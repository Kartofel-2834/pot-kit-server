// Types
import type { ComputedRef, Ref } from 'vue';
import type { EPotAttachedBoxPosition } from '../components/attach-target';

export interface IAttachOptions {
    /** Position of box relative to the target */
    position: EPotAttachedBoxPosition;

    /** Distance between box and target */
    nudge: number;

    /** Distance between box and edge */
    edgeMargin: number;

    /** Fixed box position without moving to opposite sides */
    persistent: boolean;

    /** Sticky box that will follow target */
    sticky: boolean;

    /** The side to which the tooltip will be moved if it does not fit in the X direction */
    oppositeSideX?: EPotAttachedBoxPosition;

    /** The side to which the tooltip will be moved if it does not fit in the Y direction */
    oppositeSideY?: EPotAttachedBoxPosition;
}

export interface IAttach {
    /** Box top-left corner coordinates on screen */
    coordinates: ComputedRef<[x: number, y: number]>;

    /** Target rect */
    targetRect: Ref<DOMRect | null>;

    /** Box rect */
    boxRect: Ref<DOMRect | null>;

    /** Flag for target resizing */
    isTargetResizing: Ref<boolean>;

    /** Flag for box resizing */
    isBoxResizing: Ref<boolean>;

    /** Flag for surrounding resizing */
    isSurroundingResizing: Ref<boolean>;

    /** Flag for box scrolling */
    isScrolling: Ref<boolean>;

    /** Setup box, target and their surrounding observers */
    setup: () => void;

    /** Terminate box, target and their surrounding observers */
    terminate: () => void;

    /** Set box target element */
    setTarget: (target: Element) => void;

    /** Set box element */
    setBox: (box: Element) => void;
}
