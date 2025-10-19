// Types
import type { ComputedRef, Ref } from 'vue';
import type { ISpec, ISpecsOptions, TOptionValue } from '@/types/composables/specs';

// Vue
import { computed } from 'vue';

export function useSpecs<OPTION, VALUE_FIELD extends keyof OPTION>(
    specOptions: Ref<ISpecsOptions<OPTION, VALUE_FIELD>>,
): ComputedRef<ISpec<OPTION, VALUE_FIELD>[]> {
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

    function checkIsVisible(option: OPTION): boolean {
        if (typeof specOptions.value.optionVisible === 'function') {
            return specOptions.value.optionVisible(option);
        }

        if (specOptions.value.optionVisible === undefined) {
            return true;
        }

        return Boolean(option[specOptions.value.optionVisible]);
    }

    return computed<ISpec<OPTION, VALUE_FIELD>[]>(() => {
        const filteredOptions = specOptions.value.options.filter(checkIsVisible);

        return filteredOptions.map(option => {
            const value = getValue(option);
            const label = getLabel(option);
            const disabled = checkIsDisabled(option);
            const selected = checkIsSelected(value);

            return {
                id: Symbol(label),
                option,
                value,
                label,
                disabled,
                selected,
            };
        });
    });
}
