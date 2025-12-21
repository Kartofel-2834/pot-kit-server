// Types
import type { Ref } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_CHECKBOX_SIZE = {} as const;

export const POT_CHECKBOX_COLOR = {} as const;

export const POT_CHECKBOX_RADIUS = {} as const;

export type EPotCheckboxSize = (typeof POT_CHECKBOX_SIZE)[keyof typeof POT_CHECKBOX_SIZE];

export type EPotCheckboxColor = (typeof POT_CHECKBOX_COLOR)[keyof typeof POT_CHECKBOX_COLOR];

export type EPotCheckboxRadius = (typeof POT_CHECKBOX_RADIUS)[keyof typeof POT_CHECKBOX_RADIUS];

export interface IPotCheckboxProps<TRUE_VALUE = true, FALSE_VALUE = false> {
    /** Current value */
    value?: TRUE_VALUE | FALSE_VALUE;

    /** Same as `value`, added for v-model support */
    modelValue?: TRUE_VALUE | FALSE_VALUE;

    trueValue?: TRUE_VALUE;

    falseValue?: FALSE_VALUE;

    /** Checkbox border radius */
    radius?: EPotCheckboxRadius | EPotCheckboxRadius[] | null;

    /** Checkbox size */
    size?: EPotCheckboxSize | EPotCheckboxSize[] | null;

    /** Checkbox color */
    color?: EPotCheckboxColor | EPotCheckboxColor[] | null;

    /** Breakpoints for responsive design */
    devices?: EPotDevice[];

    indeterminate?: boolean;

    /** If true, the checkbox will be disabled and inactive */
    disabled?: boolean;

    /** If true, the checkbox will be invalid */
    invalid?: boolean;

    /** Name for input element */
    inputName?: string;

    /** Value for input element */
    inputValue?: string | number | boolean;

    /** Checkbox checkmark appearance animation */
    transition?: string;
}

export interface IPotCheckboxEmits<TRUE_VALUE = true, FALSE_VALUE = false> {
    change: [value: TRUE_VALUE | FALSE_VALUE];
    'update:modelValue': [value: TRUE_VALUE | FALSE_VALUE];
}

export interface IPotCheckboxExpose {
    input: Ref<HTMLInputElement | null>;
}
