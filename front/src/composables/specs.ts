// Types
import type { ComputedRef, Ref } from 'vue';
import type { ISpec, ISpecsOptions, TOptionValue } from '@/types/composables/specs';

// Vue
import { computed, unref } from 'vue';

export function useSpecs<OPTION, VALUE_FIELD extends keyof OPTION, DATA = unknown>(
    specOptions: ISpecsOptions<OPTION, VALUE_FIELD, DATA>,
): ComputedRef<ISpec<OPTION, VALUE_FIELD, DATA>[]> {
    function getLabel(option: OPTION): string {
        const optionLabel = unref(specOptions.optionLabel);

        if (typeof optionLabel === 'function') {
            return optionLabel(option);
        }

        if (optionLabel === undefined) {
            return String(option);
        }

        return String(option[optionLabel]);
    }

    function getValue(option: OPTION): TOptionValue<OPTION, VALUE_FIELD> | null {
        const optionValue = unref(specOptions.optionValue);

        if (typeof optionValue === 'function') {
            return optionValue(option);
        }

        if (['string', 'number', 'boolean'].includes(typeof option)) {
            return option as TOptionValue<OPTION, VALUE_FIELD>;
        }

        if (optionValue === undefined) {
            return null;
        }

        const value = option[optionValue] as TOptionValue<OPTION, VALUE_FIELD>;

        return value ?? null;
    }

    function getData(
        option: OPTION,
        value: TOptionValue<OPTION, VALUE_FIELD> | null,
        label: string,
    ): DATA | null {
        const data = unref(specOptions.data);
        return data ? data(option, value, label) : null;
    }

    function checkIsDisabled(option: OPTION): boolean {
        const optionDisabled = unref(specOptions.optionDisabled);

        if (typeof optionDisabled === 'function') {
            return optionDisabled(option);
        }

        if (optionDisabled === undefined) {
            return false;
        }

        return Boolean(option[optionDisabled]);
    }

    function checkIsSelected(specValue: TOptionValue<OPTION, VALUE_FIELD> | null): boolean {
        const values = unref(specOptions.values);

        if (!Array.isArray(values) || specValue === null) {
            return false;
        }

        return values.includes(specValue);
    }

    const optionsAndIds = computed<Array<[symbol, OPTION]>>(() => {
        return unref(specOptions.options).map(option => [Symbol(), option]);
    });

    return computed<ISpec<OPTION, VALUE_FIELD, DATA>[]>(() => {
        return optionsAndIds.value.map(([id, option]) => {
            const value = getValue(option);
            const label = getLabel(option);
            const data = getData(option, value, label);
            const disabled = checkIsDisabled(option);
            const selected = checkIsSelected(value);

            return {
                id,
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
