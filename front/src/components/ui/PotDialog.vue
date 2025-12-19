<script lang="ts" setup>
// Types
import type { IPotDialogExpose, IPotDialogProps } from '@/types/components/dialog';

// Constants
import { POT_DIALOG_POSITION } from '@/types/components/dialog';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, ref, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';
import { useDialog } from '@/composables/dialog';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

const $props = withDefaults(defineProps<IPotDialogProps>(), {
    visible: undefined,
    modelValue: undefined,
    position: POT_DIALOG_POSITION.CENTER,
    to: 'body',
    transition: 'pot-dialog-transition',
    noOverlay: false,
    noAutoFocus: false,
    noFocusTrap: false,
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

// Data
const container = ref<Element | null>(null);

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => ({ zIndex: $dialog.zIndex.value }));

// Composables
const $dialog = useDialog({
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    triggers: ['escape'],
    layer: DIALOG_LAYERS.DIALOG,
    close,
    open,
});

const $properties = useDeviceProperties(
    {
        position: toRef(() => $props.position),
        size: toRef(() => $props.size),
        color: toRef(() => $props.color),
        radius: toRef(() => $props.radius),
    },
    toRef(() => $props.devices),
);

const $classList = useClassList(
    {
        position: $properties.position,
        size: $properties.size,
        color: $properties.color,
        radius: $properties.radius,
    },
    'dialog',
);

useFocusTrap(computed(() => ($props.noFocusTrap ? null : container.value)));

useAutoFocus(computed(() => ($props.noAutoFocus ? null : container.value)));

// Methods
function open() {
    $emit('open');
    $emit('update:modelValue', true);
}

function close() {
    $emit('close');
    $emit('update:modelValue', false);
}

// Exports
defineExpose<Readonly<IPotDialogExpose>>({
    isOpen: $dialog.isOpen,
    container,
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
                v-if="$dialog.isOpen.value"
                v-bind="$dialog.marker"
                :class="['pot-dialog', $classList]"
                :style="currentStyles"
            >
                <div
                    v-if="!noOverlay"
                    class="pot-dialog-overlay"
                    @click="close"
                />

                <div
                    ref="container"
                    class="pot-dialog-container"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="ariaLabelledby"
                    :aria-describedby="ariaDescribedby"
                >
                    <slot
                        :marker="$dialog.marker"
                        :close="close"
                        :open="open"
                    />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
.pot-dialog {
    position: fixed;
}

.pot-dialog-container {
    position: fixed;
    overflow: auto;
    border-style: solid;

    /* --- PotDialog - Color --- */
    background-color: var(--pot-dialog-color-background, transparent);
    border-color: var(--pot-dialog-color-border, transparent);

    /* --- PotDialog - Size --- */
    padding: var(--pot-dialog-size-padding, 0);
    border-width: var(--pot-dialog-size-border, 1px);
    font-size: var(--pot-dialog-size-text, inherit);
    font-weight: var(--pot-dialog-size-text-weight, 400);
    line-height: var(--pot-dialog-size-text-height, 1);
    box-shadow: var(--pot-dialog-size-shadow, none);

    /* --- PotDialog - Radius --- */
    border-radius: var(--pot-dialog-radius-value, 0);
}

.pot-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* --- PotDialog - Color --- */
    background-color: var(--pot-dialog-color-overlay, rgba(0, 0, 0, 0.3));
}

.pot-dialog._dialog-position-center .pot-dialog-container {
    --pot-dialog-position-transform: scale(0.5) translate(-50%, -50%);

    top: 50%;
    left: 50%;
    transform-origin: left;
    transform: scale(1) translate(-50%, -50%);
}

.pot-dialog._dialog-position-bottom .pot-dialog-container {
    --pot-dialog-position-transform: translate(
        -50%,
        calc(100% + var(--pot-dialog-size-edge-margin, 20px))
    );

    bottom: var(--pot-dialog-size-edge-margin, 20px);
    left: 50%;
    transform: translateX(-50%);
}

.pot-dialog._dialog-position-bottom-left .pot-dialog-container {
    --pot-dialog-position-transform: translateX(
        calc(-100% - var(--pot-dialog-size-edge-margin, 20px))
    );

    bottom: var(--pot-dialog-size-edge-margin, 20px);
    left: var(--pot-dialog-size-edge-margin, 20px);
}

.pot-dialog._dialog-position-bottom-right .pot-dialog-container {
    --pot-dialog-position-transform: translateX(
        calc(100% + var(--pot-dialog-size-edge-margin, 20px))
    );

    bottom: var(--pot-dialog-size-edge-margin, 20px);
    right: var(--pot-dialog-size-edge-margin, 20px);
}

.pot-dialog._dialog-position-top .pot-dialog-container {
    --pot-dialog-position-transform: translate(
        -50%,
        calc(-100% - var(--pot-dialog-size-edge-margin, 20px))
    );

    top: var(--pot-dialog-size-edge-margin, 20px);
    left: 50%;
    transform: translateX(-50%);
}

.pot-dialog._dialog-position-top-left .pot-dialog-container {
    --pot-dialog-position-transform: translateX(
        calc(-100% - var(--pot-dialog-size-edge-margin, 20px))
    );

    top: var(--pot-dialog-size-edge-margin, 20px);
    left: var(--pot-dialog-size-edge-margin, 20px);
}

.pot-dialog._dialog-position-top-right .pot-dialog-container {
    --pot-dialog-position-transform: translateX(
        calc(100% + var(--pot-dialog-size-edge-margin, 20px))
    );

    top: var(--pot-dialog-size-edge-margin, 20px);
    right: var(--pot-dialog-size-edge-margin, 20px);
}

.pot-dialog._dialog-position-left .pot-dialog-container {
    --pot-dialog-position-transform: translate(
        calc(-100% - var(--pot-dialog-size-edge-margin, 20px)),
        -50%
    );

    top: 50%;
    left: var(--pot-dialog-size-edge-margin, 20px);
    transform: translateY(-50%);
}

.pot-dialog._dialog-position-right .pot-dialog-container {
    --pot-dialog-position-transform: translate(
        calc(100% + var(--pot-dialog-size-edge-margin, 20px)),
        -50%
    );

    top: 50%;
    right: var(--pot-dialog-size-edge-margin, 20px);
    transform: translateY(-50%);
}

/* --- Overlay - Transition --- */
.pot-dialog-transition-enter-active,
.pot-dialog-transition-leave-active {
    transition: var(--pot-dialog-transition-duration, 0.2s)
        var(--pot-dialog-transition-function, ease);
}

.pot-dialog-transition-enter-active .pot-dialog-overlay,
.pot-dialog-transition-leave-active .pot-dialog-overlay {
    transition: opacity var(--pot-dialog-transition-duration, 0.2s)
        var(--pot-dialog-transition-function, ease);
}

.pot-dialog-transition-enter-from .pot-dialog-overlay,
.pot-dialog-transition-leave-to .pot-dialog-overlay {
    opacity: 0;
}

/* --- Container - Transition --- */
.pot-dialog-transition-enter-active .pot-dialog-container,
.pot-dialog-transition-leave-active .pot-dialog-container {
    transition:
        opacity var(--pot-dialog-transition-duration, 0.2s)
            var(--pot-dialog-transition-function, ease),
        transform var(--pot-dialog-transition-duration, 0.2s)
            var(--pot-dialog-transition-function, ease);
}

.pot-dialog.pot-dialog-transition-enter-from .pot-dialog-container,
.pot-dialog.pot-dialog-transition-leave-to .pot-dialog-container {
    opacity: 0;
    transform: var(--pot-dialog-position-transform);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/dialog.css" />
<!-- Styles - END -->
