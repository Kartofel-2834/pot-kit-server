/** Разбивает строку на части по правилу camelCase */
export function splitCamelCase(str: string, separator: string): string {
    return str.replace(/[A-Z0-9]+(?![a-z])|[A-Z0-9]/g, (matchedChar, index) => {
        return (index ? separator : '') + matchedChar.toLowerCase();
    });
}
