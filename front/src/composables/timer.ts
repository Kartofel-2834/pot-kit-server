/** Get debounced listener */
export function useDebounce<T extends unknown[]>(options: {
    action: (...args: T) => void;
    immediateAction?: (...args: T) => void;
    delay: number;
}) {
    let timer: number | null = null;
    return (...args: T) => {
        if (options.immediateAction) {
            options.immediateAction(...args);
        }

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => options.action(...args), options.delay);
    };
}

/** Get throttled listener */
export function useThrottle<T extends unknown[]>(options: {
    action: (...args: T) => void;
    immediateAction?: (...args: T) => void;
    delay: number;
}) {
    let timer: number | null = null;
    return (...args: T) => {
        if (options.immediateAction) {
            options.immediateAction(...args);
        }

        if (timer) return;

        options.action(...args);
        timer = setTimeout(() => (timer = null), options.delay);
    };
}
