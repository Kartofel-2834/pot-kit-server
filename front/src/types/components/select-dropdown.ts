// Types
import type { Ref, RendererElement, UnwrapRef } from 'vue';
import type { IPotSelectHeaderExpose } from '@/types/components/select-header';
import type { EPotDevice } from '@/types';
import type { EAttachedBoxPosition } from '@/types/composables/attach';
import type { TDialogMarker } from '@/types/composables/dialog';

export interface IPotSelectDropdownProps {
    header: UnwrapRef<IPotSelectHeaderExpose> | null;

    opened?: boolean;

    className?: string;
    classList?: string[] | Record<string, boolean>;
    devices?: EPotDevice[];

    to?: string | RendererElement | null;
    position?: EAttachedBoxPosition | EAttachedBoxPosition[];
    nudge?: number | number[];
    edgeMargin?: number | number[];
    persistent?: boolean;
    noSticky?: boolean;
    closeOnMove?: boolean;
    transition?: string;
}

export interface IPotSelectDropdownEmits {
    close: [];
    open: [];
}

export interface IPotSelectDropdownExpose {
    element: Ref<HTMLElement | null>;
    marker: Ref<TDialogMarker | null>;
}
