// Types
import type { Ref } from 'vue';

export interface ISurroundingData {
    id: number;
    target: Element | Window;
    scrollY: number;
    scrollX: number;
    width: number;
    height: number;
}

export interface ISurrounding {
    /** Surrounding elements scroll and size info */
    data: Ref<ISurroundingData[]>;

    /** Remove surrounding elements conditions listeners */
    terminate: () => void;

    /** Add surrounding elements conditions listeners */
    setup: (element: Element) => void;
}
