<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type { Component, Ref } from 'vue';
import type { ISpec, TOptionValue } from '@/types/composables/specs';
import type { IPotSelectProps, IPotSelectSpecData } from '@/types/components/select';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, ref, toRef } from 'vue';

// Composables
import { useDialog } from '@/composables/dialog';
import { useDeviceProperties } from '@/composables/device-is';
import { useDebounce } from '@/composables/timer';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useSpecs } from '@/composables/specs';
import { useClassList } from '@/composables/class-list';
import { useFocusableChildren, useFocusBox } from '@/composables/focus';
import { useKeyboard } from '@/composables/keyboard';
import { useAttach } from '@/composables/attach';

// Components
import PotInput from '@/components/ui/PotInput.vue';
import PotOption from '@/components/ui/PotOption.vue';

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

// Data
const container = ref<InstanceType<typeof PotInput> | null>(null);
const dropdown = ref<HTMLElement | null>(null);
const optionsElements = ref<InstanceType<typeof PotInput>[]>([]);

const isOpen = ref<boolean>(false);
const isFocused = ref<boolean>(false);

const focusedSpec = ref(null) as Ref<ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData> | null>;
const containerWidth = ref<number>(0);

const resizeObserver = new ResizeObserver(
    useDebounce({
        action: ([entry]) => (containerWidth.value = entry.contentRect?.width ?? 0),
        delay: 100,
    }),
);

// Computed
const currentValue = computed(() => $props.value ?? $props.modelValue ?? null);

const dropdownStyles = computed(() => {
    return {
        '--pot-select-size-dropdown': containerWidth.value ? `${containerWidth.value}px` : '',
        zIndex: $dialog.zIndex.value,
        transform: `translate(${$attach.x.value}px, ${$attach.y.value}px)`,
    };
});

const availableSpecs = computed(() => $specs.value.filter(spec => !spec.disabled));

const selectedSpec = computed(() => $specs.value.find(spec => spec.selected) ?? null);

const label = computed(() => {
    const selectedLabel = selectedSpec.value?.label ?? '';
    return $props.editable && isFocused.value ? $props.text : selectedLabel;
});

const isEditing = computed<boolean>(() => isFocused.value && $props.editable);

const containerWrapper = computed<Element | null>(() => container.value?.$el ?? null);

const containerInput = computed<HTMLInputElement | null>(() => container.value?.input ?? null);

const teleportTo = computed(() => $props.to ?? 'body');

// Composables
const $subscriptions = useComponentSubscriptions();

const $dialog = useDialog({
    isOpen,
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
        color: toRef(() => $props.color),
        size: toRef(() => $props.size),
        radius: toRef(() => $props.radius),
    },
    toRef(() => $props.devices),
);

const $attach = useAttach({
    target: containerWrapper,
    box: dropdown,
    position: $properties.position,
    nudge: $properties.nudge,
    edgeMargin: $properties.edgeMargin,
    persistent: toRef(() => $props.persistent),
    sticky: toRef(() => !$props.noSticky),
    onChange: () => {
        if ($props.closeOnMove) $dialog.close();
    },
});

const $classList = useClassList(
    {
        position: $properties.position,
        color: $properties.color,
        size: $properties.size,
        radius: $properties.radius,
        opened: isOpen,
        closed: computed(() => !isOpen.value),
        focused: isFocused,
        fluid: toRef(() => $props.fluid),
        editable: toRef(() => $props.editable),
        'fixed-width': toRef(() => $props.fixedDropdownWidth),
    },
    'select',
);

const $dropdownClassList = useClassList(
    {
        hidden: computed(() => $attach.x.value === null || $attach.y.value === null),
    },
    'select-dropdown',
);

const $specs = useSpecs<OPTION, VALUE_FIELD, IPotSelectSpecData>({
    values: computed(() => (currentValue.value ? [currentValue.value] : [])),
    options: toRef(() => $props.options),
    optionLabel: toRef(() => $props.optionLabel),
    optionDisabled: toRef(() => $props.optionDisabled),
    optionValue: toRef(() => $props.optionValue),
    data: (option, value) => ({
        focused: Boolean(focusedSpec.value && focusedSpec.value.value === value),
    }),
});

const { focusableChildren: $focusableChildren } = useFocusableChildren(dropdown);

useFocusBox({
    element: dropdown,
    leave: () => containerInput.value?.focus(),
    leaveFromEnd: () => close(),
    leaveFromStart: event => event.preventDefault(),
});

