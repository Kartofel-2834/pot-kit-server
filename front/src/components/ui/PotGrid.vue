<template>
    <component
        :is="tag"
        :class="['pot-grid', classList]"
        :style="currentStyles"
    >
        <slot />
    </component>
</template>

<script lang="ts" setup>
// Types
import type { IPotGridProps } from '@/types/components/grid';

// Vue
import { computed } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-properties';
import { useClassList } from '@/composables/class-list';
import { useDeviceIs } from '@/composables/device-is';

const $props = withDefaults(defineProps<IPotGridProps>(), {
    tag: 'div',
});

const $deviceIs = useDeviceIs();

// Computed
const properties = computed(() => {
    return useDeviceProperties(
        {
            cols: $props.cols,
            rows: $props.rows,
            flow: $props.flow,
            autoCols: $props.autoCols,
            autoRows: $props.autoRows,
            align: $props.align,
            alignContent: $props.alignContent,
            justify: $props.justify,
            justifyItems: $props.justifyItems,
            gap: $props.gap,
            rowGap: $props.rowGap,
            columnGap: $props.columnGap,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const classList = computed(() =>
    useClassList({
        gap: properties.value.gap,
        'row-gap': properties.value.rowGap,
        'column-gap': properties.value.columnGap,
        'divided-gap': Boolean(properties.value.rowGap || properties.value.columnGap),
    }),
);

const currentStyles = computed(() => {
    return {
        'grid-template-columns': formatNumberToFr(properties.value.cols),
        'grid-template-rows': formatNumberToFr(properties.value.rows),
        'grid-auto-flow': properties.value.flow,
        'grid-auto-rows': properties.value.autoRows,
        'grid-auto-columns': properties.value.autoCols,
        'align-items': properties.value.align,
        'align-content': properties.value.alignContent,
        'justify-content': properties.value.justify,
        'justify-items': properties.value.justifyItems,
    };
});

// Methods
function formatNumberToFr(v?: string | number): string | undefined {
    if (['number', 'string'].includes(typeof v) && !isNaN(Number(v))) {
        return `repeat(${v}, 1fr)`;
    }

    return v ? String(v) : undefined;
}
</script>

<style>
.pot-grid {
    /* --- Gap - Configuration --- */
    --pot-grid-gap-value: 0;
    --pot-grid-row-gap-value: 0;
    --pot-grid-column-gap-value: 0;

    display: grid;

    /* --- PotGrid - Gap --- */
    gap: var(--pot-grid-gap-value);
}

.pot-grid._divided-gap {
    /* Gap */
    row-gap: var(--pot-grid-row-gap-value);
    column-gap: var(--pot-grid-column-gap-value);
}
</style>
