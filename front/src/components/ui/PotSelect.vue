<script setup lang="ts" generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type { ISpec, ISpecsOptions, TOptionValue } from '@/types/composables/specs';
import type { IPotSelectProps, IPotSelectSpecData } from '@/types/components/select';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

// Vue
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useDebounce } from '@/composables/timer';
import { useSubscriptions } from '@/composables/subscriptions';
import { useSpecs } from '@/composables/specs';
import { useClassListArray } from '@/composables/class-list';
import { useFirstFocusableChild, useFocusableChildren, useFocusBox } from '@/composables/focus';
import { handleKeyboardEvent } from '@/composables/keyboard';

// Components
import PotInput from '@/components/ui/PotInput.vue';
import PotOption from '@/components/ui/PotOption.vue';
import PotPopover from '@/components/ui/PotPopover.vue';

const $props = withDefaults(defineProps<IPotSelectProps<OPTION, VALUE_FIELD>>(), {
    value: null,
    modelValue: null,
    options: () => [],
    to: 'body',
    fixedDropdownWidth: true,
    position: ATTACHED_BOX_POSITION.BOTTOM_CENTER,
    nudge: 0,
    edgeMargin: 0,
    transition: 'pot-select-transition',
});

const $emit = defineEmits<{
    change: [value: TOptionValue<OPTION, VALUE_FIELD> | null, option: OPTION];
    'update:modelValue': [value: TOptionValue<OPTION, VALUE_FIELD> | null];
    changeText: [text: string];
    'update:text': [text: string];
}>();

const $subscriptions = useSubscriptions();

const $specs = useSpecs(
    computed<ISpecsOptions<OPTION, VALUE_FIELD, IPotSelectSpecData>>(() => ({
        values: currentValue.value ? [currentValue.value] : [],
        options: $props.options,
        optionLabel: $props.optionLabel,
        optionDisabled: $props.optionDisabled,
        optionValue: $props.optionValue,
        optionData: (option: OPTION) => ({
            focused: option,
        }),
        data: (option, value) => ({
            focused: Boolean(focusedSpec.value && focusedSpec.value.value === value),
        }),
    })),
);

// Data
const container = ref<InstanceType<typeof PotInput> | null>(null);
const dropdown = ref<InstanceType<typeof PotPopover> | null>(null);

const isOpen = ref<boolean>(false);
const isFocused = ref<boolean>(false);
const containerWidth = ref<number>(0);

const focusedSpec = ref<ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData> | null>(null);

const resizeObserver = new ResizeObserver(
    useDebounce({
        action: ([entry]) => (containerWidth.value = entry.contentRect?.width ?? 0),
        delay: 100,
    }),
);

// Lifecycle
onMounted(() => {
    if (!container.value) return;

    $subscriptions.observe('resize', container.value.$el, resizeObserver);
});

onUnmounted(() => {
    $subscriptions.clear();
});

// Computed
const currentValue = computed(() => $props.value ?? $props.modelValue ?? null);

const properties = useDeviceProperties(
    computed(() => ({
        position: $props.position,
        nudge: $props.nudge,
        edgeMargin: $props.edgeMargin,
        color: $props.color,
        size: $props.size,
        radius: $props.radius,
    })),
    $props.devices,
);

const dropdownStyles = computed(() => {
    const dropdownWidth = containerWidth.value ? `${containerWidth.value}px` : '';

    return {
        '--pot-select-size-dropdown': dropdownWidth,
    };
});

const classList = useClassListArray(
    computed(() => ({
        position: properties.value.position,
        color: properties.value.color,
        size: properties.value.size,
        radius: properties.value.radius,
        editable: $props.editable,
        opened: isOpen.value,
        closed: !isOpen.value,
        focused: isFocused.value,
        fluid: $props.fluid,
        'fixed-width': $props.fixedDropdownWidth,
    })),
    'select',
);

const availableSpecs = computed(() => $specs.value.filter(spec => !spec.disabled));

const selectedSpec = computed(() => $specs.value.find(spec => spec.selected) ?? null);

const label = computed(() => {
    const selectedLabel = selectedSpec.value?.label ?? '';
    return $props.editable && isFocused.value ? $props.text : selectedLabel;
});

