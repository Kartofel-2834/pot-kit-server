<script lang="ts" setup>
// Types
import type { Component } from 'vue';
import type { IPotIconProps } from '@/types/components/icon';

// Vue
import { computed, defineAsyncComponent } from 'vue';

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
    if (!props.icon) {
        return null;
    }

    const iconLoader = iconsMap.get(props.icon);

    if (!iconLoader) {
        console.warn(`Icon with name "${props.icon}" not found in components/ui/icons`);
        return null;
    }

    return defineAsyncComponent({
        loader: iconLoader,
        onError: error => {
            console.warn(`Icon "${props.icon}" load error:`, error);
        },
        delay: 0,
        timeout: 3000,
    });
});

// Methods
function getIconName(path: string): string {
    const match = path.match(/\/([^/]+)\.vue$/);
    return match ? match[1] : '';
}
</script>

<template>
    <component
        v-if="iconComponent"
        :is="iconComponent"
        class="pot-icon"
    />
</template>
