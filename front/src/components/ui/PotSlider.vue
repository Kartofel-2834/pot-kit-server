<script lang="ts" setup>
// Types
import type { IPotSliderEmits, IPotSliderExpose, IPotSliderProps } from '@/types/components/slider';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';
import { useDeviceProperties } from '@/composables/device-is';

const props = withDefaults(defineProps<IPotSliderProps>(), {
    value: undefined,
    modelValue: undefined,
    range: undefined,
    modelRange: undefined,
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
const isDragging = ref<boolean>(false);
const activeThumb = ref<'min' | 'max' | null>(null);

// Computed
const isRange = computed(() => {
    return props.range !== undefined || props.modelRange !== undefined;
});

const currentValue = computed(() => {
    if (isRange.value) {
        const range = props.range ?? props.modelRange;
        if (range) {
            return [
                Math.max(props.min, Math.min(props.max, range[0])),
                Math.max(props.min, Math.min(props.max, range[1])),
            ] as [number, number];
        }
        return [props.min, props.max] as [number, number];
    }
    const value = props.value ?? props.modelValue;
    if (value !== undefined) {
        return Math.max(props.min, Math.min(props.max, value));
    }
    return props.min;
});

const normalizedMin = computed(() => {
    if (isRange.value) {
        const range = currentValue.value as [number, number];
        // Всегда возвращаем минимальное значение из диапазона
        return Math.min(range[0], range[1]);
    }
    return Math.min(currentValue.value as number, props.max);
});

const normalizedMax = computed(() => {
    if (isRange.value) {
        const range = currentValue.value as [number, number];
        // Всегда возвращаем максимальное значение из диапазона
        return Math.max(range[0], range[1]);
    }
    return currentValue.value as number;
});

const minPercent = computed(() => {
    return ((normalizedMin.value - props.min) / (props.max - props.min)) * 100;
});

const maxPercent = computed(() => {
    return ((normalizedMax.value - props.min) / (props.max - props.min)) * 100;
});

const trackStyle = computed(() => {
    if (props.vertical) {
        if (isRange.value) {
            return {
                bottom: `${minPercent.value}%`,
                top: `${100 - maxPercent.value}%`,
            };
        }
        return {
            bottom: '0%',
            top: `${100 - maxPercent.value}%`,
        };
    } else {
        if (isRange.value) {
            return {
                left: `${minPercent.value}%`,
                right: `${100 - maxPercent.value}%`,
            };
        }
        return {
            left: '0%',
            right: `${100 - maxPercent.value}%`,
        };
    }
});

const minThumbStyle = computed(() => {
    if (props.vertical) {
        return {
            bottom: `${minPercent.value}%`,
            left: '50%',
            transform: 'translate(-50%, 50%)',
        };
    }
    return {
        left: `${minPercent.value}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
    };
});

const maxThumbStyle = computed(() => {
    if (props.vertical) {
        return {
            bottom: `${maxPercent.value}%`,
            left: '50%',
            transform: 'translate(-50%, 50%)',
        };
    }
    return {
        left: `${maxPercent.value}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
    };
});

// Composables
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

// Methods
function normalizeValue(value: number): number {
    let normalized = Math.max(props.min, Math.min(props.max, value));

    if (props.step > 0) {
        normalized = Math.round((normalized - props.min) / props.step) * props.step + props.min;
    }

    return normalized;
}

function getValueFromEvent(event: MouseEvent | TouchEvent): number {
    if (!track.value) return props.min;

    const rect = track.value.getBoundingClientRect();
    let percentage: number;

    if (props.vertical) {
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        percentage = 1 - (clientY - rect.top) / rect.height;
    } else {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        percentage = (clientX - rect.left) / rect.width;
    }

    percentage = Math.max(0, Math.min(1, percentage));
    const value = props.min + percentage * (props.max - props.min);

    return normalizeValue(value);
}

function updateValue(newValue: number) {
    if (props.disabled) return;

    if (isRange.value) {
        const current = currentValue.value as [number, number];
        let newRange: [number, number];
        let shouldSwap = false;

        if (activeThumb.value === 'min') {
            // Разрешаем min шарику перейти за max
            newRange = [newValue, current[1]];
            // Если min перешел за max, нужно поменять местами
            if (newRange[0] > newRange[1]) {
                shouldSwap = true;
            }
        } else if (activeThumb.value === 'max') {
            // Разрешаем max шарику перейти за min
            newRange = [current[0], newValue];
            // Если max перешел за min, нужно поменять местами
            if (newRange[0] > newRange[1]) {
                shouldSwap = true;
            }
        } else {
            const distanceToMin = Math.abs(newValue - current[0]);
            const distanceToMax = Math.abs(newValue - current[1]);
            if (distanceToMin < distanceToMax) {
                activeThumb.value = 'min';
                newRange = [newValue, current[1]];
                if (newRange[0] > newRange[1]) {
                    shouldSwap = true;
                }
            } else {
                activeThumb.value = 'max';
                newRange = [current[0], newValue];
                if (newRange[0] > newRange[1]) {
                    shouldSwap = true;
                }
            }
        }

        // Если значения поменялись местами, переключаем активный шарик
        if (shouldSwap) {
            newRange = [newRange[1], newRange[0]];
            // Переключаем активный шарик на противоположный
            activeThumb.value = activeThumb.value === 'min' ? 'max' : 'min';
        }

        emit('update:modelRange', newRange);
        emit('input', newRange);
        emit('change', newRange);
    } else {
        emit('update:modelValue', newValue);
        emit('input', newValue);
        emit('change', newValue);
    }
}

function onTrackClick(event: MouseEvent) {
    if (props.disabled || isDragging.value) return;

    const newValue = getValueFromEvent(event);
    updateValue(newValue);
}

function onTrackTouchStart(event: TouchEvent) {
    if (props.disabled || isDragging.value) return;

    event.preventDefault();
    const newValue = getValueFromEvent(event);
    updateValue(newValue);
}

function onThumbMouseDown(event: MouseEvent, thumb: 'min' | 'max') {
    if (props.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    isDragging.value = true;
    activeThumb.value = thumb;

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.value) return;
        e.preventDefault();
        const value = getValueFromEvent(e);
        updateValue(value);
    };

    const handleMouseUp = () => {
        if (!isDragging.value) return;
        isDragging.value = false;
        activeThumb.value = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function onThumbTouchStart(event: TouchEvent, thumb: 'min' | 'max') {
    if (props.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    isDragging.value = true;
    activeThumb.value = thumb;

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging.value) return;
        e.preventDefault();
        const value = getValueFromEvent(e);
        updateValue(value);
    };

    const handleTouchEnd = () => {
        if (!isDragging.value) return;
        isDragging.value = false;
        activeThumb.value = null;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
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
    >
        <div
            ref="track"
            class="pot-slider-track"
            @click="onTrackClick"
            @touchstart="onTrackTouchStart"
        >
            <div
                class="pot-slider-fill"
                :style="trackStyle"
            />

            <button
                v-if="isRange"
                type="button"
                class="pot-slider-thumb pot-slider-thumb_min"
                :style="minThumbStyle"
                :disabled="disabled"
                @mousedown="onThumbMouseDown($event, 'min')"
                @touchstart="onThumbTouchStart($event, 'min')"
            />

            <button
                type="button"
                class="pot-slider-thumb"
                :class="{ 'pot-slider-thumb_max': isRange }"
                :style="isRange ? maxThumbStyle : minThumbStyle"
                :disabled="disabled"
                @mousedown="onThumbMouseDown($event, isRange ? 'max' : 'min')"
                @touchstart="onThumbTouchStart($event, isRange ? 'max' : 'min')"
            />
        </div>
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

    /* --- PotSlider - Color --- */
    background-color: var(--pot-slider-color-thumb, currentColor);
    box-shadow: var(--pot-slider-color-thumb-shadow, none);

    /* --- PotSlider - Size --- */
    width: var(--pot-slider-size-thumb-width, 1.2em);
    height: var(--pot-slider-size-thumb-height, 1.2em);
    border-radius: var(--pot-slider-radius-thumb-value, 50%);

    /* --- PotSlider - Transition --- */
    transition:
        transform var(--pot-slider-transition-duration, 0.1s)
            var(--pot-slider-transition-function, ease),
        background-color var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease),
        box-shadow var(--pot-slider-transition-duration, 0.2s)
            var(--pot-slider-transition-function, ease);
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
