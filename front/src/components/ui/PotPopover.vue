<script lang="ts" setup>
// Types
import type { VNode } from 'vue';
import type { IPotPopoverProps } from '@/types/components/popover';
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';

// Constants
import { POT_POPOVER_POSITION } from '@/types/components/popover';

// Vue
import { cloneVNode, computed, isVNode, onUnmounted, readonly, ref, watch } from 'vue';

// Components
import PotSlotCatcher from '@/components/ui/PotSlotCatcher.vue';

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

// Data
const targetKey = ref<Symbol | null>(null);
const target = ref<Element | null>(null);
const popover = ref<Element | null>(null);

// Lifecycle
onUnmounted(() => {
    $dialog.terminate();
    $popover.terminate();
});

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

function findTarget(vnode: VNode): VNode | null {
    if (!isVNode(vnode)) return vnode;

    const id = Symbol(`pot-popover-target_${Math.random().toString(36).slice(2, 9)}`);

    if (Array.isArray(vnode.children)) {
        vnode.children = vnode.children.map(v => (isVNode(v) ? findTarget(v) : v));
    }

    return cloneVNode(vnode, {
        onVnodeMounted(vnode) {
            if (target.value || !(vnode.el instanceof Element)) return;

            target.value = vnode.el as Element;
            targetKey.value = id;
        },

        onVnodeBeforeUnmount() {
            target.value = null;
            targetKey.value = null;
        },
    });
}

// Exports
defineExpose({
    x: readonly($popover.x),
    y: readonly($popover.y),
    isOpen: readonly($dialog.isOpen),
    target: readonly(currentTarget),
    popover: readonly(popover),
    open: () => $dialog.open(),
    close: () => $dialog.close(),
});
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

    <PotSlotCatcher :map-v-node="findTarget">
        <slot name="target" />
    </PotSlotCatcher>
</template>

<style>
.pot-popover {
    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;
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
