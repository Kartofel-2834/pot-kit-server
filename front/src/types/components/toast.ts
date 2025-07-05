// Types
import type { RendererElement } from 'vue';
import type { EPotDevice } from '@/types';
import type { IToast } from '@/types/composables/toast';

export const POT_TOAST_SIZE = {} as const;

export const POT_TOAST_COLOR = {} as const;

export const POT_TOAST_RADIUS = {} as const;

export const POT_TOAST_POSITION = {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
} as const;

export type EPotToastPosition = (typeof POT_TOAST_POSITION)[keyof typeof POT_TOAST_POSITION];

export type EPotToastSize = (typeof POT_TOAST_SIZE)[keyof typeof POT_TOAST_SIZE];

export type EPotToastColor = (typeof POT_TOAST_COLOR)[keyof typeof POT_TOAST_COLOR];

export type EPotToastRadius = (typeof POT_TOAST_RADIUS)[keyof typeof POT_TOAST_COLOR];

export interface IPotToastProps<T = unknown> {
    /** Toast composable instance, use this prop for share your toast type to toast slot data */
    toast?: IToast<T>;

    /** Toast group name */
    group?: string;

    /** Toast position */
    position?: EPotToastPosition;

    /** Toasts group teleport target */
    to?: string | RendererElement | null;

    /** Toasts transition name */
    transition?: string;

    /** Toast size */
    size?: EPotToastSize | EPotToastSize[] | null;

    /** Toast color */
    color?: EPotToastColor | EPotToastColor[] | null;

    /** Toast border radius */
    radius?: EPotToastRadius | EPotToastRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];
}
