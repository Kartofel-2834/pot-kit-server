<script setup lang="ts" generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type { Ref, RendererElement } from 'vue';
import type { IAttachOptions, EAttachedBoxPosition } from '@/types/composables/attach';
import type { ISpec, ISpecsOptions, TOptionValue } from '@/types/composables/specs';
import type { EPotDevice } from '@/types';
import type { EDialogLayers } from '@/types/composables/dialog';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';

// Composables
import { useAttach } from '@/composables/attach';
import { useDeviceIs } from '@/composables/device-is';
import { useDeviceProperties } from '@/composables/device-properties';
import { useDialog, useDialogLayer, useDialogZIndex } from '@/composables/dialog';
import { useDebounce } from '@/composables/timer';
import { useSubscriptions } from '@/composables/subscriptions';
import { useSpecs } from '@/composables/specs';
import { useClassListArray } from '@/composables/class-list';

const POT_SELECT_SIZE = {} as const;

const POT_SELECT_COLOR = {} as const;

const POT_SELECT_RADIUS = {} as const;

type EPotSelectSize = (typeof POT_SELECT_SIZE)[keyof typeof POT_SELECT_SIZE];

type EPotSelectColor = (typeof POT_SELECT_COLOR)[keyof typeof POT_SELECT_COLOR];

type EPotSelectRadius = (typeof POT_SELECT_RADIUS)[keyof typeof POT_SELECT_RADIUS];

interface IPotSelectProps<OPTION, VALUE_FIELD extends keyof OPTION> {
    value?: TOptionValue<OPTION, VALUE_FIELD> | null;
    modelValue?: TOptionValue<OPTION, VALUE_FIELD> | null;
    options?: OPTION[];
    optionLabel?: keyof OPTION | ((option: OPTION) => string);
    optionDisabled?: keyof OPTION | ((option: OPTION) => boolean);
    optionVisible?: keyof OPTION | ((option: OPTION) => boolean);
    optionValue?: VALUE_FIELD | ((option: OPTION) => TOptionValue<OPTION, VALUE_FIELD>);

    text?: string;
    editable?: boolean;
    fluid?: boolean;
    fixedDropdownWidth?: boolean;

    to?: string | RendererElement | null;
    position?: EAttachedBoxPosition | EAttachedBoxPosition[];
    nudge?: number | number[];
    edgeMargin?: number | number[];
    persistent?: boolean;
    noSticky?: boolean;
    closeOnMove?: boolean;
    transition?: string;

    size?: EPotSelectSize | EPotSelectSize[] | null;
    color?: EPotSelectColor | EPotSelectColor[] | null;
    radius?: EPotSelectRadius | EPotSelectRadius[] | null;

    devices?: EPotDevice[];
}

const $layer = DIALOG_LAYERS.POPOVER as EDialogLayers;
const $parentLayer = inject<Ref<EDialogLayers>>('pot-dialog-layer', ref(DIALOG_LAYERS.NONE));

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

const $deviceIs = useDeviceIs();

const $dialog = useDialog({
    triggers: ['escape', 'clickoutside'],
    isOpen: ref<boolean>(false),
    layer: computed(() => useDialogLayer($layer, $parentLayer.value)),
    close,
    open,
});

const $subscriptions = useSubscriptions();

// Data
const container = ref<HTMLElement | null>(null);
const dropdown = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

const isFocused = ref<boolean>(false);
const containerWidth = ref<number>(0);

const resizeObserver = new ResizeObserver(
    useDebounce({
        action: ([entry]) => (containerWidth.value = entry.contentRect?.width ?? 0),
        delay: 100,
    }),
);

// Lifecycle
onMounted(() => {
    if (!container.value) return;

    $subscriptions.observe('resize', container.value, resizeObserver);
});

onUnmounted(() => {
    $dialog.terminate();
    $attach.stop();
    $subscriptions.clear();
});

// Computed
const currentValue = computed(() => $props.value ?? $props.modelValue ?? null);

const properties = computed(() => {
    return useDeviceProperties(
        {
            position: $props.position,
            nudge: $props.nudge,
            edgeMargin: $props.edgeMargin,
            color: $props.color,
            size: $props.size,
            radius: $props.radius,
        },
        $deviceIs.device.value,
        $props.devices,
    );
});

const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => {
    const [x, y] = $attach.coordinates.value ?? [0, 0];
    const dropdownWidth = containerWidth.value ? `${containerWidth.value}px` : '';

    return {
        '--pot-select-size-dropdown': dropdownWidth,
        zIndex: useDialogZIndex($dialog),
        transform: `translate(${x}px, ${y}px)`,
    };
});

const classList = computed(() =>
    useClassListArray({
        position: properties.value.position,
        editable: $props.editable,
        opened: $dialog.isOpen.value,
        closed: !$dialog.isOpen.value,
        focused: isFocused.value,
        fluid: $props.fluid,
        'fixed-width': $props.fixedDropdownWidth,
    }),
);

const selectedSpec = computed(() => $specs.value.find(spec => spec.selected) ?? null);

