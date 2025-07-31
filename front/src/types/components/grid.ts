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

export const POT_GRID_ROW_GAP = {} as const;

export type EPotGridRowGap = (typeof POT_GRID_ROW_GAP)[keyof typeof POT_GRID_ROW_GAP];

export const POT_GRID_COLUMN_GAP = {} as const;

export type EPotGridColumnGap = (typeof POT_GRID_COLUMN_GAP)[keyof typeof POT_GRID_COLUMN_GAP];

export interface IPotGridProps {
    /** Tag of the element defining the grid */
    tag?: string;

    /** Number of columns in the grid */
    cols?: number | number[] | string | string[];

    /** Number of rows in the grid */
    rows?: number | number[] | string | string[];

    /** Grid direction */
    flow?: string | string[];

    /** Height of an element that goes beyond the specified grid */
    autoRows?: string | string[];

    /** Length of element that goes beyond the specified grid */
    autoCols?: string | string[];

    /** align-items css property */
    align?: TPotGridAlign | TPotGridAlign[] | null;

    /** align-content css property */
    alignContent?: TPotGridAlignContent | TPotGridAlignContent[] | null;

    /** justify-content css property */
    justify?: TPotGridJustify | TPotGridJustify[] | null;

    /** justify-items css property */
    justifyItems?: TPotGridJustifyItems | TPotGridJustifyItems[] | null;

    /** Grid margin size */
    gap?: EPotGridGap | EPotGridGap[] | null;

    /** Grid row indent size */
    rowGap?: EPotGridGap | EPotGridGap[] | null;

    /** Grid column indent size */
    columnGap?: EPotGridGap | EPotGridGap[] | null;

    /** Breakpoints for responsive design */
    devices?: EPotDevice[];
}
