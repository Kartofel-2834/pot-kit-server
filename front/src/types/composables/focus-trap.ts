import type { Ref } from 'vue';

export interface IFocusTrapOptions {
    trap: boolean;
    autofocus: boolean;
}

export interface IFocusTrap {
    /** Focusable child elements */
    focusableElements: Ref<HTMLElement[]>;

    /** Setup focus trap */
    setup: (target: Element, options?: Partial<IFocusTrapOptions>) => void;

    /** Terminate focus trap */
    terminate: () => void;

    /** Update target focusable child elements */
    update: () => void;
}
