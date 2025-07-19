<script lang="ts" setup>
// Vue
import { ref, computed, watch, onUnmounted, onMounted } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDebounce } from '@/composables/timer';

const $slots = defineSlots<{
    default?: () => unknown;
    header?: () => unknown;
    title?: () => unknown;
    icon?: () => unknown;
}>();

const $props = withDefaults(
    defineProps<{
        opened?: boolean;
        modelValue?: boolean;
    }>(),
    {
        opened: undefined,
        modelValue: undefined,
    },
);

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

// Data
const content = ref<Element | null>(null);
const contentHeight = ref<number>(0);

const contentResizeObserver = new ResizeObserver(
    useDebounce({
        delay: 500,
        action: updateContentHeight,
    }),
);

// Lifecycle
onMounted(() => setTimeout(updateContentHeight, 1000));
onUnmounted(() => contentResizeObserver.disconnect());

// Computed
const isOpen = computed(() => Boolean($props.opened ?? $props.modelValue));

const classList = computed(() => useClassList({ opened: isOpen.value }));

const currentStyles = computed(() => {
    return {
        '--pot-accordion-content-height': `${contentHeight.value || 1000}px`,
    };
});

// Watchers
watch(
    () => content.value,
    (newContent, oldContent) => {
        if (newContent) contentResizeObserver.observe(newContent);
        if (oldContent) contentResizeObserver.unobserve(oldContent);
    },
);

// Methods
function toggle() {
    if (isOpen.value) {
        close();
    } else {
        open();
    }
}

function open() {
    $emit('open');
    $emit('update:modelValue', true);
}

function close() {
    $emit('close');
    $emit('update:modelValue', false);
}

function updateContentHeight() {
    if (
        content.value &&
        content.value.scrollHeight &&
        content.value.scrollHeight !== contentHeight.value
    ) {
        contentHeight.value = content.value.scrollHeight;
    }
}
</script>

<template>
    <div
        :class="['pot-accordion', classList]"
        :style="currentStyles"
    >
        <slot name="header">
            <div
                v-if="$slots.title"
                class="pot-accordion__header"
                role="button"
                @click="toggle"
            >
                <div class="pot-accordion__header__title">
                    <slot name="title" />
                </div>

                <div class="pot-accordion__header__icon">
                    <slot name="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                        >
                            <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                        </svg>
                    </slot>
                </div>
            </div>
        </slot>

        <div
            class="pot-accordion__content"
            ref="content"
        >
            <slot />
        </div>
    </div>
</template>

<style>
.pot-accordion {
    /* --- Color - Configuration --- */
    --pot-accordion-color-background: transparent;
    --pot-accordion-color-border: transparent;
    --pot-accordion-color-text: inherit;
    --pot-accordion-color-icon: inherit;

    /* --- Size - Configuration --- */
    --pot-accordion-size-text: inherit;
    --pot-accordion-size-icon: 1.4rem;
    --pot-accordion-size-padding: 0;
    --pot-accordion-size-border: 1px;
}

/* --- PotAccordion - Opened --- */
.pot-accordion._opened .pot-accordion__header__icon {
    transform: rotate(-180deg);
}

.pot-accordion._opened .pot-accordion__content {
    max-height: var(--pot-accordion-content-height);
}

.pot-accordion__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;

    /* --- PotAccordion - Color --- */
    background-color: var(--pot-accordion-color-background);
    border-color: var(--pot-accordion-color-border);
    color: var(--pot-accordion-color-text);

    /* --- PotAccordion - Size --- */
    padding: var(--pot-accordion-size-padding);
    border-width: var(--pot-accordion-size-border);
    font-size: var(--pot-accordion-size-text);
}

.pot-accordion__header__icon {
    transition: transform 0.2s ease;

    /* --- PotAccordion - Color --- */
    color: var(--pot-accordion-color-icon);

    /* --- PotAccordion - Size --- */
    font-size: var(--pot-accordion-size-icon);
}

.pot-accordion__header__icon svg {
    width: 1em;
    height: 1em;
}

.pot-accordion__content {
    overflow: hidden;
    max-height: 0;
    transition: 0.4s ease;
}
</style>
