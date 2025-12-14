<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type { Ref } from 'vue';
import type { ISpec } from '@/types/composables/specs';
import type {
    IPotSelectEmits,
    IPotSelectProps,
    IPotSelectSpecData,
} from '@/types/components/select';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useSpecs } from '@/composables/specs';
import { useClassList } from '@/composables/class-list';
import { useKeyboard } from '@/composables/keyboard';

// Components
import PotSelectHeader from '@/components/ui/PotSelectHeader.vue';
import PotInput from '@/components/ui/PotInput.vue';
import PotSelectDropdown from '@/components/ui/PotSelectDropdown.vue';
import PotSelectOption from '@/components/ui/PotSelectOption.vue';

const $props = withDefaults(defineProps<IPotSelectProps<OPTION, VALUE_FIELD>>(), {
    value: null,
    modelValue: null,
    options: () => [],
    fixedDropdownWidth: true,
});

const $emit = defineEmits<IPotSelectEmits<OPTION, VALUE_FIELD>>();

// Refs
const header = useTemplateRef('header');

// Data
const isOpen = ref<boolean>(false);
const isFocused = ref<boolean>(false);

const focusedSpec = ref(null) as Ref<ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData> | null>;

// Computed
const headerInput = computed(() => header.value?.input ?? null);

const currentValue = computed(() => $props.value ?? $props.modelValue ?? null);

const availableSpecs = computed(() => $specs.value.filter(spec => !spec.disabled));

const selectedSpec = computed(() => $specs.value.find(spec => spec.selected) ?? null);

const isEditing = computed<boolean>(() => isFocused.value && $props.editable);

// Composables
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

useKeyboard({
    target: headerInput,
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
    },
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

// Methods
function handleKeypress(event: KeyboardEvent) {
    open();
    if (!isEditing.value) event.preventDefault();
}

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
    <div :class="['pot-select', $classList]">
        <PotSelectHeader
            ref="header"
            :class-list="$classList"
            :specs="$specs"
            :text="text"
            :placeholder="placeholder"
            :editable="editable"
            :fluid="fluid"
            :devices="devices"
            @click="onClick"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInputText"
        ></PotSelectHeader>

        <PotSelectDropdown
            :opened="isOpen"
            :specs="$specs"
            :class-list="$classList"
            :header="header"
            @open="open"
            @close="close"
            @select="change"
        >
            <template #option="{ key, spec, select }">
                <PotSelectOption
                    :key="key"
                    :class="$classList"
                    :spec="spec"
                    @select="select"
                >
                </PotSelectOption>
            </template>
        </PotSelectDropdown>
    </div>
</template>

<style>
/* --- PotSelect - Opened --- */
.pot-select._select-opened .pot-select-arrow-icon {
    transform: scaleY(-1);
}

/* --- PotSelect - Fluid --- */
.pot-select._select-fluid {
    width: 100%;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/select.css" />
<!-- Styles - END -->
