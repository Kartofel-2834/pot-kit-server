<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type {
    IPotSelectOptionEmits,
    IPotSelectOptionExpose,
    IPotSelectOptionProps,
} from '@/types/components/select-option';

// Vue
import { toRef, useTemplateRef } from 'vue';

// Components
import PotOption from '@/components/ui/PotOption.vue';

const props = withDefaults(defineProps<IPotSelectOptionProps<OPTION, VALUE_FIELD>>(), {});

const emit = defineEmits<IPotSelectOptionEmits<OPTION, VALUE_FIELD>>();

// Refs
const container = useTemplateRef('container');

// Listeners
function onOptionClick() {
    emit('select', props.spec);
}

// Expose
defineExpose<IPotSelectOptionExpose<OPTION, VALUE_FIELD>>({
    element: toRef(() => container.value?.element ?? null),
    value: toRef(() => props.spec.value),
    label: toRef(() => props.spec.label),
});
</script>

<template>
    <PotOption
        ref="container"
        tag="li"
        role="option"
        class="pot-select-option"
        :value="spec.value"
        :label="spec.label"
        :disabled="spec.disabled"
        :selected="spec.selected"
        :focused="spec.data?.focused"
        @click="onOptionClick"
    >
        <template
            v-if="$slots.content"
            #content
        >
            <slot name="content" />
        </template>

        <template
            v-if="$slots.default"
            #default
        >
            <slot />
        </template>

        <template
            v-if="$slots.preicon"
            #preicon
        >
            <slot name="preicon" />
        </template>

        <template
            v-if="$slots.icon"
            #preicon
        >
            <slot name="icon" />
        </template>
    </PotOption>
</template>

<style>
.pot-select-option {
    /* --- PotSelect - Color - Option --- */
    --pot-option-color-border: var(--pot-select-option-color-border, transparent);
    --pot-option-color-background: var(--pot-select-option-color-background, transparent);
    --pot-option-color-text: var(--pot-select-option-color-text, inherit);
    --pot-option-color-outline: var(--pot-select-option-color-outline, initial);
    --pot-option-color-icon: var(--pot-select-option-color-icon, initial);

    /* --- PotSelect - Size - Option --- */
    --pot-option-size-height: var(--pot-select-option-size-height, auto);
    --pot-option-size-gap: var(--pot-select-option-size-gap, 0.8em);
    --pot-option-size-padding: var(--pot-select-option-size-padding, 0);
    --pot-option-size-border: var(--pot-select-option-size-border, 0);
    --pot-option-size-text: var(--pot-select-option-size-text, inherit);
    --pot-option-size-text-weight: var(--pot-select-option-size-text-weight, 400);
    --pot-option-size-text-height: var(--pot-select-option-size-text-height, 1);
    --pot-option-size-outline: var(--pot-select-option-size-outline, initial);
    --pot-option-size-outline-offset: var(--pot-select-option-size-outline-offset, initial);

    /* --- PotSelect - Radius - Option --- */
    --pot-option-radius-value: var(--pot-select-option-radius-value, 0);
}
</style>
