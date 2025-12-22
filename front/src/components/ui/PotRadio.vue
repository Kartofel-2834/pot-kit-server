<script lang="ts" generic="VALUE" setup>
// Types
import type { IPotRadioEmits, IPotRadioExpose, IPotRadioProps } from '@/types/components/radio';

// Vue
import { computed, toRef, useTemplateRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const props = withDefaults(defineProps<IPotRadioProps<VALUE>>(), {
    value: undefined,
    modelValue: undefined,
    radioValue: undefined,
    inputName: 'radio',
    transition: 'pot-radio-transition',
});

const emit = defineEmits<IPotRadioEmits<VALUE>>();

// Refs
const input = useTemplateRef('input');

// Computed
const currentValue = computed(() => {
    return props.value ?? props.modelValue;
});

const radioValue = computed(() => {
    return props.radioValue ?? ((props.value ?? props.modelValue) as VALUE);
});

const isChecked = computed(() => {
    return currentValue.value !== undefined && currentValue.value === radioValue.value;
});

// Composables
const $properties = useDeviceProperties(
    {
        size: toRef(() => props.size),
        color: toRef(() => props.color),
        radius: toRef(() => props.radius),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        size: $properties.size,
        color: $properties.color,
        radius: $properties.radius,
        checked: isChecked,
        disabled: toRef(() => props.disabled),
        invalid: toRef(() => props.invalid),
    },
    'radio',
);

// Listeners
function onChange() {
    emit('update:modelValue', radioValue.value);
    emit('change', radioValue.value);
}

// Exports
defineExpose<Readonly<IPotRadioExpose>>({
    input: input,
});
</script>

<template>
    <label :class="['pot-radio', $classList]">
        <input
            ref="input"
            type="radio"
            class="pot-radio-input"
            :checked="isChecked"
            :name="inputName"
            :value="radioValue"
            :disabled="disabled"
            @change.stop="onChange"
        />

        <span class="pot-radio-box">
            <Transition
                :name="transition"
                mode="out-in"
            >
                <span
                    v-if="isChecked"
                    class="pot-radio-dot"
                />
            </Transition>
        </span>

        <span
            v-if="$slots.default"
            class="pot-radio-content"
        >
            <slot />
        </span>
    </label>
</template>

<style>
.pot-radio {
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    /* --- PotRadio - Color --- */
    color: var(--pot-radio-color-text, inherit);

    /* --- PotRadio - Size --- */
    gap: var(--pot-radio-size-gap, 0.8em);
    font-size: var(--pot-radio-size-text, inherit);
    font-weight: var(--pot-radio-size-text-weight, 400);
    line-height: var(--pot-radio-size-text-height, 1);
}

.pot-radio:has(.pot-radio-input:focus-visible) .pot-radio-box {
    outline-style: auto;
}

.pot-radio-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    margin: 0;
    padding: 0;
    pointer-events: none;
}

.pot-radio-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
    border-style: solid;

    /* --- PotRadio - Color --- */
    background-color: var(--pot-radio-color-background, transparent);
    border-color: var(--pot-radio-color-border, currentColor);

    /* --- PotRadio - Size --- */
    width: var(--pot-radio-size-width, 1.4em);
    height: var(--pot-radio-size-width, 1.4em);
    border-width: var(--pot-radio-size-border, 1px);
    outline-width: var(--pot-radio-size-outline, initial);
    outline-offset: var(--pot-radio-size-outline-offset, initial);

    /* --- PotRadio - Radius --- */
    border-radius: var(--pot-radio-radius-value, 50%);

    /* --- PotRadio - Transition --- */
    transition:
        color var(--pot-radio-transition-duration, 0.2s) var(--pot-radio-transition-function, ease),
        border-color var(--pot-radio-transition-duration, 0.2s)
            var(--pot-radio-transition-function, ease),
        background-color var(--pot-radio-transition-duration, 0.2s)
            var(--pot-radio-transition-function, ease);
}

.pot-radio-dot {
    border-radius: inherit;
    pointer-events: none;

    /* --- PotRadio - Color --- */
    background-color: var(--pot-radio-color-dot, currentColor);

    /* --- PotRadio - Size --- */
    width: var(--pot-radio-dot-size-width, 1em);
    height: var(--pot-radio-dot-size-width, 1em);

    /* --- PotRadio - Transition --- */
    transition:
        opacity var(--pot-radio-transition-duration, 0.2s)
            var(--pot-radio-transition-function, ease),
        transform var(--pot-radio-transition-duration, 0.2s)
            var(--pot-radio-transition-function, ease);
}

/* --- PotRadio - Disabled --- */
.pot-radio._radio-disabled {
    cursor: default;
}

.pot-radio-transition-enter-active,
.pot-radio-transition-leave-active {
    transition:
        opacity var(--pot-radio-transition-duration, 0.2s)
            var(--pot-radio-transition-function, ease),
        transform var(--pot-radio-transition-duration, 0.2s)
            var(--pot-radio-transition-function, ease);
}

.pot-radio-transition-enter-from,
.pot-radio-transition-leave-to {
    transform: scale(50%);
    opacity: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/radio.css" />
<!-- Styles - END -->
