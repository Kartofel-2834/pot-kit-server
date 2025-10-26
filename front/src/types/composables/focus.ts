export interface IFocusTrapInstance {
    id: symbol;
    target: Element;
    focusableChildren: HTMLElement[];
}

export interface IFocusTrapControl {
    trapInstance: IFocusTrapInstance;
    nextFocus?: (trapInstance: IFocusTrapInstance, event: KeyboardEvent) => void;
    prevFocus?: (trapInstance: IFocusTrapInstance, event: KeyboardEvent) => void;
}
