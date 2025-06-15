<script lang="ts" setup>
// Types
import type { VNode, VNodeProps } from 'vue';
import type { IPotPopoverProps } from '@/types/components/popover';
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';

// Constants
import { POT_POPOVER_POSITION } from '@/types/components/popover';

// Vue
import { computed, onUnmounted, ref, watch } from 'vue';

// Components
import PotSlotCatcher from './PotSlotCatcher.vue';

// Composables
import { usePopover } from '@/composables/popover';
import { useDialog } from '@/composables/dialog';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useClassList } from '@/composables/class-list';

const $props = withDefaults(
    defineProps<IPotPopoverProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        visible: undefined,
        modelValue: undefined,
        position: POT_POPOVER_POSITION.TOP_CENTER,
        nudge: 10,
        edgeMargin: 10,
        persistent: false,
        sticky: true,
        to: 'body',
    },
);

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

const $popover = usePopover($props);

const $dialog = useDialog({
    triggers: ['click', 'escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    close: close,
    open: open,
});

const $deviceIs = useDeviceIs();

const targetKey = ref<string | null>('');
const target = ref<Element | null>(null);
const popover = ref<Element | null>(null);

// Captures target element
const slotTargetOptions = (vnode: VNode, index: number): VNodeProps => {
    return {
        key: `pot-popover-target_${index}`,

        onVnodeMounted(vnode) {
            if (target.value || !(vnode.el instanceof Element) || typeof vnode.key !== 'string') {
                return;
            }

            target.value = vnode.el as Element;
            targetKey.value = vnode.key;
        },

        onVnodeBeforeUnmount(vnode) {
            if (targetKey.value !== vnode.key) return;

            target.value = null;
            targetKey.value = null;
        },
    };
};

// Lifecycle
onUnmounted(() => $dialog.terminate());

// Computed
const currentTarget = computed(() => $props.target ?? target.value ?? null);

const properties = computed(() => {
    return useDeviceProperties(
        {
            color: $props.color,
            size: $props.size,
            radius: $props.radius,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const classList = computed(() => useClassList({ ...properties.value }));

const styles = computed(() => {
    const isResizing =
        $popover.isTargetResizing.value ||
        $popover.isSurroundingResizing.value ||
        $popover.isPopoverResizing.value;

    return {
        ...(isResizing ? { opacity: 0 } : {}),
        transform: `translate(${$popover.x.value}px, ${$popover.y.value}px)`,
    };
});

// Watchers
watch(
    () => [popover.value, currentTarget.value],
    newValue => {
        const [newPopover, newTarget] = newValue ?? [];

        if (newPopover && newTarget) {
            $popover.setPopover(newPopover);
            $popover.setTarget(newTarget);
            $popover.setup();
        } else {
            $popover.terminate();
        }
    },
    { immediate: true },
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
</script>

<template>
    <Teleport :to="to">
        <Transition name="pot-popover-transition">
            <div
                v-if="$dialog.isOpen.value"
                v-bind="$attrs"
                ref="popover"
                :pot-dialog-id="$dialog.id.description"
                :class="['pot-popover', classList]"
                :style="styles"
            >
                <slot />
            </div>
        </Transition>
    </Teleport>

    <PotSlotCatcher :options="slotTargetOptions">
        <slot name="target" />
    </PotSlotCatcher>
</template>

<style>
.pot-popover {
    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;
    transition: opacity 0.2s ease;
}

.pot-popover-transition-enter-active,
.pot-popover-transition-leave-active {
    transition: opacity 0.2s ease;
}

.pot-popover-transition-enter-from,
.pot-popover-transition-leave-to {
    opacity: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/popover.css" />
<style src="@/assets/css/styles/conditions/popover.css" />
<style src="@/assets/css/styles/configuration/popover.css" />
<!-- Styles - END -->
