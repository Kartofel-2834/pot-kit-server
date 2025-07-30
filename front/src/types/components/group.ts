// Types
import type { EPotDevice } from '@/types';

type TPotGroupSafeAlignment<T extends string> = `${'safe' | 'unsafe'} ${T}`;

type TPotGroupJustifyKeys =
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

type TPotGroupJustifyItemsKeys = TPotGroupJustifyKeys | 'self-start' | 'self-end' | 'anchor-center';

type TPotGroupAlignKeys =
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

type TPotGroupAlignContentKeys =
    | TPotGroupAlignKeys
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

type TPotGroupDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

type TPotGroupWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

type TPotGroupJustify =
    | TPotGroupJustifyKeys
    | TPotGroupSafeAlignment<TPotGroupJustifyKeys>
    | `legacy ${TPotGroupJustifyKeys}`;

type TPotGroupJustifyItems =
    | TPotGroupJustifyItemsKeys
    | TPotGroupSafeAlignment<TPotGroupJustifyItemsKeys>
    | `legacy ${TPotGroupJustifyItemsKeys}`;

type TPotGroupAlign = TPotGroupAlignKeys | TPotGroupSafeAlignment<TPotGroupAlignKeys>;

type TPotGroupAlignContent =
    | TPotGroupAlignContentKeys
    | TPotGroupSafeAlignment<TPotGroupAlignContentKeys>;

export const POT_GROUP_GAP = {} as const;

export type EPotGroupGap = (typeof POT_GROUP_GAP)[keyof typeof POT_GROUP_GAP];

export interface IPotGroupProps {
    /** Тег элемента задающего сетку */
    tag?: string;

    /** align-items сетки */
    align?: TPotGroupAlign | TPotGroupAlign[] | null;

    /** align-content сетки */
    alignContent?: TPotGroupAlignContent | TPotGroupAlignContent[] | null;

    /** justify-content сетки */
    justify?: TPotGroupJustify | TPotGroupJustify[] | null;

    /** justify-items сетки */
    justifyItems?: TPotGroupJustifyItems | TPotGroupJustifyItems[] | null;

    /** Направление сетки */
    direction?: TPotGroupDirection | TPotGroupDirection[] | null;

    /** Тип переноса невмещаюхихся в сетку элементов */
    wrap?: TPotGroupWrap | TPotGroupWrap[] | null;

    /** Размер отступов сетки */
    gap?: EPotGroupGap | EPotGroupGap[] | null;

    /** Точки останова для адаптивного дизайна */
    devices?: EPotDevice[];
}
