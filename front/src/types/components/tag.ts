// Types
import type { EPotDevice } from '@/types';

export const POT_TAG_SIZE = {} as const;

export const POT_TAG_COLOR = {} as const;

export const POT_TAG_RADIUS = {} as const;

export type EPotTagSize = (typeof POT_TAG_SIZE)[keyof typeof POT_TAG_SIZE];

export type EPotTagColor = (typeof POT_TAG_COLOR)[keyof typeof POT_TAG_COLOR];

export type EPotTagRadius = (typeof POT_TAG_RADIUS)[keyof typeof POT_TAG_RADIUS];

export interface IPotTagProps {
    /** Tag size */
    size?: EPotTagSize | EPotTagSize[] | null;

    /** Tag color */
    color?: EPotTagColor | EPotTagColor[] | null;

    /** Tag border radius */
    radius?: EPotTagRadius | EPotTagRadius[] | null;

    /** Breakpoints names for responsive design */
    devices?: EPotDevice[];
}
