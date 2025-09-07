import type { Ref } from 'vue';

export interface IFocusTrapOptions {
    trap: boolean;
    autofocus: boolean;
}

export interface IFocusTrapInstance {
    id: symbol;
    target: Element;
    lastActiveElement: Element | null;
    options: IFocusTrapOptions;
    focusableElements: HTMLElement[];
}

export interface IFocusTrap {
    /** Focusable child elements */
    trap: Ref<IFocusTrapInstance | null>;

    /** Setup focus trap */
    setup: (target: Element, options?: Partial<IFocusTrapOptions>) => void;

    /** Terminate focus trap */
    terminate: () => void;

    /** Update target focusable child elements */
    update: () => void;
}
