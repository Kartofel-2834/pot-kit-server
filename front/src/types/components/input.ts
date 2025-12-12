// Types
import type { Ref } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_INPUT_SIZE = {} as const;

export const POT_INPUT_COLOR = {} as const;

export const POT_INPUT_RADIUS = {} as const;

export type EPotInputSize = (typeof POT_INPUT_SIZE)[keyof typeof POT_INPUT_SIZE];

export type EPotInputColor = (typeof POT_INPUT_COLOR)[keyof typeof POT_INPUT_COLOR];

export type EPotInputRadius = (typeof POT_INPUT_RADIUS)[keyof typeof POT_INPUT_RADIUS];

export interface IPotInputProps {
    /** Текущее значение */
    value?: string;

    /** То же, что и `value`, добавлен для поддержки v-model */
    modelValue?: string;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];

    /** Радиус границ кнопки */
    radius?: EPotInputRadius | EPotInputRadius[] | null;

    /** Размер инпута */
    size?: EPotInputSize | EPotInputSize[] | null;

    /** Цвет инпута */
    color?: EPotInputColor | EPotInputColor[] | null;

    /** Если true, то инпут будет заблокирован и не активен */
    disabled?: boolean;

    /** Если true, то инпут будет невалиден */
    invalid?: boolean;

    /** Если true, то инпут будет полностью заполнен */
    fluid?: boolean;

    type?: string;
    placeholder?: string;
    readonly?: boolean;
    step?: number;
    min?: number;
    max?: number;
    maxlength?: number;
    tabindex?: string | number;
    inputName?: string;
}

export interface IPotInputExpose {
    input: Ref<HTMLInputElement | null>;
}
