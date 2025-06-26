// Types
import type { Ref, RendererElement } from 'vue';
import type { EPotAttachedBoxPosition } from './attach-target';

export interface IPotTooltipProps<
    TOpenTriggers extends string[],
    TCloseTriggers extends string[],
    TDevice extends string = string,
    TColor extends string = string,
    TSize extends string = string,
    TRadius extends string = string,
> {
    /** Tooltip text (may be replaced by slot) */
    text?: string;

    /** Place where tooltip will be mounted */
    to?: string | RendererElement | null;

    /** Target events names, that will open tooltip */
    openTriggers?: TOpenTriggers;

    /** Target events names, that will close tooltip */
    closeTriggers?: TCloseTriggers;

    openTriggersDelay?: { [key in TOpenTriggers[number]]?: number };

    closeTriggersDelay?: { [key in TCloseTriggers[number]]?: number };

    /** Tooltip open delay in milliseconds */
    openDelay?: number;

    /** Tooltip close delay in milliseconds */
    closeDelay?: number;

    /** Tooltip will close after this delay in milliseconds, if delay greater than zero */
    autoCloseDelay?: number;

    /** Tooltip will not close, when mouse is over it */
    enterable?: boolean;

    /** Tooltip transition name */
    transition?: string;

    /* ------------------------------------------------------------ */

    /** Tooltip position that relative to target */
    position?: EPotAttachedBoxPosition;

    /** Distance between tooltip and target */
    nudge?: number;

    /** Distance between tooltip and edge */
    edgeMargin?: number;

    /** Fixed tooltip position without moving to opposite sides */
    persistent?: boolean;

    /** Sticky tooltip that will follow target */
    sticky?: boolean;

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

export interface IPotTooltipExpose {
    /** Tooltip visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Tooltip left-top corner X coordinate */
    x?: number;

    /** Tooltip left-top corner Y coordinate */
    y?: number;

    /** Target element */
    target?: Element | null;

    /** Tooltip element */
    tooltip?: Element | null;

    /** Open tooltip */
    open: () => void;

    /** Close tooltip */
    close: () => void;

    /** Tooltip will open after openDelay prop value in milliseconds, if delay greater than zero */
    delayedOpen: (event: Event, trigger: string) => number;

    /** Tooltip will open after closeDelay prop value in milliseconds, if delay greater than zero */
    delayedClose: (event: Event, trigger: string) => number;

    /** Pause delayed tooltip open action */
    pause: () => void;

    /** Resume delayed tooltip open action */
    resume: () => void;

    /** Clear delayed tooltip open action */
    clearDelayedAction: () => void;
}