useKeyboard({
    target: containerInput,
    keydown: event => {
        if (event.key.length !== 1 || !event.key.trim()) return;

        handleKeypress(event);
        if (!isEditing.value) focusSameLabeled(event.key);
    },
    handlers: {
        space: event => {
            const spec = focusedSpec.value as ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>;

            handleKeypress(event);
            if (!isEditing.value && spec) {
                change(spec);
                close();
            } else if (!isEditing.value && !spec) {
                focusSelected();
            }
        },
        enter: event => {
            const spec = focusedSpec.value as ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>;

            handleKeypress(event);
            if (!isEditing.value && spec) {
                change(spec);
                close();
            } else if (!isEditing.value && !spec) {
                focusSelected();
            }
        },
        arrowDown: event => {
            handleKeypress(event);
            if (!isEditing.value) focusNext();
        },
        arrowUp: event => {
            handleKeypress(event);
            if (!isEditing.value) focusPrev();
        },
        home: event => {
            handleKeypress(event);
            if (!isEditing.value) focusFirst();
        },
        end: event => {
            handleKeypress(event);
            if (!isEditing.value) focusLast();
        },
        tab: event => {
            if (!dropdown.value?.popover) return;

            const firstFocusableElement = $focusableChildren.value[0];
            const lastFocusableElement =
                $focusableChildren.value[$focusableChildren.value.length - 1];

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
    target: containerWrapper,
    observer: resizeObserver,
});

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

function onOptionClick(spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>) {
    change(spec);
}

// Methods
function handleKeypress(event: KeyboardEvent) {
    open();
    if (!isEditing.value) event.preventDefault();
}

function focusSameLabeled(text: string) {
    if (!isOpen.value) return;
    const spec = availableSpecs.value.find(spec => spec.label.startsWith(text));
    setFocusToSpec(spec ?? availableSpecs.value[0] ?? null);
}

function focusSelected() {
    if (!isOpen.value) return;
    setFocusToSpec(selectedSpec.value ?? availableSpecs.value[0] ?? null);
}

function focusFirst() {
    if (!isOpen.value) return;
    setFocusToSpec(availableSpecs.value[0] ?? null);
}

function focusLast() {
    if (!isOpen.value) return;
    setFocusToSpec(availableSpecs.value[availableSpecs.value.length - 1] ?? null);
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

    setFocusToSpec(nextSpec);
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

    setFocusToSpec(prevSpec);
}

function setFocusToSpec(spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>) {
    focusedSpec.value = spec;

    const index = availableSpecs.value.findIndex(someSpec => someSpec.value === spec.value);
    const currentElement = optionsElements.value[index]?.$el ?? null;

    if (currentElement instanceof HTMLElement) {
        currentElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
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
        v-bind="$dialog.marker"
        :class="['pot-select', $classList]"
        :value="label"
        :readonly="!editable"
        :devices="devices"
        placeholder="select"
        @click="onClick"
        @input="onInputText"
        @focus="onFocus"
        @blur="onBlur"
    >
        <template
            v-if="$slots.preicon"
            #preicon
        >
            <slot name="preicon" />
        </template>

        <template #icon>
            <slot name="icon">
                <svg
                    class="pot-select-arrow-icon"
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
            <Teleport
                :to="teleportTo"
                :disabled="!to"
            >
                <Transition :name="transition">
                    <div
                        v-if="isOpen"
                        ref="dropdown"
                        v-bind="$dialog.marker"
                        :key="`${$dialog.id.description}_${isOpen}`"
                        :class="['pot-select-dropdown', $classList, $dropdownClassList]"
                        :style="dropdownStyles"
                        tabindex="-1"
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
                                        ref="optionsElements"
                                        tag="li"
                                        role="option"
                                        :class="['pot-select-option', $classList]"
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
                </Transition>
            </Teleport>
        </template>
    </PotInput>
</template>

<style>
.pot-select.pot-input {
    /* --- PotSelect - Color - Input --- */
    --pot-input-color-border: var(--pot-select-color-border, transparent);
    --pot-input-color-background: var(--pot-select-color-background, transparent);
    --pot-input-color-text: var(--pot-select-color-text, inherit);
    --pot-input-color-caret: var(--pot-select-color-caret, currentColor);
    --pot-input-color-placeholder: var(--pot-select-color-placeholder, inherit);
    --pot-input-color-icon: var(--pot-select-color-icon, initial);

    /* --- PotSelect - Size - Input --- */
    --pot-input-size-height: var(--pot-select-size-height, auto);
    --pot-input-size-padding: var(--pot-select-size-padding, 0);
    --pot-input-size-border: var(--pot-select-size-border, 0);
    --pot-input-size-text: var(--pot-select-size-text, inherit);
    --pot-input-size-text-weight: var(--pot-select-size-text-weight, 400);
    --pot-input-size-text-height: var(--pot-select-size-text-height, 1);
    --pot-input-size-gap: var(--pot-select-size-gap, 0.8em);
    --pot-input-size-icon: var(--pot-select-size-icon, auto);
    --pot-input-size-outline: var(--pot-select-size-outline, initial);
    --pot-input-size-outline-offset: var(--pot-select-size-outline-offset, initial);

    /* --- PotSelect - Radius - Input --- */
    --pot-input-radius-value: var(--pot-select-radius-value, 0);

    cursor: pointer;
}

/* --- PotSelect - Opened --- */
.pot-select._select-opened .pot-select-arrow-icon {
    transform: scaleY(-1);
}

/* --- PotSelect - Fluid --- */
.pot-select._select-fluid {
    width: 100%;
}

.pot-select-dropdown {
    position: fixed;
    overflow: auto;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotSelect - Color - Dropdown --- */
    border-color: var(--pot-select-color-dropdown-border, transparent);
    background-color: var(--pot-select-color-dropdown-background, transparent);
    color: var(--pot-select-color-dropdown-text, inherit);

    /* --- PotSelect - Size - Dropdown --- */
    height: var(--pot-select-size-dropdown-height, auto);
    max-height: var(--pot-select-size-dropdown-max-height, 16rem);
    border-width: var(--pot-select-size-dropdown-border, 0);
    padding: var(--pot-select-size-dropdown-padding, 0);
    box-shadow: var(--pot-select-size-dropdown-shadow, none);
    font-size: var(--pot-select-size-dropdown-text, inherit);
    font-weight: var(--pot-select-size-text-weight, 400);
    line-height: var(--pot-select-size-text-height, 1);

    /* --- PotSelect - Radius - Dropdown --- */
    border-radius: var(--pot-select-radius-dropdown-value, 0);
}

.pot-select-dropdown._select-fixed-width {
    /* --- PotSelect - Size - Dropdown --- */
    width: var(--pot-select-size-dropdown, 100%);
}

.pot-select-dropdown._select-dropdown-hidden {
    opacity: 0;
}

.pot-select-options-list {
    margin: 0;
    padding: 0;
}

.pot-select-option.pot-option {
    /* --- PotSelect - Color - Option --- */
    --pot-option-color-border: var(--pot-select-color-option-border, transparent);
    --pot-option-color-background: var(--pot-select-color-option-background, transparent);
    --pot-option-color-text: var(--pot-select-color-option-text, inherit);
    --pot-option-color-outline: var(--pot-select-color-option-outline, initial);
    --pot-option-color-icon: var(--pot-select-color-option-icon, initial);

    /* --- PotSelect - Size - Option --- */
    --pot-option-size-height: var(--pot-select-size-option-height, auto);
    --pot-option-size-gap: var(--pot-select-size-option-gap, 0.8em);
    --pot-option-size-padding: var(--pot-select-size-option-padding, 0);
    --pot-option-size-border: var(--pot-select-size-option-border, 0);
    --pot-option-size-text: var(--pot-select-size-option-text, inherit);
    --pot-option-size-text-weight: var(--pot-select-size-option-text, 400);
    --pot-option-size-text-height: var(--pot-select-size-option-text, 1);
    --pot-option-size-outline: var(--pot-select-size-option-outline, initial);
    --pot-option-size-outline-offset: var(--pot-select-size-option-outline-offset, initial);

    /* --- PotSelect - Radius - Option --- */
    --pot-option-radius-value: var(--pot-select-radius-option-value, 0);
}

/* --- PotSelect - Transition --- */
.pot-select-transition-enter-active,
.pot-select-transition-leave-active {
    transition: opacity var(--pot-select-transition-duration, 0.2s)
        var(--pot-select-transition-function, ease);
}

.pot-select-transition-enter-from,
.pot-select-transition-leave-to {
    opacity: 0;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/select.css" />
<!-- Styles - END -->
