// Types
import type { Ref } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_SLIDER_SIZE = {} as const;

export const POT_SLIDER_COLOR = {} as const;

export const POT_SLIDER_RADIUS = {} as const;

export type EPotSliderSize = (typeof POT_SLIDER_SIZE)[keyof typeof POT_SLIDER_SIZE];

export type EPotSliderColor = (typeof POT_SLIDER_COLOR)[keyof typeof POT_SLIDER_COLOR];

export type EPotSliderRadius = (typeof POT_SLIDER_RADIUS)[keyof typeof POT_SLIDER_RADIUS];

export interface IPotSliderProps {
    /** Текущее значение (для одиночного слайдера) */
    value?: number;

    /** То же, что и `value`, добавлен для поддержки v-model */
    modelValue?: number;

    /** Текущее значение (для диапазона значений) */
    range?: [number, number];

    /** Минимальное значение */
    min?: number;

    /** Максимальное значение */
    max?: number;

    /** Шаг изменения значения */
    step?: number;

    /** Если true, слайдер будет вертикальным */
    vertical?: boolean;

    /** Если true, слайдер будет отключен */
    disabled?: boolean;

    /** Если true, слайдер будет невалиден */
    invalid?: boolean;

    fluid?: boolean;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];

    /** Радиус границ слайдера */
    radius?: EPotSliderRadius | EPotSliderRadius[] | null;

    /** Размер слайдера */
    size?: EPotSliderSize | EPotSliderSize[] | null;

    /** Цвет слайдера */
    color?: EPotSliderColor | EPotSliderColor[] | null;
}

export interface IPotSliderEmits {
    change: [value: number];
    changeRange: [value: [number, number]];
    'update:modelValue': [value: number];
    'update:range': [value: [number, number]];
}

export interface IPotSliderExpose {
    element: Ref<HTMLElement | null>;
}
