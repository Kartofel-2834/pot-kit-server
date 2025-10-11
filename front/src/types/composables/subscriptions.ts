export interface ISubscriptions<EVENT_KEY = unknown> {
    has(key: EVENT_KEY): boolean;

    add<SUBSCRIPTION>(
        subscribe: () => SUBSCRIPTION,
        dispose: (data: SUBSCRIPTION) => void,
        key?: EVENT_KEY,
    ): AbortController;

    addEventListener<EVENT>(data: {
        eventName: string;
        target: IEventListenerTarget<EVENT>;
        listener: (event: EVENT) => unknown;
        key?: EVENT_KEY;
        options?: boolean | AddEventListenerOptions;
    }): AbortController;

    observe<T, U extends unknown[]>(
        key: EVENT_KEY,
        target: T,
        observer: IObserver<T, U>,
        ...args: U
    ): AbortController;

    remove(key: EVENT_KEY): void;

    clear(): void;
}

export interface IObserver<T, U extends unknown[] = []> {
    observe: (target: T, ...args: U) => void;
    unobserve?: (target: T) => void;
    disconnect?: () => void;
}

export interface IEventListenerTarget<EVENT> {
    addEventListener(
        eventName: string,
        listener: (event: EVENT) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener(
        eventName: string,
        listener: (event: EVENT) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void;
}
