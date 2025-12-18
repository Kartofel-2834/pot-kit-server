// Types
import type { Ref } from 'vue';
import type { ISpec, TOptionValue } from '@/types/composables/specs';
import type { IPotSelectSpecData } from '@/types/components/select';

export interface IPotSelectOptionProps<OPTION, VALUE_FIELD extends keyof OPTION> {
    spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>;
}

export interface IPotSelectOptionEmits<OPTION, VALUE_FIELD extends keyof OPTION> {
    select: [spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>];
}

export interface IPotSelectOptionExpose<OPTION, VALUE_FIELD extends keyof OPTION> {
    element: Ref<HTMLElement | null>;
    value: Ref<TOptionValue<OPTION, VALUE_FIELD> | null>;
    label: Ref<string>;
}
