<script lang="ts" setup>
// Types
import type { IPotDrawerExpose, IPotDrawerProps } from '@/types/components/drawer';

// Constants
import { POT_DRAWER_POSITION } from '@/types/components/drawer';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, ref, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';
import { useDialog } from '@/composables/dialog';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

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

// Data
const container = ref<Element | null>(null);

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => ({ zIndex: $dialog.zIndex.value }));

// Composables
const $dialog = useDialog({
    triggers: ['escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
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
    $props.devices,
);

const $classList = useClassList(
    {
        position: $properties.position,
        size: $properties.size,
        color: $properties.color,
        radius: $properties.radius,
    },
    'pot-drawer',
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
defineExpose<Readonly<IPotDrawerExpose>>({
    isOpen: $dialog.isOpen,
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
                :class="$classList"
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
    position: fixed;
}

.pot-drawer__container {
    position: relative;
    overflow: auto;
    border-style: solid;

    /* --- PotDrawer - Color --- */
    border-color: var(--pot-drawer-color-border, transparent);
    background-color: var(--pot-drawer-color-background, transparent);

    /* --- PotDrawer - Size --- */
    padding: var(--pot-drawer-size-padding, 0);
    border-width: var(--pot-drawer-size-border, 0);
    font-size: var(--pot-drawer-size-text, inherit);
    box-shadow: var(--pot-drawer-size-shadow, none);

    /* --- PotDrawer - Radius --- */
    border-radius: var(--pot-drawer-radius-value, 0);
}

.pot-drawer__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* --- PotDrawer - Color --- */
    background-color: var(--pot-drawer-color-overlay, rgba(0, 0, 0, 0.3));
}

/* --- Position - Left --- */
.pot-drawer.pot-drawer_position-left {
    --pot-drawer-position-transform: translateX(-100%);

    top: 0;
    left: 0;
    height: 100%;
}

.pot-drawer.pot-drawer_position-left .pot-drawer__container {
    height: 100%;
}

/* --- Position - Right --- */
.pot-drawer.pot-drawer_position-right {
    --pot-drawer-position-transform: translateX(100%);

    top: 0;
    right: 0;
    height: 100%;
}

.pot-drawer.pot-drawer_position-right .pot-drawer__container {
    height: 100%;
}

/* --- Position - Top --- */
.pot-drawer.pot-drawer_position-top {
    --pot-drawer-position-transform: translateY(-100%);

    top: 0;
    left: 0;
    width: 100%;
}

.pot-drawer.pot-drawer_position-top .pot-drawer__container {
    width: 100%;
}

/* --- Position - Bottom --- */
.pot-drawer.pot-drawer_position-bottom {
    --pot-drawer-position-transform: translateY(100%);

    bottom: 0;
    left: 0;
    width: 100%;
}

.pot-drawer.pot-drawer_position-bottom .pot-drawer__container {
    width: 100%;
}

/* --- Overlay - Transition --- */
.pot-drawer-transition-enter-active,
.pot-drawer-transition-leave-active {
    transition: var(--pot-drawer-transition-duration, 0.2s)
        var(--pot-drawer-transition-function, ease);
}

.pot-drawer-transition-enter-active .pot-drawer__overlay,
.pot-drawer-transition-leave-active .pot-drawer__overlay {
    transition: opacity var(--pot-drawer-transition-duration, 0.2s)
        var(--pot-drawer-transition-function, ease);
}

.pot-drawer-transition-enter-from .pot-drawer__overlay,
.pot-drawer-transition-leave-to .pot-drawer__overlay {
    opacity: 0;
}

/* --- Container - Transition --- */
.pot-drawer-transition-enter-active .pot-drawer__container,
.pot-drawer-transition-leave-active .pot-drawer__container {
    transition: transform var(--pot-drawer-transition-duration, 0.2s)
        var(--pot-drawer-transition-function, ease);
}

.pot-drawer-transition-enter-from .pot-drawer__container,
.pot-drawer-transition-leave-to .pot-drawer__container {
    transform: var(--pot-drawer-position-transform);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/drawer.css" />
<!-- Styles - END -->
