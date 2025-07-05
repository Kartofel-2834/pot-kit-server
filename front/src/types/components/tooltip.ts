// Types
import type { Ref, RendererElement } from 'vue';
import type { EPotDevice } from '@/types';
import type { EPotAttachedBoxPosition } from '@/types/components/attach-target';

export const POT_TOOLTIP_SIZE = {} as const;

export const POT_TOOLTIP_COLOR = {} as const;

export const POT_TOOLTIP_RADIUS = {} as const;

export type EPotTooltipSize = (typeof POT_TOOLTIP_SIZE)[keyof typeof POT_TOOLTIP_SIZE];

export type EPotTooltipColor = (typeof POT_TOOLTIP_COLOR)[keyof typeof POT_TOOLTIP_COLOR];

export type EPotTooltipRadius = (typeof POT_TOOLTIP_RADIUS)[keyof typeof POT_TOOLTIP_COLOR];

export interface IPotTooltipProps<TOpenTriggers extends string[], TCloseTriggers extends string[]> {
    /** Tooltip text (may be replaced by slot) */
    text?: string;

    /** Place where tooltip will be mounted */
    to?: string | RendererElement | null;

    /** Target events names, that will open tooltip */
    openTriggers?: TOpenTriggers;

    /** Target events names, that will close tooltip */
    closeTriggers?: TCloseTriggers;

    /** Tooltip delay between open triggers activation in milliseconds */
    openTriggersDelay?: { [key in TOpenTriggers[number]]?: number };

    /** Tooltip delay between close triggers activation in milliseconds */
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

    /** Tooltip position that relative to target */
    position?: EPotAttachedBoxPosition | EPotAttachedBoxPosition[];

    /** Distance between tooltip and target */
    nudge?: number | number[];

    /** Distance between tooltip and edge */
    edgeMargin?: number | number[];

    /** Fixed tooltip position without moving to opposite sides */
    persistent?: boolean;

    /** Tooltip will not be sticky and will not follow target on scroll */
    noSticky?: boolean;

    /** Target element */
    target?: Element | null;

    /** Tooltip size */
    size?: EPotTooltipSize | EPotTooltipSize[] | null;

    /** Tooltip color */
    color?: EPotTooltipColor | EPotTooltipColor[] | null;

    /** Tooltip border radius */
    radius?: EPotTooltipRadius | EPotTooltipRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];
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
