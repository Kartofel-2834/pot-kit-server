<script lang="ts" setup>
// Types
import type { IPotTagProps } from '@/types/components/tag';

// Vue
import { toRef } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';

const props = defineProps<IPotTagProps>();

// Composables
const $properties = useDeviceProperties(
    {
        color: toRef(() => props.color),
        size: toRef(() => props.size),
        radius: toRef(() => props.radius),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        color: $properties.color,
        size: $properties.size,
        radius: $properties.radius,
    },
    'tag',
);
</script>

<template>
    <span :class="['pot-tag', $classList]">
        <slot />
    </span>
</template>

<style>
.pot-tag {
    display: flex;
    align-items: center;
    border-style: solid;

    /* --- PotTag - Color --- */
    background-color: var(--pot-tag-color-background, transparent);
    color: var(--pot-tag-color-text, inherit);
    border-color: var(--pot-tag-color-border, transparent);
    outline-color: var(--pot-tag-color-outline, initial);

    /* --- PotTag - Size --- */
    padding: var(--pot-tag-size-padding, 0);
    border-width: var(--pot-tag-size-border, 0);
    gap: var(--pot-tag-size-gap, 0.4em);
    font-size: var(--pot-tag-size-text, inherit);
    font-weight: var(--pot-tag-size-text-weight, 500);
    line-height: var(--pot-tag-size-text-height, 1);
    outline-width: var(--pot-tag-size-outline, initial);
    outline-offset: var(--pot-tag-size-outline-offset, initial);

    /* --- PotTag - Radius --- */
    border-radius: var(--pot-tag-radius-value, 0);

    /* --- PotTag - Transition --- */
    transition:
        color var(--pot-tag-transition-duration, 0.2s) var(--pot-tag-transition-function, ease),
        border-color var(--pot-tag-transition-duration, 0.2s)
            var(--pot-tag-transition-function, ease),
        outline-color var(--pot-tag-transition-duration, 0.2s)
            var(--pot-tag-transition-function, ease),
        background-color var(--pot-tag-transition-duration, 0.2s)
            var(--pot-tag-transition-function, ease);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/tag.css" />
<!-- Styles - END -->
