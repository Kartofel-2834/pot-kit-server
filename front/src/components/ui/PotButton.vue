<script lang="ts" setup>
// Types
import type { IPotButtonProps } from '@/types/components/button';
import type { EPotDevice, EPotColor, EPotSize, EPotRadius } from '@/types';

// Vue
import { computed } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDeviceIs } from '@/composables/device-is';

const $props = withDefaults(
    defineProps<IPotButtonProps<EPotDevice, EPotColor, EPotSize, EPotRadius>>(),
    {
        tag: 'button',
    },
);

const $deviceIs = useDeviceIs();

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
<style src="@/assets/css/styles/conditions/button.css" />
<style src="@/assets/css/styles/configuration/button.css" />
<!-- Styles - END -->
