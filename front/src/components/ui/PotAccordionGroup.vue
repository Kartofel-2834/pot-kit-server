<script setup lang="ts">
// Vue
import { computed, ref } from 'vue';

// Components
import PotAccordion from './PotAccordion.vue';

const $props = withDefaults(
    defineProps<{
        values?: unknown[];
        modelValue?: unknown[];
    }>(),
    {
        values: undefined,
        modelValue: undefined,
    },
);

const $emit = defineEmits<{
    change: [newValues: unknown[]];
    'update:modelValue': [newValues: unknown[]];
}>();

// Computed
const currentValues = computed(() => $props.values ?? $props.modelValue ?? []);

// Methods
function singleBind(key: unknown) {
    return {
        opened: currentValues.value.includes(key),
        onOpen: () => openSingleAccordion(key),
        onClose: () => closeAccordion(key),
    };
}

function multipleBind(key: unknown) {
    return {
        opened: currentValues.value.includes(key),
        onOpen: () => openMultipleAccordion(key),
        onClose: () => closeAccordion(key),
    };
}

function openMultipleAccordion(key: unknown) {
    const updatedKeys = [...currentValues.value, key];
    $emit('change', updatedKeys);
    $emit('update:modelValue', updatedKeys);
}

function openSingleAccordion(key: unknown) {
    const updatedKeys = [key];
    $emit('change', updatedKeys);
    $emit('update:modelValue', updatedKeys);
}

function closeAccordion(key: unknown) {
    const updatedKeys = currentValues.value.filter(selectedKey => selectedKey !== key);
    $emit('change', updatedKeys);
    $emit('update:modelValue', updatedKeys);
}
</script>

<template>
    <div>
        <slot
            :single-bind="singleBind"
            :multiple-bind="multipleBind"
        />
    </div>
</template>
