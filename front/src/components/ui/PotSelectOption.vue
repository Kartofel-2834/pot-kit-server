<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type { IPotSelectOptionEmits, IPotSelectOptionProps } from '@/types/components/select';

// Vue
import { useTemplateRef, watch } from 'vue';

// Components
import PotOption from '@/components/ui/PotOption.vue';

const $props = withDefaults(defineProps<IPotSelectOptionProps<OPTION, VALUE_FIELD>>(), {});

const $emit = defineEmits<IPotSelectOptionEmits<OPTION, VALUE_FIELD>>();

// Refs
const container = useTemplateRef('container');

// Watchers
watch(
    () => [container.value?.element, $props.spec?.data?.focused],
    ([element, isFocused]) => {
        if (!isFocused || !(element instanceof HTMLElement)) return;

        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    { immediate: true },
);

// Listeners
function onOptionClick() {
    $emit('select', $props.spec);
}
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
            v-if="$slots.label"
            #default
        >
            <slot name="label" />
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
.pot-select-option.pot-option {
    /* --- PotSelect - Color - Option --- */
    --pot-option-color-border: var(--pot-select-color-option-border, transparent);
    --pot-option-color-background: var(--pot-select-color-option-background, transparent);
    --pot-option-color-text: var(--pot-select-color-option-text, inherit);
    --pot-option-color-outline: var(--pot-select-color-option-outline, initial);
    --pot-option-color-icon: var(--pot-select-color-option-icon, initial);

    /* --- PotSelect - Size - Option --- */
    --pot-option-size-height: var(--pot-select-size-option-height, auto);
    --pot-option-size-gap: var(--pot-select-size-option-gap, 0.8em);
    --pot-option-size-padding: var(--pot-select-size-option-padding, 0);
    --pot-option-size-border: var(--pot-select-size-option-border, 0);
    --pot-option-size-text: var(--pot-select-size-option-text, inherit);
    --pot-option-size-text-weight: var(--pot-select-size-option-text, 400);
    --pot-option-size-text-height: var(--pot-select-size-option-text, 1);
    --pot-option-size-outline: var(--pot-select-size-option-outline, initial);
    --pot-option-size-outline-offset: var(--pot-select-size-option-outline-offset, initial);

    /* --- PotSelect - Radius - Option --- */
    --pot-option-radius-value: var(--pot-select-radius-option-value, 0);
}
</style>
