<script
    lang="ts"
    generic="TOpenTriggers extends string[] = string[], TCloseTriggers extends string[] = string[]"
    setup
>
// Types
import type { Ref } from 'vue';
import type { IPotTooltipExpose, IPotTooltipProps } from '@/types/components/tooltip';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onMounted, onUnmounted, provide, readonly, ref, watch } from 'vue';

// Composables
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';

// Components
import PotAttachTarget from '@/components/ui/PotAttachTarget.vue';

const isOpen = ref<boolean>(false);

const $layer = DIALOG_LAYERS.POPOVER as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(defineProps<IPotTooltipProps<TOpenTriggers, TCloseTriggers>>(), {
    text: '',
    to: 'body',
    openDelay: 0,
    closeDelay: 200,
    autoCloseDelay: 0,
    openTriggers: () => ['mouseover', 'focus'] as TOpenTriggers,
    closeTriggers: () => ['mouseout', 'blur'] as TCloseTriggers,
    openTriggersDelay: () => ({ mouseover: 200 }),
    closeTriggersDelay: () => ({ mouseover: 400 }),
    enterable: false,
    transition: 'pot-tooltip-transition',
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'trigger:open': [event: Event, trigger: string];
    'trigger:close': [event: Event, trigger: string];
}>();

const $deviceIs = useDeviceIs();

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen: computed(() => isOpen.value),
    layer: computed(() => useDialogLayer($layer, $parentLayer?.value)),
    close: close,
    open: open,
});

// Data
const openTriggersTimeouts = ref<Partial<Record<TOpenTriggers[number], number>>>({});
const closeTriggersTimeouts = ref<Partial<Record<TCloseTriggers[number], number>>>({});

const box = ref<Element | null>(null);
const attachTarget = ref<InstanceType<typeof PotAttachTarget> | null>(null);

const delayedAction = ref<{ timeoutId: number; action: Function | null; delay: number }>({
    timeoutId: NaN,
    action: null,
    delay: 0,
});

// Lifecycle
onMounted(() => {
    $props.openTriggers?.forEach?.(trigger => toggleOpenTrigger(trigger));
});

