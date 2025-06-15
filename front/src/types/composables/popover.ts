// Types
import type { EPotPopoverPosition } from '@/types/components/popover';
import type { ComputedRef, Ref } from 'vue';

export interface IPopoverOptions {
    /** Position of popover relative to the target */
    position: EPotPopoverPosition;

    /** Distance between popover and target */
    nudge: number;

    /** Distance between popover and edge */
    edgeMargin: number;

    /** Fixed popover position without moving to opposite sides */
    persistent: boolean;

    /** Sticky popover that will follow target */
    sticky: boolean;
}

export interface IPopover {
    /** Popover top-left corner X coordinate on screen */
    x: ComputedRef<number>;

    /** Popover top-left corner Y coordinate on screen */
    y: ComputedRef<number>;

    /** Target rect */
    targetRect: Ref<DOMRect | null>;

    /** Popover rect */
    popoverRect: Ref<DOMRect | null>;

    /** Flag for target resizing */
    isTargetResizing: Ref<boolean>;

    /** Flag for popover resizing */
    isPopoverResizing: Ref<boolean>;

    /** Flag for surrounding resizing */
    isSurroundingResizing: Ref<boolean>;

    /** Flag for popover scrolling */
    isScrolling: Ref<boolean>;

    /** Setup popover, target and their surrounding observers */
    setup: () => void;

    /** Terminate popover, target and their surrounding observers */
    terminate: () => void;

    /** Set popover target element */
    setTarget: (target: Element) => void;

    /** Set popover element */
    setPopover: (popover: Element) => void;
}
