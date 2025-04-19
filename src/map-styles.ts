import fs from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function cutData(data: string, dataKey: string): Record<string, string> {
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
            result[key] = condition.replace(endMarker, '');

            condition = '';
            key = '';
            endMarker = '';
        }
    }

    return result;
}

async function mapStylesToMap(dataKey: string, inputPath: string, outputPath: string) {
    try {
        const [dir] = await Promise.all([
            fs.readdir(inputPath),
            fs.mkdir(outputPath, { recursive: true }),
        ]);

        await Promise.all([
            dir.map(async fileName => {
                const componentName = path.basename(fileName, '.css');
                const data = await fs.readFile(path.join(inputPath, fileName), 'utf8');
                const stringifiedData = JSON.stringify(cutData(data, dataKey));

                await fs.writeFile(path.join(outputPath, `${componentName}.json`), stringifiedData);
            }),
        ]);
    } catch (err) {
        console.warn(`[POT-STYLES-COMBINER]:mapStylesToMap`, err);
    }
}

async function mapConditions() {
    const inputPath = path.join(__dirname, 'styles', 'conditions');
    const outputPath = path.join(__dirname, 'data', 'conditions');

    return mapStylesToMap('CONDITION', inputPath, outputPath);
}

async function mapConfigurations() {
    const inputPath = path.join(__dirname, 'styles', 'configuration');
    const outputPath = path.join(__dirname, 'data', 'configuration');

    return mapStylesToMap('CONFIGURATION', inputPath, outputPath);
}

async function init() {
    try {
        await Promise.all([mapConditions(), mapConfigurations()]);
        console.log('[POT-STYLES-COMBINER]:init styles combined');
    } catch (err) {
        console.log('[POT-STYLES-COMBINER]:init error', err);
    }
}

init();
