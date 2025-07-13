<script setup lang="ts">
// Types
import type { EPotAttachedBoxPosition } from './types/components/attach-target';

// Constants
import { POT_ATTACHED_BOX_POSITION } from './types/components/attach-target';

// Vue
import { onMounted, onUnmounted, ref } from 'vue';

// Composables
import { useToast } from './composables/toast';

// Components
import PotButton from './components/ui/PotButton.vue';
import PotPopover from './components/ui/PotPopover.vue';
import PotTooltip from './components/ui/PotTooltip.vue';
import PotDrawer from './components/ui/PotDrawer.vue';
import PotDialog from './components/ui/PotDialog.vue';
import PotToast from './components/ui/PotToast.vue';

const kamal = ref<EPotAttachedBoxPosition>(POT_ATTACHED_BOX_POSITION.TOP_CENTER);
const isVisible = ref<boolean>(false);
const isPopoverVisible = ref<boolean>(false);
const isPopoverVisible2 = ref<boolean>(true);

const mainRef = ref<Element | null>(null);
const buttonRef = ref<Element | null>(null);

const $toast = useToast<string>();
</script>

<template>
    <main
        ref="mainRef"
        id="main"
        class="main"
        style="display: flex; flex-direction: column; justify-content: center; width: 100vw"
    >
        <PotTooltip
            size="medium"
            color="pot"
            text="Tooltip"
        >
            <PotButton
                size="large"
                color="pot"
                @click="$toast.add({ data: 'bebra' })"
            >
                TOGGLE
            </PotButton>
        </PotTooltip>

        <PotToast
            v-slot="{ data, close }"
            :toast="$toast"
        >
            <div @click="close">
                {{ data }}
            </div>
        </PotToast>
    </main>
</template>

<style>
.main {
    overflow: auto;
    display: flex;
    justify-content: left;
    align-items: center;
    min-height: 100vh;
    gap: 4rem;
    /* background-color: var(--pot-base-600); */
}
</style>
