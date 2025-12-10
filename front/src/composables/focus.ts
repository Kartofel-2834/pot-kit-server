// Types
import type { MaybeRef, Ref } from 'vue';
import type { IFocusControlInstance, TFocusAction } from '@/types/composables/focus';

// Vue
import { readonly, ref, unref, watch } from 'vue';

// Composables
import {
    createAbortController,
    useComponentSubscriptions,
    useSubscriptions,
} from '@/composables/subscriptions';
import { useDebounce } from '@/composables/timer';
import { useKeyboardOutsideComponent } from '@/composables/keyboard';

const FOCUSABLE_ELEMENTS_SELECTOR = [
    '[tabindex]:not([disabled], [tabindex="-1"])',
    'a[href]:not([disabled], [tabindex="-1"])',
    'button:not([disabled], [tabindex="-1"])',
    'textarea:not([disabled], [tabindex="-1"])',
    'input:not([disabled], [tabindex="-1"])',
    'select:not([disabled], [tabindex="-1"])',
].join(', ');

const $focusSubscriptions = useSubscriptions();

const currentFocusControls = ref<symbol[]>([]);

const focusControlsInstances = new Map<symbol, IFocusControlInstance>();

/** Setup dialogs trigger listeners */
export function setup() {
    currentFocusControls.value = [];
    focusControlsInstances.clear();

    const unwatch = watch(
        () => currentFocusControls.value,
        controlsIds => {
            if (!controlsIds.length) {
                $focusSubscriptions.remove('focus');
                return;
            }

            const keyboardController = useKeyboardOutsideComponent({
                target: window,
                handlers: {
                    tab: event => {
                        const lastId =
                            currentFocusControls.value[currentFocusControls.value.length - 1];
                        const lastInstance = focusControlsInstances.get(lastId);

                        if (!lastInstance?.next) return;

                        lastInstance.next(
                            event,
                            lastInstance.target,
                            lastInstance.focusableChildren.value,
                        );
                    },
                    'shift + tab': event => {
                        const lastId =
                            currentFocusControls.value[currentFocusControls.value.length - 1];
                        const lastInstance = focusControlsInstances.get(lastId);

                        if (!lastInstance?.previous) return;

                        lastInstance.previous(
                            event,
                            lastInstance.target,
                            lastInstance.focusableChildren.value,
                        );
                    },
                },
            });

            $focusSubscriptions.add(
                () => keyboardController,
                controller => controller.abort(),
                'focus',
            );
        },
        {
            immediate: true,
        },
    );

    $focusSubscriptions.add(
        () => {
            currentFocusControls.value = [];
            focusControlsInstances.clear();
        },
        () => {
            unwatch();
            currentFocusControls.value = [];
            focusControlsInstances.clear();
        },
    );
}

/** Terminate dialogs trigger listeners */
export function terminate() {
    $focusSubscriptions.clear();
}

export function useFocusControl(options: {
    element: MaybeRef<Element | null>;
    next?: TFocusAction;
    previous?: TFocusAction;
}): AbortController {
    const $subscriptions = useComponentSubscriptions();
    const { focusableChildren, controller: childrenController } = useFocusableChildren(
        options.element,
    );

    const boxController = $subscriptions.bind(
        options.element,
        target => {
            const instance: IFocusControlInstance = {
                id: Symbol(),
                target,
                focusableChildren,
                next: options.next,
                previous: options.previous,
            };

            focusControlsInstances.set(instance.id, instance);
            currentFocusControls.value = Array.from(focusControlsInstances.keys());

            return instance.id;
        },
        instanceId => {
            focusControlsInstances.delete(instanceId);
            currentFocusControls.value = Array.from(focusControlsInstances.keys());
        },
    );

    return createAbortController(() => {
        boxController.abort();
        childrenController.abort();
    });
}

export function useFocusTrap(element: MaybeRef<Element | null>): AbortController {
    (document.activeElement as HTMLElement)?.blur?.();

    return useFocusControl({
        element,
        next: (event, target, focusableChildren) => {
            const firstFocusableElement = focusableChildren[0] ?? null;
            const lastFocusableElement = focusableChildren[focusableChildren.length - 1] ?? null;

            if (!firstFocusableElement || !lastFocusableElement) {
                event.preventDefault();
                return;
            }

            const isInTrap = focusableChildren.includes(document.activeElement as HTMLElement);

            if (document.activeElement === lastFocusableElement || !isInTrap) {
                event.preventDefault();
                firstFocusableElement.focus();
            }
        },
        previous: (event, target, focusableChildren) => {
            const firstFocusableElement = focusableChildren[0] ?? null;
            const lastFocusableElement = focusableChildren[focusableChildren.length - 1] ?? null;

            if (!firstFocusableElement || !lastFocusableElement) {
                event.preventDefault();
                return;
            }

            const isInTrap = focusableChildren.includes(document.activeElement as HTMLElement);

            if (document.activeElement === firstFocusableElement || !isInTrap) {
                event.preventDefault();
                lastFocusableElement.focus();
            }
        },
    });
}

