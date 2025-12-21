<script lang="ts" generic="TRUE_VALUE = true, FALSE_VALUE = false" setup>
// Types
import type {
    IPotCheckboxEmits,
    IPotCheckboxExpose,
    IPotCheckboxProps,
} from '@/types/components/checkbox';

// Vue
import { computed, toRef, useTemplateRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

// Components
import PotIcon from '@/components/ui/PotIcon.vue';

const props = withDefaults(defineProps<IPotCheckboxProps<TRUE_VALUE, FALSE_VALUE>>(), {
    value: undefined,
    modelValue: undefined,
    trueValue: undefined,
    falseValue: undefined,
    inputName: 'checkbox',
    transition: 'pot-checkbox-transition',
});

const emit = defineEmits<IPotCheckboxEmits<TRUE_VALUE, FALSE_VALUE>>();

// Data
const input = useTemplateRef('input');

// Computed
const currentValue = computed(() => {
    return props.value ?? props.modelValue ?? false;
});

const trueValue = computed(
    () => (props.trueValue === undefined ? true : props.trueValue) as TRUE_VALUE,
);

const falseValue = computed(
    () => (props.falseValue === undefined ? false : props.falseValue) as FALSE_VALUE,
);

const isIndeterminate = computed(() => {
    const isTrueValueSelected = currentValue.value === trueValue.value;
    const isFalseValueSelected = currentValue.value === falseValue.value;

    return props.indeterminate || (!isTrueValueSelected && !isFalseValueSelected);
});

const isChecked = computed(() => !isIndeterminate.value && currentValue.value === trueValue.value);

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
        indeterminate: isIndeterminate,
        disabled: toRef(() => props.disabled),
        invalid: toRef(() => props.invalid),
    },
    'checkbox',
);

// Methods
function onChange(event: Event) {
    event.stopPropagation();
    const newValue = isChecked.value ? falseValue.value : trueValue.value;
    emit('update:modelValue', newValue);
    emit('change', newValue);
}

// Exports
defineExpose<Readonly<IPotCheckboxExpose>>({
    input: input,
});
</script>

<template>
    <label
        :class="['pot-checkbox', $classList]"
        @mousedown.prevent
    >
        <input
            ref="input"
            type="checkbox"
            class="pot-checkbox-input"
            :checked="isChecked"
            :name="inputName"
            :value="currentValue"
            :disabled="disabled"
            @change="onChange"
        />

        <span class="pot-checkbox-box">
            <Transition
                :name="transition"
                mode="out-in"
            >
                <PotIcon
                    v-if="isIndeterminate"
                    class="pot-checkbox-icon"
                    icon="minus"
                />

                <PotIcon
                    v-else-if="isChecked"
                    class="pot-checkbox-icon"
                    icon="check"
                />
            </Transition>
        </span>

        <span
            v-if="$slots.default"
            class="pot-checkbox-content"
        >
            <slot />
        </span>
    </label>
</template>

<style>
.pot-checkbox {
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    /* --- PotCheckbox - Color --- */
    color: var(--pot-checkbox-color-text, inherit);

    /* --- PotCheckbox - Size --- */
    gap: var(--pot-checkbox-size-gap, 0.8em);
    font-size: var(--pot-checkbox-size-text, inherit);
    font-weight: var(--pot-checkbox-size-text-weight, 400);
    line-height: var(--pot-checkbox-size-text-height, 1);
}

.pot-checkbox:focus-within .pot-checkbox-box {
    outline-style: solid;
}

.pot-checkbox-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    margin: 0;
    padding: 0;
    pointer-events: none;
}

.pot-checkbox-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
    border-style: solid;
    transition:
        color var(--pot-checkbox-transition-duration, 0.2s)
            var(--pot-checkbox-transition-function, ease),
        border-color var(--pot-checkbox-transition-duration, 0.2s)
            var(--pot-checkbox-transition-function, ease),
        background-color var(--pot-checkbox-transition-duration, 0.2s)
            var(--pot-checkbox-transition-function, ease);

    /* --- PotCheckbox - Color --- */
    background-color: var(--pot-checkbox-color-background, transparent);
    color: var(--pot-checkbox-color-icon, currentColor);
    border-color: var(--pot-checkbox-color-border, currentColor);

    /* --- PotCheckbox - Size --- */
    width: var(--pot-checkbox-size-width, 1.6em);
    height: var(--pot-checkbox-size-width, 1.6em);
    border-width: var(--pot-checkbox-size-border, 1px);
    outline-width: var(--pot-checkbox-size-outline, initial);
    outline-offset: var(--pot-checkbox-size-outline-offset, initial);

    /* --- PotCheckbox - Radius --- */
    border-radius: var(--pot-checkbox-radius-value, 0);
}

.pot-checkbox-icon {
    width: 100%;
    height: 100%;
    pointer-events: none;
}

/* --- PotCheckbox - Disabled --- */
.pot-checkbox._checkbox-disabled {
    cursor: default;
}

.pot-checkbox-transition-enter-active,
.pot-checkbox-transition-leave-active {
    transition: opacity var(--pot-checkbox-transition-duration, 0.2s)
        var(--pot-checkbox-transition-function, ease);
}

.pot-checkbox-transition-enter-from,
.pot-checkbox-transition-leave-to {
    opacity: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/checkbox.css" />
<!-- Styles - END -->
