// Types
import type { Ref, RendererElement } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_DRAWER_POSITION = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
} as const;

export const POT_DRAWER_SIZE = {} as const;

export const POT_DRAWER_COLOR = {} as const;

export const POT_DRAWER_RADIUS = {} as const;

export type EPotDrawerPosition = (typeof POT_DRAWER_POSITION)[keyof typeof POT_DRAWER_POSITION];

export type EPotDrawerSize = (typeof POT_DRAWER_SIZE)[keyof typeof POT_DRAWER_SIZE];

export type EPotDrawerColor = (typeof POT_DRAWER_COLOR)[keyof typeof POT_DRAWER_COLOR];

export type EPotDrawerRadius = (typeof POT_DRAWER_RADIUS)[keyof typeof POT_DRAWER_RADIUS];

export interface IPotDrawerProps {
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
    size?: EPotDrawerSize | EPotDrawerSize[] | null;

    /** Drawer color */
    color?: EPotDrawerColor | EPotDrawerColor[] | null;

    /** Drawer border radius */
    radius?: EPotDrawerRadius | EPotDrawerRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];
}

export interface IPotDrawerExpose {
    /** Drawer visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Open drawer */
    open: () => void;

    /** Close drawer */
    close: () => void;
}
