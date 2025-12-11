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
    /** Tag of the element defining the grid */
    tag?: string;

    /** align-items css property */
    align?: TPotGroupAlign | TPotGroupAlign[] | null;

    /** align-content css property */
    alignContent?: TPotGroupAlignContent | TPotGroupAlignContent[] | null;

    /** justify-content css property */
    justify?: TPotGroupJustify | TPotGroupJustify[] | null;

    /** justify-items css property */
    justifyItems?: TPotGroupJustifyItems | TPotGroupJustifyItems[] | null;

    /** Flex direction */
    direction?: TPotGroupDirection | TPotGroupDirection[] | null;

    /** Type of transfer of elements that do not fit into the grid */
    wrap?: TPotGroupWrap | TPotGroupWrap[] | null;

    /** Gap size */
    gap?: number | EPotGroupGap | Array<EPotGroupGap | number> | null;

    /** Breakpoints for responsive design */
    devices?: EPotDevice[];
}
