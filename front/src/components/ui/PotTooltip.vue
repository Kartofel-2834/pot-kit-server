<script lang="ts" setup>
// Types
import type { VNode } from 'vue';
import type { IPotTooltipExpose, IPotTooltipProps } from '@/types/components/tooltip';

// Vue
import { cloneVNode, computed, isVNode, ref, toRef } from 'vue';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';
import { useDialog } from '@/composables/dialog';
import { useAttach } from '@/composables/attach';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

// Components
import PotSlotCatcher from '@/components/ui/PotSlotCatcher.vue';

const props = withDefaults(defineProps<IPotTooltipProps>(), {
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

const emit = defineEmits<{
    open: [];
    close: [];
    'trigger:open': [event: Event, trigger: string];
    'trigger:close': [event: Event, trigger: string];
}>();

// Data
const target = ref<Element | null>(null);
const box = ref<Element | null>(null);

const isOpen = ref<boolean>(false);

// Computed
const currentTarget = computed(() => props.target ?? target.value ?? null);

const teleportTo = computed(() => props.to ?? 'body');

const currentStyles = computed(() => {
    const x = $attach.x.value ?? 0;
    const y = $attach.y.value ?? 0;

    return {
        zIndex: $dialog.zIndex.value,
        transform: `translate(${x}px, ${y}px)`,
    };
});

const triggers = computed(() => {
    return Array.from(new Set([...(props.openTriggers ?? []), ...(props.closeTriggers ?? [])]));
});

// Composables
const $subscriptions = useComponentSubscriptions();

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen,
    layer: DIALOG_LAYERS.POPOVER,
    close,
    open,
});

const $properties = useDeviceProperties(
    {
        position: toRef(() => props.position),
        nudge: toRef(() => props.nudge),
        edgeMargin: toRef(() => props.edgeMargin),
        color: toRef(() => props.color),
        size: toRef(() => props.size),
        radius: toRef(() => props.radius),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        position: $properties.position,
        color: $properties.color,
        size: $properties.size,
        radius: $properties.radius,
        opened: $dialog.isOpen,
        closed: toRef(() => !$dialog.isOpen.value),
        hidden: toRef(() => $attach.x.value === null || $attach.y.value === null),
    },
    'tooltip',
);

const $attach = useAttach({
    target: currentTarget,
    box: box,
    position: $properties.position,
    nudge: $properties.nudge,
    edgeMargin: $properties.edgeMargin,
    persistent: toRef(() => props.persistent),
    sticky: toRef(() => !props.noSticky),
    onChange: () => {
        if (props.closeOnMove) close();
    },
});

useFocusTrap(computed(() => (props.noFocusTrap || !isOpen.value ? null : box.value)));

useAutoFocus(computed(() => (props.noAutoFocus || !isOpen.value ? null : box.value)));

$subscriptions.addEventListener({
    eventName: 'mouseenter',
    target: computed(() => (props.enterable ? box.value : null)),
    listener: enter,
});

$subscriptions.addEventListener({
    eventName: 'mouseleave',
    target: computed(() => (props.enterable ? box.value : null)),
    listener: leave,
});

$subscriptions.bind(
    triggers,
    currentTriggers => {
        return currentTriggers.map(triggger =>
            $subscriptions.addEventListener({
                eventName: triggger,
                target: currentTarget,
                listener: event => handleTrigger(triggger, event),
            }),
        );
    },
    controllers => controllers.forEach(controller => controller.abort()),
);

// Methods
function enter() {
    if (!props.enterable) return;

    $subscriptions.add(
        () => {
            const isClosing = $subscriptions.has('delayed-close');
            const isAutoClosing = $subscriptions.has('autoclose');

            $subscriptions.remove('delayed-close');
            $subscriptions.remove('autoclose');
            return [isClosing, isAutoClosing];
        },
        ([isClosing, isAutoClosing]) => {
            if (isClosing) delayedClose();
            if (isAutoClosing) autoclose();
        },
        'enter-leave',
    );
}

function leave() {
    if (!props.enterable) return;
    $subscriptions.remove('enter-leave');
}

function delayedOpen(delay?: number) {
    $subscriptions.remove('delayed-close');
    $subscriptions.add(
        () => setTimeout(open, delay ?? props.openDelay),
        timeoutId => clearTimeout(timeoutId),
        'delayed-open',
    );
}

function delayedClose(delay?: number) {
    $subscriptions.remove('delayed-open');
    $subscriptions.add(
        () => setTimeout(close, delay ?? props.closeDelay),
        timeoutId => clearTimeout(timeoutId),
        'delayed-close',
    );
}

function autoclose() {
    if (!props.autoCloseDelay) return;

    $subscriptions.add(
        () => setTimeout(close, props.autoCloseDelay),
        timeoutId => clearTimeout(timeoutId),
        'autoclose',
    );
}

function open() {
    autoclose();

    if (isOpen.value) return;

    isOpen.value = true;
    emit('open');
}

function close() {
    if (props.autoCloseDelay) $subscriptions.remove('autoclose');

    if (!isOpen.value) return;

    isOpen.value = false;
    emit('close');
}

function handleTrigger(trigger: string, event: Event) {
    const isOpenTrigger = props.openTriggers?.includes?.(trigger) ?? false;
    const isCloseTrigger = props.closeTriggers?.includes?.(trigger) ?? false;

    if (isOpenTrigger && (!isOpen.value || $subscriptions.has('delayed-close'))) {
        emit('trigger:open', event, trigger);
        delayedOpen();
        return;
    }

    if (isCloseTrigger && (isOpen.value || $subscriptions.has('delayed-open'))) {
        emit('trigger:close', event, trigger);
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
defineExpose<Readonly<IPotTooltipExpose>>({
    isOpen: $dialog.isOpen,
    x: $attach.x,
    y: $attach.y,
    target: currentTarget,
    tooltip: box,
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
                v-if="isOpen"
                v-bind="$dialog.marker"
                :key="`${$dialog.id.description}_${isOpen}`"
                :class="['pot-tooltip', $classList, classList]"
                :style="currentStyles"
            >
                <slot name="content">
                    {{ text }}
                </slot>
            </div>
        </Transition>
    </Teleport>

    <PotSlotCatcher :map-v-node="findTarget">
        <slot :marker="$dialog.marker" />
    </PotSlotCatcher>
</template>

<style>
.pot-tooltip {
    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotTooltip - Color --- */
    border-color: var(--pot-tooltip-color-border, transparent);
    background-color: var(--pot-tooltip-color-background, transparent);
    color: var(--pot-tooltip-color-text, inherit);

    /* --- PotTooltip - Size --- */
    border-width: var(--pot-tooltip-size-border, 0);
    padding: var(--pot-tooltip-size-padding, 0);
    box-shadow: var(--pot-tooltip-size-shadow, none);
    font-size: var(--pot-tooltip-size-text, inherit);

    /* --- PotTooltip - Radius --- */
    border-radius: var(--pot-tooltip-radius-value, 0);
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
