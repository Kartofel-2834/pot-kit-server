<script lang="ts" setup>
// Types
import type { IPotInputExpose, IPotInputProps, IPotInputSlots } from '@/types/components/input';

// Vue
import { ref, computed } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const $props = withDefaults(defineProps<IPotInputProps>(), {
    value: undefined,
    modelValue: undefined,
});

const $emit = defineEmits<{
    input: [value: string];
    change: [value: string];
    focus: [value: FocusEvent];
    blur: [value: FocusEvent];
    'update:modelValue': [value: string];
    keydown: [value: KeyboardEvent];
    keyup: [value: KeyboardEvent];
}>();

const $slots = defineSlots<IPotInputSlots>();

// Data
const input = ref<HTMLInputElement | null>(null);

const isFocused = ref<boolean>(false);

// Computed
const currentValue = computed(() => $props.value ?? $props.modelValue);

const properties = useDeviceProperties(
    computed(() => ({
        size: $props.size,
        color: $props.color,
        radius: $props.radius,
    })),
    $props.devices,
);

/** Классы модификаторы */
const classList = useClassList(
    computed(() => ({
        ...properties.value,
        focused: isFocused.value,
        disabled: $props.disabled,
        invalid: $props.invalid,
        fluid: $props.fluid,
    })),
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

function onFocus(event: FocusEvent) {
    $emit('focus', event);
    isFocused.value = true;
}

function onBlur(event: FocusEvent) {
    $emit('blur', event);
    isFocused.value = false;
}

// Exports
defineExpose<IPotInputExpose>({
    input: input,
});
</script>

<template>
    <label :class="['pot-input', classList]">
        <slot name="prepend"></slot>

        <div class="pot-input-icon pot-input-left-icon">
            <slot name="preicon" />
        </div>

        <input
            ref="input"
            class="pot-input-target"
            :value="currentValue"
            :type="type"
            :name="name"
            :placeholder="placeholder"
            :readonly="readonly"
            :step="step"
            :min="min"
            :max="max"
            :maxlength="maxlength"
            :tabindex="tabindex"
            :disabled="disabled"
            @input="onInput"
            @change="onChange"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="$emit('keydown', $event)"
            @keyup="$emit('keyup', $event)"
        />

        <div class="pot-input-icon pot-input-right-icon">
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
    --pot-input-color-caret: currentColor;
    --pot-input-color-placeholder: inherit;
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
    font-weight: 400;
    line-height: 1;
    transition:
        color 0.2s,
        background-color 0.2s,
        border-color 0.2s;

    /* --- PotInput - Color --- */
    color: var(--pot-input-color-text);
    background-color: var(--pot-input-color-background);
    border-color: var(--pot-input-color-border);

    /* --- PotInput - Size --- */
    padding: var(--pot-input-size-padding);
    gap: var(--pot-input-size-gap);
    font-size: var(--pot-input-size-text);
    border-width: var(--pot-input-size-border);

    /* --- PotInput - Radius --- */
    border-radius: var(--pot-input-radius-value);
}

.pot-input._disabled .pot-input-target {
    cursor: not-allowed;
}

.pot-input._fluid {
    width: 100%;
}

.pot-input-target {
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
    background-color: transparent;
    caret-color: var(--pot-input-color-caret);

    /* Size */
    height: var(--pot-input-size-height);
}

.pot-input-target[type='number']::-webkit-inner-spin-button,
.pot-input-target[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.pot-input-target[disabled] {
    opacity: 1;
}

.pot-input-target::-ms-clear {
    display: none;
}

.pot-input-icon {
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
