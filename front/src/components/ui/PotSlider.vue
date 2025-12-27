<script lang="ts" setup>
// Types
import type { Ref } from 'vue';
import type { IPotSliderEmits, IPotSliderExpose, IPotSliderProps } from '@/types/components/slider';

// Vue
import { computed, ref, toRef, useTemplateRef, watch } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useThrottle } from '@/composables/timer';
import { useKeyboard } from '@/composables/keyboard';

const props = withDefaults(defineProps<IPotSliderProps>(), {
    value: undefined,
    modelValue: undefined,
    range: undefined,
    min: 0,
    max: 100,
    step: 1,
});

const emit = defineEmits<IPotSliderEmits>();

// Refs
const container = useTemplateRef('container');
const thumbA = useTemplateRef('thumbA');
const thumbB = useTemplateRef('thumbB');

// Data
const thumbAValue = ref<number>(0);
const thumbBValue = ref<number>(0);

const trackWidth = ref<number>(0);
const trackHeight = ref<number>(0);
const trackRect = ref<DOMRect | null>(null);

const isDragging = ref<boolean>(false);
const activeThumb = ref<'start' | 'end' | null>(null);

const resizeObserver = new ResizeObserver(([entry]) => {
    trackWidth.value = entry?.target?.clientWidth ?? 0;
    trackHeight.value = entry?.target?.clientHeight ?? 0;
});

// Computed
const isRange = computed(() => {
    return props.range !== undefined;
});

const currentValue = computed(() => {
    return trimValue(props.value ?? props.modelValue ?? props.min);
});

const currentRange = computed(() => {
    const range = (props.range ?? [props.min, props.max]).map(trimValue);
    return [Math.min(...range), Math.max(...range)];
});

const fillStyles = computed(() => {
    const offset = Math.min(thumbAOffset.value, thumbBOffset.value) * (props.vertical ? -1 : 1);
    const percentage = Math.abs(thumbAPercent.value - thumbBPercent.value);

    return {
        '--pot-slider-fill-offset': `${offset}px`,
        '--pot-slider-fill-percentage': `${percentage}%`,
    };
});

const thumbAStyles = computed(() => {
    const offset = thumbAOffset.value * (props.vertical ? -1 : 1);
    return {
        '--pot-slider-thumb-offset': `${offset}px`,
    };
});

const thumbAPercent = computed(() => {
    const percentage = (thumbAValue.value - props.min) / (props.max - props.min);
    return Math.floor(percentage * 10000) / 100;
});

const thumbAOffset = computed(() => {
    const size = props.vertical ? trackHeight.value : trackWidth.value;
    return (size / 100) * thumbAPercent.value;
});

const thumbBStyles = computed(() => {
    const offset = thumbBOffset.value * (props.vertical ? -1 : 1);
    return {
        '--pot-slider-thumb-offset': `${offset}px`,
    };
});

const thumbBPercent = computed(() => {
    const percentage = (thumbBValue.value - props.min) / (props.max - props.min);
    return Math.floor(percentage * 10000) / 100;
});

const thumbBOffset = computed(() => {
    const size = props.vertical ? trackHeight.value : trackWidth.value;
    return (size / 100) * thumbBPercent.value;
});

// Watchers
watch(
    () =>
        [isRange.value, currentValue.value, currentRange.value] as [
            boolean,
            number,
            [number, number],
        ],
    ([isRange, value, range]) => {
        if (isRange && range?.length === 2) {
            const [a, b] = range;

            const firstRef = getNearestThumbValueRef(a);
            const secondRef = firstRef === thumbAValue ? thumbBValue : thumbAValue;

            firstRef.value = a;
            secondRef.value = b;
        } else {
            getNearestThumbValueRef(value).value = value;
        }
    },
    { immediate: true },
);

// Composables
const $subscriptions = useComponentSubscriptions();

const $properties = useDeviceProperties(
    {
        size: toRef(() => props.size),
        color: toRef(() => props.color),
        radius: toRef(() => props.radius),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        size: $properties.size,
        color: $properties.color,
        radius: $properties.radius,
        range: isRange,
        dragging: isDragging,
        vertical: toRef(() => props.vertical),
        disabled: toRef(() => props.disabled),
        invalid: toRef(() => props.invalid),
        fluid: toRef(() => props.fluid),
    },
    'slider',
);

const $updateRect = useThrottle({
    action: () => {
        if (!container.value) return;
        trackRect.value = container.value.getBoundingClientRect();
    },
    delay: 100,
});

useKeyboard({
    target: thumbA,
    handlers: {
        pageUp: event => moveForward(event, thumbAValue, 10),
        arrowUp: event => moveForward(event, thumbAValue),
        arrowRight: event => moveForward(event, thumbAValue),

        pageDown: event => moveBack(event, thumbAValue, 10),
        arrowDown: event => moveBack(event, thumbAValue),
        arrowLeft: event => moveBack(event, thumbAValue),
    },
});

