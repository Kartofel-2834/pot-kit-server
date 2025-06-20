<script setup lang="ts">
// Types
import type { EPotPopoverPosition } from './types/components/popover';

// Vue
import { onMounted, onUnmounted, ref } from 'vue';

// Components
import PotButton from './components/ui/PotButton.vue';
import PotPopover from './components/ui/PotPopover.vue';

// Constants
import { POT_POPOVER_POSITION } from './types/components/popover';

// Composables
import { setup as setupDialogs, terminate as terminateDialogs } from '@/composables/dialog';
import { setup as setupDeviceIs, terminate as terminateDeviceIs } from '@/composables/device-is';
import PotTooltip from './components/ui/PotTooltip.vue';

const kamal = ref<EPotPopoverPosition>(POT_POPOVER_POSITION.TOP_CENTER);
const isVisible = ref<boolean>(false);

const buttonRef = ref<Element | null>(null);

onMounted(() => {
    setupDialogs();
    setupDeviceIs();
});

onUnmounted(() => {
    terminateDialogs();
    terminateDeviceIs();
});
</script>

<template>
    <main
        class="main"
        style="display: flex; flex-direction: column; justify-content: center; width: 100vw"
    >
        <PotTooltip
            :open-triggers="['contextmenu']"
            size="medium"
            color="pot"
            enterable
            @trigger:open.prevent
        >
            <template #target>
                <PotButton
                    color="pot"
                    size="medium"
                >
                    Test
                </PotButton>
            </template>

            Test
        </PotTooltip>
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
