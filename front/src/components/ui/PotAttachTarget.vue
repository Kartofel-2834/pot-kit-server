<script lang="ts" setup>
// Types
import type { Ref, VNode } from 'vue';
import type {
    IPotAttachTargetExpose,
    IPotAttachTargetProps,
} from '@/types/components/attach-target';

// Constants
import { POT_ATTACHED_BOX_POSITION } from '@/types/components/attach-target';

// Vue
import { cloneVNode, computed, isVNode, onUnmounted, readonly, ref, watch } from 'vue';

// Components
import PotSlotCatcher from '@/components/ui/PotSlotCatcher.vue';

// Composables
import { useAttach } from '@/composables/attach';

const $props = withDefaults(defineProps<IPotAttachTargetProps>(), {
    position: POT_ATTACHED_BOX_POSITION.TOP_CENTER,
    nudge: 10,
    edgeMargin: 10,
    persistent: false,
    sticky: true,
});

const $attach = useAttach($props);

// Data
const target = ref<Element | null>(null);
const targetKey = ref<Symbol | null>(null);

// Lifecycle
onUnmounted(() => $attach.terminate());

// Computed
const currentTarget = computed(() => $props.target ?? target.value ?? null);

// Watchers
watch(
    () => [$props.box, currentTarget.value],
    newValue => {
        const [newBox, newTarget] = newValue ?? [];

        if (newBox && newTarget) {
            $attach.setBox(newBox);
            $attach.setTarget(newTarget);
            $attach.setup();
        } else {
            $attach.terminate();
        }
    },
    { immediate: true },
);

// Methods
function findTarget(vnode: VNode): VNode | null {
    if (!isVNode(vnode)) return vnode;

    const id = Symbol(`pot-attach-target_${Math.random().toString(36).slice(2, 9)}`);

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
defineExpose<IPotAttachTargetExpose>({
    boxX: readonly($attach.x),
    boxY: readonly($attach.y),
    target: readonly(currentTarget) as Readonly<Ref<Element | null>>,
});
</script>

<template>
    <PotSlotCatcher :map-v-node="findTarget">
        <slot />
    </PotSlotCatcher>
</template>
