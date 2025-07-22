// Types
import type { IFocusTrap, IFocusTrapOptions } from '@/types/composables/focus-trap';

// Vue
import { ref } from 'vue';

// Composables
import { useDebounce } from '@/composables/timer';

const defaultOptions: IFocusTrapOptions = {
    trap: true,
    autofocus: true,
};

const listeners: Array<(event: Event) => void> = [];

function setupFocusTrap() {
    window.addEventListener('keydown', handleGlobalKeydown);
}

function terminateFocusTrap() {
    window.removeEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(event: Event) {
    const currentListener = listeners[listeners.length - 1];

    if (currentListener) {
        currentListener(event);
    }
}

/** Composable for trapping focus inside container */
export function useFocusTrap(): IFocusTrap {
    const focusableElements = ref<HTMLElement[]>([]);

    const mutationObserver = new MutationObserver(
        useDebounce({
            action: update,
            delay: 100,
        }),
    );

    let trap: Element | null = null;
    let lastActiveElement: HTMLElement | null = null;

    function setup(target: Element, options: Partial<IFocusTrapOptions> = {}) {
        const currentOptions = { ...defaultOptions, ...options };

        trap = target;
        update();
        mutationObserver.observe(trap, {
            childList: true,
            subtree: true,
            attributeFilter: ['tabindex', 'disabled'],
        });

        if (!currentOptions.trap && !currentOptions.autofocus) {
            return;
        }

        blurLastActiveElement();

        if (currentOptions.trap) {
            listeners.push(handleKeydown);
            if (listeners.length === 1) setupFocusTrap();
        }

        if (currentOptions.autofocus) {
            setTimeout(focusFirst, 1);
        }
    }

    function terminate() {
        if (!trap) {
            return;
        }

        const listenerIndex = listeners.indexOf(handleKeydown);

        if (listenerIndex !== -1) listeners.splice(listenerIndex, 1);
        if (listeners.length === 0) terminateFocusTrap();

        mutationObserver.disconnect();
        focusLastActiveElement();
    }

    function update() {
        if (!trap) return;

        focusableElements.value = getFocusableElements(trap);
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
        focusableElements.value?.[0]?.focus?.();
    }

    function getFocusableElements(trap: Element): HTMLElement[] {
        const result = trap.querySelectorAll(
            '[tabindex]:not([disabled], [tabindex="-1"]), a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
        );

        return Array.from(result) as HTMLElement[];
    }

    function handleKeydown(event: Event) {
        const keyBoardEvent = event as KeyboardEvent;
        const firstFocusableElement = focusableElements.value[0] ?? null;
        const lastFocusableElement =
            focusableElements.value[focusableElements.value.length - 1] ?? null;

        if (keyBoardEvent.key !== 'Tab') {
            return;
        }

        if (!firstFocusableElement || !lastFocusableElement) {
            event.preventDefault();
            return;
        }

        /** Shift + Tab */
        if (keyBoardEvent.shiftKey && document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
            return;
        }

        /** Tab */
        if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
            return;
        }
    }

    return {
        focusableElements,
        setup,
        terminate,
        update,
    };
}
