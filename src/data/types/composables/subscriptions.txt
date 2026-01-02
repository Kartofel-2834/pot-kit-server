// Types
import type { MaybeRef } from 'vue';

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

export interface IObserverSubscriptionOptions<EVENT_KEY, TARGET, ARGUMENTS extends unknown[]> {
    target: MaybeRef<TARGET | null>;
    observer: MaybeRef<IObserver<TARGET, ARGUMENTS> | null>;
    arguments?: MaybeRef<ARGUMENTS>;
    key?: EVENT_KEY;
}

export interface IEventListenerSubscriptionOptions<EVENT_KEY, EVENT> {
    eventName: MaybeRef<string>;
    target: MaybeRef<IEventListenerTarget<EVENT> | null>;
    listener: MaybeRef<(event: EVENT) => unknown>;
    options?: MaybeRef<boolean | AddEventListenerOptions>;
    key?: EVENT_KEY;
}

export interface ISubscriptions<EVENT_KEY = unknown> {
    has(key: EVENT_KEY): boolean;

    add<SUBSCRIPTION>(
        subscribe: () => SUBSCRIPTION,
        dispose: (data: SUBSCRIPTION) => void,
        key?: EVENT_KEY,
    ): AbortController;

    bind<TARGET, DISPOSE_DATA>(
        target: MaybeRef<TARGET | null>,
        subscribe: (target: TARGET) => DISPOSE_DATA,
        dispose: (data: DISPOSE_DATA) => void,
        key?: EVENT_KEY,
    ): AbortController;

    addEventListener<EVENT>(
        options: IEventListenerSubscriptionOptions<EVENT_KEY, EVENT>,
    ): AbortController;

    observe<TARGET, ARGUMENTS extends unknown[]>(
        options: IObserverSubscriptionOptions<EVENT_KEY, TARGET, ARGUMENTS>,
    ): AbortController;

    remove(key: EVENT_KEY): void;

    clear(): void;
}
