<script lang="ts" setup>
// Types
import type { EPotColor, EPotDevice, EPotRadius } from '@/types';
import type { IPotDrawerProps } from '@/types/components/drawer';

// Constants
import { POT_DRAWER_POSITION } from '@/types/components/drawer';

// Vue
import { computed } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDialog, useDialogZIndex } from '@/composables/dialog';

const $props = withDefaults(defineProps<IPotDrawerProps<EPotDevice, EPotColor, EPotRadius>>(), {
    visible: undefined,
    modelValue: undefined,
    position: POT_DRAWER_POSITION.RIGHT,
    to: 'body',
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

const $dialog = useDialog({
    triggers: ['clickoutside', 'escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    close: close,
    open: open,
});

const $deviceIs = useDeviceIs();

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const properties = computed(() => {
    return useDeviceProperties(
        {
            position: $props.position,
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.pot-drawer__container {
    position: absolute;
    background: white;
}

.pot-drawer__overlay {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
}

/* --- Positions --- */
.pot-drawer._position-left .pot-drawer__container {
    --pot-drawer-position-transform: translateX(-100%);

    top: 0;
    left: 0;
    height: 100%;
}

.pot-drawer._position-right .pot-drawer__container {
    --pot-drawer-position-transform: translateX(100%);

    top: 0;
    right: 0;
    height: 100%;
}

.pot-drawer._position-top .pot-drawer__container {
    --pot-drawer-position-transform: translateY(-100%);

    top: 0;
    left: 0;
    width: 100%;
}

.pot-drawer._position-bottom .pot-drawer__container {
    --pot-drawer-position-transform: translateY(100%);

    bottom: 0;
    left: 0;
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
