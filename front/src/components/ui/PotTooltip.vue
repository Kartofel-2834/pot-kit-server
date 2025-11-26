<script lang="ts" setup>
// Types
import type { Ref, VNode } from 'vue';
import type { IPotTooltipExpose, IPotTooltipProps } from '@/types/components/tooltip';
import type { EDialogLayers } from '@/types/composables/dialog';
import type { IAttachOptions } from '@/types/composables/attach';

// Vue
import { cloneVNode, computed, inject, isVNode, provide, readonly, ref, watch } from 'vue';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useClassListArray } from '@/composables/class-list';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useAttach } from '@/composables/attach';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

// Components
import PotSlotCatcher from '@/components/ui/PotSlotCatcher.vue';

const $layer = DIALOG_LAYERS.POPOVER as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(defineProps<IPotTooltipProps>(), {
    text: '',
    to: 'body',
    openDelay: 0,
    closeDelay: 200,
    autoCloseDelay: 0,
    openTriggers: () => ['mouseenter', 'focus'],
    closeTriggers: () => ['mouseleave', 'blur'],
    noAutoFocus: true,
    noFocusTrap: true,
    position: ATTACHED_BOX_POSITION.TOP_CENTER,
    nudge: 10,
    edgeMargin: 10,
    transition: 'pot-tooltip-transition',
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'trigger:open': [event: Event, trigger: string];
    'trigger:close': [event: Event, trigger: string];
}>();

const $subscriptions = useComponentSubscriptions();
const $targetSubscriptions = useComponentSubscriptions();
const $boxSubscriptions = useComponentSubscriptions();

// Data
const target = ref<Element | null>(null);
const box = ref<Element | null>(null);

const isOpen = ref<boolean>(false);

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen,
    layer: useDialogLayer($layer, $parentLayer),
    close,
    open,
});

// Computed
const currentTarget = computed(() => $props.target ?? target.value ?? null);

const teleportTo = computed(() => $props.to ?? 'body');

const zIndex = useDialogZIndex($dialog);

const properties = useDeviceProperties(
    computed(() => ({
        position: $props.position,
        nudge: $props.nudge,
        edgeMargin: $props.edgeMargin,
        color: $props.color,
        size: $props.size,
        radius: $props.radius,
    })),
    $props.devices,
);

const classList = computed(() =>
    useClassListArray({
        position: properties.value.position,
        color: properties.value.color,
        size: properties.value.size,
        radius: properties.value.radius,
    }),
);

const currentStyles = computed(() => {
    const [x, y] = $attach.coordinates.value ?? [0, 0];

    return {
        zIndex: zIndex.value,
        transform: `translate(${x}px, ${y}px)`,
    };
});

const triggers = computed(() => {
    return Array.from(new Set([...($props.openTriggers ?? []), ...($props.closeTriggers ?? [])]));
});

// Helper-hooks
const $attach = useAttach(
    computed<IAttachOptions>(() => ({
        position: properties.value.position,
        nudge: properties.value.nudge,
        edgeMargin: properties.value.edgeMargin,
        persistent: $props.persistent,
        sticky: !$props.noSticky,
        terminateOnChange: $props.closeOnMove,
    })),
    () => close(),
);

// Subscriptions
$subscriptions.bind(
    computed(() => ($props.noFocusTrap || !isOpen.value ? null : box.value)),
    boxElement => useFocusTrap(boxElement),
    controller => controller.abort(),
);

$subscriptions.bind(
    computed(() => ($props.noAutoFocus || !isOpen.value ? null : box.value)),
    boxElement => useAutoFocus(boxElement, document.activeElement),
    controller => controller.abort(),
);

$subscriptions.bind(
    computed(() => (currentTarget.value && box.value ? [currentTarget.value, box.value] : null)),
    ([targetElement, boxElement]) => $attach.start(targetElement, boxElement),
    () => $attach.stop(),
);

