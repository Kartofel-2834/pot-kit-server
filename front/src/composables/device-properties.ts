// Types
import type {
    TDeviceProperties,
    TDevicePropertyValue,
} from '@/types/composables/device-properties';
import type { EPotDevice } from '@/types';

// Constants
import { ALL_DEVICES_REVERSED } from '@/types';

export function useDeviceProperties<T extends object>(
    properties: T,
    currentDevice: EPotDevice | null,
    devices?: EPotDevice[],
) {
    const devicesList = devices ?? ALL_DEVICES_REVERSED;

    return Object.keys(properties).reduce((res, property) => {
        const values = properties[property as keyof T];

        return {
            ...res,
            [property]: getCurrentValue(values, currentDevice, devicesList),
        };
    }, {}) as TDeviceProperties<T>;
}

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
