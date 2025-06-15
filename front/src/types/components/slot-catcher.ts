import type { VNode, VNodeProps } from 'vue';

export interface IPotSlotCatcherProps {
    /** Settings to add to VNodes */
    options: (vnode: VNode, index: number) => VNodeProps;
}
