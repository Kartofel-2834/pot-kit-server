<script lang="ts" setup>
// Types
import type { Ref } from 'vue';
import type { IPotTooltipExpose, IPotTooltipProps } from '@/types/components/tooltip';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onUnmounted, provide, readonly, ref, watch } from 'vue';

// Composables
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';
import { useSubscriptions } from '@/composables/subscriptions';

// Components
import PotAttachTarget from '@/components/ui/PotAttachTarget.vue';

interface IDelayedAction {
    timeoutId: number;
    action: ((...args: unknown[]) => unknown) | null;
    delay: number;
}

const isOpen = ref<boolean>(false);

const $layer = DIALOG_LAYERS.POPOVER as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(defineProps<IPotTooltipProps>(), {
    text: '',
    to: 'body',
    openDelay: 300,
    closeDelay: 300,
    autoCloseDelay: 0,
    openTriggers: () => ['mouseenter', 'focus'],
    closeTriggers: () => ['mouseleave', 'blur'],
    enterable: false,
    transition: 'pot-tooltip-transition',
});

const $emit = defineEmits<{
    open: [];
    close: [];
    trigger: [event: Event, trigger: string];
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

const $targetSubscriptions = useSubscriptions();
const $boxSubscriptions = useSubscriptions();

// Data
const box = ref<Element | null>(null);
const attachTarget = ref<InstanceType<typeof PotAttachTarget> | null>(null);

const closeDelayedAction = ref<IDelayedAction | null>();
const openDelayedAction = ref<IDelayedAction | null>();

// Lifecycle
onUnmounted(() => {
    $dialog.terminate();
    $targetSubscriptions.clear();
    $boxSubscriptions.clear();
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
    const [x, y] = attachTarget.value?.boxCoordinates ?? [0, 0];

    return {
        zIndex: useDialogZIndex($dialog),
        transform: `translate(${x}px, ${y}px)`,
    };
});

const triggers = computed(() => {
    return [...($props.openTriggers ?? []), ...($props.closeTriggers ?? [])];
});

// Watchers
watch(
    () => [attachTarget.value?.target, triggers.value] as [Element | null, string[]],
    newValue => {
        const [newTarget, newTriggers] = newValue;

        $targetSubscriptions.clear();

        if (!Array.isArray(newTriggers) || !(newTarget instanceof Element)) return;

        newTriggers.forEach(trigger => {
            $targetSubscriptions.addEventListener({
                key: `target-trigger-${trigger}`,
                eventName: trigger,
                target: newTarget,
                listener: event => toggleTrigger(trigger, event),
            });
        });
    },
);

watch(
    () => [box.value, $props.enterable] as [Element, boolean],
    newValue => {
        const [boxElement, enterable] = newValue;

        $boxSubscriptions.clear();

        if (!enterable || !(boxElement instanceof Element)) return;

        $boxSubscriptions.addEventListener({
            eventName: 'mouseenter',
            target: boxElement,
            listener: pause,
        });

        $boxSubscriptions.addEventListener({
            eventName: 'mouseleave',
            target: boxElement,
            listener: resume,
        });
    },
);

// Methods
function open() {
    if (isOpen.value) return;

    isOpen.value = true;
    $emit('open');
    autoClose();
}

function close() {
    if (!isOpen.value) return;

    isOpen.value = false;
    $emit('close');
}

function autoClose() {
    if (!$props.autoCloseDelay) {
        return;
    }

    clearTimeout(closeDelayedAction.value?.timeoutId);
    clearTimeout(openDelayedAction.value?.timeoutId);

    openDelayedAction.value = null;
    closeDelayedAction.value = {
        timeoutId: setTimeout(close, $props.autoCloseDelay),
        delay: $props.autoCloseDelay,
        action: close,
    };
}

function delayedOpen(trigger: string, event: Event) {
    clearTimeout(closeDelayedAction.value?.timeoutId);
    clearTimeout(openDelayedAction.value?.timeoutId);

    if (isOpen.value) {
        autoClose();
        return;
    }

    const delay = $props.openDelay;
    const action = () => {
        if (isOpen.value) return;
        $emit('trigger:open', event, trigger);
        open();
    };

    const timeoutId = setTimeout(action, delay);

    closeDelayedAction.value = null;
    openDelayedAction.value = { timeoutId, delay, action };
}

function delayedClose(trigger: string, event: Event) {
    clearTimeout(closeDelayedAction.value?.timeoutId);
    clearTimeout(openDelayedAction.value?.timeoutId);

    if (!isOpen.value) return;

    const delay = $props.closeDelay;
    const action = () => {
        if (!isOpen.value) return;
        $emit('trigger:close', event, trigger);
        close();
    };

    const timeoutId = setTimeout(action, delay);

    closeDelayedAction.value = { timeoutId, delay, action };
    openDelayedAction.value = null;
}

function pause() {
    if (!closeDelayedAction.value) {
        return;
    }

    clearTimeout(closeDelayedAction.value.timeoutId);
    closeDelayedAction.value = {
        ...closeDelayedAction.value,
        timeoutId: NaN,
    };
}

function resume() {
    if (!closeDelayedAction.value?.action || !isNaN(closeDelayedAction.value.timeoutId)) {
        return;
    }

    const timeoutId = setTimeout(closeDelayedAction.value.action, closeDelayedAction.value.delay);
    closeDelayedAction.value = { ...closeDelayedAction.value, timeoutId };
}

function toggleTrigger(trigger: string, event: Event) {
    const isOpenTrigger = $props.openTriggers?.includes(trigger);
    const isCloseTrigger = $props.closeTriggers?.includes(trigger);

    $emit('trigger', event, trigger);

    if (isOpenTrigger && isCloseTrigger) {
        if (isOpen.value) {
            delayedClose(trigger, event);
        } else {
            delayedOpen(trigger, event);
        }
    } else if (isOpenTrigger) {
        delayedOpen(trigger, event);
    } else if (isCloseTrigger) {
        delayedClose(trigger, event);
    }
}

// Exports
provide('pot-dialog-layer', $dialog.layer);

defineExpose<any>({
    isOpen: readonly(isOpen),
    coordinates: attachTarget.value?.boxCoordinates,
    target: attachTarget.value?.target as Element,
    tooltip: box.value,
    open,
    close,
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
