<script lang="ts" setup>
// Types
import type { Ref, VNode } from 'vue';
import type { IPotTooltipExpose, IPotTooltipProps } from '@/types/components/tooltip';
import type { EDialogLayers } from '@/types/composables/dialog';
import type { IAttachOptions } from '@/types/composables/attach';

// Vue
import {
    cloneVNode,
    computed,
    inject,
    isVNode,
    onUnmounted,
    provide,
    readonly,
    ref,
    watch,
} from 'vue';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Composables
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';
import { useClassListArray } from '@/composables/class-list';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useAttach } from '@/composables/attach';
import { useSubscriptions } from '@/composables/subscriptions';
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

const $deviceIs = useDeviceIs();

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen: ref<boolean>(false),
    layer: computed(() => useDialogLayer($layer, $parentLayer.value)),
    close,
    open,
});

const $subscriptions = useSubscriptions();
const $targetSubscriptions = useSubscriptions();
const $boxSubscriptions = useSubscriptions();

// Data
const target = ref<Element | null>(null);
const box = ref<Element | null>(null);

// Lifecycle
onUnmounted(() => {
    $subscriptions.clear();
    $targetSubscriptions.clear();
    $boxSubscriptions.clear();
    $dialog.terminate();
    $attach.stop();
});

// Computed
const currentTarget = computed(() => $props.target ?? target.value ?? null);

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

const attachOptions = computed<IAttachOptions>(() => ({
    position: properties.value.position,
    nudge: properties.value.nudge,
    edgeMargin: properties.value.edgeMargin,
    persistent: $props.persistent,
    sticky: !$props.noSticky,
    terminateOnChange: $props.closeOnMove,
}));

const $attach = useAttach(attachOptions, () => close());

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
        zIndex: useDialogZIndex($dialog),
        transform: `translate(${x}px, ${y}px)`,
    };
});

const triggers = computed(() => {
    return Array.from(new Set([...($props.openTriggers ?? []), ...($props.closeTriggers ?? [])]));
});

// Watchers
watch(
    () => [$dialog.isOpen.value, box.value],
    () => {
        if ($dialog.isOpen.value && box.value) {
            if (!$props.noFocusTrap) focusTrap();
            if (!$props.noAutoFocus) autoFocus();
        } else {
            $subscriptions.remove('focus-trap');
            $subscriptions.remove('autofocus');
        }
    },
);

watch(
    () => [currentTarget.value, box.value],
    () => {
        if (currentTarget.value && box.value) {
            $attach.start(currentTarget.value, box.value);
        } else {
            $attach.stop();
        }
    },
);

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

watch(
    () => [box.value, $props.enterable],
    () => {
        if (!box.value || !$props.enterable) {
            $boxSubscriptions.remove('enter');
            $boxSubscriptions.remove('leave');
            return;
        }

        $boxSubscriptions.addEventListener({
            eventName: 'mouseenter',
            target: box.value,
            listener: enter,
            key: 'enter',
        });

        $boxSubscriptions.addEventListener({
            eventName: 'mouseleave',
            target: box.value,
            listener: leave,
            key: 'leave',
        });
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

    if ($dialog.isOpen.value) return;

    $dialog.isOpen.value = true;
    $emit('open');
}

function close() {
    if ($props.autoCloseDelay) $subscriptions.remove('autoclose');

    if (!$dialog.isOpen.value) return;

    $dialog.isOpen.value = false;
    $emit('close');
}

function handleTrigger(trigger: string, event: Event) {
    const isOpenTrigger = $props.openTriggers?.includes?.(trigger) ?? false;
    const isCloseTrigger = $props.closeTriggers?.includes?.(trigger) ?? false;

    if (isOpenTrigger && (!$dialog.isOpen.value || $subscriptions.has('delayed-close'))) {
        $emit('trigger:open', event, trigger);
        delayedOpen();
        return;
    }

    if (isCloseTrigger && ($dialog.isOpen.value || $subscriptions.has('delayed-open'))) {
        $emit('trigger:close', event, trigger);
        delayedClose();
        return;
    }
}

function focusTrap() {
    const boxElement = box.value as Element;

    if (!boxElement) return;

    $subscriptions.add(
        () => useFocusTrap(boxElement),
        controller => controller.abort(),
        'focus-trap',
    );
}

function autoFocus() {
    const boxElement = box.value as Element;
    const lastActiveElement = document.activeElement;

    if (!boxElement) return;

    $subscriptions.add(
        () => useAutoFocus(boxElement, lastActiveElement),
        controller => controller.abort(),
        'autofocus',
    );
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
                <slot name="content">
                    {{ text }}
                </slot>
            </div>
        </Transition>
    </Teleport>

    <PotSlotCatcher :map-v-node="findTarget">
        <slot />
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
