<script setup lang="ts" generic="VALUE = unknown">
// Types
import type { IPotOptionProps } from '@/types/components/option';

// Vue
import { computed } from 'vue';

// Composables
import { useClassList, useClassListArray } from '@/composables/class-list';

const $props = withDefaults(defineProps<IPotOptionProps<VALUE>>(), {
    tag: 'div',
    label: '',
    selected: false,
    focused: false,
    disabled: false,
    fluid: false,
});

const classList = useClassList(
    {
        selected: $props.selected,
        focused: $props.focused,
        disabled: $props.disabled,
        fluid: $props.fluid,
    },
    'option',
);
</script>

<template>
    <component
        :is="tag"
        :class="['pot-option', classList]"
        :data-label="label"
        :data-value="value"
    >
        <slot> {{ label }} {{ focused }} </slot>
    </component>
</template>

<style>
.pot-option {
    /* --- Color - Configuration --- */
    --pot-option-color-border: transparent;
    --pot-option-color-background: transparent;
    --pot-option-color-text: inherit;
    --pot-option-color-outline: initial;

    /* --- Size - Configuration --- */
    --pot-option-size-height: auto;
    --pot-option-size-gap: 0;
    --pot-option-size-padding: 0;
    --pot-option-size-border: 0;
    --pot-option-size-text: inherit;
    --pot-option-size-outline: initial;
    --pot-option-size-outline-offset: initial;

    /* --- Radius - Configuration --- */
    --pot-option-radius-value: 0;

    display: flex;
    align-items: center;
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

    /* --- PotOption - Color --- */
    border-color: var(--pot-option-color-border);
    background-color: var(--pot-option-color-background);
    color: var(--pot-option-color-text);
    outline-color: var(--pot-option-color-outline);

    /* --- PotOption - Size --- */
    height: var(--pot-option-size-height);
    gap: var(--pot-option-size-gap);
    padding: 0 var(--pot-option-size-padding);
    border-width: var(--pot-option-size-border);
    font-size: var(--pot-option-size-text);
    outline-width: var(--pot-option-size-outline);
    outline-offset: var(--pot-option-size-outline-offset);

    /* --- PotOption - Radius --- */
    border-radius: var(--pot-option-radius-value);
}
</style>
