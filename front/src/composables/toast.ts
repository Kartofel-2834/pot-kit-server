// Types
import type { Ref } from 'vue';
import type { IToast, IToastDialog, IToastDialogData } from '@/types/composables/toast';

// Vue
import { readonly, ref } from 'vue';

const toastsList = ref<IToastDialog<unknown>[]>([]);

export function useToast<T = unknown>(): IToast<T> {
    function add(toast: IToastDialogData<T>) {
        const id = Symbol(Math.random().toString(36).slice(2, 9));
        const data = { ...toast, id };

        toastsList.value = [...toastsList.value, data];

        if (toast.lifetime) {
            setTimeout(() => remove(id), toast.lifetime);
        }
    }

    function remove(id: Symbol) {
        toastsList.value = toastsList.value.filter(toast => toast.id !== id);
    }

    return {
        list: readonly(toastsList) as Readonly<Ref<IToastDialog<unknown>[]>>,
        add,
        remove,
    };
}
