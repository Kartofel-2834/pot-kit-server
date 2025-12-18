// Types
import type { ComputedRef, Ref, RendererElement } from 'vue';
import type { EPotDevice } from '@/types';
import type { EAttachedBoxPosition } from '@/types/composables/attach';
import type { TDialogMarker } from '@/types/composables/dialog';

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

    /** Popover element classlist */
    classList?: string[] | Record<string, unknown>;

    /** Popover position that relative to target */
    position?: EAttachedBoxPosition | EAttachedBoxPosition[];

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

    /** Popover will be closed if target or box rect changed or on surrounding scroll/resize */
    closeOnMove?: boolean;

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

export interface IPotPopoverEmits {
    open: [];
    close: [];
    'update:modelValue': [isVisible: boolean];
}

export interface IPotPopoverExpose {
    /** Popover visibility flag */
    isOpen: ComputedRef<boolean>;

    /** Popover dialog marker */
    marker: Ref<TDialogMarker | null>;

    /** Popover x coordinate */
    x: ComputedRef<number | null>;

    /** Popover y coordinate */
    y: ComputedRef<number | null>;

    /** Popover target element */
    target: Readonly<Ref<Element | null>>;

    /** Popover element */
    popover: Readonly<Ref<Element | null>>;

    /** Open popover */
    open: () => void;

    /** Close popover */
    close: () => void;
}
