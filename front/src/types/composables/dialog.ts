// Types
import type { ComputedRef, DeepReadonly, Ref } from 'vue';

export type TDialogTrigger = 'click' | 'escape';

export interface IDialogsSetupOptions {
    /** Start z-index for dialogs */
    startZIndex: number;

    /** Time after the dialog is created, after which triggers will start working */
    triggersStartDelays: Partial<Record<TDialogTrigger, number>>;
}

export interface IDialogOptions {
    /** Flag that indicates whether dialog is open */
    isOpen: Ref<boolean>;

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

    /** Dialog's position in the queue */
    readonly queueIndex: DeepReadonly<ComputedRef<number>>;

    /** Flag that indicates whether dialog is open */
    isOpen: Ref<boolean>;

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

    /** Open dialog */
    open: () => void;

    /** Close dialog */
    close: () => void;

    /** Triggers that will close dialog */
    triggers: TDialogTrigger[];

    /** The time in ms when the dialog state changed */
    updatedAt: number;
}
