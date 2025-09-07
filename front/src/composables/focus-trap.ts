// Types
import type {
    IFocusTrap,
    IFocusTrapInstance,
    IFocusTrapOptions,
} from '@/types/composables/focus-trap';

// Vue
import { ref } from 'vue';

// Composables
import { useDebounce } from '@/composables/timer';
import { useSubscriptions } from '@/composables/subscriptions';

const DEFAULT_OPTIONS: Readonly<IFocusTrapOptions> = {
    trap: true,
    autofocus: true,
};

const $subscriptions = useSubscriptions();

const trapsList: IFocusTrapInstance[] = [];

/** Composable for trapping focus inside container */
export function useFocusTrap(): IFocusTrap {
    const id = Symbol();
    const instance = ref<IFocusTrapInstance | null>(null);
    const mutationObserver = new MutationObserver(useDebounce({ action: update, delay: 100 }));

    function setup(target: Element, options: Partial<IFocusTrapOptions> = {}) {
        terminate();

        instance.value = {
            id,
            target,
            lastActiveElement: document.activeElement,
            options: { ...DEFAULT_OPTIONS, ...options },
            focusableElements: getFocusableElements(target),
        };

        trapsList.push(instance.value);

        $subscriptions.observe('mutation', target, mutationObserver, {
            childList: true,
            subtree: true,
            attributeFilter: ['tabindex', 'disabled'],
        });

        if (instance.value.options.trap || instance.value.options.autofocus) {
            const lastActiveElement = instance.value.lastActiveElement as HTMLElement;
            lastActiveElement?.blur?.();
        }

        if (instance.value.options.trap) {
            setupFocusTrap();
        }

        if (instance.value.options.autofocus) {
            setTimeout(focusFirst, 1);
        }
    }

    function terminate() {
        const lastActiveElement = instance.value?.lastActiveElement as HTMLElement;

        terminateFocusTrap();
        $subscriptions.remove('mutation');

        lastActiveElement?.focus?.();
        instance.value = null;
    }

    function setupFocusTrap() {
        if ($subscriptions.has('focus-trap')) return;

        $subscriptions.addEventListener<KeyboardEvent>({
            key: 'focus-trap',
            target: window,
            eventName: 'keydown',
            listener: event => {
                const lastTrap = trapsList[trapsList.length - 1];
                if (!lastTrap) return;
                handleKeydown(lastTrap, event);
            },
        });
    }

    function terminateFocusTrap() {
        if (!instance.value) return;

        const index = trapsList.indexOf(instance.value);

        if (index !== -1) trapsList.splice(index, 1);
        if (trapsList.length === 0) $subscriptions.remove('focus-trap');
    }

    function update() {
        if (!instance.value) return;

        instance.value = {
            ...instance.value,
            focusableElements: getFocusableElements(instance.value.target),
        };
    }

    function focusFirst() {
        if (!instance.value) return;

        const focusableElements = instance.value.focusableElements ?? [];
        focusableElements[0]?.focus?.();
    }

    function getFocusableElements(trap: Element): HTMLElement[] {
        const result = trap.querySelectorAll(
            '[tabindex]:not([disabled], [tabindex="-1"]), a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
        );

        return Array.from(result) as HTMLElement[];
    }

    function handleKeydown(trapInstance: IFocusTrapInstance, event: KeyboardEvent) {
        const focusableElements = trapInstance.focusableElements ?? [];
        const firstFocusableElement = focusableElements[0] ?? null;
        const lastFocusableElement = focusableElements[focusableElements.length - 1] ?? null;

        if (event.key !== 'Tab') {
            return;
        }

        if (!firstFocusableElement || !lastFocusableElement) {
            event.preventDefault();
            return;
        }

        /** Shift + Tab */
        if (event.shiftKey && document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
            return;
        }

        /** Tab */
        if (!event.shiftKey && document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
            return;
        }
    }

    return {
        trap: instance,
        setup,
        terminate,
        update,
    };
}
