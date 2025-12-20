// Types
import type { EPotDevice } from '@/types';

export const POT_ICON_NAME = {} as const;

export const POT_ICON_SIZE = {} as const;

export const POT_ICON_COLOR = {} as const;

export type EPotIconName = (typeof POT_ICON_NAME)[keyof typeof POT_ICON_NAME] extends never
    ? string
    : (typeof POT_ICON_NAME)[keyof typeof POT_ICON_NAME];

export type EPotIconSize = (typeof POT_ICON_SIZE)[keyof typeof POT_ICON_SIZE];

export type EPotIconColor = (typeof POT_ICON_COLOR)[keyof typeof POT_ICON_COLOR];

export interface IPotIconProps {
    /** Имя иконки */
    icon: EPotIconName | EPotIconName[];

    /** Размер иконки */
    size?: EPotIconSize | number | Array<EPotIconSize | number> | null;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];
}
