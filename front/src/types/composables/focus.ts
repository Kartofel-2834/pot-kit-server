import type { Ref } from 'vue';

export type TFocusAction = (
    event: KeyboardEvent,
    target: Element,
    focusableChildren: HTMLElement[],
) => void;

export interface IFocusControlInstance {
    id: symbol;
    target: Element;
    focusableChildren: Readonly<Ref<HTMLElement[]>>;
    next: TFocusAction | undefined;
    previous: TFocusAction | undefined;
}