useKeyboard({
    target: thumbB,
    handlers: {
        pageUp: event => moveForward(event, thumbBValue, 10),
        arrowUp: event => moveForward(event, thumbBValue),
        arrowRight: event => moveForward(event, thumbBValue),

        pageDown: event => moveBack(event, thumbBValue, 10),
        arrowDown: event => moveBack(event, thumbBValue),
        arrowLeft: event => moveBack(event, thumbBValue),
    },
});

$subscriptions.observe({
    target: container,
    observer: resizeObserver,
});

$subscriptions.addEventListener<MouseEvent>({
    eventName: 'mousedown',
    target: thumbA,
    listener: event => handleMouseDown(event, thumbAValue),
});

$subscriptions.addEventListener<MouseEvent>({
    eventName: 'mousedown',
    target: thumbB,
    listener: event => handleMouseDown(event, thumbBValue),
});

$subscriptions.addEventListener<TouchEvent>({
    eventName: 'touchstart',
    target: thumbA,
    listener: event => handleTouchStart(event, thumbAValue),
});

$subscriptions.addEventListener<TouchEvent>({
    eventName: 'touchstart',
    target: thumbB,
    listener: event => handleTouchStart(event, thumbBValue),
});

// Listeners
function onTrackClick(event: MouseEvent) {
    if (props.disabled || isDragging.value) return;

    const value = mapPositionToValue(event.clientX, event.clientY);
    const nearestThumbValue = getNearestThumbValueRef(value);

    nearestThumbValue.value = value;
    update();
}

function onTrackTouchStart(event: TouchEvent) {
    if (props.disabled || isDragging.value) return;

    const value = mapPositionToValue(event.touches[0].clientX, event.touches[0].clientY);
    const nearestThumbValue = getNearestThumbValueRef(value);

    nearestThumbValue.value = value;
    update();
}

// Methods
function update() {
    const a = normalizeValue(thumbAValue.value);
    const b = normalizeValue(thumbBValue.value);

    if (props.disabled) return;

    if (!isRange.value) {
        emit('update:modelValue', a);
        emit('change', a);
        return;
    }

    const newRange: [number, number] = [Math.min(a, b), Math.max(a, b)];
    emit('update:range', newRange);
    emit('changeRange', newRange);
}

function handleMouseDown(event: MouseEvent, thumbValueRef: Ref<number>) {
    if (props.disabled) return;

    event.preventDefault();
    isDragging.value = true;

    $subscriptions.addEventListener<MouseEvent>({
        key: 'mousemove',
        eventName: 'mousemove',
        target: document,
        listener: event => handleMouseMove(event, thumbValueRef),
    });

    $subscriptions.addEventListener({
        key: 'mouseup',
        eventName: 'mouseup',
        target: document,
        listener: handleMouseUp,
    });
}

function handleMouseMove(event: MouseEvent, thumbValueRef: Ref<number>) {
    if (!isDragging.value) return;

    event.preventDefault();
    const value = mapPositionToValue(event.clientX, event.clientY);

    thumbValueRef.value = value;
    update();
}

function handleMouseUp() {
    if (!isDragging.value) return;

    isDragging.value = false;
    $subscriptions.remove('mousemove');
    $subscriptions.remove('mouseup');
}

function handleTouchStart(event: TouchEvent, thumbValueRef: Ref<number>) {
    if (props.disabled) return;

    event.preventDefault();
    isDragging.value = true;

    $subscriptions.addEventListener<TouchEvent>({
        key: 'touchmove',
        eventName: 'touchmove',
        target: document,
        listener: event => handleTouchMove(event, thumbValueRef),
    });

    $subscriptions.addEventListener({
        key: 'touchend',
        eventName: 'touchend',
        target: document,
        listener: handleTouchEnd,
    });
}

function handleTouchMove(event: TouchEvent, thumbValueRef: Ref<number>) {
    if (!isDragging.value) return;

    event.preventDefault();
    const value = mapPositionToValue(event.touches[0].clientX, event.touches[0].clientY);
    thumbValueRef.value = value;
    update();
}

function handleTouchEnd() {
    if (!isDragging.value) return;

    isDragging.value = false;
    activeThumb.value = null;

    $subscriptions.remove('touchmove');
    $subscriptions.remove('touchend');
}

function moveForward(event: KeyboardEvent, thumbValueRef: Ref<number>, step?: number) {
    event.preventDefault();
    thumbValueRef.value = normalizeValue(thumbValueRef.value + (step ?? props.step));
    update();
}

function moveBack(event: KeyboardEvent, thumbValueRef: Ref<number>, step?: number) {
    event.preventDefault();
    thumbValueRef.value = normalizeValue(thumbValueRef.value - (step ?? props.step));
    update();
}

function normalizeValue(someValue: number): number {
    const result = trimValue(someValue);

    if (props.step > 0) {
        return Math.round((result - props.min) / props.step) * props.step + props.min;
    }

    return result;
}

function trimValue(someValue: number): number {
    return Math.max(props.min, Math.min(props.max, someValue));
}

