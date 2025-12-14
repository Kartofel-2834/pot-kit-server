import type {
    Ref,
    RendererElement,
    ShallowRef,
    ShallowUnwrapRef,
    TemplateRef,
    UnwrapRef,
} from 'vue';
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
    classList?: Record<string, boolean>;
    text?: string;
    editable?: boolean;
    fluid?: boolean;
    placeholder?: string;
    devices?: EPotDevice[];
}

export interface IPotSelectHeaderEmits {
    click: [];
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
export interface IPotSelectDropdownProps<OPTION, VALUE_FIELD extends keyof OPTION> {
    header: UnwrapRef<IPotSelectHeaderExpose> | null;
    specs: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>[];

    opened?: boolean;

    classList?: Record<string, boolean>;
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

export interface IPotSelectDropdownEmits<OPTION, VALUE_FIELD extends keyof OPTION> {
    select: [spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>];
    open: [];
    close: [];
}

/* --- Option --- */
export interface IPotSelectOptionProps<OPTION, VALUE_FIELD extends keyof OPTION> {
    spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>;
}

export interface IPotSelectOptionEmits<OPTION, VALUE_FIELD extends keyof OPTION> {
    select: [spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>];
}
