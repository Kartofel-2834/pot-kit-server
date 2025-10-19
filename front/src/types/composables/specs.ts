export type TOptionValue<OPTION, VALUE_FIELD extends keyof OPTION> = VALUE_FIELD extends never
    ? OPTION extends string | number | boolean
        ? OPTION
        : OPTION[keyof OPTION]
    : OPTION[VALUE_FIELD];

export interface ISpecsOptions<OPTION, VALUE_FIELD extends keyof OPTION = never> {
    values: TOptionValue<OPTION, VALUE_FIELD>[];
    options: OPTION[];
    optionLabel?: keyof OPTION | ((option: OPTION) => string);
    optionDisabled?: keyof OPTION | ((option: OPTION) => boolean);
    optionVisible?: keyof OPTION | ((option: OPTION) => boolean);
    optionValue?: VALUE_FIELD | ((option: OPTION) => TOptionValue<OPTION, VALUE_FIELD>);
}

export interface ISpec<OPTION, VALUE_FIELD extends keyof OPTION> {
    id: symbol;
    option: OPTION;
    value: TOptionValue<OPTION, VALUE_FIELD> | null;
    label: string;
    disabled: boolean;
    selected: boolean;
}
