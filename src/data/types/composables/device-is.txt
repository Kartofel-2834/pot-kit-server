// Types
import type { ComputedRef, Ref, UnwrapRef } from 'vue';

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

// export type TDevicePropertyValue<VALUE> = VALUE extends Ref
//     ? VALUE['value'] extends unknown[]
//         ? UnwrapRef<VALUE>[number]
//         : UnwrapRef<VALUE>
//     : VALUE extends unknown[]
//       ? VALUE[number]
//       : VALUE;

export type TDeviceValue<VALUE> = VALUE extends infer T | (infer T)[] ? T : null;

export type TDevicePropertyValue<VALUE> = VALUE extends Ref
    ? TDeviceValue<UnwrapRef<VALUE>>
    : TDeviceValue<VALUE>;

export type TDeviceProperties<PROPERTIES> = {
    readonly [Property in keyof PROPERTIES]: ComputedRef<
        TDevicePropertyValue<PROPERTIES[Property]>
    >;
};
