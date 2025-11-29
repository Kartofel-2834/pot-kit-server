// Types
import type { ComputedRef, MaybeRef, Ref } from 'vue';

export type TDialogTrigger = 'clickoutside' | 'escape';

export const DIALOG_LAYERS = {
    NONE: 1,
    POPOVER: 500,
    DIALOG: 1000,
    TOAST: 2000,
} as const;

export type EDialogLayers = (typeof DIALOG_LAYERS)[keyof typeof DIALOG_LAYERS];

export type TDialogTriggersDelays = {
    [key in TDialogTrigger]: number;
};

export interface IDialogOptions {
    /** Flag that indicates whether dialog is open */
    isOpen: Ref<boolean>;

    /** Dialog layer z-index value */
    layer: MaybeRef<EDialogLayers>;

    /** Triggers that will close dialog */
    triggers: MaybeRef<TDialogTrigger[]>;

    /** Close dialog */
    close: () => void;

    /** Open dialog */
    open: () => void;
}

export interface IDialog {
    /** Dialog unique id */
    readonly id: symbol;

    /** Triggers that will close dialog */
    readonly triggers: ComputedRef<TDialogTrigger[]>;

    /** Flag that indicates whether dialog is open */
    readonly isOpen: ComputedRef<boolean>;

    /** Dialog layer */
    readonly layer: ComputedRef<EDialogLayers>;

    /** Dialog layer z-index value */
    readonly zIndex: ComputedRef<number>;

    /** The time in ms when the dialog was created changed */
    readonly createdAt: Ref<number>;

    /** The time in ms when the dialog open state changed */
    readonly updatedAt: Ref<number>;

    /** Abort controller, that removes dialog on abort */
    readonly controller: AbortController;

    /** Bindable marker for dialog component elements */
    readonly marker: {
        'data-pot-dialog-id': string;
    };

    /** Close dialog */
    close: () => void;

    /** Open dialog */
    open: () => void;
}

export interface IDialogManager {
    /** Dialog unique id */
    id: symbol;

    /** Flag that indicates whether dialog is open */
    isOpen: boolean;

    /** Dialog layer z-index value */
    layer: EDialogLayers;

    /** Triggers that will close dialog */
    triggers: TDialogTrigger[];

    /** Open dialog */
    open: () => void;

    /** Close dialog */
    close: () => void;

    /** The time in ms when the dialog was created changed */
    createdAt: number;

    /** The time in ms when the dialog open state changed */
    updatedAt: number;
}
