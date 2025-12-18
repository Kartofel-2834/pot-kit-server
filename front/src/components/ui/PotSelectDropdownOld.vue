<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type {
    IPotSelectDropdownEmits,
    IPotSelectDropdownExpose,
    IPotSelectDropdownProps,
    IPotSelectSpecData,
} from '@/types/components/select';
import type { ISpec } from '@/types/composables/specs';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

// Composables
import { useDialog } from '@/composables/dialog';
import { useFocusableChildren, useFocusBox } from '@/composables/focus';
import { useAttach } from '@/composables/attach';
import { useDeviceProperties } from '@/composables/device-is';
import { useDebounce } from '@/composables/timer';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useKeyboard } from '@/composables/keyboard';
import { useClassList } from '@/composables/class-list';

// Components
import PotSelectOption from '@/components/ui/PotSelectOption.vue';

const $props = withDefaults(defineProps<IPotSelectDropdownProps<OPTION, VALUE_FIELD>>(), {
    to: 'body',
    fixedDropdownWidth: true,
    position: ATTACHED_BOX_POSITION.BOTTOM_CENTER,
    nudge: 0,
    edgeMargin: 0,
    transition: 'pot-select-dropdown-transition',
});

const $emit = defineEmits<IPotSelectDropdownEmits<OPTION, VALUE_FIELD>>();

// Refs
const container = useTemplateRef('container');

// Data
const headerWidth = ref<number>(0);

const resizeObserver = new ResizeObserver(
    useDebounce({
        action: ([entry]) => (headerWidth.value = entry.target.clientWidth ?? 0),
        delay: 100,
    }),
);

// Computed
const headerElement = computed(() => $props.header?.element ?? null);

const headerInput = computed(() => $props.header?.input ?? null);

const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => {
    return {
        '--pot-select-dropdown-size-width': headerWidth.value ? `${headerWidth.value}px` : '',
        zIndex: $dialog.zIndex.value,
        transform: `translate(${$attach.x.value}px, ${$attach.y.value}px)`,
    };
});

const currentClassList = computed(() => ({
    ...$classList.value,
    ...($props.classList ?? {}),
}));

// Composables
const $subscriptions = useComponentSubscriptions();

const { focusableChildren: $focusableChildren } = useFocusableChildren(container);

const $dialog = useDialog({
    isOpen: computed(() => $props.opened ?? false),
    triggers: ['clickoutside', 'escape'],
    layer: DIALOG_LAYERS.POPOVER,
    close,
    open,
});

const $properties = useDeviceProperties(
    {
        position: toRef(() => $props.position),
        nudge: toRef(() => $props.nudge),
        edgeMargin: toRef(() => $props.edgeMargin),
    },
    toRef(() => $props.devices),
);

const $classList = useClassList(
    {
        hidden: computed(() => $attach.x.value === null || $attach.y.value === null),
    },
    'select-dropdown',
);

const $attach = useAttach({
    target: headerElement,
    box: container,
    position: $properties.position,
    nudge: $properties.nudge,
    edgeMargin: $properties.edgeMargin,
    persistent: toRef(() => $props.persistent),
    sticky: toRef(() => !$props.noSticky),
    onChange: () => {
        if ($props.closeOnMove) $dialog.close();
    },
});

useFocusBox({
    element: container,
    leave: () => $props.header?.focus?.(),
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
function open() {
    if ($dialog.isOpen.value) return;
    $emit('open');
}

function close() {
    if (!$dialog.isOpen.value) return;
    $emit('close');
}

function toggle() {
    if ($dialog.isOpen.value) {
        close();
    } else {
        open();
    }
}

function select(spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>) {
    $emit('select', spec);
}

// Exports
defineExpose<IPotSelectDropdownExpose>({
    element: container,
    marker: $dialog.marker,
});
</script>

<template>
    <Teleport
        :to="teleportTo"
        :disabled="!to"
    >
        <Transition :name="transition">
            <div>
                <div
                    v-if="$dialog.isOpen.value"
                    v-bind="$dialog.marker"
                    ref="container"
                    :class="['pot-select-dropdown', className, currentClassList]"
                    :style="currentStyles"
                    tabindex="-1"
                >
                    <slot
                        name="dropdown-header"
                        :open="open"
                        :close="close"
                        :toggle="toggle"
                        :select="select"
                    />

                    <slot
                        name="options-list"
                        :specs="specs"
                        :open="open"
                        :close="close"
                        :toggle="toggle"
                        :select="select"
                    >
                        <ul
                            class="pot-select-options-list"
                            role="listbox"
                        >
                            <slot
                                v-for="spec of specs"
                                name="option"
                                :key="spec.id"
                                :spec="spec"
                                :class-list="currentClassList"
                                :select="select"
                            >
                                <PotSelectOption
                                    :key="spec.id"
                                    :class="currentClassList"
                                    :spec="spec"
                                    @select="select"
                                >
                                    <template #content>TEST</template>
                                </PotSelectOption>
                            </slot>
                        </ul>
                    </slot>

                    <slot
                        name="dropdown-footer"
                        :open="open"
                        :close="close"
                        :toggle="toggle"
                        :select="select"
                    />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
.pot-select-dropdown {
    position: fixed;
    display: flex;
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
    border-width: var(--pot-select-dropdown-size-border, 0);
    padding: var(--pot-select-dropdown-size-padding, 0);
    box-shadow: var(--pot-select-dropdown-size-shadow, none);
    font-size: var(--pot-select-dropdown-size-text, inherit);
    font-weight: var(--pot-select-dropdown-size-text-weight, 400);
    line-height: var(--pot-select-dropdown-size-text-height, 1);

    /* --- PotSelect - Radius - Dropdown --- */
    border-radius: var(--pot-select-dropdown-radius-value, 0);
}

.pot-select-dropdown._select-fixed-width {
    /* --- PotSelect - Size - Dropdown --- */
    width: var(--pot-select-dropdown-size-width, fit-content);
}

.pot-select-dropdown._select-dropdown-hidden {
    opacity: 0;
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

/* --- PotSelect - Configuration - Option --- */
.pot-select-option {
    --pot-select-option-color-border: var(--pot-select-dropdown-color-option-border, transparent);
    --pot-select-option-color-background: var(
        --pot-select-dropdown-color-option-background,
        transparent
    );
    --pot-select-option-color-text: var(--pot-select-dropdown-color-option-text, inherit);
    --pot-select-option-color-outline: var(--pot-select-dropdown-color-option-outline, initial);
    --pot-select-option-color-icon: var(--pot-select-dropdown-color-option-icon, initial);

    --pot-select-option-size-height: var(--pot-select-dropdown-size-option-height, auto);
    --pot-select-option-size-gap: var(--pot-select-dropdown-size-option-gap, 0.8em);
    --pot-select-option-size-padding: var(--pot-select-dropdown-size-option-padding, 0);
    --pot-select-option-size-border: var(--pot-select-dropdown-size-option-border, 0);
    --pot-select-option-size-text: var(--pot-select-dropdown-size-option-text, inherit);
    --pot-select-option-size-text-weight: var(--pot-select-dropdown-size-option-text-weight, 400);
    --pot-select-option-size-text-height: var(--pot-select-dropdown-size-option-text-height, 1);
    --pot-select-option-size-outline: var(--pot-select-dropdown-size-option-outline, initial);
    --pot-select-option-size-outline-offset: var(
        --pot-select-dropdown-size-option-outline-offset,
        initial
    );

    --pot-select-option-radius-value: var(--pot-select-dropdown-radius-option-value, 0);
}
</style>