// Watchers
watch(
    () => dropdown.value?.popover,
    () => {
        if (dropdown.value) {
            setupFocusBox();
        } else {
            terminateFocusBox();
        }
    },
);

// Listeners
function onClick() {
    open();
}

function onFocus() {
    isFocused.value = true;
}

function onBlur() {
    isFocused.value = false;
}

function onInputText(text: string) {
    changeText(text);
}

function onInputKeydown(event: KeyboardEvent) {
    const isEdit = isFocused.value && $props.editable;
    const spec = focusedSpec.value as ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>;

    const handleKeypress = (event: KeyboardEvent) => {
        open();
        if (!isEdit) event.preventDefault;
    };

    handleKeyboardEvent(event, {
        space: event => {
            handleKeypress(event);
            if (!isEdit && spec) {
                change(spec);
                close();
            } else if (!isEdit && !spec) {
                focusSelected();
            }
        },
        enter: event => {
            handleKeypress(event);
            if (!isEdit && spec) {
                change(spec);
                close();
            } else if (!isEdit && !spec) {
                focusSelected();
            }
        },
        arrowDown: event => {
            handleKeypress(event);
            if (!isEdit) focusNext();
        },
        arrowUp: event => {
            handleKeypress(event);
            if (!isEdit) focusPrev();
        },
        home: event => {
            handleKeypress(event);
            if (!isEdit) focusFirst();
        },
        end: event => {
            handleKeypress(event);
            if (!isEdit) focusLast();
        },
        tab: event => {
            if (!dropdown.value?.popover) return;

            const focusableChildren = useFocusableChildren(dropdown.value.popover);
            const firstFocusableElement = focusableChildren[0];
            const lastFocusableElement = focusableChildren[focusableChildren.length - 1];

            if (!firstFocusableElement && !lastFocusableElement) {
                close();
            } else if (!event.shiftKey) {
                event.preventDefault();
                firstFocusableElement.focus();
            } else {
                close();
            }
        },
    });

    if (event.key.length === 1 && event.key.trim()) {
        handleKeypress(event);
        if (!isEdit) focusSameLabeled(event.key);
    }
}

function onOptionClick(spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>) {
    change(spec);
}

// Methods
function focusSameLabeled(text: string) {
    if (!isOpen.value) return;
    const spec = availableSpecs.value.find(spec => spec.label.startsWith(text));
    focusedSpec.value = spec ?? availableSpecs.value[0] ?? null;
}

function focusSelected() {
    if (!isOpen.value) return;
    focusedSpec.value = selectedSpec.value ?? availableSpecs.value[0] ?? null;
}

function focusFirst() {
    if (!isOpen.value) return;
    focusedSpec.value = availableSpecs.value[0] ?? null;
}

function focusLast() {
    if (!isOpen.value) return;
    focusedSpec.value = availableSpecs.value[availableSpecs.value.length - 1] ?? null;
}

function focusNext() {
    if (!isOpen.value) return;

    if (!focusedSpec.value) {
        focusFirst();
        return;
    }

    const index = availableSpecs.value.findIndex(v => v.option === focusedSpec.value?.option);
    const nextSpec = availableSpecs.value[index + 1];

    if (!nextSpec || index === -1 || index === availableSpecs.value.length - 1) {
        focusFirst();
        return;
    }

    focusedSpec.value = nextSpec;
}

function focusPrev() {
    if (!isOpen.value) return;

    if (!focusedSpec.value) {
        focusLast();
        return;
    }

    const index = availableSpecs.value.findIndex(v => v.value === focusedSpec.value?.value);
    const prevSpec = availableSpecs.value[index - 1];

    if (!prevSpec || index === -1 || index === 0) {
        focusLast();
        return;
    }

    focusedSpec.value = prevSpec;
}

function setupFocusBox() {
    const dropdownElement = dropdown.value?.popover as Element;

    if (!dropdownElement) return;

    const focusableChild = useFirstFocusableChild(dropdownElement);

    if (!focusableChild) return;

    $subscriptions.add(
        () => {
            return useFocusBox(dropdownElement, {
                leave: () => container.value?.input?.focus?.(),
                leaveForward: () => close(),
                leaveBack: (trapInstance, event) => event.preventDefault(),
            });
        },
        controller => controller.abort(),
        'focus-control',
    );
}

