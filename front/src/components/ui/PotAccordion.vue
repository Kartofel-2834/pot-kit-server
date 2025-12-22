<script lang="ts" setup>
// Types
import type { IPotAccordionProps } from '@/types/components/accordion';

// Vue
import { ref, computed, onMounted, toRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useThrottle } from '@/composables/timer';
import { useComponentSubscriptions } from '@/composables/subscriptions';

// Components
import PotIcon from '@/components/ui/PotIcon.vue';

const props = withDefaults(defineProps<IPotAccordionProps>(), {
    opened: undefined,
    modelValue: undefined,
    disabled: false,
});

const emit = defineEmits<{
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
const isOpen = computed(() => Boolean(!props.disabled && (props.opened ?? props.modelValue)));

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
        disabled: toRef(() => props.disabled),
    },
    'accordion',
);

$subscriptions.observe({
    target: content,
    observer: contentResizeObserver,
});

// Methods
function toggle() {
    if (props.disabled) return;

    if (isOpen.value) {
        close();
    } else {
        open();
    }
}

function open() {
    if (props.disabled) return;

    emit('open');
    emit('update:modelValue', true);
}

function close() {
    if (props.disabled) return;

    emit('close');
    emit('update:modelValue', false);
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
        :class="['pot-accordion', $classList]"
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
                class="pot-accordion-header"
                :tabindex="disabled ? -1 : 0"
                @click="toggle"
                @keydown.enter="toggle"
                @keydown.space="toggle"
            >
                <div class="pot-accordion-title">
                    <slot name="title" />
                </div>

                <div class="pot-accordion-icon">
                    <slot name="icon">
                        <PotIcon icon="arrow" />
                    </slot>
                </div>
            </div>
        </slot>

        <Transition name="pot-accordion-transition">
            <div
                v-show="isOpen"
                class="pot-accordion-content"
                ref="content"
            >
                <slot />
            </div>
        </Transition>
    </div>
</template>

<style>
.pot-accordion-header {
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

.pot-accordion-header:disabled {
    cursor: default;
}

.pot-accordion-icon {
    display: flex;
    transition: transform var(--pot-accordion-transition-duration, 0.2s)
        var(--pot-accordion-transition-function, ease);

    /* --- PotAccordion - Color --- */
    color: var(--pot-accordion-color-icon, inherit);

    /* --- PotAccordion - Size --- */
    font-size: var(--pot-accordion-size-icon, 1.4rem);
}

.pot-accordion-content {
    overflow: hidden;
}

/* --- Disabled --- */
._accordion-disabled .pot-accordion-header {
    cursor: default;
}

/* --- Opened --- */
._accordion-opened .pot-accordion-icon {
    transform: scaleY(-1);
}

.pot-accordion-transition-enter-active,
.pot-accordion-transition-leave-active {
    max-height: var(--pot-accordion-content-height);
    transition: var(--pot-accordion-transition-duration, 0.2s)
        var(--pot-accordion-transition-function, ease);
}

.pot-accordion-transition-enter-from,
.pot-accordion-transition-leave-to {
    max-height: 0;
}
</style>
