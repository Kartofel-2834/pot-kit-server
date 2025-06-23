<script lang="ts" setup>
// Types
import type { EPotColor, EPotDevice, EPotRadius } from '@/types';
import type { IPotDrawerExports, IPotDrawerProps } from '@/types/components/drawer';

// Constants
import { POT_DRAWER_POSITION } from '@/types/components/drawer';

// Vue
import { computed, onUnmounted, readonly } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDialog, useDialogZIndex } from '@/composables/dialog';

const $props = withDefaults(defineProps<IPotDrawerProps<EPotDevice, EPotColor, EPotRadius>>(), {
    visible: undefined,
    modelValue: undefined,
    position: POT_DRAWER_POSITION.LEFT,
    to: 'body',
    noOverlay: false,
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    close,
    open,
});

const $deviceIs = useDeviceIs();

// Lifecycle
onUnmounted(() => $dialog.terminate());

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const properties = computed(() => {
    return useDeviceProperties(
        {
            position: $props.position,
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
defineExpose<IPotDrawerExports>({
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
        <Transition name="pot-drawer-transition">
            <div
                v-if="$dialog.isOpen.value"
                :pot-dialog-id="$dialog.id.description"
                :class="['pot-drawer', classList]"
                :style="currentStyles"
            >
                <div
                    v-if="!noOverlay"
                    class="pot-drawer__overlay"
                    @click="close"
                />

                <div class="pot-drawer__container">
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
}

.pot-drawer__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
<style src="@/assets/css/styles/conditions/drawer.css" />
<style src="@/assets/css/styles/configuration/drawer.css" />
<!-- Styles - END -->
