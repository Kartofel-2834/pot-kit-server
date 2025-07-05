// Types
import type { Ref } from 'vue';

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
    isOpen: Ref<boolean>;

    /** Dialog layer z-index value */
    layer: Ref<EDialogLayers>;

    /** Close dialog */
    close: () => void;

    /** Open dialog */
    open: () => void;

    /** Triggers that will close dialog */
    triggers: TDialogTrigger[];
}

export interface IDialog {
    /** Dialog unique id */
    readonly id: Symbol;

    /** Triggers that will close dialog */
    readonly triggers: TDialogTrigger[];

    /** Flag that indicates whether dialog is open */
    isOpen: Ref<boolean>;

    /** Dialog layer z-index value */
    layer: Ref<EDialogLayers>;

    /** Close dialog */
    close: () => void;

    /** Open dialog */
    open: () => void;

    /** Terminate dialogs watchers and listeners */
    terminate: () => void;
}

export interface IDialogManager {
    /** Dialog unique id */
    id: Symbol;

    /** Dialog layer z-index value */
    layer: EDialogLayers;

    /** Open dialog */
    open: () => void;

    /** Close dialog */
    close: () => void;

    /** Triggers that will close dialog */
    triggers: TDialogTrigger[];

    /** The time in ms when the dialog was created changed */
    createdAt: number;

    /** The time in ms when the dialog open state changed */
    updatedAt: number;
}
