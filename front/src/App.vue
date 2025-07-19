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
import { POT_TOAST_POSITION, type EPotToastPosition } from './types/components/toast';
import PotAccordion from './components/ui/PotAccordion.vue';

const kamal = ref<EPotAttachedBoxPosition>(POT_ATTACHED_BOX_POSITION.TOP_CENTER);
const isVisible = ref<boolean>(false);
const isPopoverVisible = ref<boolean>(false);
const isPopoverVisible2 = ref<boolean>(true);

const mainRef = ref<Element | null>(null);
const buttonRef = ref<Element | null>(null);

const $toast = useToast<string>();
const position = ref<EPotToastPosition>(POT_TOAST_POSITION.TOP_LEFT);
</script>

<template>
    <main
        ref="mainRef"
        id="main"
        class="main"
        style="display: flex; flex-direction: column; width: 100vw"
    >
        {{ isVisible }}

        <div style="width: 400px">
            <PotAccordion v-model="isVisible">
                <template #title> Ahmad </template>

                <div style="height: 400px; background-color: green">TEST</div>
            </PotAccordion>
        </div>
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
