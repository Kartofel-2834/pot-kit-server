// Types
import type { ComputedRef, MaybeRef } from 'vue';

// Vue
import { computed, unref } from 'vue';

export function useClassList(
    properties: MaybeRef<Record<string, unknown>>,
    prefix: MaybeRef<string> = '',
): ComputedRef<Record<string, boolean>> {
    return computed(() => {
        const data = unref(properties);
        const prefixValue = unref(prefix);

        if (!data && typeof data !== 'object') return {};

        return Object.entries(data).reduce((res, [property, value]) => {
            const key = [prefixValue, property, typeof value !== 'boolean' ? value : '']
                .filter(Boolean)
                .join('-');

            if (!value) return res;

            return { ...res, [`_${key}`]: Boolean(value) };
        }, {});
    });
}

export function useClassListArray(
    properties: MaybeRef<Record<string, unknown>>,
    prefix: MaybeRef<string> = '',
): ComputedRef<string[]> {
    return computed(() => {
        const data = unref(properties);
        const prefixValue = unref(prefix);

        if (!data && typeof data !== 'object') return [];

        const classList = Object.entries(data).reduce((res, [property, value]) => {
            const key = [prefixValue, property, typeof value !== 'boolean' ? value : '']
                .filter(Boolean)
                .join('-');

            if (!value) return res;

            return [...res, `_${key}`];
        }, [] as string[]);

        return [...new Set(classList.filter(Boolean))];
    });
}
