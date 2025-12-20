// Types
import type { Ref } from 'vue';
import type { IToast, IToastDialog, IToastDialogData } from '@/types/composables/toast';

// Vue
import { readonly, ref } from 'vue';

const toastsList = ref<IToastDialog[]>([]);

export function useToast<DATA = unknown>(): IToast<DATA> {
    function add(toast: IToastDialogData<DATA>) {
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
        list: readonly(toastsList) as Readonly<Ref<IToastDialog[]>>,
        add,
        remove,
    };
}
