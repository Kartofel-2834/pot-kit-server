export function useClassList(properties: Record<string, unknown>): Record<string, boolean> {
    if (!properties && typeof properties !== 'object') return {};

    return Object.entries(properties).reduce((res, [property, value]) => {
        let key = `_${property}`;
        key += typeof value !== 'boolean' ? `-${value}` : '';

        return { ...res, [key]: Boolean(value) };
    }, {});
}
