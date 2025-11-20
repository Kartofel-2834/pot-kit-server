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

export interface IDialogsSetupOptions {
    /** Time after the dialog is created, after which triggers will start working */
    triggersStartDelays: Partial<Record<TDialogTrigger, number>>;
}

export interface IDialogOptions {
    /** Flag that indicates whether dialog is open */
    isOpen: MaybeRef<boolean>;

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
    readonly id: Symbol;

    /** Triggers that will close dialog */
    readonly triggers: ComputedRef<TDialogTrigger[]>;

    /** Flag that indicates whether dialog is open */
    readonly isOpen: ComputedRef<boolean>;

    /** Dialog layer z-index value */
    readonly layer: ComputedRef<EDialogLayers>;

    /** Close dialog */
    close: () => void;

    /** Open dialog */
    open: () => void;
}

export interface IDialogManager {
    /** Dialog unique id */
    id: Symbol;

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