onUnmounted(() => {
    $dialog.terminate();

    if (attachTarget.value?.target) {
        terminateTargetTriggers(attachTarget.value.target as Element);
    }

    if (box.value) {
        terminateBoxListeners(box.value as Element);
    }
});

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const properties = computed(() => {
    return useDeviceProperties(
        {
            position: $props.position,
            nudge: $props.nudge,
            edgeMargin: $props.edgeMargin,
            color: $props.color,
            size: $props.size,
            radius: $props.radius,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const classList = computed(() => useClassList({ ...properties.value }));

const currentStyles = computed(() => {
    const x = attachTarget.value?.boxX ?? 0;
    const y = attachTarget.value?.boxY ?? 0;

    return {
        zIndex: useDialogZIndex($dialog),
        transform: `translate(${x}px, ${y}px)`,
    };
});

// Watchers
watch(
    () => [attachTarget.value?.target, $props.openTriggers, $props.closeTriggers],
    (newValue, oldValue) => {
        const [newTarget] = newValue;
        const [oldTarget] = oldValue;

        if (oldTarget instanceof Element) terminateTargetTriggers(oldTarget);
        if (newTarget instanceof Element) setupTargetTriggers(newTarget);
    },
);

watch(
    () => [box.value, $props.enterable],
    (newValue, oldValue) => {
        const [boxElement, enterable] = newValue;
        const [oldBoxElement] = oldValue;

        if (!enterable) return;

        if (oldBoxElement instanceof Element) {
            terminateBoxListeners(oldBoxElement);
        }

        if (boxElement instanceof Element) {
            setupBoxListeners(boxElement);
        }
    },
);

// Methods
function open() {
    if (isOpen.value) return;

    clearDelayedAction();
    isOpen.value = true;
    $emit('open');

    if ($props.autoCloseDelay > 0) startAutoClose();
}

function close() {
    if (!isOpen.value) return;

    clearDelayedAction();
    isOpen.value = false;
    $emit('close');
}

function delayedOpen(event: Event, trigger: TOpenTriggers[number]): number {
    return setDelayedAction(() => {
        if (isOpen.value) return;
        if (!toggleOpenTrigger(trigger)) return;

        $emit('trigger:open', event, trigger);
        open();
    }, $props.openDelay);
}

function toggleOpenTrigger(trigger: TOpenTriggers[number]): boolean {
    const timeoutId = openTriggersTimeouts.value[trigger] ?? NaN;
    const triggerAvailableDelay = $props.openTriggersDelay?.[trigger] ?? 0;

    if (!triggerAvailableDelay) return true;
    if (timeoutId) return false;

    const newTimeoutId = setTimeout(() => {
        openTriggersTimeouts.value = { ...openTriggersTimeouts.value, [trigger]: NaN };
    }, triggerAvailableDelay);

    openTriggersTimeouts.value = { ...openTriggersTimeouts.value, [trigger]: newTimeoutId };

    return true;
}

function delayedClose(event: Event, trigger: string): number {
    return setDelayedAction(() => {
        if (!isOpen.value) return;
        if (!toggleCloseTrigger(trigger)) return;

        $emit('trigger:close', event, trigger);
        close();
    }, $props.closeDelay);
}

function toggleCloseTrigger(trigger: TCloseTriggers[number]): boolean {
    const timeoutId = closeTriggersTimeouts.value[trigger] ?? NaN;
    const triggerAvailableDelay = $props.closeTriggersDelay?.[trigger] ?? 0;

    if (!triggerAvailableDelay) return true;
    if (timeoutId) return false;

    const newTimeoutId = setTimeout(() => {
        closeTriggersTimeouts.value = { ...closeTriggersTimeouts.value, [trigger]: NaN };
    }, triggerAvailableDelay);

    closeTriggersTimeouts.value = { ...closeTriggersTimeouts.value, [trigger]: newTimeoutId };

    return true;
}

function startAutoClose(): number {
    if ($props.autoCloseDelay <= 0 || isNaN($props.autoCloseDelay)) return NaN;

    return setDelayedAction(() => {
        if (!isOpen.value) return;

        isOpen.value = false;
        $emit('close');
    }, $props.autoCloseDelay);
}

function pause() {
    clearTimeout(delayedAction.value.timeoutId);
    delayedAction.value = { ...delayedAction.value, timeoutId: NaN };
}

function resume() {
    setDelayedAction(delayedAction.value.action, delayedAction.value.delay);
}

function clearDelayedAction() {
    clearTimeout(delayedAction.value.timeoutId);
    delayedAction.value = { action: null, timeoutId: NaN, delay: 0 };
}

function setDelayedAction(action: Function | null, delay: number): number {
    if (!action) return NaN;

    clearTimeout(delayedAction.value.timeoutId);
    const timeoutId = delay ? setTimeout(action, delay) : NaN;

    if (!delay) action();

    delayedAction.value = {
        action: delay ? action : null,
        timeoutId,
        delay,
    };

    return timeoutId;
}

function setupTargetTriggers(element: Element) {
    if (!element) return;

    $props.closeTriggers?.forEach?.(trigger =>
        element.addEventListener(trigger, (event: Event) => delayedClose(event, trigger)),
    );
    $props.openTriggers?.forEach?.(trigger =>
        element.addEventListener(trigger, (event: Event) => delayedOpen(event, trigger)),
    );
}

function terminateTargetTriggers(element: Element) {
    if (!element) return;

    $props.closeTriggers?.forEach?.(trigger =>
        element.removeEventListener(trigger, (event: Event) => delayedClose(event, trigger)),
    );
    $props.openTriggers?.forEach?.(trigger =>
        element.removeEventListener(trigger, (event: Event) => delayedOpen(event, trigger)),
    );
}

function setupBoxListeners(element: Element) {
    if (!element) return;

    element.addEventListener('mouseover', pause);
    element.addEventListener('mouseout', resume);
}

function terminateBoxListeners(element: Element) {
    if (!element) return;

    element.removeEventListener('mouseover', pause);
    element.removeEventListener('mouseout', resume);
}

// Exports
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotTooltipExpose>({
    isOpen: readonly(isOpen),
    x: attachTarget.value?.boxX,
    y: attachTarget.value?.boxY,
    target: attachTarget.value?.target as Element,
    tooltip: box.value,
    open,
    close,
    delayedOpen,
    delayedClose,
    pause,
    resume,
    clearDelayedAction,
});
</script>

<template>
    <Teleport
        :to="teleportTo"
        :disabled="!to"
    >
        <Transition :name="transition">
            <div
                ref="box"
                v-if="$dialog.isOpen.value"
                v-bind="$attrs"
                :key="`${$dialog.id.description}_${$dialog.isOpen.value}`"
                :class="['pot-tooltip', classList]"
                :style="currentStyles"
                :data-pot-dialog-id="$dialog.id.description"
            >
                <slot name="content">
                    {{ text }}
                </slot>
            </div>
        </Transition>
    </Teleport>

    <PotAttachTarget
        ref="attachTarget"
        :box="box"
        :position="properties.position"
        :edge-margin="properties.edgeMargin"
        :nudge="properties.nudge"
        :target="target"
        :to="to"
        :sticky="!noSticky"
        :persistent="persistent"
    >
        <slot />
    </PotAttachTarget>
</template>

<style>
.pot-tooltip {
    /* --- Color - Configuration --- */
    --pot-tooltip-color-background: transparent;
    --pot-tooltip-color-border: transparent;
    --pot-tooltip-color-text: inherit;

    /* --- Size - Configuration --- */
    --pot-tooltip-size-border: 0;
    --pot-tooltip-size-padding: 0;
    --pot-tooltip-size-shadow: none;
    --pot-tooltip-size-text: inherit;

    /* --- Radius - Configuration --- */
    --pot-tooltip-radius-value: 0;

    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotTooltip - Color --- */
    border-color: var(--pot-tooltip-color-border);
    background-color: var(--pot-tooltip-color-background);
    color: var(--pot-tooltip-color-text);

    /* --- PotTooltip - Size --- */
    border-width: var(--pot-tooltip-size-border);
    padding: var(--pot-tooltip-size-padding);
    box-shadow: var(--pot-tooltip-size-shadow);
    font-size: var(--pot-tooltip-size-text);

    /* --- PotTooltip - Radius --- */
    border-radius: var(--pot-tooltip-radius-value);
}

.pot-tooltip-transition-enter-active,
.pot-tooltip-transition-leave-active {
    transition: opacity 0.2s ease;
}

.pot-tooltip-transition-enter-from,
.pot-tooltip-transition-leave-to {
    opacity: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/tooltip.css" />
<!-- Styles - END -->
