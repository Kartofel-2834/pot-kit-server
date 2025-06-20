<script lang="ts">
// Types
import type { IPotSlotCatcherProps } from '@/types/components/slot-catcher';
import type { VNode } from 'vue';

// Vue
import { defineComponent } from 'vue';

export default defineComponent<IPotSlotCatcherProps>({
    inheritAttrs: false,

    props: {
        mapVNode: {
            type: Function,
            required: true,
            default: (v: VNode) => v,
        },
    },

    setup(props, { slots }) {
        return () => {
            const slotContent = slots.default?.() ?? null;

            if (!Array.isArray(slotContent)) {
                return null;
            }

            return slotContent.map(vnode => props.mapVNode?.(vnode) ?? vnode) as VNode[];
        };
    },
});
</script>
