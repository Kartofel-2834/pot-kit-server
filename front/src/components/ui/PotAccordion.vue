<script lang="ts" setup>
// Types
import type { IPotAccordionProps, IPotAccordionSlots } from '@/types/components/accordion';

// Vue
import { ref, computed, onMounted, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useThrottle } from '@/composables/timer';
import { useComponentSubscriptions } from '@/composables/subscriptions';

const $slots = defineSlots<IPotAccordionSlots>();

const $props = withDefaults(defineProps<IPotAccordionProps>(), {
    opened: undefined,
    modelValue: undefined,
    disabled: false,
});

const $emit = defineEmits<{
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}>();

// Data
const contentResizeObserver = new ResizeObserver(
    useThrottle({
        delay: 500,
        action: updateContentHeight,
    }),
);

const content = ref<Element | null>(null);
const contentHeight = ref<number>(NaN);

// Lifecycle
onMounted(() => setTimeout(updateContentHeight));

// Computed
const isOpen = computed(() => Boolean(!$props.disabled && ($props.opened ?? $props.modelValue)));

const currentStyles = computed(() => {
    return {
        '--pot-accordion-content-height': contentHeight.value ? `${contentHeight.value}px` : '',
    };
});

// Composables
const $subscriptions = useComponentSubscriptions();

const $classList = useClassList(
    {
        opened: isOpen,
        disabled: toRef(() => $props.disabled),
    },
    'pot-accordion',
);

$subscriptions.observe({
    target: content,
    observer: contentResizeObserver,
});

// Methods
function toggle() {
    if ($props.disabled) return;

    if (isOpen.value) {
        close();
    } else {
        open();
    }
}

function open() {
    if ($props.disabled) return;

    $emit('open');
    $emit('update:modelValue', true);
}

function close() {
    if ($props.disabled) return;

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
        :class="$classList"
        :style="currentStyles"
    >
        <slot
            name="header"
            :toggle="toggle"
            :open="open"
            :close="close"
        >
            <div
                v-if="$slots.title"
                data-pot-accordion-header
                class="pot-accordion__header"
                :tabindex="disabled ? -1 : 0"
                @click="toggle"
                @keydown.enter="toggle"
                @keydown.space="toggle"
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

        <Transition name="pot-accordion-transition">
            <div
                v-show="isOpen"
                class="pot-accordion__content"
                ref="content"
            >
                <slot />
            </div>
        </Transition>
    </div>
</template>

<style>
/* --- PotAccordion - Disabled --- */
.pot-accordion.pot-accordion_disabled .pot-accordion__header {
    cursor: not-allowed;
}

/* --- PotAccordion - Opened --- */
.pot-accordion.pot-accordion_opened .pot-accordion__header__icon {
    transform: scaleY(-1);
}

.pot-accordion__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;

    /* --- PotAccordion - Color --- */
    background-color: var(--pot-accordion-color-background, transparent);
    border-color: var(--pot-accordion-color-border, transparent);
    color: var(--pot-accordion-color-text, inherit);
    outline-color: var(--pot-accordion-color-outline, initial);

    /* --- PotAccordion - Size --- */
    padding: var(--pot-accordion-size-padding, 0);
    border-width: var(--pot-accordion-size-border, 1px);
    font-size: var(--pot-accordion-size-text, inherit);
    font-weight: var(--pot-accordion-size-text-weight, 400);
    line-height: var(--pot-accordion-size-text-height, 1);
    outline-width: var(--pot-accordion-size-outline, initial);
    outline-offset: var(--pot-accordion-size-outline-offset, initial);
}

.pot-accordion__header:disabled {
    cursor: not-allowed;
}

.pot-accordion__header__icon {
    display: flex;
    transition: transform 0.2s ease;

    /* --- PotAccordion - Color --- */
    color: var(--pot-accordion-color-icon, inherit);

    /* --- PotAccordion - Size --- */
    font-size: var(--pot-accordion-size-icon, 1.4rem);
}

.pot-accordion__header__icon svg {
    width: 1em;
    height: 1em;
}

.pot-accordion__content {
    overflow: hidden;
}

/* --- Transition --- */
.pot-accordion-transition-enter-active,
.pot-accordion-transition-leave-active {
    max-height: var(--pot-accordion-content-height);
    transition: 0.4s ease;
}

.pot-accordion-transition-enter-from,
.pot-accordion-transition-leave-to {
    max-height: 0;
}
</style>
