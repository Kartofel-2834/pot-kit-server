// Types
import type { Ref, RendererElement } from 'vue';

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

export type EPotDialogPosition = (typeof POT_DIALOG_POSITION)[keyof typeof POT_DIALOG_POSITION];

export interface IPotDialogProps<
    TDevice extends string = string,
    TColor extends string = string,
    TSize extends string = string,
    TRadius extends string = string,
> {
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

    /** Dialog transition name */
    transition?: string;

    /** Dialog size */
    size?: TSize | TSize[] | null;

    /** Dialog color */
    color?: TColor | TColor[] | null;

    /** Dialog border radius */
    radius?: TRadius | TRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: TDevice[];
}

export interface IPotDialogExports {
    /** Dialog visibility flag */
    isOpen: Readonly<Ref<boolean>>;

    /** Open dialog */
    open: () => void;

    /** Close dialog */
    close: () => void;
}
