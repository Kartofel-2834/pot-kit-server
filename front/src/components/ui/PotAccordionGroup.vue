<script setup lang="ts">
// Vue
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// Composables
import { useSubscriptions } from '@/composables/subscriptions';
import { useDebounce } from '@/composables/timer';
import { useFocusableChildren } from '@/composables/focus';
import { handleKeyboardEvent } from '@/composables/keyboard';

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

const $subscriptions = useSubscriptions();
const $accordionSubscriptions = useSubscriptions();

// Data
const container = ref<Element | null>(null);
const selectedHeader = ref<HTMLElement | null>(null);
const accordionsHeaders = ref<HTMLElement[]>([]);

const mutationObserver = new MutationObserver(
    useDebounce({
        action: () => (accordionsHeaders.value = getAccordionHeaders()),
        delay: 100,
    }),
);

// Lifecycle
onMounted(() => {
    if (!container.value) return;

    accordionsHeaders.value = getAccordionHeaders();

    $subscriptions.observe('focusable-elements-change', container.value, mutationObserver, {
        childList: true,
        subtree: true,
        attributeFilter: ['tabindex', 'disabled'],
    });
});

onUnmounted(() => {
    $subscriptions.clear();
    $accordionSubscriptions.clear();
});

// Computed
const currentValues = computed(() => $props.values ?? $props.modelValue ?? []);

// Watchers
watch(
    () => accordionsHeaders.value,
    headers => {
        $accordionSubscriptions.clear();

        if (!Array.isArray(headers)) return;

        headers.forEach(header => {
            if (!(header instanceof Element)) return;

            $accordionSubscriptions.addEventListener({
                target: header,
                eventName: 'focus',
                listener: handleAccordionHeaderFocus,
            });
        });
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
    const headers = accordionsHeaders.value;
    const index = headers.indexOf(selectedHeader.value as HTMLElement);

    let nextIndex = 0;

    const isMatched = handleKeyboardEvent(event, {
        arrowDown: () => (nextIndex = index === -1 || index === headers.length - 1 ? 0 : index + 1),
        arrowUp: () => (nextIndex = index === -1 || index === 0 ? headers.length - 1 : index - 1),
        home: () => (nextIndex = 0),
        end: () => (nextIndex = headers.length - 1),
    });

    if (!isMatched) return;

    event.preventDefault();
    headers[nextIndex]?.focus?.();
}

function handleAccordionHeaderFocus(event: Event) {
    const header = event.target as HTMLElement;
    selectedHeader.value = header;
}

function getAccordionHeaders(): HTMLElement[] {
    if (!container.value) return [];

    const focusableChildren = useFocusableChildren(container.value);

    return focusableChildren.filter(element => {
        return element instanceof HTMLElement && element.dataset.potAccordionHeader !== undefined;
    });
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
