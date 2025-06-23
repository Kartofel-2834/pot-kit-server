// Types
import type { Ref, RendererElement } from 'vue';
import type { EPotAttachedBoxPosition } from '@/types/components/attach-target';

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
    position?: EPotAttachedBoxPosition;

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

    /** Popover transition name */
    transition?: string;
}

export interface IPotPopoverExpose {
    /** Popover visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Popover left-top corner X coordinate */
    x?: number;

    /** Popover left-top corner Y coordinate */
    y?: number;

    /** Popover target element */
    target?: Element | null;

    /** Popover element */
    popover?: Element | null;

    /** Open popover */
    open: () => void;

    /** Close popover */
    close: () => void;
}
