<script lang="ts" setup>
// Types
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';
import type { IPotTooltipProps } from '@/types/components/tooltip';

// Vue
import { onUnmounted, readonly, ref, watch } from 'vue';

// Components
import PotPopover from '@/components/ui/PotPopover.vue';

const $props = withDefaults(
    defineProps<IPotTooltipProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        text: '',
        openDelay: 0,
        closeDelay: 200,
        autoCloseDelay: 0,
        openTriggers: () => ['mouseover'],
        closeTriggers: () => ['mouseout'],
        enterable: false,
    },
);

const $emit = defineEmits<{
    open: [];
    close: [];
    'trigger:open': [event: Event];
    'trigger:close': [event: Event];
}>();

// Data
const popoverRef = ref<InstanceType<typeof PotPopover> | null>(null);
const isOpen = ref<boolean>(false);
const delayedAction = ref<{ timeoutId: number; action: Function | null; delay: number }>({
    timeoutId: NaN,
    action: null,
    delay: 0,
});

// Lifecycle
onUnmounted(() => {
    if (popoverRef.value?.target) terminateTargetTriggers(popoverRef.value.target as Element);
    if (popoverRef.value?.popover) terminatePopoverListeners(popoverRef.value.popover as Element);
});

// Watchers
watch(
    () => popoverRef.value?.target,
    (newValue, oldValue) => {
        if (oldValue instanceof Element) terminateTargetTriggers(oldValue);
        if (newValue instanceof Element) setupTargetTriggers(newValue);
    },
);

watch(
    () => [popoverRef.value?.popover, $props.enterable],
    (newValue, oldValue) => {
        const [popoverElement, enterable] = newValue;
        const [oldPopoverElement] = oldValue;

        if (!enterable) return;

        if (popoverElement instanceof Element) {
            setupPopoverListeners(popoverElement);
        } else if (oldPopoverElement instanceof Element) {
            terminatePopoverListeners(oldPopoverElement);
        }
    },
);

// Methods
function open() {
    clearDelayedAction();
    isOpen.value = true;
    $emit('open');
    if ($props.autoCloseDelay > 0) startAutoClose();
}

function close() {
    clearDelayedAction();
    isOpen.value = false;
    $emit('close');
}

function delayedOpen(event: Event): number {
    return setDelayedAction(() => {
        if (isOpen.value) return;

        $emit('trigger:open', event);
        open();
    }, $props.openDelay);
}

function delayedClose(event: Event): number {
    return setDelayedAction(() => {
        if (!isOpen.value) return;

        $emit('trigger:close', event);
        close();
    }, $props.closeDelay);
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

    $props.closeTriggers?.forEach?.(trigger => element.addEventListener(trigger, delayedClose));
    $props.openTriggers?.forEach?.(trigger => element.addEventListener(trigger, delayedOpen));
}

function terminateTargetTriggers(element: Element) {
    if (!element) return;

    $props.closeTriggers?.forEach?.(trigger => element.removeEventListener(trigger, delayedClose));
    $props.openTriggers?.forEach?.(trigger => element.removeEventListener(trigger, delayedOpen));
}

function setupPopoverListeners(element: Element) {
    if (!element) return;

    element.addEventListener('mouseover', pause);
    element.addEventListener('mouseout', resume);
}

function terminatePopoverListeners(element: Element) {
    if (!element) return;

    element.removeEventListener('mouseover', pause);
    element.removeEventListener('mouseout', resume);
}

// Exports
defineExpose({
    isOpen: readonly(isOpen),
    target: popoverRef.value?.target,
    popover: popoverRef.value?.popover,
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
    <PotPopover
        ref="popoverRef"
        :visible="isOpen"
        :target="target"
        :to="to"
        :color="color"
        :size="size"
        :radius="radius"
        :devices="devices"
        :sticky="sticky"
        :persistent="persistent"
        :edge-margin="edgeMargin"
        :nudge="nudge"
        :position="position"
        @open="open"
        @close="close"
    >
        <template #target>
            <slot name="target" />
        </template>

        <slot>
            {{ text }}
        </slot>
    </PotPopover>
</template>
