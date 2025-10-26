// Types
import type { ComputedRef, Ref } from 'vue';
import type { ISpec, ISpecsOptions, TOptionValue } from '@/types/composables/specs';

// Vue
import { computed } from 'vue';

export function useSpecs<OPTION, VALUE_FIELD extends keyof OPTION, DATA = unknown>(
    specOptions: Ref<ISpecsOptions<OPTION, VALUE_FIELD, DATA>>,
): ComputedRef<ISpec<OPTION, VALUE_FIELD, DATA>[]> {
    function getLabel(option: OPTION): string {
        if (typeof specOptions.value.optionLabel === 'function') {
            return specOptions.value.optionLabel(option);
        }

        if (specOptions.value.optionLabel === undefined) {
            return String(option);
        }

        return String(option[specOptions.value.optionLabel]);
    }

    function getValue(option: OPTION): TOptionValue<OPTION, VALUE_FIELD> | null {
        if (typeof specOptions.value.optionValue === 'function') {
            return specOptions.value.optionValue(option);
        }

        if (['string', 'number', 'boolean'].includes(typeof option)) {
            return option as TOptionValue<OPTION, VALUE_FIELD>;
        }

        if (specOptions.value.optionValue === undefined) {
            return null;
        }

        const value = option[specOptions.value.optionValue] as TOptionValue<OPTION, VALUE_FIELD>;

        return value ?? null;
    }

    function getData(
        option: OPTION,
        value: TOptionValue<OPTION, VALUE_FIELD> | null,
        label: string,
    ): DATA | null {
        if (!specOptions.value.data) {
            return null;
        }

        return specOptions.value.data(option, value, label);
    }

    function checkIsDisabled(option: OPTION): boolean {
        if (typeof specOptions.value.optionDisabled === 'function') {
            return specOptions.value.optionDisabled(option);
        }

        if (specOptions.value.optionDisabled === undefined) {
            return false;
        }

        return Boolean(option[specOptions.value.optionDisabled]);
    }

    function checkIsSelected(specValue: TOptionValue<OPTION, VALUE_FIELD> | null): boolean {
        if (!Array.isArray(specOptions.value.values) || specValue === null) {
            return false;
        }

        return specOptions.value.values.includes(specValue);
    }

    return computed<ISpec<OPTION, VALUE_FIELD, DATA>[]>(() => {
        return specOptions.value.options.map(option => {
            const value = getValue(option);
            const label = getLabel(option);
            const data = getData(option, value, label);
            const disabled = checkIsDisabled(option);
            const selected = checkIsSelected(value);

            return {
                id: Symbol(label),
                option,
                value,
                label,
                disabled,
                selected,
                data,
            };
        });
    });
}
