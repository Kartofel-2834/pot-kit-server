// Composables
import { useSubscriptions } from '@/composables/subscriptions';

export function useKeyboard(
    target: Window | Document | Element | null,
    handlers: Record<string, (event: KeyboardEvent) => void>,
    options?: boolean | AddEventListenerOptions,
): AbortController {
    const controller = new AbortController();

    if (!target) return controller;

    const $subscriptions = useSubscriptions();

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
        target,
        options,
        listener: event => {
            const key = event.key === ' ' ? 'space' : event.key;
            pressedKeys.add(key);
            const pressedCombo = [...pressedKeys].join('+');
            const matchedPattern = data.find(pattern => pattern.regex.test(pressedCombo));

            if (matchedPattern) {
                matchedPattern.action(event);
            }
        },
    });

    $subscriptions.addEventListener<KeyboardEvent>({
        eventName: 'keyup',
        target,
        options,
        listener: event => {
            const key = event.key === ' ' ? 'space' : event.key;
            pressedKeys.delete(key);
        },
    });

    controller.signal.addEventListener('abort', () => $subscriptions.clear());

    return controller;
}

export function useKeydown(
    event: KeyboardEvent,
    handlers: Record<string, (event: KeyboardEvent) => void>,
): boolean {
    const key = event.key === ' ' ? 'space' : event.key;

    for (const [pattern, handler] of Object.entries(handlers)) {
        const regex = mapPatternToRegex(pattern);

        if (regex.test(key)) {
            handler(event);
            return true;
        }
    }

    return false;
}

function mapPatternToRegex(pattern: string): RegExp {
    const escapedPattern = pattern
        .replace(/ctrl/gi, 'control')
        .replace(/\s/g, '')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return new RegExp(escapedPattern, 'i');
}
