<script setup lang="ts">
// Types
import type { IPotAccordionGroupProps } from '@/types/components/accordion';

// Vue
import { computed, ref, toRef } from 'vue';

// Composables
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useFocusableChildren } from '@/composables/focus';
import { useKeyboard } from '@/composables/keyboard';

const props = withDefaults(defineProps<IPotAccordionGroupProps>(), {
    values: undefined,
    modelValue: undefined,
});

const emit = defineEmits<{
    change: [newValues: unknown[]];
    'update:modelValue': [newValues: unknown[]];
}>();

// Data
const container = ref<Element | null>(null);
const selectedHeader = ref<HTMLElement | null>(null);

// Computed
const currentValues = computed(() => props.values ?? props.modelValue ?? []);

const accordionsHeaders = computed(() => {
    return $focusableChildren.value.filter(element => {
        return element instanceof HTMLElement && element.dataset.potAccordionHeader !== undefined;
    });
});

const selectedHeaderIndex = computed(() => {
    if (!selectedHeader.value) {
        return -1;
    }

    return accordionsHeaders.value.indexOf(selectedHeader.value);
});

// Composables
const $subscriptions = useComponentSubscriptions();
const { focusableChildren: $focusableChildren } = useFocusableChildren(container);

useKeyboard({
    target: container,
    handlers: {
        arrowUp: event => {
            event.preventDefault();
            moveUp();
        },
        arrowDown: event => {
            event.preventDefault();
            moveDown();
        },
        home: event => {
            event.preventDefault();
            moveStart();
        },
        end: event => {
            event.preventDefault();
            moveEnd();
        },
    },
});

$subscriptions.bind(
    computed(() => (accordionsHeaders.value.length ? accordionsHeaders.value : null)),
    headers => {
        return headers.map(header => {
            return $subscriptions.addEventListener({
                target: header,
                eventName: 'focus',
                listener: () => (selectedHeader.value = header),
            });
        });
    },
    controllersList => controllersList.forEach(controller => controller.abort()),
);

// Methods
function singleBind(key: unknown) {
    return {
        opened: toRef(() => currentValues.value.includes(key)),
        onOpen: () => openSingleAccordion(key),
        onClose: () => closeAccordion(key),
    };
}

function multipleBind(key: unknown) {
    return {
        opened: toRef(() => currentValues.value.includes(key)),
        onOpen: () => openMultipleAccordion(key),
        onClose: () => closeAccordion(key),
    };
}

function openMultipleAccordion(key: unknown) {
    const updatedKeys = [...currentValues.value, key];
    emit('change', updatedKeys);
    emit('update:modelValue', updatedKeys);
}

function openSingleAccordion(key: unknown) {
    const updatedKeys = [key];
    emit('change', updatedKeys);
    emit('update:modelValue', updatedKeys);
}

function closeAccordion(key: unknown) {
    const updatedKeys = currentValues.value.filter(selectedKey => selectedKey !== key);
    emit('change', updatedKeys);
    emit('update:modelValue', updatedKeys);
}

function moveUp() {
    const headers = accordionsHeaders.value;
    const index = selectedHeaderIndex.value;

    const nextIndex = index === -1 || index === 0 ? headers.length - 1 : index - 1;
    headers[nextIndex]?.focus?.();
}

function moveDown() {
    const headers = accordionsHeaders.value;
    const index = selectedHeaderIndex.value;

    const nextIndex = index === -1 || index === headers.length - 1 ? 0 : index + 1;
    headers[nextIndex]?.focus?.();
}

function moveStart() {
    accordionsHeaders.value[0]?.focus?.();
}

function moveEnd() {
    accordionsHeaders.value[accordionsHeaders.value.length - 1]?.focus?.();
}
</script>

<template>
    <div
        ref="container"
        class="pot-accordion-group"
    >
        <slot
            :single-bind="singleBind"
            :multiple-bind="multipleBind"
        />
    </div>
</template>
