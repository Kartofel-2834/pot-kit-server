// Types
import type { Ref } from 'vue';

export interface IPotOptionProps<VALUE = unknown> {
    tag?: string;
    value?: VALUE;
    label?: string;
    selected?: boolean;
    focused?: boolean;
    disabled?: boolean;
    fluid?: boolean;
}

export interface IPotOptionExpose<VALUE = unknown> {
    element: Ref<HTMLElement | null>;
    value: Ref<VALUE | null>;
    label: Ref<string>;
}