$boxSubscriptions.addEventListener({
    eventName: 'mouseenter',
    target: computed(() => ($props.enterable ? box.value : null)),
    listener: enter,
});

$boxSubscriptions.addEventListener({
    eventName: 'mouseleave',
    target: computed(() => ($props.enterable ? box.value : null)),
    listener: leave,
});

// Watchers
watch(
    () => [currentTarget.value, triggers.value],
    () => {
        $targetSubscriptions.clear();

        if (!(currentTarget.value instanceof Element) || !Array.isArray(triggers.value)) return;

        triggers.value.forEach(triggger =>
            $targetSubscriptions.addEventListener({
                eventName: triggger,
                target: currentTarget.value as Element,
                listener: event => handleTrigger(triggger, event),
            }),
        );
    },
);

// Methods
function enter() {
    if (!$props.enterable) return;

    $subscriptions.add(
        () => {
            const isClosing = $subscriptions.has('delayed-close');
            $subscriptions.remove('delayed-close');
            return isClosing;
        },
        isClosing => {
            if (isClosing) delayedClose();
        },
        'enter-leave',
    );
}

function leave() {
    if (!$props.enterable) return;
    $subscriptions.remove('enter-leave');
}

function delayedOpen(delay?: number) {
    $subscriptions.remove('delayed-close');
    $subscriptions.add(
        () => setTimeout(open, delay ?? $props.openDelay),
        timeoutId => clearTimeout(timeoutId),
        'delayed-open',
    );
}

function delayedClose(delay?: number) {
    $subscriptions.remove('delayed-open');
    $subscriptions.add(
        () => setTimeout(close, delay ?? $props.closeDelay),
        timeoutId => clearTimeout(timeoutId),
        'delayed-close',
    );
}

function open() {
    if ($props.autoCloseDelay) {
        $subscriptions.add(
            () => setTimeout(close, $props.autoCloseDelay),
            timeoutId => clearTimeout(timeoutId),
            'autoclose',
        );
    }

    if (isOpen.value) return;

    isOpen.value = true;
    $emit('open');
}

function close() {
    if ($props.autoCloseDelay) $subscriptions.remove('autoclose');

    if (!isOpen.value) return;

    isOpen.value = false;
    $emit('close');
}

function handleTrigger(trigger: string, event: Event) {
    const isOpenTrigger = $props.openTriggers?.includes?.(trigger) ?? false;
    const isCloseTrigger = $props.closeTriggers?.includes?.(trigger) ?? false;

    if (isOpenTrigger && (!isOpen.value || $subscriptions.has('delayed-close'))) {
        $emit('trigger:open', event, trigger);
        delayedOpen();
        return;
    }

    if (isCloseTrigger && (isOpen.value || $subscriptions.has('delayed-open'))) {
        $emit('trigger:close', event, trigger);
        delayedClose();
        return;
    }
}

function findTarget(vnode: VNode): VNode | null {
    if (!isVNode(vnode)) return vnode;

    if (Array.isArray(vnode.children)) {
        vnode.children = vnode.children.map(v => (isVNode(v) ? findTarget(v) : v));
    }

    return cloneVNode(vnode, {
        onVnodeMounted(vnode) {
            if (target.value || !(vnode.el instanceof Element)) return;
            target.value = vnode.el as Element;
        },

        onVnodeBeforeUnmount() {
            if (target.value === vnode.el) {
                target.value = null;
            }
        },
    });
}

// Exports
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotTooltipExpose>({
    dialogId: $dialog.id,
    isOpen: readonly($dialog.isOpen),
    coordinates: $attach.coordinates.value,
    target: currentTarget.value,
    tooltip: box.value,
    open,
    close,
    delayedOpen,
    delayedClose,
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
                <slot
                    name="content"
                    :dialog-id="$dialog.id"
                >
                    {{ text }}
                </slot>
            </div>
        </Transition>
    </Teleport>

    <PotSlotCatcher :map-v-node="findTarget">
        <slot :dialog-id="$dialog.id" />
    </PotSlotCatcher>
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
