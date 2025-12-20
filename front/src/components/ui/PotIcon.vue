<script lang="ts" setup>
// Types
import type { Component } from 'vue';
import type { EPotIconSize, IPotIconProps } from '@/types/components/icon';

// Vue
import { computed, defineAsyncComponent, toRef, unref } from 'vue';

// Composables
import { useDeviceProperties } from '@/composables/device-is';
import { useClassList } from '@/composables/class-list';

const props = defineProps<IPotIconProps>();

// Data
const iconsMap = new Map<string, () => Promise<{ default: Component }>>();
const iconsModules = import.meta.glob<{ default: Component }>('@/components/ui/icons/*.vue', {
    eager: false,
});

Object.keys(iconsModules).forEach(path => {
    const iconName = getIconName(path);
    if (!iconName) return;

    iconsMap.set(iconName, iconsModules[path] as () => Promise<{ default: Component }>);
});

// Computed
const iconComponent = computed<Component | null>(() => {
    const icon = unref($properties.icon);

    if (!icon) return null;

    const iconLoader = iconsMap.get(icon);

    if (!iconLoader) {
        console.warn(`Icon with name "${icon}" not found in components/ui/icons`);
        return null;
    }

    return defineAsyncComponent({
        loader: iconLoader,
        onError: error => console.warn(`Icon "${icon}" load error:`, error),
        delay: 0,
        timeout: 3000,
    });
});

const currentStyles = computed(() => {
    return {
        '--pot-icon-size-width': formatSize($properties.size.value),
    };
});

// Composables
const $properties = useDeviceProperties(
    {
        icon: toRef(() => props.icon),
        size: toRef(() => props.size),
    },
    toRef(() => props.devices),
);

const $classList = useClassList(
    {
        size: $properties.size,
    },
    'icon',
);

// Methods
function getIconName(path: string): string {
    const match = path.match(/\/([^/]+)\.vue$/);
    return splitCamelCase(match?.[1] ?? '', '-');
}

function splitCamelCase(str: string, separator: string) {
    return str.replace(/[A-Z0-9]+(?![a-z])|[A-Z0-9]/g, (matchedChar, index) => {
        return (index ? separator : '') + matchedChar.toLowerCase();
    });
}

function formatSize(size: EPotIconSize | number | null | undefined): string {
    return typeof size === 'number' && !isNaN(size) && isFinite(size) ? `${size}px` : '';
}
</script>

<template>
    <component
        v-if="iconComponent"
        :is="iconComponent"
        :class="['pot-icon', $classList]"
        :style="currentStyles"
    />
</template>

<style>
.pot-icon {
    /* --- PotIcon - Size --- */
    width: var(--pot-icon-size-width, 1em);
    height: var(--pot-icon-size-height, auto);
}
</style>
