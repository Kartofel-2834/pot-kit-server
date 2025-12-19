<script lang="ts" setup>
// Types
import type { IPotGroupProps } from '@/types/components/group';
import type { EPotGridGap } from '@/types/components/grid';

// Vue
import { computed, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const props = withDefaults(defineProps<IPotGroupProps>(), {
    tag: 'div',
});

// Computed
const currentStyles = computed(() => {
    return {
        gap: formatGap($properties.gap.value),
        'flex-direction': $properties.direction.value,
        'align-items': $properties.align.value,
        'align-content': $properties.alignContent.value,
        'justify-content': $properties.justify.value,
        'justify-items': $properties.justifyItems.value,
        'flex-wrap': $properties.wrap.value,
    };
});

// Composables
const $properties = useDeviceProperties(
    {
        gap: toRef(() => props.gap),
        direction: toRef(() => props.direction),
        align: toRef(() => props.align),
        alignContent: toRef(() => props.alignContent),
        justify: toRef(() => props.justify),
        justifyItems: toRef(() => props.justifyItems),
        wrap: toRef(() => props.wrap),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        gap: computed(() =>
            typeof $properties.gap.value !== 'number' ? $properties.gap.value : null,
        ),
    },
    'group',
);

// Methods
function formatGap(gap: EPotGridGap | number | null | undefined): string {
    return typeof gap === 'number' && !isNaN(gap) && isFinite(gap) ? `${gap}px` : '';
}
</script>

<template>
    <component
        :is="tag"
        :class="['pot-group', $classList]"
        :style="currentStyles"
    >
        <slot />
    </component>
</template>

<style>
.pot-group {
    display: flex;

    /* --- PotGroup - Gap --- */
    gap: var(--pot-group-gap-value, 0);
}
</style>
