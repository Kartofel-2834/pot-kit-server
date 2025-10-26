// Types
import type { IFocusTrapControl, IFocusTrapInstance } from '@/types/composables/focus';

// Vue
import { shallowRef, watch } from 'vue';

// Composables
import { useSubscriptions } from '@/composables/subscriptions';
import { useDebounce } from '@/composables/timer';

const $subscriptions = useSubscriptions();

const controlsList = shallowRef<IFocusTrapControl[]>([]);

watch(
    () => controlsList.value,
    () => {
        if (!controlsList.value.length) {
            $subscriptions.remove('focus-trap-keydown');
            return;
        }

        $subscriptions.addEventListener<KeyboardEvent>({
            key: 'focus-trap-keydown',
            target: window,
            eventName: 'keydown',
            options: { capture: true },
            listener: event => {
                const lastControlInstance = controlsList.value[controlsList.value.length - 1];
                if (!lastControlInstance) return;
                handleKeydown(lastControlInstance, event);
            },
        });
    },
);

function handleKeydown(controlInstance: IFocusTrapControl, event: KeyboardEvent) {
    if (event.key !== 'Tab') {
        return;
    }

    /** Shift + Tab */
    if (event.shiftKey && controlInstance.prevFocus) {
        controlInstance.prevFocus(controlInstance.trapInstance, event);
        return;
    }

    if (!event.shiftKey && controlInstance.nextFocus) {
        controlInstance.nextFocus(controlInstance.trapInstance, event);
        return;
    }
}

export function useFocusControl(
    element: Element,
    options: {
        nextFocus?: IFocusTrapControl['nextFocus'];
        prevFocus?: IFocusTrapControl['prevFocus'];
    },
): AbortController {
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
            const controlInstance: IFocusTrapControl = {
                trapInstance: instance,
                nextFocus: options.nextFocus,
                prevFocus: options.prevFocus,
            };

            mutationObserver.observe(element, {
                childList: true,
                subtree: true,
                attributeFilter: ['tabindex', 'disabled'],
            });

            controlsList.value = [
                ...controlsList.value.filter(v => v.trapInstance.id !== instance.id),
                controlInstance,
            ];
        },
        () => {
            mutationObserver.disconnect();
            controlsList.value = controlsList.value.filter(v => v.trapInstance.id !== instance.id);
        },
    );
}

export function useFocusTrap(element: Element): AbortController {
    (document.activeElement as HTMLElement)?.blur?.();

    return useFocusControl(element, {
        nextFocus: (trapInstance, event) => {
            const focusableElements = trapInstance.focusableChildren ?? [];
            const firstFocusableElement = focusableElements[0] ?? null;
            const lastFocusableElement = focusableElements[focusableElements.length - 1] ?? null;

            if (!firstFocusableElement || !lastFocusableElement) {
                event.preventDefault();
                return;
            }

            const isInTrap = focusableElements.includes(document.activeElement as HTMLElement);

            if (document.activeElement === lastFocusableElement || !isInTrap) {
                event.preventDefault();
                firstFocusableElement.focus();
            }
        },

        prevFocus: (trapInstance, event) => {
            const focusableElements = trapInstance.focusableChildren ?? [];
            const firstFocusableElement = focusableElements[0] ?? null;
            const lastFocusableElement = focusableElements[focusableElements.length - 1] ?? null;

            if (!firstFocusableElement || !lastFocusableElement) {
                event.preventDefault();
                return;
            }

            const isInTrap = focusableElements.includes(document.activeElement as HTMLElement);

            if (document.activeElement === firstFocusableElement || !isInTrap) {
                event.preventDefault();
                lastFocusableElement.focus();
            }
        },
    });
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
