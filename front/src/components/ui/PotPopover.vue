<script lang="ts" setup>
// Types
import type { Ref } from 'vue';
import type { IPotPopoverExpose, IPotPopoverProps } from '@/types/components/popover';
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { POT_ATTACHED_BOX_POSITION } from '@/types/components/attach-target';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onUnmounted, provide, readonly, ref, watch } from 'vue';

// Composables
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useClassList } from '@/composables/class-list';

// Components
import PotAttachTarget from '@/components/ui/PotAttachTarget.vue';
import { useFocusTrap } from '@/composables/focus-trap';

const $layer = DIALOG_LAYERS.DIALOG as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

const $props = withDefaults(
    defineProps<IPotPopoverProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        visible: undefined,
        modelValue: undefined,
        position: POT_ATTACHED_BOX_POSITION.TOP_CENTER,
        nudge: 10,
        edgeMargin: 10,
        persistent: false,
        noSticky: false,
        noAutoFocus: false,
        noFocusTrap: false,
        to: 'body',
        transition: 'pot-popover-transition',
    },
);

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

const $dialog = useDialog({
    triggers: ['clickoutside', 'escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    layer: computed(() => useDialogLayer($layer, $parentLayer.value)),
    close: close,
    open: open,
});

const $deviceIs = useDeviceIs();

const $focusTrap = useFocusTrap();

// Data
const box = ref<Element | null>(null);
const attachTarget = ref<InstanceType<typeof PotAttachTarget> | null>(null);

// Lifecycle
onUnmounted(() => $dialog.terminate());

// Computed
const teleportTo = computed(() => $props.to ?? 'body');

const properties = computed(() => {
    return useDeviceProperties(
        {
            position: $props.position,
            nudge: $props.nudge,
            edgeMargin: $props.edgeMargin,
            color: $props.color,
            size: $props.size,
            radius: $props.radius,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const classList = computed(() => useClassList({ ...properties.value }));

const currentStyles = computed(() => {
    const x = attachTarget.value?.boxX ?? 0;
    const y = attachTarget.value?.boxY ?? 0;

    return {
        zIndex: useDialogZIndex($dialog),
        transform: `translate(${x}px, ${y}px)`,
    };
});

// Watchers
watch(
    () => [box.value, $props.noFocusTrap],
    newValue => {
        const [box] = newValue;

        if (box instanceof Element) {
            $focusTrap.setup(box, {
                trap: !$props.noFocusTrap,
                autofocus: !$props.noAutoFocus,
            });
        } else {
            $focusTrap.terminate();
        }
    },
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

// Exports
provide('pot-dialog-layer', $dialog.layer);

defineExpose<IPotPopoverExpose>({
    isOpen: readonly($dialog.isOpen),
    x: attachTarget.value?.boxX,
    y: attachTarget.value?.boxY,
    target: attachTarget.value?.target as Element,
    popover: box.value,
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
                ref="box"
                v-if="$dialog.isOpen.value"
                v-bind="$attrs"
                :key="`${$dialog.id.description}_${$dialog.isOpen.value}`"
                :class="['pot-popover', classList]"
                :style="currentStyles"
                :pot-dialog-id="$dialog.id.description"
            >
                <slot />
            </div>
        </Transition>
    </Teleport>

    <PotAttachTarget
        ref="attachTarget"
        :box="box"
        :position="properties.position"
        :edge-margin="properties.edgeMargin"
        :nudge="properties.nudge"
        :target="target"
        :sticky="!noSticky"
        :persistent="persistent"
    >
        <slot name="target" />
    </PotAttachTarget>
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
