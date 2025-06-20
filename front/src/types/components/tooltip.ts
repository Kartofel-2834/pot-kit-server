// Types
import type { EPotPopoverPosition } from '@/types/components/popover';
import type { RendererElement } from 'vue';

export interface IPotTooltipProps<
    TDevice extends string = string,
    TColor extends string = string,
    TSize extends string = string,
    TRadius extends string = string,
> {
    /** Tooltip text (may be replaced by slot) */
    text?: string;

    /** Target events names, that will open tooltip */
    openTriggers?: string[];

    /** Target events names, that will close tooltip */
    closeTriggers?: string[];

    /** Tooltip open delay in milliseconds */
    openDelay?: number;

    /** Tooltip close delay in milliseconds */
    closeDelay?: number;

    /** Tooltip will not close, when mouse is over it */
    enterable?: boolean;

    /* ------------------------------------------------------------ */

    /** Tooltip visibility flag */
    visible?: boolean;

    /** Tooltip visibility flag */
    modelValue?: boolean;

    /** Tooltip position that relative to target */
    position?: EPotPopoverPosition;

    /** Distance between tooltip and target */
    nudge?: number;

    /** Distance between tooltip and edge */
    edgeMargin?: number;

    /** Fixed tooltip position without moving to opposite sides */
    persistent?: boolean;

    /** Sticky tooltip that will follow target */
    sticky?: boolean;

    /** Place where tooltip will be mounted */
    to?: string | RendererElement | null;

    /** Target element */
    target?: Element | null;

    /** Tooltip size */
    size?: TSize | TSize[] | null;

    /** Tooltip color */
    color?: TColor | TColor[] | null;

    /** Tooltip border radius */
    radius?: TRadius | TRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: TDevice[];
}
