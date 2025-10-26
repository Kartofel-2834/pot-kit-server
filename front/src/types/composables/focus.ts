export interface IFocusTrapInstance {
    id: symbol;
    target: Element;
    focusableChildren: HTMLElement[];
}

export type TFocusTrapAction = (trapInstance: IFocusTrapInstance, event: KeyboardEvent) => void;

export interface IFocusTrapControl {
    trapInstance: IFocusTrapInstance;
    next?: TFocusTrapAction;
    previous?: TFocusTrapAction;
}
