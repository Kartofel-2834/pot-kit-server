export function cutData(data: string, dataKey: string): Record<string, string> {
    const result: Record<string, string> = {};

    let condition = '';
    let key = '';
    let endMarker = '';

    const startRegex = new RegExp(`/\\* ${dataKey}:[a-zA-Z]+ - START \\*/`);

    for (let char of data) {
        condition += char;

        if (startRegex.test(condition)) {
            const startIndex = condition.indexOf(`${dataKey}:`);
            const endIndex = condition.indexOf(' - START');

            key = condition.slice(startIndex + dataKey.length + 1, endIndex);
            endMarker = `\/\* ${dataKey}:${key} - END \*\/`;
            condition = '';
        }

        if (endMarker && condition.includes(endMarker)) {
            condition = condition;
            result[key] = condition.replace(endMarker, '').trim();

            condition = '';
            key = '';
            endMarker = '';
        }
    }

    return result;
}

export function multiReplace(data: string, keys: Record<string, string>) {
    return Object.entries(keys).reduce((res, [key, value]) => res.replaceAll(key, value), data);
}
