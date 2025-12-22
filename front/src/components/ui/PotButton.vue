<script lang="ts" setup>
// Types
import type { IPotButtonProps } from '@/types/components/button';

// Vue
import { toRef } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';

const props = withDefaults(defineProps<IPotButtonProps>(), {
    tag: 'button',
});

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
        square: toRef(() => props.square),
        fluid: toRef(() => props.fluid),
    },
    'button',
);
</script>

<template>
    <component
        :is="tag"
        :class="['pot-button', $classList]"
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

    /* --- PotButton - Color --- */
    border-color: var(--pot-button-color-border, transparent);
    background-color: var(--pot-button-color-background, transparent);
    color: var(--pot-button-color-text, inherit);
    outline-color: var(--pot-button-color-outline, initial);

    /* --- PotButton - Size --- */
    height: var(--pot-button-size-height, auto);
    gap: var(--pot-button-size-gap, 0);
    padding: var(--pot-button-size-padding, 0);
    border-width: var(--pot-button-size-border, 0);
    font-size: var(--pot-button-size-text, inherit);
    font-weight: var(--pot-button-size-text-weight, 500);
    line-height: var(--pot-button-size-text-height, 1);
    outline-width: var(--pot-button-size-outline, initial);
    outline-offset: var(--pot-button-size-outline-offset, initial);

    /* --- PotButton - Radius --- */
    border-radius: var(--pot-button-radius-value, 0);

    /* --- PotButton - Transition --- */
    transition:
        color var(--pot-button-transition-duration, 0.2s)
            var(--pot-button-transition-function, ease),
        border-color var(--pot-button-transition-duration, 0.2s)
            var(--pot-button-transition-function, ease),
        outline-color var(--pot-button-transition-duration, 0.2s)
            var(--pot-button-transition-function, ease),
        background-color var(--pot-button-transition-duration, 0.2s)
            var(--pot-button-transition-function, ease);
}

.pot-button:disabled {
    cursor: default;
}

/* --- Square --- */
.pot-button._button-square {
    padding: 0;
    aspect-ratio: 1 / 1;
}

/* --- Fluid --- */
.pot-button._button-fluid {
    width: 100%;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/button.css" />
<!-- Styles - END -->
