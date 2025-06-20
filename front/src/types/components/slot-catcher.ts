import type { VNode, VNodeProps } from 'vue';

export interface IPotSlotCatcherProps {
    /** Map VNode */
    mapVNode?: (vnode: VNode) => VNode | null;
}
