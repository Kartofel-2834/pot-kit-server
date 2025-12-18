import type { Ref, RendererElement, UnwrapRef } from 'vue';
import type { TDialogMarker } from '@/types/composables/dialog';
import type { ISpec, TOptionValue } from '@/types/composables/specs';
import type { EAttachedBoxPosition } from '@/types/composables/attach';
import type { EPotDevice } from '@/types';

export const POT_SELECT_COLOR = {
    POT: 'pot',
} as const;

export type EPotSelectColor = (typeof POT_SELECT_COLOR)[keyof typeof POT_SELECT_COLOR];

export const POT_SELECT_SIZE = {
    MEDIUM: 'medium',
} as const;

export const POT_SELECT_RADIUS = {
    CIRCLE: 'circle',
} as const;

export type EPotSelectSize = (typeof POT_SELECT_SIZE)[keyof typeof POT_SELECT_SIZE];

export type EPotSelectRadius = (typeof POT_SELECT_RADIUS)[keyof typeof POT_SELECT_RADIUS];

export interface IPotSelectSpecData {
    focused: boolean;
}

export interface IPotSelectProps<OPTION, VALUE_FIELD extends keyof OPTION> {
    value?: TOptionValue<OPTION, VALUE_FIELD> | null;
    modelValue?: TOptionValue<OPTION, VALUE_FIELD> | null;
    options?: OPTION[];
    optionLabel?: keyof OPTION | ((option: OPTION) => string);
    optionDisabled?: keyof OPTION | ((option: OPTION) => boolean);
    optionValue?: VALUE_FIELD | ((option: OPTION) => TOptionValue<OPTION, VALUE_FIELD>);

    text?: string;
    placeholder?: string;
    editable?: boolean;
    fluid?: boolean;
    fixedDropdownWidth?: boolean;

    to?: string | RendererElement | null;
    position?: EAttachedBoxPosition | EAttachedBoxPosition[];
    nudge?: number | number[];
    edgeMargin?: number | number[];
    persistent?: boolean;
    noSticky?: boolean;
    closeOnMove?: boolean;
    transition?: string;

    size?: EPotSelectSize | EPotSelectSize[] | null;
    color?: EPotSelectColor | EPotSelectColor[] | null;
    radius?: EPotSelectRadius | EPotSelectRadius[] | null;

    devices?: EPotDevice[];
}

export interface IPotSelectEmits<OPTION, VALUE_FIELD extends keyof OPTION> {
    change: [value: TOptionValue<OPTION, VALUE_FIELD> | null, option: OPTION];
    'update:modelValue': [value: TOptionValue<OPTION, VALUE_FIELD> | null];
    changeText: [text: string];
    'update:text': [text: string];
}

/* --- Header --- */
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

/* --- Dropdown --- */
export interface IPotSelectDropdownProps {
    header: UnwrapRef<IPotSelectHeaderExpose> | null;

    opened?: boolean;

    className?: string;
    classList?: string[] | Record<string, boolean>;
    devices?: EPotDevice[];

    to?: string | RendererElement | null;
    position?: EAttachedBoxPosition | EAttachedBoxPosition[];
    nudge?: number | number[];
    edgeMargin?: number | number[];
    persistent?: boolean;
    noSticky?: boolean;
    closeOnMove?: boolean;
    transition?: string;
}

export interface IPotSelectDropdownEmits {
    close: [];
    open: [];
}

export interface IPotSelectDropdownExpose {
    element: Ref<HTMLElement | null>;
    marker: Ref<TDialogMarker | null>;
}
