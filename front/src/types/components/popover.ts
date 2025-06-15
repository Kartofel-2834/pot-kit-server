// Types
import type { RendererElement } from 'vue';

export const POT_POPOVER_POSITION = {
    TOP_START: 'top-start',
    TOP_END: 'top-end',
    TOP_CENTER: 'top-center',

    BOTTOM_START: 'bottom-start',
    BOTTOM_END: 'bottom-end',
    BOTTOM_CENTER: 'bottom-center',

    LEFT_START: 'left-start',
    LEFT_END: 'left-end',
    LEFT_CENTER: 'left-center',

    RIGHT_START: 'right-start',
    RIGHT_END: 'right-end',
    RIGHT_CENTER: 'right-center',
} as const;

export type EPotPopoverPosition = (typeof POT_POPOVER_POSITION)[keyof typeof POT_POPOVER_POSITION];

export interface IPotPopoverProps<
    TDevice extends string = string,
    TColor extends string = string,
    TSize extends string = string,
    TRadius extends string = string,
> {
    /** Popover visibility flag */
    visible?: boolean;

    /** Popover visibility flag */
    modelValue?: boolean;

    /** Popover position that relative to target */
    position?: EPotPopoverPosition;

    /** Distance between popover and target */
    nudge?: number;

    /** Distance between popover and edge */
    edgeMargin?: number;

    /** Fixed popover position without moving to opposite sides */
    persistent?: boolean;

    /** Sticky popover that will follow target */
    sticky?: boolean;

    /** Place where popover will be mounted */
    to?: string | RendererElement | null;

    /** Target element */
    target?: Element | null;

    /** Popover size */
    size?: TSize | TSize[] | null;

    /** Popover color */
    color?: TColor | TColor[] | null;

    /** Popover border radius */
    radius?: TRadius | TRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: TDevice[];
}
