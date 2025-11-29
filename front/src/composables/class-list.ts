// Types
import type { ComputedRef, MaybeRef } from 'vue';

// Vue
import { computed, unref } from 'vue';

export function useClassList(
    properties: Record<string, MaybeRef<unknown>>,
    prefix: MaybeRef<string> = '',
): ComputedRef<Record<string, boolean>> {
    return computed(() => {
        if (!properties && typeof properties !== 'object') return [];

        const prefixValue = unref(prefix);

        return Object.entries(properties).reduce((res, [property, initialValue]) => {
            const value = unref(initialValue);
            const key = [prefixValue, property, typeof value !== 'boolean' ? value : '']
                .filter(Boolean)
                .join('-');

            if (!value) return res;

            return { ...res, [`_${key}`]: Boolean(value) };
        }, {});
    });
}

export function useClassListArray(
    properties: Record<string, MaybeRef<unknown>>,
    prefix: MaybeRef<string> = '',
): ComputedRef<string[]> {
    return computed(() => {
        if (!properties && typeof properties !== 'object') return [];

        const prefixValue = unref(prefix);

        const classList = Object.entries(properties).reduce((res, [property, initialValue]) => {
            const value = unref(initialValue);
            const key = [prefixValue, property, typeof value !== 'boolean' ? value : '']
                .filter(Boolean)
                .join('-');

            if (!value) return res;

            return [...res, `_${key}`];
        }, [] as string[]);

        return [...new Set(classList.filter(Boolean))];
    });
}
