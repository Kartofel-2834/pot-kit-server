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

export interface IPotOptionExpose {
    element: Ref<HTMLElement | null>;
}
