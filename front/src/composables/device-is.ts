// Types
import type {
    TDeviceIs,
    TDeviceProperties,
    TDevicePropertyValue,
} from '@/types/composables/device-is';
import type { EPotDevice } from '@/types';

// Constants
import { ALL_DEVICES, ALL_DEVICES_REVERSED, POT_BREAKPOINT } from '@/types';

// Composables
import { useSubscriptions } from '@/composables/subscriptions';

// Vue
import { computed, ref } from 'vue';

const $subscriptions = useSubscriptions();

const emptyState: Record<EPotDevice, boolean> = Object.keys(POT_BREAKPOINT).reduce(
    (res, breakpoint) => {
        return { ...res, [breakpoint]: false };
    },
    {} as Record<EPotDevice, boolean>,
);

let queries: Map<EPotDevice, MediaQueryList> | null = null;

const device = ref<EPotDevice | null>(null);

const state = computed(() => {
    const data = { ...emptyState };

    if (device.value && ALL_DEVICES.includes(device.value)) {
        data[device.value] = true;
    }

    return data;
});

/** Handle media-query change event */
function handleQueryChange(event: MediaQueryListEvent, breakpoint: EPotDevice | null) {
    if (!event || !event.matches) return;

    device.value = breakpoint;
}

/** Create media-query for breakpoint */
function createQuery(
    currentBreakpoint: EPotDevice | null,
    nextBreakpoint: EPotDevice | null,
): MediaQueryList | null {
    const minWidth = currentBreakpoint ? POT_BREAKPOINT[currentBreakpoint] : NaN;
    const maxWidth = nextBreakpoint ? POT_BREAKPOINT[nextBreakpoint] : NaN;

    const minWidthQuery = isNaN(minWidth) ? '' : `(min-width: ${minWidth}px)`;
    const maxWidthQuery = isNaN(maxWidth) ? '' : `(max-width: ${maxWidth - 0.02}px)`;

    const query: string = [minWidthQuery, maxWidthQuery].filter(Boolean).join(' and ');

    if (!query.length) {
        return null;
    }

    const createdQuery: MediaQueryList = window.matchMedia(query);

    $subscriptions.addEventListener<MediaQueryListEvent>({
        target: createdQuery,
        eventName: 'change',
        listener: event => handleQueryChange(event, currentBreakpoint),
    });

    return createdQuery;
}

/** Get value for current breakpoint */
function getCurrentValue<T>(
    values: T[keyof T],
    currentDevice: EPotDevice | null,
    devices: EPotDevice[],
): TDevicePropertyValue<T[keyof T]> | null {
    if (!Array.isArray(values)) return values as TDevicePropertyValue<T[keyof T]>;

    if (!currentDevice) return values[0] ?? null;

    const deviceIndex = ALL_DEVICES_REVERSED.indexOf(currentDevice as EPotDevice);

    if (deviceIndex === -1) return null;

    for (let index = deviceIndex; index >= 0; index--) {
        const device = ALL_DEVICES_REVERSED[index];
        const nearestDeviceIndex = devices.indexOf(device);

        if (nearestDeviceIndex === -1) continue;

        const value = values[nearestDeviceIndex];

        if (value !== undefined) return value as TDevicePropertyValue<T[keyof T]>;
    }

    return null;
}

/** Terminate all media-queries listeners */
export function terminate() {
    if (!queries) return;

    $subscriptions.clear();

    queries = null;
    device.value = null;
}

/** Setup all based on breakpoints media-queries listeners */
export function setup() {
    if (!window?.matchMedia) {
        console.warn('[deviceIs/setup]: media query setup failed. widnow matchMedia not found');
        return;
    }

    terminate();

    const createdQueries = new Map<EPotDevice, MediaQueryList>();
    let currentDevice: EPotDevice | null = null;

    for (let index = 0; index < ALL_DEVICES.length; index++) {
        const breakpoint = ALL_DEVICES[index];
        const nextBreakpoint = ALL_DEVICES[index + 1] || null;

        const mediaQuery = createQuery(breakpoint, nextBreakpoint);

        if (!mediaQuery) continue;

        createdQueries.set(breakpoint, mediaQuery);
        currentDevice = !currentDevice && mediaQuery.matches ? breakpoint : currentDevice;
    }

    queries = createdQueries;
    device.value = currentDevice;
}

/** Composable for get current screen breakpoint */
export function useDeviceIs(): TDeviceIs<EPotDevice> {
    return { state, device };
}

/** Composable for getting values depending on screen breakpoints */
export function useDeviceProperties<T extends object>(
    properties: T,
    currentDevice: EPotDevice | null,
    devices?: EPotDevice[],
): TDeviceProperties<T> {
    const devicesList = devices ?? ALL_DEVICES_REVERSED;

    return Object.keys(properties).reduce((res, property) => {
        const values = properties[property as keyof T];

        return {
            ...res,
            [property]: getCurrentValue(values, currentDevice, devicesList),
        };
    }, {}) as TDeviceProperties<T>;
}
