// Types
import type { MaybeRef } from 'vue';

// Vue
import { unref } from 'vue';

/** Get debounced listener */
export function useDebounce<T extends unknown[]>(options: {
    action: (...args: T) => void;
    immediateAction?: (...args: T) => void;
    delay: MaybeRef<number>;
}) {
    let timer: number | null = null;
    return (...args: T) => {
        if (options.immediateAction) {
            options.immediateAction(...args);
        }

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => options.action(...args), unref(options.delay ?? 0));
    };
}

/** Get throttled listener */
export function useThrottle<T extends unknown[]>(options: {
    action: (...args: T) => void;
    immediateAction?: (...args: T) => void;
    delay: MaybeRef<number>;
}) {
    let timer: number | null = null;
    return (...args: T) => {
        if (options.immediateAction) {
            options.immediateAction(...args);
        }

        if (timer) return;

        options.action(...args);
        timer = setTimeout(() => (timer = null), unref(options.delay ?? 0));
    };
}
