<script setup lang="ts">
// Types
import type { Ref, VNode } from 'vue';
import type { IPotPopoverExpose, IPotPopoverProps } from '@/types/components/popover';
import type { IAttachOptions } from '@/types/composables/attach';
import type { EDialogLayers } from '@/types/composables/dialog';

// Vue
import { cloneVNode, computed, inject, isVNode, provide, readonly, ref, watch } from 'vue';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useAttach } from '@/composables/attach';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useClassListArray } from '@/composables/class-list';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useAutoFocus, useFocusTrap } from '@/composables/focus';

// Components
import PotSlotCatcher from '@/components/ui/PotSlotCatcher.vue';

const $layer = DIALOG_LAYERS.POPOVER as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(defineProps<IPotPopoverProps>(), {
    visible: undefined,
    modelValue: undefined,
    position: ATTACHED_BOX_POSITION.BOTTOM_CENTER,
    nudge: 10,
    edgeMargin: 10,
    to: 'body',
    transition: 'pot-popover-transition',
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

const $dialog = useDialog({
    triggers: ['clickoutside', 'escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    layer: useDialogLayer($layer, $parentLayer),
    close,
    open,
});

const $subscriptions = useComponentSubscriptions();

// Data
const target = ref<Element | null>(null);
const box = ref<Element | null>(null);

// Computed
const currentTarget = computed(() => $props.target ?? target.value ?? null);

const teleportTo = computed(() => $props.to ?? 'body');

const zIndex = useDialogZIndex($dialog);

const properties = useDeviceProperties(
    computed(() => ({
        position: $props.position,
        nudge: $props.nudge,
        edgeMargin: $props.edgeMargin,
        color: $props.color,
        size: $props.size,
        radius: $props.radius,
    })),
    $props.devices,
);

const classList = useClassListArray(
    computed(() => ({
        position: properties.value.position,
        color: properties.value.color,
        size: properties.value.size,
        radius: properties.value.radius,
        opened: $dialog.isOpen.value,
        closed: !$dialog.isOpen.value,
    })),
    'popover',
);

const currentStyles = computed(() => {
    const x = $attach.x.value;
    const y = $attach.y.value;

    return {
        zIndex: zIndex.value,
        transform: `translate(${x}px, ${y}px)`,
    };
});

// Helper-hooks
const $attach = useAttach({
    target: currentTarget,
    box: box,
    position: computed(() => properties.value.position),
    nudge: computed(() => properties.value.nudge),
    edgeMargin: computed(() => properties.value.edgeMargin),
    persistent: $props.persistent,
    sticky: !$props.noSticky,
    onChange: () => {
        if ($props.closeOnMove) $dialog.close();
    },
});

// Subscriptions
$subscriptions.bind(
    computed(() => ($props.noFocusTrap ? null : box.value)),
    boxElement => useFocusTrap(boxElement),
    controller => controller.abort(),
);

$subscriptions.bind(
    computed(() => ($props.noAutoFocus ? null : box.value)),
    boxElement => useAutoFocus(boxElement, document.activeElement),
    controller => controller.abort(),
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
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotPopoverExpose>({
    dialogId: $dialog.id,
    isOpen: readonly($dialog.isOpen),
    coordinates: [$attach.x.value, $attach.y.value],
    target: currentTarget,
    popover: box,
    open: () => $dialog.open(),
    close: () => $dialog.close(),
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
                v-bind="$attrs"
                :key="`${$dialog.id.description}_${$dialog.isOpen.value}`"
                :class="['pot-popover', classList]"
                :style="currentStyles"
                :data-pot-dialog-id="$dialog.id.description"
            >
                <slot :dialog-id="$dialog.id" />
            </div>
        </Transition>
    </Teleport>

    <PotSlotCatcher :map-v-node="findTarget">
        <slot
            name="target"
            :dialog-id="$dialog.id"
        />
    </PotSlotCatcher>
</template>

<style>
.pot-popover {
    /* --- Color - Configuration --- */
    --pot-popover-color-background: transparent;
    --pot-popover-color-border: transparent;
    --pot-popover-color-text: inherit;

    /* --- Size - Configuration --- */
    --pot-popover-size-border: 0;
    --pot-popover-size-padding: 0;
    --pot-popover-size-shadow: none;
    --pot-popover-size-text: inherit;

    /* --- Radius - Configuration --- */
    --pot-popover-radius-value: 0;

    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotPopover - Color --- */
    border-color: var(--pot-popover-color-border);
    background-color: var(--pot-popover-color-background);
    color: var(--pot-popover-color-text);

    /* --- PotPopover - Size --- */
    border-width: var(--pot-popover-size-border);
    padding: var(--pot-popover-size-padding);
    box-shadow: var(--pot-popover-size-shadow);
    font-size: var(--pot-popover-size-text);

    /* --- PotPopover - Radius --- */
    border-radius: var(--pot-popover-radius-value);
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
