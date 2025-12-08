<script lang="ts" setup>
// Types
import type { IPotButtonProps } from '@/types/components/button';

// Vue
import { toRef } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';

const $props = withDefaults(defineProps<IPotButtonProps>(), {
    tag: 'button',
});

// Composables
const $properties = useDeviceProperties(
    {
        color: toRef(() => $props.color),
        size: toRef(() => $props.size),
        radius: toRef(() => $props.radius),
    },
    $props.devices,
);

const $classList = useClassList(
    {
        color: $properties.color,
        size: $properties.size,
        radius: $properties.radius,
        square: toRef(() => $props.square),
        fluid: toRef(() => $props.fluid),
    },
    'pot-button',
);
</script>

<template>
    <component
        :is="tag"
        :class="$classList"
        :disabled="disabled"
    >
        <slot />
    </component>
</template>

<style>
.pot-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    border-style: solid;
    font-weight: 500;
    line-height: 1;
    transition:
        color 0.2s ease,
        border-color 0.2s ease,
        outline-color 0.2s ease,
        background-color 0.2s ease;

    /* --- PotButton - Color --- */
    border-color: var(--pot-button-color-border, transparent);
    background-color: var(--pot-button-color-background, transparent);
    color: var(--pot-button-color-text, inherit);
    outline-color: var(--pot-button-color-outline, initial);

    /* --- PotButton - Size --- */
    height: var(--pot-button-size-height, auto);
    gap: var(--pot-button-size-gap, 0);
    padding: 0 var(--pot-button-size-padding, 0);
    border-width: var(--pot-button-size-border, 0);
    font-size: var(--pot-button-size-text, inherit);
    outline-width: var(--pot-button-size-outline, initial);
    outline-offset: var(--pot-button-size-outline-offset, initial);

    /* --- PotButton - Radius --- */
    border-radius: var(--pot-button-radius-value, 0);
}

/* --- PotButton - Disabled --- */
.pot-button:disabled {
    cursor: not-allowed;
}

/* --- PotButton - Square --- */
.pot-button.pot-button_square {
    padding: 0;
    aspect-ratio: 1 / 1;
}

/* --- PotButton - Fluid --- */
.pot-button.pot-button_fluid {
    width: 100%;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/button.css" />
<!-- Styles - END -->
