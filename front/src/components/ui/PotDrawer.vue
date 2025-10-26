<script lang="ts" setup>
// Types
import type { Ref } from 'vue';
import type { IPotDrawerExpose, IPotDrawerProps } from '@/types/components/drawer';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { POT_DRAWER_POSITION } from '@/types/components/drawer';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onUnmounted, provide, readonly, ref, watch } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceIs, useDeviceProperties } from '@/composables/device-is';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useSubscriptions } from '@/composables/subscriptions';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

const $layer = DIALOG_LAYERS.DIALOG as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(defineProps<IPotDrawerProps>(), {
    visible: undefined,
    modelValue: undefined,
    position: POT_DRAWER_POSITION.LEFT,
    to: 'body',
    transition: 'pot-drawer-transition',
    noOverlay: false,
    noAutoFocus: false,
    noFocusTrap: false,
});

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

const $subscriptions = useSubscriptions();

// Data
const container = ref<Element | null>(null);

// Lifecycle
onUnmounted(() => {
    $dialog.terminate();
    $subscriptions.clear();
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
    () => {
        if (container.value instanceof Element) {
            if (!$props.noFocusTrap) focusTrap();
            if (!$props.noAutoFocus) autoFocus();
        } else {
            $subscriptions.remove('focus-trap');
            $subscriptions.remove('autofocus');
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

function focusTrap() {
    const containerElement = container.value as Element;

    if (!containerElement) return;

    $subscriptions.add(
        () => useFocusTrap(containerElement),
        controller => controller.abort(),
        'focus-trap',
    );
}

function autoFocus() {
    const containerElement = container.value as Element;
    const lastActiveElement = document.activeElement;

    if (!containerElement) return;

    $subscriptions.add(
        () => useAutoFocus(containerElement, lastActiveElement),
        controller => controller.abort(),
        'autofocus',
    );
}

// Exports
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotDrawerExpose>({
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
                :data-pot-dialog-id="$dialog.id.description"
                :class="['pot-drawer', classList]"
                :style="currentStyles"
            >
                <div
                    v-if="!noOverlay"
                    class="pot-drawer__overlay"
                    @click="close"
                />

                <div
                    ref="container"
                    class="pot-drawer__container"
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
.pot-drawer {
    /* --- Color - Configuration --- */
    --pot-drawer-color-background: transparent;
    --pot-drawer-color-border: transparent;
    --pot-drawer-color-overlay: rgba(0, 0, 0, 0.3);

    /* --- Size - Configuration --- */
    --pot-drawer-size-text: inherit;
    --pot-drawer-size-padding: 0;
    --pot-drawer-size-border: 0;
    --pot-drawer-size-shadow: none;

    /* --- Radius - Configuration --- */
    --pot-drawer-radius-value: 0;

    position: fixed;
}

.pot-drawer__container {
    position: relative;
    overflow: auto;
    border-style: solid;

    /* --- PotDrawer - Color --- */
    border-color: var(--pot-drawer-color-border);
    background-color: var(--pot-drawer-color-background);

    /* --- PotDrawer - Size --- */
    padding: var(--pot-drawer-size-padding);
    border-width: var(--pot-drawer-size-border);
    font-size: var(--pot-drawer-size-text);
    box-shadow: var(--pot-drawer-size-shadow);

    /* --- PotDrawer - Radius --- */
    border-radius: var(--pot-drawer-radius-value);
}

.pot-drawer__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* --- PotDrawer - Color --- */
    background-color: var(--pot-drawer-color-overlay);
}

/* --- Position - Left --- */
.pot-drawer._position-left {
    --pot-drawer-position-transform: translateX(-100%);

    top: 0;
    left: 0;
    height: 100%;
}

.pot-drawer._position-left .pot-drawer__container {
    height: 100%;
}

/* --- Position - Right --- */
.pot-drawer._position-right {
    --pot-drawer-position-transform: translateX(100%);

    top: 0;
    right: 0;
    height: 100%;
}

.pot-drawer._position-right .pot-drawer__container {
    height: 100%;
}

/* --- Position - Top --- */
.pot-drawer._position-top {
    --pot-drawer-position-transform: translateY(-100%);

    top: 0;
    left: 0;
    width: 100%;
}

.pot-drawer._position-top .pot-drawer__container {
    width: 100%;
}

/* --- Position - Bottom --- */
.pot-drawer._position-bottom {
    --pot-drawer-position-transform: translateY(100%);

    bottom: 0;
    left: 0;
    width: 100%;
}

.pot-drawer._position-bottom .pot-drawer__container {
    width: 100%;
}

/* --- Overlay - Transition --- */
.pot-drawer-transition-enter-active,
.pot-drawer-transition-leave-active {
    transition: 0.2s ease;
}

.pot-drawer-transition-enter-active .pot-drawer__overlay,
.pot-drawer-transition-leave-active .pot-drawer__overlay {
    transition: opacity 0.2s ease;
}

.pot-drawer-transition-enter-from .pot-drawer__overlay,
.pot-drawer-transition-leave-to .pot-drawer__overlay {
    opacity: 0;
}

/* --- Container - Transition --- */
.pot-drawer-transition-enter-active .pot-drawer__container,
.pot-drawer-transition-leave-active .pot-drawer__container {
    transition: transform 0.2s ease;
}

.pot-drawer-transition-enter-from .pot-drawer__container,
.pot-drawer-transition-leave-to .pot-drawer__container {
    transform: var(--pot-drawer-position-transform);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/drawer.css" />
<!-- Styles - END -->
