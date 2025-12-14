// Types
import type { Ref } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_CHECKBOX_SIZE = {} as const;

export const POT_CHECKBOX_COLOR = {} as const;

export const POT_CHECKBOX_RADIUS = {} as const;

export type EPotCheckboxSize = (typeof POT_CHECKBOX_SIZE)[keyof typeof POT_CHECKBOX_SIZE];

export type EPotCheckboxColor = (typeof POT_CHECKBOX_COLOR)[keyof typeof POT_CHECKBOX_COLOR];

export type EPotCheckboxRadius = (typeof POT_CHECKBOX_RADIUS)[keyof typeof POT_CHECKBOX_RADIUS];

export interface IPotCheckboxProps {
    /** Текущее значение */
    value?: boolean;

    /** То же, что и `value`, добавлен для поддержки v-model */
    modelValue?: boolean;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];

    /** Радиус границ чекбокса */
    radius?: EPotCheckboxRadius | EPotCheckboxRadius[] | null;

    /** Размер чекбокса */
    size?: EPotCheckboxSize | EPotCheckboxSize[] | null;

    /** Цвет чекбокса */
    color?: EPotCheckboxColor | EPotCheckboxColor[] | null;

    /** Если true, то чекбокс будет заблокирован и не активен */
    disabled?: boolean;

    /** Если true, то чекбокс будет невалиден */
    invalid?: boolean;

    /** Имя для input элемента */
    name?: string;

    /** Значение для input элемента */
    inputValue?: string | number | boolean;
}

export interface IPotCheckboxExpose {
    input: Ref<HTMLInputElement | null>;
}

