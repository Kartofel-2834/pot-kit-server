<script lang="ts" setup>
// Types
import type { IPotCheckboxExpose, IPotCheckboxProps } from '@/types/components/checkbox';

// Vue
import { ref, computed, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const props = withDefaults(defineProps<IPotCheckboxProps>(), {
    value: undefined,
    modelValue: undefined,
});

const emit = defineEmits<{
    change: [value: boolean];
    'update:modelValue': [value: boolean];
}>();

// Data
const input = ref<HTMLInputElement | null>(null);

// Computed
const isChecked = computed(() => props.value ?? props.modelValue ?? false);

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
    'checkbox',
);

// Methods
function onChange(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    const newValue = target.checked;

    emit('update:modelValue', newValue);
    emit('change', newValue);
}

// Exports
defineExpose<Readonly<IPotCheckboxExpose>>({
    input: input,
});
</script>

<template>
    <label :class="['pot-checkbox', $classList]">
        <input
            ref="input"
            type="checkbox"
            class="pot-checkbox-input"
            :checked="isChecked"
            :name="$props.name"
            :value="$props.inputValue"
            :disabled="$props.disabled"
            @change="onChange"
        />

        <div class="pot-checkbox-icon-wrapper">
            <svg
                v-if="isChecked"
                class="pot-checkbox-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </div>

        <div
            v-if="$slots.default"
            class="pot-checkbox-content"
        >
            <slot />
        </div>
    </label>
</template>

<style>
.pot-checkbox {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
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
    color: var(--pot-checkbox-color-text, inherit);
    border-color: var(--pot-checkbox-color-border, transparent);

    /* --- PotCheckbox - Size --- */
    gap: var(--pot-checkbox-size-gap, 0.8em);
    font-size: var(--pot-checkbox-size-text, inherit);
    font-weight: var(--pot-checkbox-size-text-weight, 400);
    line-height: var(--pot-checkbox-size-text-height, 1);
    border-width: var(--pot-checkbox-size-border, 0);
    outline-width: var(--pot-checkbox-size-outline, initial);
    outline-offset: var(--pot-checkbox-size-outline-offset, initial);
}

.pot-checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
    pointer-events: none;
}

.pot-checkbox-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
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
    border-color: var(--pot-checkbox-color-border, currentColor);
    color: var(--pot-checkbox-color-icon, transparent);

    /* --- PotCheckbox - Size --- */
    width: var(--pot-checkbox-size-height, 1.6em);
    height: var(--pot-checkbox-size-height, 1.6em);
    border-width: var(--pot-checkbox-size-border, 2px);

    /* --- PotCheckbox - Radius --- */
    border-radius: var(--pot-checkbox-radius-value, 0);
}

.pot-checkbox-icon {
    width: 100%;
    height: 100%;
    stroke: currentColor;
    fill: none;
    pointer-events: none;
}

.pot-checkbox-content {
    flex: 1;
    min-width: 0;
}

/* --- PotCheckbox - Disabled --- */
.pot-checkbox._checkbox-disabled {
    cursor: default;
}

/* --- PotCheckbox - Checked --- */
.pot-checkbox._checkbox-checked .pot-checkbox-icon-wrapper {
    background-color: var(--pot-checkbox-color-checked-background, currentColor);
    border-color: var(--pot-checkbox-color-checked-border, currentColor);
    color: var(--pot-checkbox-color-checked-icon, white);
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/checkbox.css" />
<!-- Styles - END -->
