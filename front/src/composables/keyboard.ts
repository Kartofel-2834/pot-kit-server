// Types
import { onUnmounted, type MaybeRef } from 'vue';

// Composables
import { createAbortController, useSubscriptions } from '@/composables/subscriptions';

export function useKeyboard(options: {
    target: MaybeRef<Window | Document | Element | null>;
    keydown?: (event: KeyboardEvent) => void;
    keyup?: (event: KeyboardEvent) => void;
    handlers?: Record<string, (event: KeyboardEvent) => void>;
    options?: MaybeRef<boolean | AddEventListenerOptions>;
}): AbortController {
    const controller = useKeyboardOutsideComponent(options);

    onUnmounted(() => controller.abort());

    return controller;
}

export function useKeyboardOutsideComponent(options: {
    target: MaybeRef<Window | Document | Element | null>;
    keydown?: (event: KeyboardEvent) => void;
    keyup?: (event: KeyboardEvent) => void;
    handlers?: Record<string, (event: KeyboardEvent) => void>;
    options?: MaybeRef<boolean | AddEventListenerOptions>;
}): AbortController {
    const $subscriptions = useSubscriptions();

    const handlers = options.handlers ?? {};
    const keydown = options.keydown ?? (() => {});
    const keyup = options.keyup ?? (() => {});

    const pressedKeys = new Set();
    const data = Object.keys(handlers)
        .map(stringPattern => ({
            keysCount: [...stringPattern.matchAll(/\+/g)].length + 1,
            action: handlers[stringPattern],
            regex: mapPatternToRegex(stringPattern),
        }))
        .sort((a, b) => b.keysCount - a.keysCount);

    $subscriptions.addEventListener<KeyboardEvent>({
        eventName: 'keydown',
        target: options.target,
        options: options.options,
        listener: event => {
            keydown(event);

            const key = event.key === ' ' ? 'space' : event.key;
            pressedKeys.add(key);
            const pressedCombo = [...pressedKeys].join('+');
            const matchedPattern = data.find(pattern => pattern.regex.test(pressedCombo));

            if (matchedPattern) matchedPattern.action(event);
        },
    });

    $subscriptions.addEventListener<KeyboardEvent>({
        eventName: 'keyup',
        target: options.target,
        options: options.options,
        listener: event => {
            keyup(event);

            const key = event.key === ' ' ? 'space' : event.key;
            pressedKeys.delete(key);
        },
    });

    return createAbortController(() => $subscriptions.clear());
}

function mapPatternToRegex(pattern: string): RegExp {
    const escapedPattern = pattern
        .replace(/ctrl/gi, 'control')
        .replace(/\s/g, '')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return new RegExp(escapedPattern, 'i');
}
