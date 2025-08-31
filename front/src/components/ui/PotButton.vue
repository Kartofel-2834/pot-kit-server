<script lang="ts" setup>
// Types
import type { IPotButtonProps } from '@/types/components/button';

// Vue
import { computed } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';

const $props = withDefaults(defineProps<IPotButtonProps>(), {
    tag: 'button',
});

const $deviceIs = useDeviceIs();

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

const classList = computed(() =>
    useClassList({
        ...properties.value,
        square: $props.square,
    }),
);
</script>

<template>
    <component
        :is="tag"
        :class="['pot-button', classList]"
        :disabled="disabled"
    >
        <slot />
    </component>
</template>

<style>
.pot-button {
    /* --- Color - Configuration --- */
    --pot-button-color-border: transparent;
    --pot-button-color-background: transparent;
    --pot-button-color-text: inherit;
    --pot-button-color-outline: initial;

    /* --- Size - Configuration --- */
    --pot-button-size-height: auto;
    --pot-button-size-gap: 0;
    --pot-button-size-padding: 0;
    --pot-button-size-border: 0;
    --pot-button-size-text: inherit;
    --pot-button-size-outline: initial;
    --pot-button-size-outline-offset: initial;

    /* --- Radius - Configuration --- */
    --pot-button-radius-value: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    border-style: solid;
    font-weight: 500;
    line-height: 1;
    transition:
        color 0.4s ease,
        border-color 0.4s ease,
        outline-color 0.4s ease,
        background-color 0.4s ease;

    /* --- PotButton - Color --- */
    border-color: var(--pot-button-color-border);
    background-color: var(--pot-button-color-background);
    color: var(--pot-button-color-text);
    outline-color: var(--pot-button-color-outline);

    /* --- PotButton - Size --- */
    height: var(--pot-button-size-height);
    gap: var(--pot-button-size-gap);
    padding: 0 var(--pot-button-size-padding);
    border-width: var(--pot-button-size-border);
    font-size: var(--pot-button-size-text);
    outline-width: var(--pot-button-size-outline);
    outline-offset: var(--pot-button-size-outline-offset);

    /* --- PotButton - Radius --- */
    border-radius: var(--pot-button-radius-value);
}

/* --- PotButton - Disabled --- */
.pot-button:disabled {
    cursor: not-allowed;
}

/* --- PotButton - Square --- */
.pot-button._square {
    padding: 0;
    aspect-ratio: 1 / 1;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/button.css" />
<!-- Styles - END -->
