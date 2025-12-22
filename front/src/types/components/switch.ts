// Types
import type { Ref } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_SWITCH_SIZE = {} as const;

export const POT_SWITCH_COLOR = {} as const;

export const POT_SWITCH_RADIUS = {} as const;

export type EPotSwitchSize = (typeof POT_SWITCH_SIZE)[keyof typeof POT_SWITCH_SIZE];

export type EPotSwitchColor = (typeof POT_SWITCH_COLOR)[keyof typeof POT_SWITCH_COLOR];

export type EPotSwitchRadius = (typeof POT_SWITCH_RADIUS)[keyof typeof POT_SWITCH_RADIUS];

export interface IPotSwitchProps<TRUE_VALUE = true, FALSE_VALUE = false> {
    /** Current value */
    value?: TRUE_VALUE | FALSE_VALUE;

    /** Same as `value`, added for v-model support */
    modelValue?: TRUE_VALUE | FALSE_VALUE;

    trueValue?: TRUE_VALUE;

    falseValue?: FALSE_VALUE;

    /** Switch border radius */
    radius?: EPotSwitchRadius | EPotSwitchRadius[] | null;

    /** Switch size */
    size?: EPotSwitchSize | EPotSwitchSize[] | null;

    /** Switch color */
    color?: EPotSwitchColor | EPotSwitchColor[] | null;

    /** Breakpoints for responsive design */
    devices?: EPotDevice[];

    /** If true, the switch will be disabled and inactive */
    disabled?: boolean;

    /** If true, the switch will be invalid */
    invalid?: boolean;

    /** Name for input element */
    inputName?: string;

    /** Value for input element */
    inputValue?: string | number | boolean;

    /** Switch toggle appearance animation */
    transition?: string;
}

export interface IPotSwitchEmits<TRUE_VALUE = true, FALSE_VALUE = false> {
    change: [value: TRUE_VALUE | FALSE_VALUE];
    'update:modelValue': [value: TRUE_VALUE | FALSE_VALUE];
}

export interface IPotSwitchExpose {
    input: Ref<HTMLInputElement | null>;
}
