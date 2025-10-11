<script lang="ts" setup>
// Types
import type { IPotGroupProps } from '@/types/components/group';

// Vue
import { computed } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';

const $props = withDefaults(defineProps<IPotGroupProps>(), {
    tag: 'div',
});

const $deviceIs = useDeviceIs();

// Computed
const properties = computed(() => {
    return useDeviceProperties(
        {
            gap: $props.gap,
            direction: $props.direction,
            align: $props.align,
            alignContent: $props.alignContent,
            justify: $props.justify,
            justifyItems: $props.justifyItems,
            wrap: $props.wrap,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const classList = computed(() =>
    useClassList({
        gap: properties.value.gap,
    }),
);

const currentStyles = computed(() => {
    return {
        'flex-direction': properties.value.direction,
        'align-items': properties.value.align,
        'align-content': properties.value.alignContent,
        'justify-content': properties.value.justify,
        'justify-items': properties.value.justifyItems,
        'flex-wrap': properties.value.wrap,
    };
});
</script>

<template>
    <component
        :is="tag"
        :class="['pot-group', classList]"
        :style="currentStyles"
    >
        <slot />
    </component>
</template>

<style>
.pot-group {
    /* --- Gap - Configuration --- */
    --pot-group-gap-value: auto;

    display: flex;

    /* --- PotGroup - Gap --- */
    gap: var(--pot-group-gap-value);
}
</style>
