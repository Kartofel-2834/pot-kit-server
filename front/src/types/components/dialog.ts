// Types
import type { Ref, RendererElement } from 'vue';
import type { EPotDevice } from '@/types';

export const POT_DIALOG_POSITION = {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    TOP: 'top',

    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM: 'bottom',

    RIGHT: 'right',
    LEFT: 'left',
    CENTER: 'center',
} as const;

export const POT_DIALOG_SIZE = {} as const;

export const POT_DIALOG_COLOR = {} as const;

export const POT_DIALOG_RADIUS = {} as const;

export type EPotDialogPosition = (typeof POT_DIALOG_POSITION)[keyof typeof POT_DIALOG_POSITION];

export type EPotDialogSize = (typeof POT_DIALOG_SIZE)[keyof typeof POT_DIALOG_SIZE];

export type EPotDialogColor = (typeof POT_DIALOG_COLOR)[keyof typeof POT_DIALOG_COLOR];

export type EPotDialogRadius = (typeof POT_DIALOG_RADIUS)[keyof typeof POT_DIALOG_RADIUS];

export interface IPotDialogProps {
    /** Dialog visibility flag */
    visible?: boolean;

    /** Dialog visibility flag */
    modelValue?: boolean;

    /** Dialog position */
    position?: EPotDialogPosition | EPotDialogPosition[] | null;

    /** Dialog teleport target */
    to?: string | RendererElement | null;

    /** Dialog will not have overlay */
    noOverlay?: boolean;

    /** Dialog will not focus first focusable element on container mount */
    noAutoFocus?: boolean;

    /** Dialog will not lock focus outside of container */
    noFocusTrap?: boolean;

    /** Dialog transition name */
    transition?: string;

    /** Semantic aria-aria-labelledby attribute value */
    ariaLabelledby?: string;

    /** Semantic aria-describedby attribute value */
    ariaDescribedby?: string;

    /** Dialog size */
    size?: EPotDialogSize | EPotDialogSize[] | null;

    /** Dialog color */
    color?: EPotDialogColor | EPotDialogColor[] | null;

    /** Dialog border radius */
    radius?: EPotDialogRadius | EPotDialogRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];
}

export interface IPotDialogExpose {
    /** Dialog visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Open dialog */
    open: () => void;

    /** Close dialog */
    close: () => void;
}
