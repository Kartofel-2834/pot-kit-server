// Types
import type { IFocusTrap, IFocusTrapOptions } from '@/types/composables/focus-trap';

// Composables
import { useDebounce } from '@/composables/timer';

const defaultOptions: IFocusTrapOptions = {
    trap: true,
    autofocus: true,
};

/** Composable for trapping focus inside container */
export function useFocusTrap(): IFocusTrap {
    const mutationObserver = new MutationObserver(
        useDebounce({
            action: update,
            delay: 100,
        }),
    );

    let trap: Element | null = null;
    let lastActiveElement: HTMLElement | null = null;
    let firstFocusableElement: HTMLElement | null = null;
    let lastFocusableElement: HTMLElement | null = null;

    function setup(target: Element, options: Partial<IFocusTrapOptions>) {
        const currentOptions = { ...defaultOptions, ...options };

        if (!currentOptions.trap && !currentOptions.autofocus) {
            return;
        }

        trap = target;
        blurLastActiveElement();
        update();
        mutationObserver.observe(trap, {
            childList: true,
            subtree: true,
            attributeFilter: ['tabindex', 'disabled'],
        });

        if (currentOptions.trap) {
            trap.addEventListener('keydown', handleKeydown);
        }

        if (currentOptions.autofocus) {
            focusFirst();
        }
    }

    function terminate() {
        if (!trap) {
            return;
        }

        trap.removeEventListener('keydown', handleKeydown);
        mutationObserver.disconnect();
        focusLastActiveElement();
    }

    function update() {
        if (!trap) {
            return;
        }

        const focusableElements = getFocusableElements(trap);
        firstFocusableElement = focusableElements[0] ?? null;
        lastFocusableElement = focusableElements[focusableElements.length - 1] ?? null;
    }

    function blurLastActiveElement() {
        lastActiveElement = document.activeElement as HTMLElement;
        lastActiveElement?.blur?.();
    }

    function focusLastActiveElement() {
        lastActiveElement?.focus?.();
        lastActiveElement = null;
    }

    function focusFirst() {
        firstFocusableElement?.focus?.();
    }

    function getFocusableElements(trap: Element): NodeListOf<HTMLElement> {
        return trap.querySelectorAll(
            '[tabindex]:not([disabled], [tabindex="-1"]) a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
        );
    }

    function handleKeydown(event: Event) {
        const keyBoardEvent = event as KeyboardEvent;

        if (keyBoardEvent.key !== 'Tab' || !firstFocusableElement || !lastFocusableElement) {
            return;
        }

        /** Shift + Tab */
        if (keyBoardEvent.shiftKey && document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
            return;
        }

        if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
            return;
        }
    }

    return {
        setup,
        terminate,
        update,
    };
}
