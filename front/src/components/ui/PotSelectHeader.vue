<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type {
    IPotSelectHeaderEmits,
    IPotSelectHeaderExpose,
    IPotSelectHeaderProps,
} from '@/types/components/select';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

// Components
import PotInput from '@/components/ui/PotInput.vue';

const $props = defineProps<IPotSelectHeaderProps<OPTION, VALUE_FIELD>>();

const $emit = defineEmits<IPotSelectHeaderEmits>();

// Refs
const container = useTemplateRef('container');

// Data
const isFocused = ref<boolean>(false);

// Computed
const label = computed(() => {
    const selectedLabels = $props.specs.filter(spec => spec.selected).map(spec => spec.label);

    return $props.editable && isFocused.value ? $props.text : selectedLabels.join(', ');
});

// Listeners
function onClick() {
    $emit('click');
}

function onInput(value: string) {
    $emit('input', value);
}

function onFocus(event: FocusEvent) {
    isFocused.value = true;
    $emit('focus', event);
}

function onBlur(event: FocusEvent) {
    isFocused.value = false;
    $emit('blur', event);
}

// Methods
function focus() {
    container.value?.input?.focus?.();
}

// Expose
defineExpose<IPotSelectHeaderExpose>({
    element: toRef(() => container.value?.element ?? null),
    input: toRef(() => container.value?.input ?? null),
    focus,
});
</script>

<template>
    <PotInput
        ref="container"
        :class="['pot-select-header', classList]"
        :value="label"
        :readonly="!editable"
        :devices="devices"
        :placeholder="placeholder"
        @click="onClick"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
    >
        <template
            v-if="$slots.preicon"
            #preicon
        >
            <slot name="preicon" />
        </template>

        <template #icon>
            <slot name="icon">
                <svg
                    class="pot-select-arrow-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                </svg>
            </slot>
        </template>
    </PotInput>
</template>

<style>
.pot-select-header.pot-input {
    /* --- PotSelect - Color - Input --- */
    --pot-input-color-border: var(--pot-select-color-header-border, transparent);
    --pot-input-color-background: var(--pot-select-color-header-background, transparent);
    --pot-input-color-text: var(--pot-select-color-header-text, inherit);
    --pot-input-color-caret: var(--pot-select-color-header-caret, currentColor);
    --pot-input-color-placeholder: var(--pot-select-color-header-placeholder, inherit);
    --pot-input-color-icon: var(--pot-select-color-header-icon, initial);

    /* --- PotSelect - Size - Input --- */
    --pot-input-size-height: var(--pot-select-size-header-height, auto);
    --pot-input-size-padding: var(--pot-select-size-header-padding, 0);
    --pot-input-size-border: var(--pot-select-size-header-border, 0);
    --pot-input-size-text: var(--pot-select-size-header-text, inherit);
    --pot-input-size-text-weight: var(--pot-select-size-header-text-weight, 400);
    --pot-input-size-text-height: var(--pot-select-size-header-text-height, 1);
    --pot-input-size-gap: var(--pot-select-size-header-gap, 0.8em);
    --pot-input-size-icon: var(--pot-select-size-header-padding-icon, auto);
    --pot-input-size-outline: var(--pot-select-size-header-outline, initial);
    --pot-input-size-outline-offset: var(--pot-select-size-header-outline-offset, initial);

    /* --- PotSelect - Radius - Input --- */
    --pot-input-radius-value: var(--pot-select-radius-header-value, 0);

    cursor: pointer;
}
</style>
