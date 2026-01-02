// Node
import fs from 'node:fs/promises';
import path from 'node:path';

// Utils
import { splitCamelCase } from './utils/string-utils';

// Logger
import { logger } from './logger';

type TPotDependencies = {
    components: string[];
    composables: string[];
    types: string[];
};

const COMPONENTS_PATH = path.join(process.cwd(), 'front', 'src', 'components', 'ui');
const COMPOSABLES_PATH = path.join(process.cwd(), 'front', 'src', 'composables');
const TYPES_PATH = path.join(process.cwd(), 'front', 'src', 'types');

// Paths
const COMPONENTS_GLOBAL_PATH = `@\/components\/ui`;
const COMPOSABLES_GLOBAL_PATH = `@\/composables`;
const TYPES_GLOBAL_PATH = `@\/types`;

// Import from paths
const COMPONENTS_IMPORT_FROM_PATH = `${COMPONENTS_GLOBAL_PATH}(\/[a-zA-Z0-9\-\_\.\/]+)?`;
const COMPOSABLES_IMPORT_FROM_PATH = `${COMPOSABLES_GLOBAL_PATH}(\/[a-zA-Z0-9\-\_\.\/]+)?`;
const TYPES_IMPORT_FROM_PATH = `${TYPES_GLOBAL_PATH}(\/([a-zA-Z0-9\-\_\.\/]+)?)?`;

// Import paths regex
const COMPONENT_IMPORT_PATH_REGEX = new RegExp(COMPONENTS_IMPORT_FROM_PATH, 'g');
const COMPOSABLE_IMPORT_PATH_REGEX = new RegExp(COMPOSABLES_IMPORT_FROM_PATH, 'g');
const TYPE_IMPORT_PATH_REGEX = new RegExp(TYPES_IMPORT_FROM_PATH, 'g');

// Import regex
const COMPONENT_IMPORT_REGEX = new RegExp(
    `import (type )?(.|\n)+ from (('${COMPONENTS_IMPORT_FROM_PATH}')|("${COMPONENTS_IMPORT_FROM_PATH}"))`,
    'gm',
);

const COMPOSABLE_IMPORT_REGEX = new RegExp(
    `import (type )?(.|\n)+ from (('${COMPOSABLES_IMPORT_FROM_PATH}')|("${COMPOSABLES_IMPORT_FROM_PATH}"))`,
    'gm',
);

const TYPE_IMPORT_REGEX = new RegExp(
    `import (type )?(.|\n)+ from (('${TYPES_IMPORT_FROM_PATH}')|("${TYPES_IMPORT_FROM_PATH}"))`,
    'gm',
);

function getComponentName(fileName: string): string {
    return splitCamelCase(path.basename(fileName, '.vue'), '-').replace(/^pot-/, '');
}

function collectDeps(data: string): TPotDependencies {
    const componentsImportsList = [...data.matchAll(COMPONENT_IMPORT_REGEX)].map(v => v[0]);
    const composablesImportsList = [...data.matchAll(COMPOSABLE_IMPORT_REGEX)].map(v => v[0]);
    const typesImportsList = [...data.matchAll(TYPE_IMPORT_REGEX)].map(v => v[0]);

    const componentsMatch = componentsImportsList.map(v => v.match(COMPONENT_IMPORT_PATH_REGEX));
    const composablesMatch = composablesImportsList.map(v => v.match(COMPOSABLE_IMPORT_PATH_REGEX));
    const typesMatch = typesImportsList.map(v => v.match(TYPE_IMPORT_PATH_REGEX));

    let components = componentsMatch.filter(Array.isArray).flat(Infinity) as string[];
    let composables = composablesMatch.filter(Array.isArray).flat(Infinity) as string[];
    let types = typesMatch.filter(Array.isArray).flat(Infinity) as string[];

    const trimPath = (v: string) => {
        return v
            .split('/')
            .map(v => v.trim())
            .filter(Boolean)
            .join('/');
    };

    components = components
        .map(v => trimPath(v.replace(COMPONENTS_GLOBAL_PATH, '')))
        .map(v => getComponentName(v));

    types = types
        .map(v => trimPath(v.replace(TYPES_GLOBAL_PATH, '')))
        .map(v => (v.length ? v : 'index'));

    composables = composables.map(v => trimPath(v.replace(COMPOSABLES_GLOBAL_PATH, '')));

    components = [...new Set(components.filter(Boolean))];
    composables = [...new Set(composables.filter(Boolean))];
    types = [...new Set(types.filter(Boolean))];

    return {
        components,
        composables,
        types,
    };
}

async function collectComponentDeps(fileName: string): Promise<Record<string, TPotDependencies>> {
    const data = await fs.readFile(path.join(COMPONENTS_PATH, fileName), 'utf8');

    return {
        [getComponentName(fileName)]: collectDeps(data),
    };
}

async function collectComposableDeps(fileName: string): Promise<Record<string, TPotDependencies>> {
    const data = await fs.readFile(path.join(COMPOSABLES_PATH, fileName), 'utf8').catch(() => '');

    return {
        [path.basename(fileName, '.ts')]: collectDeps(data),
    };
}

async function collectTypeDeps(fileName: string): Promise<Record<string, TPotDependencies>> {
    const data = await fs.readFile(path.join(TYPES_PATH, fileName), 'utf8');
    const key = fileName.replaceAll('.ts', '').replaceAll('\\', '/');

    return {
        [key]: collectDeps(data),
    };
}

async function readdir(dirpath: string) {
    return fs.readdir(dirpath, { recursive: true }).then(list => {
        return list.filter(v => path.extname(v).length);
    });
}

async function collectAllDeps(): Promise<Record<string, Record<string, TPotDependencies>>> {
    const [allComponents, composables, types] = await Promise.all([
        readdir(COMPONENTS_PATH),
        readdir(COMPOSABLES_PATH),
        readdir(TYPES_PATH),
    ]);

    const components = allComponents.filter(v => /^Pot.+\.vue$/.test(v));

    const [componentsDeps, composablesDeps, typesDeps] = await Promise.all([
        Promise.all(components.map(v => collectComponentDeps(v))),
        Promise.all(composables.map(v => collectComposableDeps(v))),
        Promise.all(types.map(v => collectTypeDeps(v))),
    ]);

    return {
        components: componentsDeps.reduce((res, v) => ({ ...res, ...v }), {}),
        composables: composablesDeps.reduce((res, v) => ({ ...res, ...v }), {}),
        types: typesDeps.reduce((res, v) => ({ ...res, ...v }), {}),
    };
}

export async function writeDeps() {
    const dependencies = await collectAllDeps();
    const data = JSON.stringify(dependencies, null, 4);
    const filePath = path.join(process.cwd(), 'src', 'data', 'dependencies.json');

    return fs
        .writeFile(filePath, data)
        .then(() => {
            logger.success('Dependencies collected and successfully written');
        })
        .catch(err => {
            logger.error('Dependencies collection error', err as Error);
        });
}
