// Types
import type { ComputedRef, Ref } from 'vue';

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
    /** Position of box relative to the target */
    position: EAttachedBoxPosition;

    /** Distance between box and target */
    nudge: number;

    /** Distance between box and edge */
    edgeMargin: number;

    /** Fixed box position without moving to opposite sides */
    persistent: boolean;

    /** Sticky box that will follow target */
    sticky: boolean;

    /** Terminates on rect change or surrounding scroll/resize */
    terminateOnChange?: boolean;

    /** The side to which the tooltip will be moved if it does not fit in the X direction */
    oppositeSideX?: EAttachedBoxPosition;

    /** The side to which the tooltip will be moved if it does not fit in the Y direction */
    oppositeSideY?: EAttachedBoxPosition;
}

export interface IAttach {
    /** Box top-left corner coordinates on screen */
    coordinates: ComputedRef<[x: number, y: number]>;

    /** Target element */
    target: Ref<Element | null>;

    /** Box element */
    box: Ref<Element | null>;

    /** Target rect */
    targetRect: Ref<DOMRect | null>;

    /** Box rect */
    boxRect: Ref<DOMRect | null>;

    /** Setup box, target and their surrounding observers */
    start: (target: Element, box: Element) => Promise<void>;

    /** Terminate box, target and their surrounding observers */
    stop: () => void;
}