const label = computed(() => {
    const selectedLabel = selectedSpec.value?.label ?? '';
    return $props.editable && isFocused.value ? $props.text : selectedLabel;
});

// Helper-hooks
const $attach = useAttach(
    computed<IAttachOptions>(() => ({
        position: properties.value.position,
        nudge: properties.value.nudge,
        edgeMargin: properties.value.edgeMargin,
        persistent: $props.persistent,
        sticky: !$props.noSticky,
        terminateOnChange: $props.closeOnMove,
    })),
    () => $dialog.close(),
);

const $specs = useSpecs(
    computed<ISpecsOptions<OPTION, VALUE_FIELD>>(() => ({
        values: currentValue.value ? [currentValue.value] : [],
        options: $props.options,
        optionLabel: $props.optionLabel,
        optionDisabled: $props.optionDisabled,
        optionVisible: $props.optionVisible,
        optionValue: $props.optionValue,
    })),
);

// Watchers
watch(
    () => [container.value, dropdown.value],
    () => {
        if (container.value && dropdown.value) {
            $attach.start(container.value, dropdown.value);
        } else {
            $attach.stop();
        }
    },
);

// Listeners
function onFocus() {
    isFocused.value = true;
    open();
}

function onBlur() {
    isFocused.value = false;
}

function onInputText(event: Event) {
    const target = event.target as HTMLInputElement;
    open();
    changeText(target.value);
}

function onInputKeydown(event: KeyboardEvent) {
    if (event.key === ' ' && !isFocused.value) {
        toggle();
        return;
    }

    if (event.key === 'Tab') {
        close();
        return;
    }
}

function onOptionClick(spec: ISpec<OPTION, VALUE_FIELD>) {
    change(spec);
}

// Methods
function toggle() {
    if ($dialog.isOpen.value) {
        $dialog.close();
    } else {
        $dialog.open();
    }
}

function open() {
    if ($dialog.isOpen.value) return;
    $dialog.isOpen.value = true;
}

function close() {
    if (!$dialog.isOpen.value) return;
    $dialog.isOpen.value = false;
}

function change(spec: ISpec<OPTION, VALUE_FIELD>) {
    if (spec.disabled || spec.selected) return;

    $emit('change', spec.value, spec.option);
    $emit('update:modelValue', spec.value);
    $dialog.close();
}

function changeText(text: string) {
    $emit('changeText', text);
    $emit('update:text', text);
}

function getSpecClassList(spec: ISpec<OPTION, VALUE_FIELD>): string[] {
    return useClassListArray({
        selected: spec.selected,
        disabled: spec.disabled,
    });
}
</script>

<template>
    <label
        ref="container"
        :class="['pot-select', classList]"
        :data-pot-dialog-id="$dialog.id.description"
    >
        <input
            ref="input"
            class="pot-select__input"
            placeholder="select"
            :value="label"
            :readonly="!editable"
            @input="onInputText"
            @keydown="onInputKeydown"
            @focus="onFocus"
            @blur="onBlur"
        />

        <div class="pot-select__icon">
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
        </div>

        <Teleport
            :to="teleportTo"
            :disabled="!to"
        >
            <Transition :name="transition">
                <div
                    v-if="$dialog.isOpen.value"
                    ref="dropdown"
                    :class="['pot-select__dropdown', classList]"
                    :style="currentStyles"
                    :key="`${$dialog.id.description}_${$dialog.isOpen.value}`"
                    :data-pot-dialog-id="$dialog.id.description"
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
                        <div class="pot-select__dropdown__options-list">
                            <slot
                                v-for="spec of $specs"
                                name="option"
                                :key="spec.id"
                                :spec="spec"
                                :change="change"
                            >
                                <div
                                    :class="[
                                        'pot-select__dropdown__options-list__option',
                                        getSpecClassList(spec),
                                    ]"
                                    @click="onOptionClick(spec)"
                                >
                                    {{ spec.label }}
                                </div>
                            </slot>
                        </div>
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
    </label>
</template>

<style>
.pot-select {
    display: flex;
    align-items: center;
}

/* --- PotSelect - Focused --- */
.pot-select._focused {
    background-color: purple;
}

/* --- PotSelect - Opened --- */
.pot-select._opened .pot-select__icon {
    transform: scaleY(-1);
}

/* --- PotSelect - Fluid --- */
.pot-select._fluid {
    width: 100%;
}

.pot-select__icon {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.pot-select__input {
    outline: none;
    height: 100%;
    flex-basis: 100%;
}

.pot-select__input:focus {
    background-color: yellow;
}

.pot-select__dropdown {
    position: fixed;
    top: 0;
    left: 0;
    background-color: red;
}

.pot-select__dropdown._fixed-width {
    width: var(--pot-select-size-dropdown);
}

.pot-select__dropdown__options-list__option:hover:not(._selected) {
    background-color: blue;
    color: white;
    cursor: pointer;
}

.pot-select__dropdown__options-list__option._selected {
    background-color: green;
    color: white;
    cursor: default;
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
