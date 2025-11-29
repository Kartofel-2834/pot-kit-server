// Types
import type { ComputedRef, MaybeRef, Ref } from 'vue';

export const ATTACHED_BOX_POSITION = {
    TOP_START: 'top-start',
    TOP_END: 'top-end',
    TOP_CENTER: 'top-center',

    BOTTOM_START: 'bottom-start',
    BOTTOM_END: 'bottom-end',
    BOTTOM_CENTER: 'bottom-center',

    LEFT_START: 'left-start',
    LEFT_END: 'left-end',
    LEFT_CENTER: 'left-center',

    RIGHT_START: 'right-start',
    RIGHT_END: 'right-end',
    RIGHT_CENTER: 'right-center',
} as const;

export type EAttachedBoxPosition =
    (typeof ATTACHED_BOX_POSITION)[keyof typeof ATTACHED_BOX_POSITION];

export interface IAttachSurroundingData {
    id: number;
    target: Element | Window;
    scrollY: number;
    scrollX: number;
    width: number;
    height: number;
    position: string | null;
}

export interface IAttachOptions {
    target: MaybeRef<Element | null>;

    box: MaybeRef<Element | null>;

    /** Position of box relative to the target */
    position: MaybeRef<EAttachedBoxPosition>;

    /** Distance between box and target */
    nudge: MaybeRef<number>;

    /** Distance between box and edge */
    edgeMargin: MaybeRef<number>;

    /** Fixed box position without moving to opposite sides */
    persistent: MaybeRef<boolean>;

    /** Sticky box that will follow target */
    sticky: MaybeRef<boolean>;

    /** The side to which the tooltip will be moved if it does not fit in the X direction */
    oppositeSideX?: MaybeRef<EAttachedBoxPosition>;

    /** The side to which the tooltip will be moved if it does not fit in the Y direction */
    oppositeSideY?: MaybeRef<EAttachedBoxPosition>;

    /** Calls on rect change or surrounding scroll/resize */
    onChange?: () => void;
}

export interface IAttach {
    readonly x: ComputedRef<number>;
    readonly y: ComputedRef<number>;
    readonly targetRect: Readonly<Ref<DOMRect | null>>;
    readonly boxRect: Readonly<Ref<DOMRect | null>>;
}
