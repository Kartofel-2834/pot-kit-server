// Types
import type { Ref } from 'vue';

export type TDeviceIsMediaQueries<TDevice extends string = string> = Partial<
    Record<TDevice, MediaQueryList>
>;

export type TDeviceIsState<TDevice extends string = string> = Partial<Record<TDevice, boolean>>;

export type TDeviceIs<TDevice extends string = string> = {
    /** Current statuses of all breakpoints */
    state: Ref<TDeviceIsState<TDevice>>;

    /** Current active breakpoint */
    device: Ref<TDevice | null>;
};

export type TDevicePropertyValue<T> = T extends unknown[] ? TDevicePropertyValue<T[number]> : T;

export type TDeviceProperties<T> = {
    [Property in keyof T]: TDevicePropertyValue<T[Property]>;
};