function terminateFocusBox() {
    $subscriptions.remove('focus-control');
}

function toggle() {
    if (isOpen.value) {
        close();
    } else {
        open();
    }
}

function open() {
    if (isOpen.value) return;
    isOpen.value = true;
}

function close() {
    if (!isOpen.value) return;
    isOpen.value = false;
    focusedSpec.value = null;
}

function change(spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>) {
    if (spec.disabled || spec.selected) return;

    $emit('change', spec.value, spec.option);
    $emit('update:modelValue', spec.value);
    close();
}

function changeText(text: string) {
    $emit('changeText', text);
    $emit('update:text', text);
}
</script>

<template>
    <PotInput
        ref="container"
        :class="['pot-select', classList]"
        :data-pot-dialog-id="dropdown?.dialogId.description"
        :value="label"
        :readonly="!editable"
        :devices="devices"
        placeholder="select"
        @click="onClick"
        @input="onInputText"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onInputKeydown"
    >
        <template #preicon>
            <slot name="preicon" />
        </template>

        <template #icon>
            <slot name="icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                </svg>
            </slot>
        </template>

        <template #append>
            <PotPopover
                ref="dropdown"
                :visible="isOpen"
                :target="container?.$el"
                :to="to"
                :transition="transition"
                :position="position"
                :nudge="nudge"
                :edge-margin="edgeMargin"
                :persistent="persistent"
                :no-sticky="noSticky"
                :close-on-move="closeOnMove"
                :devices="devices"
                no-auto-focus
                no-focus-trap
                @close="close"
                @open="open"
            >
                <div
                    :class="['pot-select-dropdown', classList]"
                    :style="dropdownStyles"
                >
                    <slot
                        name="header"
                        :open="open"
                        :close="close"
                        :toggle="toggle"
                        :change="change"
                    />

                    <slot
                        name="options-list"
                        :specs="$specs"
                        :open="open"
                        :close="close"
                        :toggle="toggle"
                        :change="change"
                    >
                        <ul
                            class="pot-select-options-list"
                            role="listbox"
                        >
                            <slot
                                v-for="spec of $specs"
                                name="option"
                                :key="spec.id"
                                :spec="spec"
                                :change="change"
                            >
                                <PotOption
                                    tag="li"
                                    :class="['pot-select-option', classList]"
                                    role="option"
                                    :value="spec.value"
                                    :label="spec.label"
                                    :disabled="spec.disabled"
                                    :selected="spec.selected"
                                    :focused="spec.data?.focused"
                                    fluid
                                    @click="onOptionClick(spec)"
                                />
                            </slot>
                        </ul>
                    </slot>

                    <slot
                        name="footer"
                        :open="open"
                        :close="close"
                        :toggle="toggle"
                        :change="change"
                    />
                </div>
            </PotPopover>
        </template>
    </PotInput>
</template>

<style>
.pot-select {
    /* --- Color - Configuration --- */
    --pot-select-color-border: transparent;
    --pot-select-color-background: transparent;
    --pot-select-color-text: inherit;
    --pot-select-color-caret: currentColor;
    --pot-select-color-placeholder: inherit;
    --pot-select-color-icon: initial;

    /* --- Size - Configuration --- */
    --pot-select-size-height: auto;
    --pot-select-size-padding: 0;
    --pot-select-size-border: 0;
    --pot-select-size-text: inherit;
    --pot-select-size-gap: 1rem;
    --pot-select-size-icon: auto;
    --pot-select-size-outline: initial;
    --pot-select-size-outline-offset: initial;

    /* --- Radius - Configuration --- */
    --pot-select-radius-value: 0;
}

.pot-select.pot-input {
    /* --- Input - Color - Configuration --- */
    --pot-input-color-border: var(--pot-select-color-border);
    --pot-input-color-background: var(--pot-select-color-background);
    --pot-input-color-text: var(--pot-select-color-text);
    --pot-input-color-caret: var(--pot-select-color-caret);
    --pot-input-color-placeholder: var(--pot-select-color-placeholder);
    --pot-input-color-icon: var(--pot-select-color-icon);

    /* --- Input - Size - Configuration --- */
    --pot-input-size-height: var(--pot-select-size-height);
    --pot-input-size-padding: var(--pot-select-size-padding);
    --pot-input-size-border: var(--pot-select-size-border);
    --pot-input-size-text: var(--pot-select-size-text);
    --pot-input-size-gap: var(--pot-select-size-border);
    --pot-input-size-icon: var(--pot-select-size-icon);
    --pot-input-size-outline: var(--pot-select-size-outline);
    --pot-input-size-outline-offset: var(--pot-select-size-outline-offset);

    /* --- Input - Radius - Configuration --- */
    --pot-input-radius-value: var(--pot-select-radius-value);

    cursor: pointer;
}

