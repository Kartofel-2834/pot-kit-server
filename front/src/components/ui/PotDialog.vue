<script lang="ts" setup>
// Types
import type { Ref } from 'vue';
import type { IPotDialogExports, IPotDialogProps } from '@/types/components/dialog';
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { POT_DIALOG_POSITION } from '@/types/components/dialog';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onUnmounted, provide, readonly, ref, watch } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useFocusTrap } from '@/composables/focus-trap';

const $layer = DIALOG_LAYERS.DIALOG as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(
    defineProps<IPotDialogProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        visible: undefined,
        modelValue: undefined,
        position: POT_DIALOG_POSITION.CENTER,
        to: 'body',
        transition: 'pot-dialog-transition',
        noOverlay: false,
        noFocus: false,
    },
);

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    layer: computed(() => useDialogLayer($layer, $parentLayer.value)),
    close,
    open,
});

const $deviceIs = useDeviceIs();

const $focusTrap = useFocusTrap();

// Data
const container = ref<Element | null>(null);

// Lifecycle
onUnmounted(() => {
    $dialog.terminate();
    $focusTrap.terminate();
});

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const properties = computed(() => {
    return useDeviceProperties(
        {
            position: $props.position,
            size: $props.size,
            color: $props.color,
            radius: $props.radius,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const classList = computed(() => useClassList({ ...properties.value }));

const currentStyles = computed(() => ({
    zIndex: useDialogZIndex($dialog),
}));

// Watchers
watch(
    () => [container.value, $props.noFocusTrap],
    newValue => {
        const [container] = newValue;

        if (container instanceof Element) {
            $focusTrap.setup(container, {
                trap: !$props.noFocusTrap,
                autofocus: !$props.noAutoFocus,
            });
        } else {
            $focusTrap.terminate();
        }
    },
);

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
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotDialogExports>({
    isOpen: readonly($dialog.isOpen),
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
                :pot-dialog-id="$dialog.id.description"
                :class="['pot-dialog', classList]"
                :style="currentStyles"
            >
                <div
                    v-if="!noOverlay"
                    class="pot-dialog__overlay"
                    @click="close"
                />

                <div
                    ref="container"
                    class="pot-dialog__container"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="ariaLabelledby"
                    :aria-describedby="ariaDescribedby"
                >
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
.pot-dialog {
    position: fixed;
}

.pot-dialog__container {
    position: relative;
    overflow: auto;
}

.pot-dialog__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* --- Position - Center --- */
.pot-dialog._position-center {
    --pot-dialog-position-transform: scale(0.5) translate(-50%, -50%);

    top: 50%;
    left: 50%;
}

.pot-dialog._position-center .pot-dialog__container {
    transform-origin: left;
    transform: scale(1) translate(-50%, -50%);
}

/* --- Position - Bottom --- */
.pot-dialog._position-bottom {
    --pot-dialog-position-transform: translate(-50%, calc(100% + var(--pot-dialog-edge-margin)));

    bottom: var(--pot-dialog-edge-margin);
    left: 50%;
}

.pot-dialog._position-bottom .pot-dialog__container {
    transform: translateX(-50%);
}

/* --- Position - Bottom-Left --- */
.pot-dialog._position-bottom-left {
    --pot-dialog-position-transform: translateX(calc(-100% - var(--pot-dialog-edge-margin)));

    bottom: var(--pot-dialog-edge-margin);
    left: var(--pot-dialog-edge-margin);
}

/* --- Position - Bottom-Right --- */
.pot-dialog._position-bottom-right {
    --pot-dialog-position-transform: translateX(calc(100% + var(--pot-dialog-edge-margin)));

    bottom: var(--pot-dialog-edge-margin);
    right: var(--pot-dialog-edge-margin);
}

/* --- Position - Top --- */
.pot-dialog._position-top {
    --pot-dialog-position-transform: translate(-50%, calc(-100% - var(--pot-dialog-edge-margin)));

    top: var(--pot-dialog-edge-margin);
    left: 50%;
}

.pot-dialog._position-top .pot-dialog__container {
    transform: translateX(-50%);
}

/* --- Position - Top-Left --- */
.pot-dialog._position-top-left {
    --pot-dialog-position-transform: translateX(calc(-100% - var(--pot-dialog-edge-margin)));

    top: var(--pot-dialog-edge-margin);
    left: var(--pot-dialog-edge-margin);
}

/* --- Position - Top-Right --- */
.pot-dialog._position-top-right {
    --pot-dialog-position-transform: translateX(calc(100% + var(--pot-dialog-edge-margin)));

    top: var(--pot-dialog-edge-margin);
    right: var(--pot-dialog-edge-margin);
}

/* --- Position - Left --- */
.pot-dialog._position-left {
    --pot-dialog-position-transform: translate(calc(-100% - var(--pot-dialog-edge-margin)), -50%);

    top: 50%;
    left: var(--pot-dialog-edge-margin);
}

.pot-dialog._position-left .pot-dialog__container {
    transform: translateY(-50%);
}

/* --- Position - Right --- */
.pot-dialog._position-right {
    --pot-dialog-position-transform: translate(calc(100% + var(--pot-dialog-edge-margin)), -50%);

    top: 50%;
    right: var(--pot-dialog-edge-margin);
}

.pot-dialog._position-right .pot-dialog__container {
    transform: translateY(-50%);
}

/* --- Overlay - Transition --- */
.pot-dialog-transition-enter-active,
.pot-dialog-transition-leave-active {
    transition: 0.2s ease;
}

.pot-dialog-transition-enter-active .pot-dialog__overlay,
.pot-dialog-transition-leave-active .pot-dialog__overlay {
    transition: opacity 0.2s ease;
}

.pot-dialog-transition-enter-from .pot-dialog__overlay,
.pot-dialog-transition-leave-to .pot-dialog__overlay {
    opacity: 0;
}

/* --- Container - Transition --- */
.pot-dialog-transition-enter-active .pot-dialog__container,
.pot-dialog-transition-leave-active .pot-dialog__container {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.pot-dialog.pot-dialog-transition-enter-from .pot-dialog__container,
.pot-dialog.pot-dialog-transition-leave-to .pot-dialog__container {
    opacity: 0;
    transform: var(--pot-dialog-position-transform);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/dialog.css" />
<style src="@/assets/css/styles/conditions/dialog.css" />
<style src="@/assets/css/styles/configuration/dialog.css" />
<!-- Styles - END -->
