// Types
import type { ComputedRef, Ref, RendererElement } from 'vue';
import type { EPotDevice } from '@/types';
import type { EAttachedBoxPosition } from '@/types/composables/attach';

export const POT_TOOLTIP_SIZE = {} as const;

export const POT_TOOLTIP_COLOR = {} as const;

export const POT_TOOLTIP_RADIUS = {} as const;

export type EPotTooltipSize = (typeof POT_TOOLTIP_SIZE)[keyof typeof POT_TOOLTIP_SIZE];

export type EPotTooltipColor = (typeof POT_TOOLTIP_COLOR)[keyof typeof POT_TOOLTIP_COLOR];

export type EPotTooltipRadius = (typeof POT_TOOLTIP_RADIUS)[keyof typeof POT_TOOLTIP_RADIUS];

export interface IPotTooltipProps {
    /** Tooltip text (may be replaced by slot) */
    text?: string;

    /** Place where tooltip will be mounted */
    to?: string | RendererElement | null;

    /** Tooltip element classlist */
    classList?: string[] | Record<string, unknown>;

    /** Target events names, that will open tooltip */
    openTriggers?: string[];

    /** Target events names, that will close tooltip */
    closeTriggers?: string[];

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
    position?: EAttachedBoxPosition | EAttachedBoxPosition[];

    /** Distance between tooltip and target */
    nudge?: number | number[];

    /** Distance between tooltip and edge */
    edgeMargin?: number | number[];

    /** Fixed tooltip position without moving to opposite sides */
    persistent?: boolean;

    /** Tooltip will not be sticky and will not follow target on scroll */
    noSticky?: boolean;

    /** Tooltip will not focus first focusable element on container mount */
    noAutoFocus?: boolean;

    /** Tooltip will not lock focus outside of container */
    noFocusTrap?: boolean;

    /** Tooltip will be closed if target or box rect changed or on surrounding scroll/resize */
    closeOnMove?: boolean;

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
    isOpen: ComputedRef<boolean>;

    /** Tooltip left-top corner x coordinate */
    x: ComputedRef<number | null>;

    /** Tooltip left-top corner y coordinate */
    y: ComputedRef<number | null>;

    /** Target element */
    target: ComputedRef<Element | null>;

    /** Tooltip element */
    tooltip: Readonly<Ref<Element | null>>;

    /** Open tooltip */
    open: () => void;

    /** Close tooltip */
    close: () => void;

    /** Tooltip will open after openDelay prop value in milliseconds */
    delayedOpen: () => void;

    /** Tooltip will open after closeDelay prop value in milliseconds */
    delayedClose: () => void;
}
