export interface IFocusTrapOptions {
    trap: boolean;
    autofocus: boolean;
}

export interface IFocusTrap {
    /** Setup focus trap */
    setup: (target: Element, options: Partial<IFocusTrapOptions>) => void;

    /** Terminate focus trap */
    terminate: () => void;

    /** Update target focusable child elements */
    update: () => void;
}
