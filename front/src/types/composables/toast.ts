// Types
import type { Ref } from 'vue';

export interface IToastDialogData<DATA = unknown> {
    group?: string;
    lifetime?: number;
    data?: DATA;
}

export interface IToastDialog<DATA = unknown> extends IToastDialogData<DATA> {
    id: Symbol;
}

export interface IToast<DATA = unknown> {
    list: Readonly<Ref<IToastDialog[]>>;
    add: (toast: IToastDialogData<DATA>) => void;
    remove: (id: Symbol) => void;
}
