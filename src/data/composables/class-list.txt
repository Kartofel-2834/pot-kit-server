export function useClassList(properties: Record<string, unknown>): Record<string, boolean> {
    if (!properties && typeof properties !== 'object') return {};

    return Object.entries(properties).reduce((res, [property, value]) => {
        let key = `_${property}`;
        key += typeof value !== 'boolean' ? `-${value}` : '';

        return { ...res, [key]: Boolean(value) };
    }, {});
}

export function useClassListArray(properties: Record<string, unknown>): string[] {
    if (!properties && typeof properties !== 'object') return [];

    const classList = Object.entries(properties).reduce((res, [property, value]) => {
        let key = `_${property}`;
        key += typeof value !== 'boolean' ? `-${value}` : '';

        if (!value) return res;

        return [...res, key];
    }, [] as string[]);

    return [...new Set(classList.filter(Boolean))];
}
