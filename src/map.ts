// Node
import fs from 'node:fs/promises';
import path from 'node:path';

// Utils
import { multiReplace } from './utils/template-utils';
import { splitCamelCase } from './utils/string-utils';

// Logger
import { logger } from './logger';

// Dependencies collection
import { writeDeps } from './collect-dependencies';

const COMPONENTS_PATH = path.join(process.cwd(), 'front', 'src', 'components', 'ui');
const COMPOSABLES_PATH = path.join(process.cwd(), 'front', 'src', 'composables');
const TYPES_PATH = path.join(process.cwd(), 'front', 'src', 'types');

const COMPONENTS_REPLACEMENTS = {
    pot: '<%kebab%>',
    POT: '<%upper%>',
    Pot: '<%camel%>',
    '@/components/ui': '<%componentsImport%>',
    '@/types': '<%typesImport%>',
    '@/composables': '<%composablesImport%>',
};

const COMPOSABLES_REPLACEMENTS = {
    pot: '<%kebab%>',
    POT: '<%upper%>',
    Pot: '<%camel%>',
    '@/types': '<%typesImport%>',
    '@/composables': '<%composablesImport%>',
};

const TYPES_REPLACEMENTS = {
    pot: '<%kebab%>',
    POT: '<%upper%>',
    Pot: '<%camel%>',
    '@/types': '<%typesImport%>',
    '@/composables': '<%composablesImport%>',
};

const STYLES_MARKER_START = '<!-- Styles - START -->';
const STYLES_MARKER_END = '<!-- Styles - END -->';

async function mapComponent(fileName: string) {
    const componentName = path.basename(fileName, '.vue');
    const data = await fs.readFile(path.join(COMPONENTS_PATH, fileName), 'utf8');

    const clearedName = splitCamelCase(componentName, '-').replace(/^pot-/, '');

    const stylesMarkerStartIndex = data.indexOf(STYLES_MARKER_START);
    const stylesMarkerEndIndex = data.indexOf(STYLES_MARKER_END);

    let preparedData = data;

    if (stylesMarkerStartIndex !== -1 && stylesMarkerEndIndex !== -1) {
        preparedData =
            preparedData.slice(0, stylesMarkerStartIndex) +
            preparedData.slice(stylesMarkerEndIndex + STYLES_MARKER_END.length);
    }

    preparedData = multiReplace(preparedData, COMPONENTS_REPLACEMENTS);
    preparedData = preparedData.trim();

    await fs.writeFile(
        path.join(process.cwd(), 'src', 'data', 'components', `${clearedName}.txt`),
        preparedData,
    );
}

async function mapAllComponents() {
    try {
        const [dir] = await Promise.all([
            fs.readdir(COMPONENTS_PATH),
            fs.mkdir(path.join(process.cwd(), 'src', 'data', 'components'), { recursive: true }),
        ]);

        await Promise.all([dir.map(mapComponent)]);
        logger.success('Components successfully mapped');
    } catch (err) {
        logger.error('Components mapping error', err as Error);
    }
}

async function mapComposable(fileName: string) {
    const composableName = path.basename(fileName, '.ts');
    const data = await fs.readFile(path.join(COMPOSABLES_PATH, fileName), 'utf8');
    const preparedData = multiReplace(data, COMPOSABLES_REPLACEMENTS);

    await fs.writeFile(
        path.join(process.cwd(), 'src', 'data', 'composables', `${composableName}.txt`),
        preparedData,
    );
}

async function mapAllComposables() {
    try {
        const [dir] = await Promise.all([
            fs.readdir(COMPOSABLES_PATH),
            fs.mkdir(path.join(process.cwd(), 'src', 'data', 'composables'), { recursive: true }),
        ]);

        await Promise.all([dir.map(mapComposable)]);
        logger.success('Composables successfully mapped');
    } catch (err) {
        logger.error('Composables mapping error', err as Error);
    }
}

async function mapTypes(dirPath: string[] = []) {
    try {
        const list = await fs.readdir(path.join(TYPES_PATH, ...dirPath));

        await Promise.all(
            list.map(async fileName => {
                const extName = path.extname(fileName);

                if (extName !== '.ts') {
                    return mapTypes([...dirPath, fileName]);
                } else if (!dirPath.length) {
                    return;
                }

                const typeFileName = path.basename(fileName, '.ts');
                const data = await fs.readFile(path.join(TYPES_PATH, ...dirPath, fileName), 'utf8');
                const preparedData = multiReplace(data, TYPES_REPLACEMENTS);

                return fs.writeFile(
                    path.join(
                        process.cwd(),
                        'src',
                        'data',
                        'types',
                        ...dirPath,
                        `${typeFileName}.txt`,
                    ),
                    preparedData,
                );
            }),
        );

        if (!dirPath.length) logger.success('Types successfully mapped');
    } catch (err) {
        logger.error('Types mapping error', err as Error);
    }
}

async function init() {
    logger.time('Mapping duration');

    await Promise.all([mapAllComponents(), mapAllComposables(), mapTypes()]);

    await writeDeps();

    logger.timeEnd('Mapping duration');
}

init();
