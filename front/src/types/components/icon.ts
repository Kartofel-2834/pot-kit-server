// Types
import type { EPotDevice } from '@/types';

export interface IPotIconProps {
    /** Имя иконки (без расширения .vue) */
    icon: string;

    /** Размер иконки */
    size?: string | number;

    /** Цвет иконки */
    color?: string;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];
}
