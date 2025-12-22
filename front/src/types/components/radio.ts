// Types
import type { Ref } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_RADIO_SIZE = {} as const;

export const POT_RADIO_COLOR = {} as const;

export const POT_RADIO_RADIUS = {} as const;

export type EPotRadioSize = (typeof POT_RADIO_SIZE)[keyof typeof POT_RADIO_SIZE];

export type EPotRadioColor = (typeof POT_RADIO_COLOR)[keyof typeof POT_RADIO_COLOR];

export type EPotRadioRadius = (typeof POT_RADIO_RADIUS)[keyof typeof POT_RADIO_RADIUS];

export interface IPotRadioProps<VALUE> {
    /** Current value */
    value?: VALUE;

    /** Same as `value`, added for v-model support */
    modelValue?: VALUE;

    /** Radio button value */
    radioValue?: VALUE;

    /** Radio button border radius */
    radius?: EPotRadioRadius | EPotRadioRadius[] | null;

    /** Radio button size */
    size?: EPotRadioSize | EPotRadioSize[] | null;

    /** Radio button color */
    color?: EPotRadioColor | EPotRadioColor[] | null;

    /** Breakpoints for responsive design */
    devices?: EPotDevice[];

    /** If true, the radio will be disabled and inactive */
    disabled?: boolean;

    /** If true, the radio will be invalid */
    invalid?: boolean;

    /** Name for input element */
    inputName?: string;

    /** Radio button appearance animation */
    transition?: string;
}

export interface IPotRadioEmits<VALUE> {
    change: [value: VALUE];
    'update:modelValue': [value: VALUE];
}

export interface IPotRadioExpose {
    input: Ref<HTMLInputElement | null>;
}
