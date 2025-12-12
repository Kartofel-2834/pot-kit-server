<script lang="ts" setup>
// Types
import type { IPotInputExpose, IPotInputProps } from '@/types/components/input';

// Vue
import { ref, computed, toRef } from 'vue';

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

// Data
const input = ref<HTMLInputElement | null>(null);

const isFocused = ref<boolean>(false);

// Computed
const currentValue = computed(() => $props.value ?? $props.modelValue);

// Composables
const $properties = useDeviceProperties(
    {
        size: toRef(() => $props.size),
        color: toRef(() => $props.color),
        radius: toRef(() => $props.radius),
    },
    toRef(() => $props.devices),
);

const $classList = useClassList(
    {
        size: $properties.size,
        color: $properties.color,
        radius: $properties.radius,
        focused: isFocused,
        disabled: toRef(() => $props.disabled),
        invalid: toRef(() => $props.invalid),
        fluid: toRef(() => $props.fluid),
    },
    'input',
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
defineExpose<Readonly<IPotInputExpose>>({
    input: input,
});
</script>

<template>
    <label :class="['pot-input', $classList]">
        <slot name="prepend"></slot>

        <div
            v-if="$slots.preicon"
            class="pot-input-icon pot-input-icon_left"
        >
            <slot name="preicon" />
        </div>

        <div class="pot-input-wrapper">
            <slot name="label" />

            <input
                ref="input"
                class="pot-input-target"
                :value="currentValue"
                :type="type"
                :name="inputName"
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
        </div>

        <div
            v-if="$slots.icon"
            class="pot-input-icon pot-input-icon_right"
        >
            <slot name="icon" />
        </div>

        <slot name="append" />
    </label>
</template>

<style>
.pot-input {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    border-style: solid;
    cursor: text;
    transition:
        color var(--pot-input-transition-duration, 0.2s) var(--pot-input-transition-function, ease),
        background-color var(--pot-input-transition-duration, 0.2s)
            var(--pot-input-transition-function, ease),
        border-color var(--pot-input-transition-duration, 0.2s)
            var(--pot-input-transition-function, ease);

    /* --- PotInput - Color --- */
    color: var(--pot-input-color-text, inherit);
    background-color: var(--pot-input-color-background, transparent);
    border-color: var(--pot-input-color-border, transparent);

    /* --- PotInput - Size --- */
    padding: var(--pot-input-size-padding, 0);
    gap: var(--pot-input-size-gap, 0.8em);
    font-size: var(--pot-input-size-text, inherit);
    font-weight: var(--pot-input-size-text-weight, 400);
    line-height: var(--pot-input-size-text-height, 1);
    border-width: var(--pot-input-size-border, 0);
    outline-width: var(--pot-input-size-outline, initial);
    outline-offset: var(--pot-input-size-outline-offset, initial);

    /* --- PotInput - Radius --- */
    border-radius: var(--pot-input-radius-value, 0);
}

.pot-input._input-disabled .pot-input-target {
    cursor: default;
}

.pot-input._input-fluid {
    width: 100%;
}

.pot-input-wrapper {
    display: flex;
    flex-direction: column;
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
    cursor: inherit;

    /* --- PotInput - Color --- */
    color: inherit;
    background-color: transparent;
    caret-color: var(--pot-input-color-caret, currentColor);

    /* --- PotInput - Size --- */
    height: var(--pot-input-size-height, auto);
}

.pot-input-target::placeholder {
    font-weight: var(--pot-input-size-placeholder-weight, inherit);
    color: var(--pot-input-color-placeholder, initial);
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
    color: var(--pot-input-color-icon, initial);
    fill: var(--pot-input-color-icon, initial);

    /* --- PotInput - Size --- */
    width: var(--pot-input-size-icon, auto);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/input.css" />
<!-- Styles - END -->
