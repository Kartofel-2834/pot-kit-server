<script lang="ts" setup>
// Types
import type { Ref } from 'vue';
import type { IPotDialogProps } from '@/types/components/dialog';
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';
import type { EPotDialogLayers } from '@/types/composables/dialog';

// Constants
import { POT_DIALOG_POSITION } from '@/types/components/dialog';
import { POT_DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onUnmounted, provide, ref } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';

const $layer = POT_DIALOG_LAYERS.DIALOG as EPotDialogLayers;
const $parentLayer = inject<Ref<EPotDialogLayers>>('pot-dialog-layer', ref(POT_DIALOG_LAYERS.NONE));

const $props = withDefaults(
    defineProps<IPotDialogProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        visible: undefined,
        modelValue: undefined,
        position: POT_DIALOG_POSITION.CENTER,
        to: 'body',
        noOverlay: false,
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
    layer: computed(() => useDialogLayer($layer, $parentLayer?.value)),
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
provide('pot-dialog-layer', $dialog.layer);
</script>

<template>
    <Teleport
        :to="teleportTo"
        :disabled="!to"
    >
        <Transition name="pot-dialog-transition">
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

                <div class="pot-dialog__container">
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
</style>
