<script lang="ts" setup>
// Types
import type { IPotInputProps, IPotInputSlots } from '@/types/components/input';

// Vue
import { ref, computed } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';

const $props = withDefaults(defineProps<IPotInputProps>(), {
    value: undefined,
    modelValue: undefined,
});

const $emit = defineEmits<{
    input: [value: string];
    change: [value: string];
    'update:modelValue': [value: string];
    keydown: [value: KeyboardEvent];
    keyup: [value: KeyboardEvent];
}>();

const $slots = defineSlots<IPotInputSlots>();

const $deviceIs = useDeviceIs();

const isFocused = ref<boolean>(false);

// Computed
const currentValue = computed(() => $props.value ?? $props.modelValue);

const properties = computed(() => {
    return useDeviceProperties(
        {
            size: $props.size,
            color: $props.color,
            radius: $props.radius,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

/** Классы модификаторы */
const classList = computed(() =>
    useClassList({
        ...properties.value,
        focused: isFocused.value,
        disabled: $props.disabled,
        invalid: $props.invalid,
    }),
);

// Methods
function onInput(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;

    $emit('update:modelValue', target.value);
    $emit('input', target.value);
}

function onChange(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;

    $emit('change', target.value);
}

function onFocus() {
    isFocused.value = true;
}

function onBlur() {
    isFocused.value = false;
}
</script>

<template>
    <label :class="['pot-input', classList]">
        <slot name="prepend"></slot>

        <div class="pot-input__icon pot-input__icon_left">
            <slot name="preicon" />
        </div>

        <input
            :value="currentValue"
            :disabled="disabled"
            class="pot-input__target"
            v-bind="$attrs"
            @input="onInput"
            @change="onChange"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="$emit('keydown', $event)"
            @keyup="$emit('keyup', $event)"
        />

        <div class="pot-input__icon pot-input__icon_right">
            <slot name="icon" />
        </div>

        <slot name="append" />
    </label>
</template>

<style>
.pot-input {
    /* --- Color - Configuration --- */
    --pot-input-color-border: transparent;
    --pot-input-color-background: transparent;
    --pot-input-color-text: inherit;
    --pot-input-color-icon: initial;

    /* --- Size - Configuration --- */
    --pot-input-size-height: auto;
    --pot-input-size-padding: 0;
    --pot-input-size-border: 0;
    --pot-input-size-text: inherit;
    --pot-input-size-gap: 1rem;
    --pot-input-size-icon: auto;
    --pot-input-size-outline: initial;
    --pot-input-size-outline-offset: initial;

    /* --- Radius - Configuration --- */
    --pot-input-radius-value: 0;

    display: flex;
    align-items: center;
    width: 100%;
    border-style: solid;
    cursor: text;
    background-color: inherit;
    font-weight: 400;
    line-height: 1;
    transition:
        color 0.4s,
        background-color 0.4s,
        border-color 0.4s;

    /* --- PotInput - Color --- */
    color: var(--pot-input-color-text);
    border-color: var(--input-color-border);

    /* --- PotInput - Size --- */
    padding: 0 var(--pot-input-size-padding);
    gap: var(--pot-input-size-gap);
    font-size: var(--pot-input-size-text);
    border-width: var(--pot-input-size-border);

    /* --- PotInput - Radius --- */
    border-radius: var(--pot-input-radius-value);
}

.pot-input._disabled .pot-input__target {
    cursor: not-allowed;
}

.pot-input__target {
    outline: none;
    padding: 0;
    border: none;
    outline: none;
    font-family: inherit;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 100%;
    font-size: inherit;

    /* Color */
    color: inherit;
    background-color: var(--input-color-background);

    /* Size */
    height: var(--input-size-height);
}

.pot-input__target[type='number']::-webkit-inner-spin-button,
.pot-input__target[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.pot-input__target[disabled] {
    opacity: 1;
}

.pot-input__target::-ms-clear {
    display: none;
}

.pot-input__icon {
    flex-shrink: 0;
    pointer-events: none;
    font-size: inherit;

    /* --- PotInput - Color --- */
    color: var(--pot-input-color-icon);
    fill: var(--pot-input-color-icon);

    /* --- PotInput - Size --- */
    width: var(--pot-input-size-icon);
}
</style>
