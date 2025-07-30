// Types
import type { EPotDevice } from '@/types';

type TPotGridSafeAlignment<T extends string> = `${'safe' | 'unsafe'} ${T}`;

type TPotGridJustifyKeys =
    | 'normal'
    | 'stretch'
    | 'center'
    | 'start'
    | 'flex-start'
    | 'end'
    | 'flex-end'
    | 'left'
    | 'right'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

type TPotGridJustifyItemsKeys = TPotGridJustifyKeys | 'self-start' | 'self-end' | 'anchor-center';

type TPotGridAlignKeys =
    | 'normal'
    | 'stretch'
    | 'center'
    | 'start'
    | 'flex-start'
    | 'end'
    | 'flex-end'
    | 'baseline'
    | 'first baseline'
    | 'last baseline';

type TPotGridAlignContentKeys =
    | TPotGridAlignKeys
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

type TPotGridJustify =
    | TPotGridJustifyKeys
    | TPotGridSafeAlignment<TPotGridJustifyKeys>
    | `legacy ${TPotGridJustifyKeys}`;

type TPotGridJustifyItems =
    | TPotGridJustifyItemsKeys
    | TPotGridSafeAlignment<TPotGridJustifyItemsKeys>
    | `legacy ${TPotGridJustifyItemsKeys}`;

type TPotGridAlign = TPotGridAlignKeys | TPotGridSafeAlignment<TPotGridAlignKeys>;

type TPotGridAlignContent =
    | TPotGridAlignContentKeys
    | TPotGridSafeAlignment<TPotGridAlignContentKeys>;

export const POT_GRID_GAP = {} as const;

export type EPotGridGap = (typeof POT_GRID_GAP)[keyof typeof POT_GRID_GAP];

/**
 * Интерфейс пропсов для компонента PotGrid
 */
export interface IPotGridProps {
    /** Тег элемента задающего сетку */
    tag?: string;

    /** Кол-во колонок в сетке */
    cols?: number | number[] | string | string[];

    /** Кол-во рядов в сетке */
    rows?: number | number[] | string | string[];

    /** Направление сетки */
    flow?: string | string[];

    /** Высота элемента выходящего за заданную сетку */
    autoRows?: string | string[];

    /** Длина элемента выходящего за заданную сетку */
    autoCols?: string | string[];

    /** align-items сетки */
    align?: TPotGridAlign | TPotGridAlign[] | null;

    /** align-content сетки */
    alignContent?: TPotGridAlignContent | TPotGridAlignContent[] | null;

    /** justify-content сетки */
    justify?: TPotGridJustify | TPotGridJustify[] | null;

    /** justify-items сетки */
    justifyItems?: TPotGridJustifyItems | TPotGridJustifyItems[] | null;

    /** Размер отступов сетки */
    gap?: EPotGridGap | EPotGridGap[] | null;

    /** Размер отступов рядов сетки */
    rowGap?: EPotGridGap | EPotGridGap[] | null;

    /** Размер отступов колонок сетки */
    columnGap?: EPotGridGap | EPotGridGap[] | null;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];
}
