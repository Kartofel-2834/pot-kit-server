<script lang="ts" generic="DATA = any" setup>
// Types
import type { IPotToastExpose, IPotToastProps } from '@/types/components/toast';
import type { IToastDialog } from '@/types/composables/toast';

// Vue
import { computed, toRef } from 'vue';

// Constants
import { POT_TOAST_POSITION } from '@/types/components/toast';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Composables
import { useToast } from '@/composables/toast';
import { useDialog } from '@/composables/dialog';
import { useDeviceProperties } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';

const $props = withDefaults(defineProps<IPotToastProps<DATA>>(), {
    group: undefined,
    position: POT_TOAST_POSITION.TOP_LEFT,
    to: 'body',
    transition: 'pot-toast-transition',
});

// Computed
const toastsList = computed(() => {
    return $toast.list.value.filter(toast => toast.group === $props.group) as IToastDialog<DATA>[];
});

const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => ({ zIndex: $dialog.zIndex.value }));

// Composables
const $toast = useToast<DATA>();

const $dialog = useDialog({
    triggers: [],
    isOpen: toRef(() => Boolean($toast.list.value.length)),
    layer: DIALOG_LAYERS.TOAST,
    close: pop,
    open: () => {},
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
    'toast',
);

// Methods
function getData(toast: IToastDialog): DATA {
    return toast.data as DATA;
}

function pop() {
    const firstToast = $toast.list.value[0];
    if (firstToast) close(firstToast.id);
}

function close(id: Symbol) {
    $toast.remove(id);
}

// Exports
defineExpose<IPotToastExpose<DATA>>({
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
            :class="['pot-toast', $classList, classList]"
            :style="currentStyles"
            v-bind="$dialog.marker"
            tag="div"
            role="alert"
        >
            <div
                v-for="(toastDialog, index) in toastsList"
                :key="toastDialog.id.description"
                ref="toastDialogsList"
                class="pot-toast-item"
            >
                <div class="pot-toast-item-container">
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
    position: fixed;
    display: flex;
    flex-direction: column;
}

.pot-toast-item {
    position: relative;
    max-height: 1000px;
}

.pot-toast-item-container {
    border-style: solid;

    /* --- PotToast - Color --- */
    border-color: var(--pot-toast-color-border, transparent);
    background-color: var(--pot-toast-color-background, transparent);
    color: var(--pot-toast-color-text, inherit);

    /* --- PotToast - Size --- */
    border-width: var(--pot-toast-size-border, 0);
    padding: var(--pot-toast-size-padding, 0);
    box-shadow: var(--pot-toast-size-shadow, none);
    font-size: var(--pot-toast-size-text, inherit);

    /* --- PotToast - Radius --- */
    border-radius: var(--pot-toast-radius-value, 0);
}

.pot-toast._toast-position-top-left .pot-toast-item-container,
.pot-toast._toast-position-top-center .pot-toast-item-container,
.pot-toast._toast-position-top-right .pot-toast-item-container {
    margin-bottom: var(--pot-toast-size-gap, 20px);
}

.pot-toast._toast-position-bottom-left .pot-toast-item-container,
.pot-toast._toast-position-bottom-center .pot-toast-item-container,
.pot-toast._toast-position-bottom-right .pot-toast-item-container {
    margin-top: var(--pot-toast-size-gap, 20px);
}

/* --- Toast - Position - Top-left  --- */
.pot-toast._toast-position-top-left {
    top: var(--pot-toast-size-edge-margin, 20px);
    left: var(--pot-toast-size-edge-margin, 20px);
}

/* --- Toast - Position - Top-center  --- */
.pot-toast._toast-position-top-center {
    top: var(--pot-toast-size-edge-margin, 20px);
    left: 50%;
    transform: translateX(-50%);
}

/* --- Toast - Position - Top-right  --- */
.pot-toast._toast-position-top-right {
    top: var(--pot-toast-size-edge-margin, 20px);
    right: var(--pot-toast-size-edge-margin, 20px);
}

/* --- Toast - Position - Bottom-left  --- */
.pot-toast._toast-position-bottom-left {
    flex-direction: column-reverse;
    bottom: var(--pot-toast-size-edge-margin, 20px);
    left: var(--pot-toast-size-edge-margin, 20px);
}

/* --- Toast - Position - Bottom-center  --- */
.pot-toast._toast-position-bottom-center {
    flex-direction: column-reverse;
    bottom: var(--pot-toast-size-edge-margin, 20px);
    left: 50%;
    transform: translateX(-50%);
}

/* --- Toast - Position - Bottom-right  --- */
.pot-toast._toast-position-bottom-right {
    flex-direction: column-reverse;
    bottom: var(--pot-toast-size-edge-margin, 20px);
    right: var(--pot-toast-size-edge-margin, 20px);
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
