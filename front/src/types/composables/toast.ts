// Types
import type { Ref } from 'vue';

export interface IToastDialogData<T = unknown> {
    group?: string;
    lifetime?: number;
    data?: T;
}

export interface IToastDialog<T = unknown> extends IToastDialogData<T> {
    id: Symbol;
}

export interface IToast<T = unknown> {
    list: Readonly<Ref<IToastDialog<unknown>[]>>;
    add: (toast: IToastDialogData<T>) => void;
    remove: (id: Symbol) => void;
}