function mapPositionToValue(x: number, y: number): number {
    if (!container.value) return props.min;

    const rect = getCurrentTrackRect();

    if (!rect) return props.min;

    const percentage = props.vertical
        ? 1 - (y - rect.top) / trackHeight.value
        : (x - rect.left) / trackWidth.value;

    const value = props.min + Math.max(0, Math.min(1, percentage)) * (props.max - props.min);

    return normalizeValue(value);
}

function getCurrentTrackRect(): DOMRect | null {
    $updateRect();
    return trackRect.value;
}

function getNearestThumbValueRef(value: number): Ref<number> {
    if (!isRange.value) return thumbAValue;

    const distanceToA = Math.abs(value - thumbAValue.value);
    const distanceToB = Math.abs(value - thumbBValue.value);

    return distanceToA < distanceToB ? thumbAValue : thumbBValue;
}

// Exports
defineExpose<IPotSliderExpose>({
    element: container,
});
</script>

<template>
    <div
        ref="container"
        :class="['pot-slider', $classList]"
        @click="onTrackClick"
        @touchstart="onTrackTouchStart"
    >
        <slot name="fill">
            <span
                class="pot-slider-fill"
                :style="fillStyles"
            />
        </slot>

        <slot
            v-if="isRange"
            name="thumb"
        >
            <span
                ref="thumbB"
                :style="thumbBStyles"
                class="pot-slider-thumb"
                tabindex="0"
            />
        </slot>

        <slot name="thumb">
            <span
                ref="thumbA"
                :style="thumbAStyles"
                class="pot-slider-thumb"
                tabindex="0"
            />
        </slot>
    </div>
</template>

<style>
.pot-slider {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-style: solid;
    cursor: pointer;
    touch-action: none;

    /* --- PotSlider - Color --- */
    color: var(--pot-slider-color-text, inherit);
    background-color: var(--pot-slider-color-background, transparent);
    border-color: var(--pot-slider-color-border, currentColor);

    /* --- PotSlider - Size --- */
    width: var(--pot-slider-size-width, 20rem);
    height: var(--pot-slider-size-height, 0.4rem);
    padding: var(--pot-slider-size-padding, 0);
    border-width: var(--pot-slider-size-border, 1px);

    /* --- PotSlider - Radius --- */
    border-radius: var(--pot-slider-radius-value, 1000px);

    /* --- PotSlider - Transition --- */
    transition:
        background-color var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease),
        border-color var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease);
}

.pot-slider-fill {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    touch-action: none;
    transform-origin: left;
    transform: translateX(var(--pot-slider-fill-offset)) scaleX(var(--pot-slider-fill-percentage));

    /* --- PotSlider - Color --- */
    background-color: var(--pot-slider-color-fill, currentColor);

    /* --- PotSlider - Size --- */
    border-radius: inherit;
}

.pot-slider-thumb {
    position: absolute;
    cursor: grab;
    border: none;
    padding: 0;
    margin: 0;
    pointer-events: auto;
    touch-action: none;
    left: calc(var(--pot-slider-size-thumb-width, 1.2em) / -2);
    transform: translateX(var(--pot-slider-thumb-offset));

    /* --- PotSlider - Color --- */
    background-color: var(--pot-slider-color-thumb, currentColor);
    outline-color: var(--pot-slider-color-thumb-outline, currentColor);

    /* --- PotSlider - Size --- */
    width: var(--pot-slider-size-thumb-width, 1.2em);
    height: var(--pot-slider-size-thumb-height, 1.2em);
    box-shadow: var(--pot-slider-size-thumb-shadow, none);
    outline-width: var(--pot-slider-size-outline, 2px);
    outline-offset: var(--pot-slider-size-outline-offset, 2px);

    /* --- PotSlider - Radius --- */
    border-radius: var(--pot-slider-radius-thumb, 50%);

    /* --- PotSlider - Transition --- */
    transition:
        background-color var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease),
        box-shadow var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease);
}

.pot-slider-thumb:active {
    cursor: grabbing;
}

/* --- Fluid --- */
.pot-slider._slider-fluid {
    width: 100%;
}

.pot-slider._slider-vertical._slider-fluid {
    height: 100%;
}

/* --- Vertical --- */
.pot-slider._slider-vertical {
    width: var(--pot-slider-size-height, 0.4rem);
    height: var(--pot-slider-size-width, 20rem);
}

._slider-vertical .pot-slider-fill {
    transform-origin: bottom;
    transform: translateY(var(--pot-slider-fill-offset)) scaleY(var(--pot-slider-fill-percentage));
}

._slider-vertical .pot-slider-thumb {
    left: auto;
    bottom: calc(var(--pot-slider-size-thumb-width, 1.2em) / -2);
    transform: translateY(var(--pot-slider-thumb-offset));
}

/* --- Disabled --- */
.pot-slider._slider-disabled {
    cursor: default;
}

._slider-disabled .pot-slider-thumb {
    cursor: default;
    pointer-events: none;
}
</style>

<!-- Styles - START -->
<style src="@/assets/css/styles/test/slider.css" />
<!-- Styles - END -->
