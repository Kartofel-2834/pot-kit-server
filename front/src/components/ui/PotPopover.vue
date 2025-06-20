<script lang="ts" setup>
// Types
import type { IPotPopoverProps } from '@/types/components/popover';
import type { EPotColor, EPotDevice, EPotRadius, EPotSize } from '@/types';

// Constants
import { POT_ATTACHED_BOX_POSITION } from '@/types/components/attached-box';

// Vue
import { computed, onUnmounted, readonly, ref } from 'vue';

// Composables
import { useDialog, useDialogZIndex } from '@/composables/dialog';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useClassList } from '@/composables/class-list';

// Components
import PotAttachTarget from '@/components/ui/PotAttachTarget.vue';

const $props = withDefaults(
    defineProps<IPotPopoverProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        visible: undefined,
        modelValue: undefined,
        position: POT_ATTACHED_BOX_POSITION.TOP_CENTER,
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

const $dialog = useDialog({
    triggers: ['click', 'escape'],
    isOpen: computed(() => Boolean($props.visible ?? $props.modelValue)),
    close: close,
    open: open,
});

const $deviceIs = useDeviceIs();

// Data
const box = ref<Element | null>(null);
const attachTarget = ref<InstanceType<typeof PotAttachTarget> | null>(null);

// Lifecycle
onUnmounted(() => $dialog.terminate());

// Computed
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

const currentStyles = computed(() => {
    const x = attachTarget.value?.x ?? 0;
    const y = attachTarget.value?.y ?? 0;

    return {
        zIndex: useDialogZIndex($dialog),
        transform: `translate(${x}px, ${y}px)`,
    };
});

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
defineExpose({
    isOpen: readonly($dialog.isOpen),
    x: attachTarget.value?.x,
    y: attachTarget.value?.y,
    target: attachTarget.value?.target,
    popover: box.value,
    open: () => $dialog.open(),
    close: () => $dialog.close(),
});
</script>

<template>
    <Transition name="pot-popover-transition">
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

    <PotAttachTarget
        ref="attachTarget"
        :box="box"
        :position="position"
        :target="target"
        :to="to"
        :sticky="sticky"
        :persistent="persistent"
        :edge-margin="edgeMargin"
        :nudge="nudge"
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
