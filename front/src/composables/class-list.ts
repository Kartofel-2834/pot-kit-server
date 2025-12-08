// Types
import type { ComputedRef, MaybeRef } from 'vue';

// Vue
import { computed, unref } from 'vue';

export function useClassList(
    properties: Record<string, MaybeRef<unknown>>,
    base: MaybeRef<string>,
): ComputedRef<Record<string, boolean>> {
    return computed(() => {
        if (!properties && typeof properties !== 'object') return {};

        const baseValue = unref(base);

        return Object.entries(properties).reduce(
            (res, [property, initialValue]) => {
                const value = unref(initialValue);
                const key = [property, typeof value !== 'boolean' ? value : '']
                    .filter(Boolean)
                    .join('-');

                if (!value) return res;

                return { ...res, [`${baseValue}_${key}`]: Boolean(value) };
            },
            { [baseValue]: true } as Record<string, boolean>,
        );
    });
}

export function useClassListArray(
    properties: Record<string, MaybeRef<unknown>>,
    base: MaybeRef<string>,
): ComputedRef<string[]> {
    return computed(() => {
        if (!properties && typeof properties !== 'object') return [];

        const baseValue = unref(base);

        const classList = Object.entries(properties).reduce(
            (res, [property, initialValue]) => {
                const value = unref(initialValue);
                const key = [property, typeof value !== 'boolean' ? value : '']
                    .filter(Boolean)
                    .join('-');

                if (!value) return res;

                return [...res, `${baseValue}_${key}`];
            },
            [baseValue] as string[],
        );

        return [...new Set(classList.filter(Boolean))];
    });
}
