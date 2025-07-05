// Types
import type { VNode } from 'vue';

export interface IPotSlotCatcherProps {
    /** Map VNode */
    mapVNode?: (vnode: VNode) => VNode | null;
}