/* --- PotSelect - Opened --- */
.pot-select._select-opened .pot-input-icon {
    transform: scaleY(-1);
}

/* --- PotSelect - Fluid --- */
.pot-select._select-fluid {
    width: 100%;
}

/* --- PotSelect - Dropdown - Fixed Width --- */
.pot-select-dropdown._select-fixed-width {
    width: var(--pot-select-size-dropdown);
}

.pot-select-dropdown {
    /* --- Dropdown - Color - Configuration --- */
    --pot-select-color-dropdown-background: transparent;
    --pot-select-color-dropdown-border: transparent;
    --pot-select-color-dropdown-text: inherit;
    --pot-select-color-option-background: transparent;

    /* --- Dropdown - Size - Configuration --- */
    --pot-select-size-dropdown-border: 0;
    --pot-select-size-dropdown-padding: 0;
    --pot-select-size-dropdown-shadow: none;
    --pot-select-size-dropdown-text: inherit;

    /* --- Dropdown - Radius - Configuration --- */
    --pot-select-radius-dropdown-value: 0;

    position: fixed;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotSelect - Dropdown - Color --- */
    border-color: var(--pot-select-color-dropdown-border);
    background-color: var(--pot-select-color-dropdown-background);
    color: var(--pot-select-color-dropdown-text);

    /* --- PotSelect - Dropdown - Size --- */
    border-width: var(--pot-select-size-dropdown-border);
    padding: var(--pot-select-size-dropdown-padding);
    box-shadow: var(--pot-select-size-dropdown-shadow);
    font-size: var(--pot-select-size-dropdown-text);

    /* --- PotSelect - Dropdown - Radius --- */
    border-radius: var(--pot-select-radius-dropdown-value);
}

.pot-select-option {
    /* --- Color - Configuration --- */
    --pot-select-color-option-border: transparent;
    --pot-select-color-option-background: transparent;
    --pot-select-color-option-text: inherit;
    --pot-select-color-option-outline: initial;

    /* --- Size - Configuration --- */
    --pot-select-size-option-height: auto;
    --pot-select-size-option-gap: 0;
    --pot-select-size-option-padding: 0;
    --pot-select-size-option-border: 0;
    --pot-select-size-option-text: inherit;
    --pot-select-size-option-outline: initial;
    --pot-select-size-option-outline-offset: initial;

    /* ---  Radius - Configuration --- */
    --pot-select-radius-option-value: 0;
}

.pot-select-option.pot-option {
    /* --- Option - Color - Configuration --- */
    --pot-option-color-border: var(--pot-select-color-option-border);
    --pot-option-color-background: var(--pot-select-color-option-background);
    --pot-option-color-text: var(--pot-select-color-option-text);
    --pot-option-color-outline: var(--pot-select-color-option-outline);

    /* --- Option - Size - Configuration --- */
    --pot-option-size-height: var(--pot-select-size-option-height);
    --pot-option-size-gap: var(--pot-select-size-option-gap);
    --pot-option-size-padding: var(--pot-select-size-option-padding);
    --pot-option-size-border: var(--pot-select-size-option-border);
    --pot-option-size-text: var(--pot-select-size-option-text);
    --pot-option-size-outline: var(--pot-select-size-option-outline);
    --pot-option-size-outline-offset: var(--pot-select-size-option-outline-offset);

    /* --- Option - Radius - Configuration --- */
    --pot-option-radius-value: var(--pot-select-radius-option-value);
}

/* --- PotSelect - Transition --- */
.pot-select-transition-enter-active,
.pot-select-transition-leave-active {
    transition: opacity 0.2s ease;
}

.pot-select-transition-enter-from,
.pot-select-transition-leave-to {
    opacity: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/select.css" />
<!-- Styles - END -->
