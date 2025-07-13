// Types
import type { EPotDevice } from '@/types';

export const POT_BUTTON_SIZE = {} as const;

export const POT_BUTTON_COLOR = {} as const;

export const POT_BUTTON_RADIUS = {} as const;

export type EPotButtonSize = (typeof POT_BUTTON_SIZE)[keyof typeof POT_BUTTON_SIZE];

export type EPotButtonColor = (typeof POT_BUTTON_COLOR)[keyof typeof POT_BUTTON_COLOR];

export type EPotButtonRadius = (typeof POT_BUTTON_RADIUS)[keyof typeof POT_BUTTON_RADIUS];

export interface IPotButtonProps {
    /** Button HTML-tag */
    tag?: string;

    /** Button size */
    size?: EPotButtonSize | EPotButtonSize[] | null;

    /** Button color */
    color?: EPotButtonColor | EPotButtonColor[] | null;

    /** Button border radius */
    radius?: EPotButtonRadius | EPotButtonRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];

    /** If true, the button length will be equal to the width from the size prop */
    square?: boolean;

    /** If true, the button will be disabled and inactive */
    disabled?: boolean;
}
