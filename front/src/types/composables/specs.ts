// Types
import type { MaybeRef } from 'vue';

export type TOptionValue<OPTION, VALUE_FIELD extends keyof OPTION> = VALUE_FIELD extends never
    ? OPTION extends string | number | boolean
        ? OPTION
        : OPTION[keyof OPTION]
    : OPTION[VALUE_FIELD];

export interface ISpecsOptions<OPTION, VALUE_FIELD extends keyof OPTION = never, DATA = unknown> {
    values: MaybeRef<TOptionValue<OPTION, VALUE_FIELD>[]>;
    options: MaybeRef<OPTION[]>;
    data?: MaybeRef<
        (option: OPTION, value: TOptionValue<OPTION, VALUE_FIELD> | null, label: string) => DATA
    >;
    optionLabel?: MaybeRef<keyof OPTION | ((option: OPTION) => string)>;
    optionDisabled?: MaybeRef<keyof OPTION | ((option: OPTION) => boolean)>;
    optionValue?: MaybeRef<VALUE_FIELD | ((option: OPTION) => TOptionValue<OPTION, VALUE_FIELD>)>;
}

export interface ISpec<OPTION, VALUE_FIELD extends keyof OPTION, DATA = unknown> {
    id: symbol;
    option: OPTION;
    value: TOptionValue<OPTION, VALUE_FIELD> | null;
    label: string;
    disabled: boolean;
    selected: boolean;
    data: DATA | null;
}
