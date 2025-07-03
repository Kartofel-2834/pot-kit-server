// Types
import type { Ref, RendererElement } from 'vue';

export const POT_DRAWER_POSITION = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
} as const;

export type EPotDrawerPosition = (typeof POT_DRAWER_POSITION)[keyof typeof POT_DRAWER_POSITION];

export interface IPotDrawerProps<
    TDevice extends string = string,
    TColor extends string = string,
    TSize extends string = string,
    TRadius extends string = string,
> {
    /** Drawer visibility flag */
    visible?: boolean;

    /** Drawer visibility flag */
    modelValue?: boolean;

    /** Place where drawer will be mounted */
    to?: string | RendererElement | null;

    /** Drawer position */
    position?: EPotDrawerPosition | EPotDrawerPosition[] | null;

    /** Drawer will not have overlay */
    noOverlay?: boolean;

    /** Drawer will not focus first focusable element on container mount */
    noAutoFocus?: boolean;

    /** Drawer will not lock focus outside of container */
    noFocusTrap?: boolean;

    /** Drawer transition name */
    transition?: string;

    /** Semantic aria-aria-labelledby attribute value */
    ariaLabelledby?: string;

    /** Semantic aria-describedby attribute value */
    ariaDescribedby?: string;

    /** Drawer size */
    size?: TSize | TSize[] | null;

    /** Drawer color */
    color?: TColor | TColor[] | null;

    /** Drawer border radius */
    radius?: TRadius | TRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: TDevice[];
}

export interface IPotDrawerExports {
    /** Drawer visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Open drawer */
    open: () => void;

    /** Close drawer */
    close: () => void;
}
