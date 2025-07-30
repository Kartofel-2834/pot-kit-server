// Types
import type { Ref, RendererElement } from 'vue';
import type { EPotAttachedBoxPosition } from '@/types/components/attach-target';
import type { EPotDevice } from '@/types';

export const POT_POPOVER_SIZE = {} as const;

export const POT_POPOVER_COLOR = {} as const;

export const POT_POPOVER_RADIUS = {} as const;

export type EPotPopoverSize = (typeof POT_POPOVER_SIZE)[keyof typeof POT_POPOVER_SIZE];

export type EPotPopoverColor = (typeof POT_POPOVER_COLOR)[keyof typeof POT_POPOVER_COLOR];

export type EPotPopoverRadius = (typeof POT_POPOVER_RADIUS)[keyof typeof POT_POPOVER_RADIUS];

export interface IPotPopoverProps {
    /** Popover visibility flag */
    visible?: boolean;

    /** Popover visibility flag */
    modelValue?: boolean;

    /** Popover position that relative to target */
    position?: EPotAttachedBoxPosition | EPotAttachedBoxPosition[];

    /** Distance between popover and target */
    nudge?: number | number[];

    /** Distance between popover and edge */
    edgeMargin?: number | number[];

    /** Fixed popover position without moving to opposite sides */
    persistent?: boolean;

    /** Popover will not be sticky and will not follow target on scroll */
    noSticky?: boolean;

    /** Place where popover will be mounted */
    to?: string | RendererElement | null;

    /** Target element */
    target?: Element | null;

    /** Popover will not focus first focusable element on container mount */
    noAutoFocus?: boolean;

    /** Popover will not lock focus outside of container */
    noFocusTrap?: boolean;

    /** Popover size */
    size?: EPotPopoverSize | EPotPopoverSize[] | null;

    /** Popover color */
    color?: EPotPopoverColor | EPotPopoverColor[] | null;

    /** Popover border radius */
    radius?: EPotPopoverRadius | EPotPopoverRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];

    /** Popover transition name */
    transition?: string;
}

export interface IPotPopoverExpose {
    /** Popover visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Popover left-top corner coordinates */
    coordinates?: [x: number, y: number];

    /** Popover target element */
    target?: Element | null;

    /** Popover element */
    popover?: Element | null;

    /** Open popover */
    open: () => void;

    /** Close popover */
    close: () => void;
}
