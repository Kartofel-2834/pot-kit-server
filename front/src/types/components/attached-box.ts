// Types
import type { RendererElement } from 'vue';

export const POT_ATTACHED_BOX_POSITION = {
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

export type EPotAttachedBoxPosition =
    (typeof POT_ATTACHED_BOX_POSITION)[keyof typeof POT_ATTACHED_BOX_POSITION];

export interface IPotAttachedBoxProps {
    /** Box element */
    box: Element | null;

    /** Box position that relative to target */
    position?: EPotAttachedBoxPosition;

    /** Distance between box and target */
    nudge?: number;

    /** Distance between box and edge */
    edgeMargin?: number;

    /** Fixed box position without moving to opposite sides */
    persistent?: boolean;

    /** Sticky box that will follow target */
    sticky?: boolean;

    /** Place where box will be mounted */
    to?: string | RendererElement | null;

    /** Target element */
    target?: Element | null;
}
