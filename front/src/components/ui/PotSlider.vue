<script lang="ts" setup>
// Types
import type { IPotSliderEmits, IPotSliderExpose, IPotSliderProps } from '@/types/components/slider';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

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
    vertical: false,
    disabled: false,
    invalid: false,
});

const emit = defineEmits<IPotSliderEmits>();

// Refs
const container = useTemplateRef('container');
const track = useTemplateRef('track');
const startThumb = useTemplateRef('start-thumb');
const endThumb = useTemplateRef('end-thumb');

// Data
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

const startOffset = computed(() => {
    return (trackWidth.value / 100) * startPercent.value;
});

const endOffset = computed(() => {
    return (trackWidth.value / 100) * endPercent.value;
});

const currentStyles = computed(() => {
    return {
        '--pot-slider-offset-start': `${startOffset.value}px`,
        '--pot-slider-offset-end': `${endOffset.value}px`,
        '--pot-slider-start': `${startPercent.value}%`,
        '--pot-slider-end': `${endPercent.value}%`,
    };
});

const normalizedStart = computed(() => {
    return isRange.value ? Math.min(...currentRange.value) : 0;
});

const normalizedEnd = computed(() => {
    return isRange.value ? Math.max(...currentRange.value) : currentValue.value;
});

const startPercent = computed(() => {
    const percentage = (normalizedStart.value - props.min) / (props.max - props.min);
    return Math.floor(percentage * 10000) / 100;
});

const endPercent = computed(() => {
    const percentage = (normalizedEnd.value - props.min) / (props.max - props.min);
    return Math.floor(percentage * 10000) / 100;
});

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
    },
    'slider',
);

const $updateRect = useThrottle({
    action: () => {
        if (!track.value) return;
        trackRect.value = track.value.getBoundingClientRect();
    },
    delay: 100,
});

useKeyboard({
    target: startThumb,
    handlers: {
        arrowRight: event => {
            event.preventDefault();
            updateValue(currentRange.value[0] + 1);
        },
        arrowLeft: event => {
            event.preventDefault();
            updateValue(currentRange.value[0] - 1);
        },
    },
});

useKeyboard({
    target: endThumb,
    handlers: {
        arrowRight: event => {
            event.preventDefault();
            updateValue(currentRange.value[1] + 1);
        },
        arrowLeft: event => {
            event.preventDefault();
            updateValue(currentRange.value[1] - 1);
        },
    },
});

$subscriptions.observe({
    target: container,
    observer: resizeObserver,
});

// Methods
function updateValue(newValue: number) {
    if (props.disabled) return;

    if (!isRange.value) {
        emit('update:modelValue', newValue);
        emit('change', newValue);
        return;
    }

    const [a, b] = currentRange.value;
    const thumb = activeThumb.value ?? getNearestThumb(newValue);

    let newRange: [number, number] = thumb === 'start' ? [newValue, b] : [a, newValue];

    if (newRange[0] > newRange[1]) {
        newRange = [newRange[1], newRange[0]];
        activeThumb.value = thumb === 'start' ? 'end' : 'start';
    }

    emit('update:range', newRange);
    emit('changeRange', newRange);
}

// Listeners
function onTrackClick(event: MouseEvent) {
    if (props.disabled || isDragging.value) return;

    const value = mapPositionToValue(event.clientX, event.clientY);
    updateValue(value);
}

function onTrackTouchStart(event: TouchEvent) {
    if (props.disabled || isDragging.value) return;

    const value = mapPositionToValue(event.touches[0].clientX, event.touches[0].clientY);

    updateValue(value);
}

function onThumbMouseDown(thumb: 'start' | 'end') {
    if (props.disabled) return;

    isDragging.value = true;
    activeThumb.value = thumb;

    $subscriptions.addEventListener({
        key: 'mousemove',
        eventName: 'mousemove',
        target: document,
        listener: handleMouseMove,
    });

    $subscriptions.addEventListener({
        key: 'mouseup',
        eventName: 'mouseup',
        target: document,
        listener: handleMouseUp,
    });
}

function onThumbTouchStart(thumb: 'start' | 'end') {
    if (props.disabled) return;

    isDragging.value = true;
    activeThumb.value = thumb;

    $subscriptions.addEventListener({
        key: 'touchmove',
        eventName: 'touchmove',
        target: document,
        listener: handleTouchMove,
    });

    $subscriptions.addEventListener({
        key: 'touchend',
        eventName: 'touchend',
        target: document,
        listener: handleTouchEnd,
    });
}

// Methods
function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value) return;

    event.preventDefault();
    const value = mapPositionToValue(event.clientX, event.clientY);
    updateValue(value);
}

function handleMouseUp() {
    if (!isDragging.value) return;

    isDragging.value = false;
    activeThumb.value = null;

    $subscriptions.remove('mousemove');
    $subscriptions.remove('mouseup');
}

function handleTouchMove(event: TouchEvent) {
    if (!isDragging.value) return;

    event.preventDefault();
    const value = mapPositionToValue(event.touches[0].clientX, event.touches[0].clientY);
    updateValue(value);
}

