<script lang="ts" generic="T = unknown" setup>
// Types
import type { Ref } from 'vue';
import type { IPotToastExpose, IPotToastProps } from '@/types/components/toast';
import type { IToastDialog } from '@/types/composables/toast';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { POT_TOAST_POSITION } from '@/types/components/toast';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, ref, inject, onUnmounted, provide } from 'vue';

// Composables
import { useToast } from '@/composables/toast';
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';

const $layer = DIALOG_LAYERS.TOAST as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(defineProps<IPotToastProps<T>>(), {
    group: undefined,
    position: POT_TOAST_POSITION.TOP_LEFT,
    to: 'body',
    transition: 'pot-toast-transition',
});

const $deviceIs = useDeviceIs();

const $toast = useToast<T>();

const $dialog = useDialog({
    triggers: ['escape'],
    isOpen: computed(() => Boolean($toast.list.value.length)),
    layer: computed(() => useDialogLayer($layer, $parentLayer.value)),
    close: pop,
    open: () => {},
});

// Data
const toastDialogsList = ref<HTMLElement[]>([]);

// Lifecycle
onUnmounted(() => {
    $dialog.terminate();
});

// Computed
const toastsList = computed(() => {
    return $toast.list.value.filter(toast => toast.group === $props.group) as IToastDialog<T>[];
});

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

// Methods
function getData(toast: IToastDialog): T {
    return toast.data as T;
}

function pop() {
    const firstToast = $toast.list.value[0];
    if (firstToast) close(firstToast.id);
}

function close(id: Symbol) {
    $toast.remove(id);
}

// Exports
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotToastExpose<T>>({
    list: toastsList,
    pop,
    close,
});
</script>

<template>
    <Teleport
        :to="teleportTo"
        :disabled="!to"
    >
        <TransitionGroup
            :name="transition"
            :class="['pot-toast', classList]"
            :style="currentStyles"
            tag="div"
            role="alertdialog"
        >
            <div
                v-for="(toastDialog, index) in toastsList"
                :key="toastDialog.id.description"
                ref="toastDialogsList"
                class="pot-toast__item"
            >
                <div class="pot-toast__item__container">
                    <slot
                        :id="toastDialog.id"
                        :data="getData(toastDialog)"
                        :index="index"
                        :close="() => close(toastDialog.id)"
                    >
                        {{ toastDialog.data }}
                    </slot>
                </div>
            </div>
        </TransitionGroup>
    </Teleport>
</template>

<style>
.pot-toast {
    /* --- Color - Configuration --- */
    --pot-toast-color-background: transparent;
    --pot-toast-color-border: transparent;
    --pot-toast-color-text: inherit;

    /* --- Size - Configuration --- */
    --pot-toast-size-border: 0;
    --pot-toast-size-padding: 0;
    --pot-toast-size-shadow: none;
    --pot-toast-size-text: inherit;
    --pot-toast-size-edge-margin: 20px;
    --pot-toast-size-gap: 20px;

    /* --- Radius - Configuration --- */
    --pot-toast-radius-value: 0;

    position: fixed;
    display: flex;
    flex-direction: column;
}

.pot-toast__item {
    position: relative;
    max-height: 1000px;
}

.pot-toast__item__container {
    border-style: solid;

    /* --- PotTooltip - Color --- */
    border-color: var(--pot-toast-color-border);
    background-color: var(--pot-toast-color-background);
    color: var(--pot-toast-color-text);

    /* --- PotTooltip - Size --- */
    border-width: var(--pot-toast-size-border);
    padding: var(--pot-toast-size-padding);
    box-shadow: var(--pot-toast-size-shadow);
    font-size: var(--pot-toast-size-text);

    /* --- PotTooltip - Radius --- */
    border-radius: var(--pot-toast-radius-value);
}

.pot-toast._position-top-left .pot-toast__item__container,
.pot-toast._position-top-center .pot-toast__item__container,
.pot-toast._position-top-right .pot-toast__item__container {
    margin-bottom: var(--pot-toast-size-gap);
}

.pot-toast._position-bottom-left .pot-toast__item__container,
.pot-toast._position-bottom-center .pot-toast__item__container,
.pot-toast._position-bottom-right .pot-toast__item__container {
    margin-top: var(--pot-toast-size-gap);
}

/* --- Toast - Position - Top-left  --- */
.pot-toast._position-top-left {
    top: var(--pot-toast-size-edge-margin);
    left: var(--pot-toast-size-edge-margin);
}

/* --- Toast - Position - Top-center  --- */
.pot-toast._position-top-center {
    top: var(--pot-toast-size-edge-margin);
    left: 50%;
    transform: translateX(-50%);
}

/* --- Toast - Position - Top-right  --- */
.pot-toast._position-top-right {
    top: var(--pot-toast-size-edge-margin);
    right: var(--pot-toast-size-edge-margin);
}

/* --- Toast - Position - Bottom-left  --- */
.pot-toast._position-bottom-left {
    flex-direction: column-reverse;
    bottom: var(--pot-toast-size-edge-margin);
    left: var(--pot-toast-size-edge-margin);
}

/* --- Toast - Position - Bottom-center  --- */
.pot-toast._position-bottom-center {
    flex-direction: column-reverse;
    bottom: var(--pot-toast-size-edge-margin);
    left: 50%;
    transform: translateX(-50%);
}

/* --- Toast - Position - Bottom-right  --- */
.pot-toast._position-bottom-right {
    flex-direction: column-reverse;
    bottom: var(--pot-toast-size-edge-margin);
    right: var(--pot-toast-size-edge-margin);
}

/* --- Transition - Toast --- */
.pot-toast-transition-enter-active,
.pot-toast-transition-leave-active {
    transition:
        max-height 0.45s cubic-bezier(0, 1, 0, 1),
        opacity 0.2s,
        margin-bottom 0.4s,
        margin-top 0.4s;
}

.pot-toast-transition-enter-from,
.pot-toast-transition-leave-to {
    opacity: 0;
    margin-bottom: 0;
    margin-top: 0;
    max-height: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/toast.css" />
<!-- Styles - END -->
