<script setup lang="ts">
// Vue
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// Composables
import { useFocusTrap } from '@/composables/focus-trap';

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

const $focusTrap = useFocusTrap();

// Data
const container = ref<Element | null>(null);
const selectedHeader = ref<HTMLElement | null>(null);

// Lifecycle
onMounted(() => {
    if (!container.value) return;

    $focusTrap.setup(container.value, {
        trap: false,
        autofocus: false,
    });
});

onUnmounted(() => $focusTrap.terminate());

// Computed
const currentValues = computed(() => $props.values ?? $props.modelValue ?? []);

const accordionsHeaders = computed(() =>
    $focusTrap.focusableElements.value.filter(v => v.dataset.potAccordionHeader !== undefined),
);

// Watchers
watch(
    () => accordionsHeaders.value,
    (newAccordionsHeaders, oldAccordionsHeaders) => {
        newAccordionsHeaders.forEach(header =>
            header.addEventListener('focus', handleAccordionHeaderFocus),
        );

        oldAccordionsHeaders.forEach(header =>
            header.removeEventListener('focus', handleAccordionHeaderFocus),
        );
    },
);

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

function handleKeydown(event: KeyboardEvent) {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;

    event.stopPropagation();
    const headers = accordionsHeaders.value;
    const index = headers.indexOf(selectedHeader.value as HTMLElement);

    let nextIndex = 0;

    if (event.key === 'ArrowDown') {
        nextIndex = index === -1 || index === headers.length - 1 ? 0 : index + 1;
    }

    if (event.key === 'ArrowUp') {
        nextIndex = index === -1 || index === 0 ? headers.length - 1 : index - 1;
    }

    if (event.key === 'Home') {
        nextIndex = 0;
    }

    if (event.key === 'End') {
        nextIndex = headers.length - 1;
    }

    headers[nextIndex]?.focus?.();
}

function handleAccordionHeaderFocus(event: Event) {
    const header = event.target as HTMLElement;
    selectedHeader.value = header;
}
</script>

<template>
    <div
        ref="container"
        class="pot-accordion-group"
        @keydown="handleKeydown"
    >
        <slot
            :single-bind="singleBind"
            :multiple-bind="multipleBind"
        />
    </div>
</template>
