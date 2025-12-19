// Types
import type { Ref } from 'vue';
import type { ISpec } from '@/types/composables/specs';
import type { IPotSelectSpecData } from '@/types/components/select';
import type { EPotDevice } from '@/types';

export interface IPotSelectHeaderProps<OPTION, VALUE_FIELD extends keyof OPTION> {
    specs: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>[];
    text?: string;
    editable?: boolean;
    fluid?: boolean;
    placeholder?: string;
    devices?: EPotDevice[];
}

export interface IPotSelectHeaderEmits {
    input: [value: string];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
}

export interface IPotSelectHeaderExpose {
    element: Ref<HTMLElement | null>;
    input: Ref<HTMLInputElement | null>;
    focus: () => void;
}
