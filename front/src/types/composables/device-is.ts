// Types
import type { ComputedRef, Ref } from 'vue';

export type TDeviceIsMediaQueries<TDevice extends string = string> = Partial<
    Record<TDevice, MediaQueryList>
>;

export type TDeviceIsState<TDevice extends string = string> = Partial<Record<TDevice, boolean>>;

export type TDeviceIs<TDevice extends string = string> = {
    /** Current statuses of all breakpoints */
    readonly state: Readonly<Ref<TDeviceIsState<TDevice>>>;

    /** Current active breakpoint */
    readonly device: Readonly<Ref<TDevice | null>>;
};

export type TDevicePropertyValue<T> = T extends unknown[] ? TDevicePropertyValue<T[number]> : T;

export type TDeviceProperties<T> = {
    readonly [Property in keyof T]: ComputedRef<TDevicePropertyValue<T[Property]>>;
};
