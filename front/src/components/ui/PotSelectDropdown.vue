<script setup lang="ts">
// Types
import type {
    IPotSelectDropdownEmits,
    IPotSelectDropdownExpose,
    IPotSelectDropdownProps,
} from '@/types/components/select-dropdown';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

// Composables
import { useDebounce } from '@/composables/timer';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useFocusableChildren, useFocusBox } from '@/composables/focus';
import { useKeyboard } from '@/composables/keyboard';

// Components
import PotPopover from '@/components/ui/PotPopover.vue';

const props = withDefaults(defineProps<IPotSelectDropdownProps>(), {
    to: 'body',
    fixedDropdownWidth: true,
    position: ATTACHED_BOX_POSITION.BOTTOM_START,
    nudge: 20,
    edgeMargin: 0,
    transition: 'pot-select-dropdown-transition',
});

const emit = defineEmits<IPotSelectDropdownEmits>();

// Refs
const container = useTemplateRef('container');
const popover = useTemplateRef('popover');

// Data
const headerWidth = ref<number>(0);

const resizeObserver = new ResizeObserver(
    useDebounce({
        action: ([entry]) => (headerWidth.value = entry.target.clientWidth ?? 0),
        delay: 100,
    }),
);

// Computed
const headerElement = computed(() => props.header?.element ?? null);

const headerInput = computed(() => props.header?.input ?? null);

const currentStyles = computed(() => {
    return {
        '--pot-select-dropdown-size-width': headerWidth.value ? `${headerWidth.value}px` : '',
    };
});

// Composables
const $subscriptions = useComponentSubscriptions();

const { focusableChildren: $focusableChildren } = useFocusableChildren(container);

useFocusBox({
    element: container,
    leave: () => props.header?.focus?.(),
    leaveFromEnd: () => close(),
    leaveFromStart: event => event.preventDefault(),
});

useKeyboard({
    target: headerInput,
    handlers: {
        tab: event => {
            if (!container.value) return;

            const data = $focusableChildren.value;
            const firstFocusableElement = data[0];
            const lastFocusableElement = data[data.length - 1];

            if (!firstFocusableElement && !lastFocusableElement) {
                close();
            } else if (!event.shiftKey) {
                event.preventDefault();
                event.stopImmediatePropagation();
                firstFocusableElement.focus();
            } else {
                close();
            }
        },
    },
});

$subscriptions.observe({
    target: headerElement,
    observer: resizeObserver,
});

// Methods
function close() {
    if (!props.opened) return;
    emit('close');
}

// Exports
defineExpose<IPotSelectDropdownExpose>({
    element: container,
    marker: toRef(() => popover.value?.marker ?? null),
});
</script>

<template>
    <PotPopover
        ref="popover"
        :visible="opened"
        :class-list="classList"
        :target="headerElement"
        :to="to"
        :position="position"
        :nudge="nudge"
        :edge-margin="edgeMargin"
        :persistent="persistent"
        :no-sticky="noSticky"
        :close-on-move="closeOnMove"
        :transition="transition"
        no-auto-focus
        no-focus-trap
        @close="close"
    >
        <div
            ref="container"
            :style="currentStyles"
            class="pot-select-dropdown"
        >
            <slot
                name="dropdown-header"
                :on-close="close"
            />

            <slot
                name="options-list"
                :on-close="close"
            >
                <ul
                    class="pot-select-options-list"
                    role="listbox"
                    tabindex="-1"
                >
                    <slot />
                </ul>
            </slot>

            <slot
                name="dropdown-footer"
                :on-close="close"
            />
        </div>
    </PotPopover>
</template>

<style>
.pot-select-dropdown {
    position: fixed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotSelect - Color - Dropdown --- */
    border-color: var(--pot-select-dropdown-color-border, transparent);
    background-color: var(--pot-select-dropdown-color-background, transparent);
    color: var(--pot-select-dropdown-color-text, inherit);

    /* --- PotSelect - Size - Dropdown --- */
    height: var(--pot-select-dropdown-size-height, auto);
    max-height: var(--pot-select-dropdown-size-max-height, 16rem);
    gap: var(--pot-select-dropdown-size-gap, 2rem);
    border-width: var(--pot-select-dropdown-size-border, 0);
    padding: var(--pot-select-dropdown-size-padding, 0);
    box-shadow: var(--pot-select-dropdown-size-shadow, none);
    font-size: var(--pot-select-dropdown-size-text, inherit);
    font-weight: var(--pot-select-dropdown-size-text-weight, 400);
    line-height: var(--pot-select-dropdown-size-text-height, 1);

    /* --- PotSelect - Radius - Dropdown --- */
    border-radius: var(--pot-select-dropdown-radius-value, 0);
}

._select-fixed-width .pot-select-dropdown {
    /* --- PotSelect - Size - Dropdown --- */
    width: var(--pot-select-dropdown-size-width, fit-content);
}

.pot-select-options-list {
    overflow: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0;
    padding: 0;
}

/* --- PotSelect - Transition --- */
.pot-select-dropdown-transition-enter-active,
.pot-select-dropdown-transition-leave-active {
    transition: opacity var(--pot-select-dropdown-transition-duration, 0.2s)
        var(--pot-select-dropdown-transition-function, ease);
}

.pot-select-dropdown-transition-enter-from,
.pot-select-dropdown-transition-leave-to {
    opacity: 0;
}
</style>
