<script lang="ts" generic="T = unknown" setup>
// Types
import type { IPotToastProps } from '@/types/components/toast';
import type { IToastDialog } from '@/types/composables/toast';

// Constants
import { POT_TOAST_POSITION } from '@/types/components/toast';

// Vue
import { computed, ref } from 'vue';

// Composables
import { useToast } from '@/composables/toast';
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';

const $props = withDefaults(defineProps<IPotToastProps<T>>(), {
    group: undefined,
    position: POT_TOAST_POSITION.BOTTOM_RIGHT,
    to: 'body',
    transition: 'pot-toast-transition',
});

const $deviceIs = useDeviceIs();

const $toast = useToast();

// Data
const toastDialogsList = ref<HTMLElement[]>([]);

// Computed
const toastsList = computed(() => $toast.list.value.filter(toast => toast.group === $props.group));

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

// Methods
function getData(toast: IToastDialog): T {
    return toast.data as T;
}
</script>

<template>
    <Teleport
        :to="teleportTo"
        :disabled="!to"
    >
        <TransitionGroup
            :name="transition"
            class="pot-toast"
            tag="div"
        >
            <div
                v-for="(toastDialog, index) in toastsList"
                :key="toastDialog.id.description"
                ref="toastDialogsList"
                class="pot-toast__container"
            >
                <slot
                    :id="toastDialog.id"
                    :data="getData(toastDialog)"
                    :index="index"
                    :close="() => $toast.remove(toastDialog.id)"
                >
                    {{ toastDialog.data }}
                </slot>
            </div>
        </TransitionGroup>
    </Teleport>
</template>

<style>
.pot-toast {
    position: fixed;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
}

.pot-toast__container {
    position: relative;
    max-height: 1000px;

    background-color: cadetblue;
    color: white;
    font-size: 2rem;
    margin-bottom: 2rem;
}

/* --- Transition - Toast --- */
.pot-toast-transition-enter-active,
.pot-toast-transition-leave-active {
    transition:
        max-height 0.45s cubic-bezier(0, 1, 0, 1),
        opacity 0.2s,
        margin-bottom 0.4s;
}

.pot-toast-transition-enter-from,
.pot-toast-transition-leave-to {
    opacity: 0;
    margin-bottom: 0;
    margin-top: 0;
    max-height: 0;
}
</style>
