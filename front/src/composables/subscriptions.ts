// Types
import type {
    IEventListenerTarget,
    IObserver,
    ISubscriptions,
} from '@/types/composables/subscriptions';

export function useSubscriptions<EVENT_KEY = unknown>(): ISubscriptions<EVENT_KEY> {
    const subscriptions: Map<unknown, AbortController> = new Map();

    function observe<T, U extends unknown[]>(
        key: EVENT_KEY,
        target: T,
        observer: IObserver<T, U>,
        ...args: U
    ): AbortController {
        return add(
            () => observer.observe(target, ...args),
            () => {
                if (observer.unobserve) {
                    observer.unobserve(target);
                } else if (observer.disconnect) {
                    observer.disconnect();
                }
            },
            key,
        );
    }

    function addEventListener<EVENT>(data: {
        eventName: string;
        target: IEventListenerTarget<EVENT>;
        listener: (event: EVENT) => unknown;
        key?: EVENT_KEY;
        options?: boolean | AddEventListenerOptions;
    }): AbortController {
        return add(
            () => data.target.addEventListener(data.eventName, data.listener, data.options),
            () => data.target.removeEventListener(data.eventName, data.listener, data.options),
            data.key,
        );
    }

    function add<T>(
        subscribe: () => T,
        dispose: (data: T) => void,
        key?: EVENT_KEY,
    ): AbortController {
        const currentKey = key ?? Symbol();

        if (key !== undefined && subscriptions.has(key)) {
            remove(key);
        }

        const controller = new AbortController();
        const disposeData = subscribe();

        subscriptions.set(currentKey, controller);

        function abort() {
            controller.signal.removeEventListener('abort', abort);
            dispose(disposeData);
            subscriptions.delete(currentKey);
        }

        controller.signal.addEventListener('abort', abort);

        return controller;
    }

    function remove(key: EVENT_KEY) {
        subscriptions.get(key)?.abort();
    }

    function clear() {
        subscriptions.forEach(controller => controller.abort());
    }

    function has(key: EVENT_KEY): boolean {
        return subscriptions.has(key);
    }

    return {
        has,
        add,
        addEventListener,
        observe,
        remove,
        clear,
    };
}
