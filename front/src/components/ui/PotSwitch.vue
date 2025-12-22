<script lang="ts" generic="TRUE_VALUE = true, FALSE_VALUE = false" setup>
// Types
import type { IPotSwitchEmits, IPotSwitchExpose, IPotSwitchProps } from '@/types/components/switch';

// Vue
import { computed, toRef, useTemplateRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const props = withDefaults(defineProps<IPotSwitchProps<TRUE_VALUE, FALSE_VALUE>>(), {
    value: undefined,
    modelValue: undefined,
    trueValue: undefined,
    falseValue: undefined,
    inputName: 'switch',
    transition: 'pot-switch-transition',
});

const emit = defineEmits<IPotSwitchEmits<TRUE_VALUE, FALSE_VALUE>>();

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

const isChecked = computed(() => currentValue.value === trueValue.value);

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
    'switch',
);

// Methods
function onChange() {
    const newValue = isChecked.value ? falseValue.value : trueValue.value;
    emit('update:modelValue', newValue);
    emit('change', newValue);
}

// Exports
defineExpose<Readonly<IPotSwitchExpose>>({
    input: input,
});
</script>

<template>
    <label
        :class="['pot-switch', $classList]"
        @mousedown.prevent
    >
        <input
            ref="input"
            type="checkbox"
            class="pot-switch-input"
            :checked="isChecked"
            :name="inputName"
            :value="currentValue"
            :disabled="disabled"
            @change.stop="onChange"
        />

        <span class="pot-switch-track">
            <span class="pot-switch-thumb" />
        </span>

        <span
            v-if="$slots.default"
            class="pot-switch-content"
        >
            <slot />
        </span>
    </label>
</template>

<style>
.pot-switch {
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    /* --- PotSwitch - Color --- */
    color: var(--pot-switch-color-text, inherit);

    /* --- PotSwitch - Size --- */
    gap: var(--pot-switch-size-gap, 0.8em);
    font-size: var(--pot-switch-size-text, inherit);
    font-weight: var(--pot-switch-size-text-weight, 400);
    line-height: var(--pot-switch-size-text-height, 1);
}

.pot-switch:has(.pot-switch-input:focus-visible) .pot-switch-track {
    outline-style: auto;
}

.pot-switch-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    margin: 0;
    padding: 0;
    pointer-events: none;
}

.pot-switch-track {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    user-select: none;

    /* --- PotSwitch - Color --- */
    background-color: var(--pot-switch-color-background, transparent);
    border-color: var(--pot-switch-color-border, currentColor);
    border-style: solid;

    /* --- PotSwitch - Size --- */
    width: var(--pot-switch-size-width, 2.4em);
    height: var(--pot-switch-size-height, 1.4em);
    border-width: var(--pot-switch-size-border, 1px);
    outline-width: var(--pot-switch-size-outline, initial);
    outline-offset: var(--pot-switch-size-outline-offset, initial);

    /* --- PotSwitch - Radius --- */
    border-radius: var(--pot-switch-radius-value, 1000px);

    /* --- PotSwitch - Transition --- */
    transition:
        color var(--pot-switch-transition-duration, 0.2s)
            var(--pot-switch-transition-function, ease),
        border-color var(--pot-switch-transition-duration, 0.2s)
            var(--pot-switch-transition-function, ease),
        background-color var(--pot-switch-transition-duration, 0.2s)
            var(--pot-switch-transition-function, ease);
}

.pot-switch-thumb {
    position: absolute;
    border-radius: inherit;
    pointer-events: none;

    /* --- PotSwitch - Color --- */
    background-color: var(--pot-switch-color-thumb, currentColor);

    /* --- PotSwitch - Size --- */
    left: var(--pot-switch-thumb-offset, 2px);
    width: var(--pot-switch-thumb-size-width, 1em);
    height: var(--pot-switch-thumb-size-width, 1em);

    /* --- PotSwitch - Transition --- */
    transition:
        transform var(--pot-switch-transition-duration, 0.2s)
            var(--pot-switch-transition-function, ease),
        background-color var(--pot-switch-transition-duration, 0.2s)
            var(--pot-switch-transition-function, ease);
}

/* --- Disabled --- */
._switch-disabled {
    cursor: default;
}

/* --- Checked --- */
._switch-checked .pot-switch-thumb {
    transform: translateX(
        calc(
            var(--pot-switch-size-width, 2.4em) - var(--pot-switch-thumb-size-width, 1em) - 2 *
                var(--pot-switch-thumb-offset, 2px)
        )
    );
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/switch.css" />
<!-- Styles - END -->
