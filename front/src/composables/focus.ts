// Types
import type { IFocusTrapInstance } from '@/types/composables/focus';

// Vue
import { shallowRef, watch } from 'vue';

// Composables
import { useSubscriptions } from '@/composables/subscriptions';
import { useDebounce } from '@/composables/timer';

const $subscriptions = useSubscriptions();

const trapsList = shallowRef<IFocusTrapInstance[]>([]);

watch(
    () => trapsList.value,
    () => {
        if (!trapsList.value.length) {
            $subscriptions.remove('focus-trap-keydown');
            return;
        }

        $subscriptions.addEventListener<KeyboardEvent>({
            key: 'focus-trap-keydown',
            target: window,
            eventName: 'keydown',
            options: { capture: true },
            listener: event => {
                const lastTrap = trapsList.value[trapsList.value.length - 1];
                if (!lastTrap) return;
                handleKeydown(lastTrap, event);
            },
        });
    },
);

function handleKeydown(trapInstance: IFocusTrapInstance, event: KeyboardEvent) {
    const focusableElements = trapInstance.focusableChildren ?? [];
    const firstFocusableElement = focusableElements[0] ?? null;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] ?? null;

    const isInTrap = focusableElements.includes(document.activeElement as HTMLElement);

    if (event.key !== 'Tab') {
        return;
    }

    if (!firstFocusableElement || !lastFocusableElement) {
        event.preventDefault();
        return;
    }

    /** Shift + Tab */
    if (event.shiftKey && (document.activeElement === firstFocusableElement || !isInTrap)) {
        lastFocusableElement.focus();
        event.preventDefault();
        return;
    }

    /** Tab */
    if (!event.shiftKey && (document.activeElement === lastFocusableElement || !isInTrap)) {
        firstFocusableElement.focus();
        event.preventDefault();
        return;
    }
}

export function useFocusTrap(element: Element): AbortController {
    const instance: IFocusTrapInstance = {
        id: Symbol(),
        target: element,
        focusableChildren: useFocusableChildren(element),
    };

    const mutationObserver = new MutationObserver(
        useDebounce({
            action: () => (instance.focusableChildren = useFocusableChildren(element)),
            delay: 100,
        }),
    );

    return $subscriptions.add(
        () => {
            mutationObserver.observe(element, {
                childList: true,
                subtree: true,
                attributeFilter: ['tabindex', 'disabled'],
            });

            (document.activeElement as HTMLElement)?.blur?.();
            trapsList.value = [...trapsList.value.filter(v => v.id !== instance.id), instance];
        },
        () => {
            mutationObserver.disconnect();
            trapsList.value = trapsList.value.filter(v => v.id !== instance.id);
        },
    );
}

export function useAutoFocus(
    element: Element,
    lastActiveElement?: Element | null,
): AbortController {
    return $subscriptions.add(
        () => {
            const currentActiveElement = document.activeElement;
            useFirstFocusableChild(element)?.focus();
            return lastActiveElement ?? currentActiveElement;
        },
        element => {
            if (element instanceof HTMLElement) {
                element.focus();
            }
        },
    );
}

export function useFirstFocusableChild(element: Element): HTMLElement | null {
    return element.querySelector(
        '[tabindex]:not([disabled], [tabindex="-1"]), a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
    );
}

export function useFocusableChildren(element: Element): HTMLElement[] {
    const result = element.querySelectorAll(
        '[tabindex]:not([disabled], [tabindex="-1"]), a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
    );

    return Array.from(result) as HTMLElement[];
}