function handleTouchEnd() {
    if (!isDragging.value) return;

    isDragging.value = false;
    activeThumb.value = null;

    $subscriptions.remove('touchmove');
    $subscriptions.remove('touchend');
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
    if (!track.value) return props.min;

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

function getNearestThumb(value: number): 'start' | 'end' {
    if (!isRange.value) return 'end';

    const [a, b] = currentRange.value;

    const distanceToMin = Math.abs(value - a);
    const distanceToMax = Math.abs(value - b);

    return distanceToMin < distanceToMax ? 'start' : 'end';
}

// Exports
defineExpose<IPotSliderExpose>({
    element: container,
    track: track,
});
</script>

<template>
    <div
        ref="container"
        :class="['pot-slider', $classList]"
        :style="currentStyles"
    >
        <span
            ref="track"
            class="pot-slider-track"
            @click="onTrackClick"
            @touchstart="onTrackTouchStart"
        >
            <slot name="fill">
                <span class="pot-slider-fill" />
            </slot>

            <slot
                v-if="isRange"
                name="thumb"
            >
                <span
                    ref="start-thumb"
                    tabindex="0"
                    class="pot-slider-thumb pot-slider-thumb_start"
                    @mousedown="onThumbMouseDown('start')"
                    @touchstart="onThumbTouchStart('start')"
                />
            </slot>

            <slot name="thumb">
                <span
                    ref="end-thumb"
                    class="pot-slider-thumb pot-slider-thumb_end"
                    tabindex="0"
                    @mousedown="onThumbMouseDown('end')"
                    @touchstart="onThumbTouchStart('end')"
                />
            </slot>
        </span>
    </div>
</template>

<style>
.pot-slider {
    display: flex;
    align-items: center;
    position: relative;
    user-select: none;
    touch-action: none;

    /* --- PotSlider - Color --- */
    color: var(--pot-slider-color-text, inherit);

    /* --- PotSlider - Size --- */
    width: var(--pot-slider-size-width, 100%);
    height: var(--pot-slider-size-height, auto);
    padding: var(--pot-slider-size-padding, 0);
}

.pot-slider-track {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    cursor: pointer;

    /* --- PotSlider - Color --- */
    background-color: var(--pot-slider-color-track-background, transparent);
    border-color: var(--pot-slider-color-track-border, currentColor);
    border-style: solid;

    /* --- PotSlider - Size --- */
    border-width: var(--pot-slider-size-track-border, 1px);
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
    transform-origin: left;
    transform: translateX(var(--pot-slider-offset-start))
        scaleX(calc(var(--pot-slider-end) - var(--pot-slider-start)));

    /* --- PotSlider - Color --- */
    background-color: var(--pot-slider-color-fill, currentColor);

    /* --- PotSlider - Size --- */
    border-radius: inherit;
}

.pot-slider-thumb {
    position: absolute;
    cursor: grab;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    pointer-events: auto;

    left: calc(var(--pot-slider-size-thumb-width, 1.2em) / -2);
    transform: translateX(var(--pot-slider-offset-end));

    /* --- PotSlider - Color --- */
    background-color: var(--pot-slider-color-thumb, currentColor);
    box-shadow: var(--pot-slider-color-thumb-shadow, none);

    /* --- PotSlider - Size --- */
    width: var(--pot-slider-size-thumb-width, 1.2em);
    height: var(--pot-slider-size-thumb-height, 1.2em);
    border-radius: var(--pot-slider-radius-thumb-value, 50%);

    /* --- PotSlider - Transition --- */
    transition:
        background-color var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease),
        box-shadow var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease);
}

.pot-slider-thumb_start {
    transform: translateX(var(--pot-slider-offset-start));
}

.pot-slider-thumb_end {
    transform: translateX(var(--pot-slider-offset-end));
}

.pot-slider-thumb:active {
    cursor: grabbing;
}

.pot-slider-thumb:focus-visible {
    outline-style: auto;
    outline-width: var(--pot-slider-size-outline, 2px);
    outline-offset: var(--pot-slider-size-outline-offset, 2px);
    outline-color: var(--pot-slider-color-outline, currentColor);
}

/* --- Vertical --- */
.pot-slider._slider-vertical {
    flex-direction: column;
    height: 100%;
}

.pot-slider._slider-vertical .pot-slider-track {
    width: var(--pot-slider-size-track-width-vertical, 0.4em);
    height: 100%;
}

.pot-slider._slider-vertical .pot-slider-fill {
    width: 100%;
}

/* --- Horizontal (default) --- */
.pot-slider:not(._slider-vertical) .pot-slider-track {
    width: 100%;
    height: var(--pot-slider-size-track-height, 0.4em);
}

.pot-slider:not(._slider-vertical) .pot-slider-fill {
    height: 100%;
}

/* --- Disabled --- */
._slider-disabled {
    cursor: default;
}

._slider-disabled .pot-slider-track {
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