export function useFocusBox(options: {
    element: MaybeRef<Element | null>;
    next?: TFocusAction;
    previous?: TFocusAction;
    enter?: TFocusAction;
    enterFromStart?: TFocusAction;
    enterFromEnd?: TFocusAction;
    leave?: TFocusAction;
    leaveFromStart?: TFocusAction;
    leaveFromEnd?: TFocusAction;
}): AbortController {
    return useFocusControl({
        element: options.element,
        next: (event, target, focusableChildren) => {
            const firstFocusableElement = focusableChildren[0];
            const lastFocusableElement = focusableChildren[focusableChildren.length - 1];
            const isInTrap = focusableChildren.includes(document.activeElement as HTMLElement);

            if (firstFocusableElement && document.activeElement === firstFocusableElement) {
                options.enter?.(event, target, focusableChildren);
                options.enterFromStart?.(event, target, focusableChildren);
            } else if (lastFocusableElement && document.activeElement === lastFocusableElement) {
                options.leave?.(event, target, focusableChildren);
                options.leaveFromEnd?.(event, target, focusableChildren);
            } else if (isInTrap) {
                options.next?.(event, target, focusableChildren);
            }
        },
        previous: (event, target, focusableChildren) => {
            const firstFocusableElement = focusableChildren[0];
            const lastFocusableElement = focusableChildren[focusableChildren.length - 1];
            const isInTrap = focusableChildren.includes(document.activeElement as HTMLElement);

            if (lastFocusableElement && document.activeElement === lastFocusableElement) {
                options.enter?.(event, target, focusableChildren);
                options.enterFromEnd?.(event, target, focusableChildren);
            } else if (firstFocusableElement && document.activeElement === firstFocusableElement) {
                options.leave?.(event, target, focusableChildren);
                options.leaveFromStart?.(event, target, focusableChildren);
            } else if (isInTrap) {
                options.previous?.(event, target, focusableChildren);
            }
        },
    });
}

export function useAutoFocus(
    element: MaybeRef<Element | null>,
    lastActiveElement?: MaybeRef<Element | null>,
): AbortController {
    const $subscriptions = useComponentSubscriptions();
    const { focusableChild, controller: childController } = useFirstFocusableChild(element);

    const autoFocusController = $subscriptions.bind(
        element,
        target => {
            const disposeElement = unref(lastActiveElement) ?? document.activeElement;
            focusableChild.value?.focus?.();
            return disposeElement;
        },
        disposeElement => {
            if (disposeElement instanceof HTMLElement) disposeElement.focus();
        },
    );

    return createAbortController(() => {
        autoFocusController.abort();
        childController.abort();
    });
}

export function useFirstFocusableChild(element: MaybeRef<Element | null>): {
    controller: AbortController;
    focusableChild: Readonly<Ref<HTMLElement | null>>;
} {
    const $subscriptions = useComponentSubscriptions();
    const mutationObserver = new MutationObserver(
        useDebounce({
            action: updateFocusableChild,
            delay: 100,
        }),
    );

    const focusableChild = ref<HTMLElement | null>(null);

    const unwatch = watch(() => unref(element), updateFocusableChild, { immediate: true });

    $subscriptions.observe({
        target: element,
        observer: mutationObserver,
        arguments: [
            {
                childList: true,
                subtree: true,
                attributeFilter: ['tabindex', 'disabled'],
            },
        ],
    });

    function updateFocusableChild() {
        const currentElement = unref(element);

        if (!currentElement) {
            return;
        }

        focusableChild.value = currentElement
            ? currentElement.querySelector(FOCUSABLE_ELEMENTS_SELECTOR)
            : null;
    }

    return {
        focusableChild: readonly(focusableChild) as Readonly<Ref<HTMLElement | null>>,
        controller: createAbortController(() => {
            unwatch();
            $subscriptions.clear();
        }),
    };
}

export function useFocusableChildren(element: MaybeRef<Element | null>): {
    controller: AbortController;
    focusableChildren: Readonly<Ref<HTMLElement[]>>;
} {
    const $subscriptions = useComponentSubscriptions();
    const mutationObserver = new MutationObserver(
        useDebounce({
            action: updateFocusableChildren,
            delay: 100,
        }),
    );

    const focusableChildren = ref<HTMLElement[]>([]);

    const unwatch = watch(() => unref(element), updateFocusableChildren, { immediate: true });

    $subscriptions.observe({
        target: element,
        observer: mutationObserver,
        arguments: [
            {
                childList: true,
                subtree: true,
                attributeFilter: ['tabindex', 'disabled'],
            },
        ],
    });

    function updateFocusableChildren() {
        const currentElement = unref(element);

        if (!currentElement) {
            focusableChildren.value = [];
            return;
        }

        const nodesList = currentElement.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);

        focusableChildren.value = Array.from(nodesList) as HTMLElement[];
    }

    return {
        focusableChildren: readonly(focusableChildren) as Readonly<Ref<HTMLElement[]>>,
        controller: createAbortController(() => {
            unwatch();
            $subscriptions.clear();
        }),
    };
}
