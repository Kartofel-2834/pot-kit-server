<script setup lang="ts">
// Types
import type { VNode } from 'vue';
import type {
    IPotPopoverEmits,
    IPotPopoverExpose,
    IPotPopoverProps,
} from '@/types/components/popover';

// Vue
import { cloneVNode, computed, isVNode, ref, toRef } from 'vue';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useAttach } from '@/composables/attach';
import { useDialog } from '@/composables/dialog';
import { useClassList } from '@/composables/class-list';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

// Components
import PotSlotCatcher from '@/components/ui/PotSlotCatcher.vue';

const $props = withDefaults(defineProps<IPotPopoverProps>(), {
    visible: undefined,
    modelValue: undefined,
    position: ATTACHED_BOX_POSITION.BOTTOM_CENTER,
    nudge: 10,
    edgeMargin: 10,
    to: 'body',
    transition: 'pot-popover-transition',
});

const $emit = defineEmits<IPotPopoverEmits>();

// Data
const target = ref<Element | null>(null);
const box = ref<Element | null>(null);

// Computed
const currentTarget = computed(() => $props.target ?? target.value ?? null);

const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => {
    return {
        zIndex: $dialog.zIndex.value,
        transform: `translate(${$attach.x.value}px, ${$attach.y.value}px)`,
    };
});

// Composables
const $dialog = useDialog({
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    triggers: ['clickoutside', 'escape'],
    layer: DIALOG_LAYERS.POPOVER,
    close,
    open,
});

const $properties = useDeviceProperties(
    {
        position: toRef(() => $props.position),
        nudge: toRef(() => $props.nudge),
        edgeMargin: toRef(() => $props.edgeMargin),
        color: toRef(() => $props.color),
        size: toRef(() => $props.size),
        radius: toRef(() => $props.radius),
    },
    toRef(() => $props.devices),
);

const $classList = useClassList(
    {
        position: $properties.position,
        color: $properties.color,
        size: $properties.size,
        radius: $properties.radius,
        opened: $dialog.isOpen,
        closed: computed(() => !$dialog.isOpen.value),
        hidden: computed(() => $attach.x.value === null || $attach.y.value === null),
    },
    'popover',
);

const $attach = useAttach({
    target: currentTarget,
    box: box,
    position: $properties.position,
    nudge: $properties.nudge,
    edgeMargin: $properties.edgeMargin,
    persistent: toRef(() => $props.persistent),
    sticky: toRef(() => !$props.noSticky),
    onChange: () => {
        if ($props.closeOnMove) $dialog.close();
    },
});

useFocusTrap(computed(() => ($props.noFocusTrap ? null : box.value)));

useAutoFocus(computed(() => ($props.noAutoFocus ? null : box.value)));

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

    if (Array.isArray(vnode.children)) {
        vnode.children = vnode.children.map(v => (isVNode(v) ? findTarget(v) : v));
    }

    return cloneVNode(vnode, {
        onVnodeMounted(vnode) {
            if (target.value || !(vnode.el instanceof Element)) return;
            target.value = vnode.el as Element;
        },

        onVnodeBeforeUnmount() {
            if (target.value === vnode.el) {
                target.value = null;
            }
        },
    });
}

// Exports
defineExpose<Readonly<IPotPopoverExpose>>({
    isOpen: $dialog.isOpen,
    x: $attach.x,
    y: $attach.y,
    target: currentTarget,
    popover: box,
    marker: toRef(() => $dialog.marker),
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
                ref="box"
                v-bind="$dialog.marker"
                :key="`${$dialog.id.description}_${$dialog.isOpen.value}`"
                :class="['pot-popover', $classList, classList]"
                :style="currentStyles"
            >
                <slot
                    :open="open"
                    :close="close"
                />
            </div>
        </Transition>
    </Teleport>

    <PotSlotCatcher :map-v-node="findTarget">
        <slot
            name="target"
            :marker="$dialog.marker"
            :open="open"
            :close="close"
        />
    </PotSlotCatcher>
</template>

<style>
.pot-popover {
    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotPopover - Color --- */
    border-color: var(--pot-popover-color-border, transparent);
    background-color: var(--pot-popover-color-background, transparent);
    color: var(--pot-popover-color-text, inherit);

    /* --- PotPopover - Size --- */
    border-width: var(--pot-popover-size-border, 0);
    padding: var(--pot-popover-size-padding, 0);
    box-shadow: var(--pot-popover-size-shadow, none);
    font-size: var(--pot-popover-size-text, inherit);
    font-weight: var(--pot-button-size-text-weight, 400);
    line-height: var(--pot-button-size-text-height, 1);

    /* --- PotPopover - Radius --- */
    border-radius: var(--pot-popover-radius-value, 0);
}

.pot-popover._popover-hidden {
    opacity: 0;
}

.pot-popover-transition-enter-active,
.pot-popover-transition-leave-active {
    transition: opacity var(--pot-popover-transition-duration, 0.2s)
        var(--pot-popover-transition-function, ease);
}

.pot-popover-transition-enter-from,
.pot-popover-transition-leave-to {
    opacity: 0;
}
</style>
