<script lang="ts" setup>
// Types
import type { EPotGridGap, IPotGridProps } from '@/types/components/grid';

// Vue
import { computed, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const props = withDefaults(defineProps<IPotGridProps>(), {
    tag: 'div',
});

// Computed
const currentStyles = computed(() => {
    const rowGap = formatGap($properties.rowGap.value);
    const columnGap = formatGap($properties.columnGap.value);
    const gap = formatGap($properties.gap.value);

    const data = rowGap || columnGap ? { 'row-gap': rowGap, 'column-gap': columnGap } : { gap };

    return {
        ...data,
        'grid-template-columns': formatNumberToFr($properties.cols.value),
        'grid-template-rows': formatNumberToFr($properties.rows.value),
        'grid-auto-flow': $properties.flow.value,
        'grid-auto-rows': $properties.autoRows.value,
        'grid-auto-columns': $properties.autoCols.value,
        'align-items': $properties.align.value,
        'align-content': $properties.alignContent.value,
        'justify-content': $properties.justify.value,
        'justify-items': $properties.justifyItems.value,
    };
});

// Composables
const $properties = useDeviceProperties(
    {
        cols: toRef(() => props.cols),
        rows: toRef(() => props.rows),
        flow: toRef(() => props.flow),
        autoCols: toRef(() => props.autoCols),
        autoRows: toRef(() => props.autoRows),
        align: toRef(() => props.align),
        alignContent: toRef(() => props.alignContent),
        justify: toRef(() => props.justify),
        justifyItems: toRef(() => props.justifyItems),
        gap: toRef(() => props.gap),
        rowGap: toRef(() => props.rowGap),
        columnGap: toRef(() => props.columnGap),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        'divided-gap': computed(() => {
            const [rowGap, columnGap] = [$properties.rowGap.value, $properties.columnGap.value];
            const hasRowGap = rowGap && typeof rowGap !== 'number';
            const hasColumnGap = columnGap && typeof columnGap !== 'number';

            return hasRowGap || hasColumnGap;
        }),
        gap: toRef(() =>
            typeof $properties.gap.value !== 'number' ? $properties.gap.value : null,
        ),
        'row-gap': toRef(() =>
            typeof $properties.rowGap.value !== 'number' ? $properties.rowGap.value : null,
        ),
        'column-gap': toRef(() =>
            typeof $properties.columnGap.value !== 'number' ? $properties.columnGap.value : null,
        ),
    },
    'grid',
);

// Methods
function formatNumberToFr(v?: string | number): string | undefined {
    if (['number', 'string'].includes(typeof v) && !isNaN(Number(v))) {
        return `repeat(${v}, 1fr)`;
    }

    return v ? String(v) : undefined;
}

function formatGap(gap: EPotGridGap | number | null | undefined): string {
    return typeof gap === 'number' && !isNaN(gap) && isFinite(gap) ? `${gap}px` : '';
}
</script>

<template>
    <component
        :is="tag"
        :class="['pot-grid', $classList]"
        :style="currentStyles"
    >
        <slot />
    </component>
</template>

<style>
.pot-grid {
    display: grid;

    /* --- PotGrid - Gap --- */
    gap: var(--pot-grid-gap-value, 0);
}

/* --- Divided-Gap --- */
._grid-divided-gap {
    row-gap: var(--pot-grid-gap-row, 0);
    column-gap: var(--pot-grid-gap-column, 0);
}
</style>
