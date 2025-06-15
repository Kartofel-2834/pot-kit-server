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

const kamal = ref<EPotPopoverPosition>(POT_POPOVER_POSITION.TOP_CENTER);
const isVisible = ref<boolean>(false);
const isVisible2 = ref<boolean>(false);

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
        style="display: flex; flex-direction: column; justify-content: center; width: 400vw"
    >
        <PotPopover
            v-model="isVisible"
            color="pot"
            size="small"
            radius="medium"
            :position="kamal"
        >
            <template #target>
                <div style="background-color: aquamarine">
                    <PotButton
                        size="large"
                        color="pot"
                        @click="isVisible = !isVisible"
                    >
                        Toggle
                    </PotButton>
                </div>
            </template>

            <template #default>
                <div
                    style="
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                        justify-content: center;
                        align-items: center;
                        width: 20rem;
                        height: 20rem;
                    "
                >
                    Test
                </div>
            </template>
        </PotPopover>

        <div style="display: flex; gap: 2rem">
            <!-- Top -->
            <PotButton @click="kamal = POT_POPOVER_POSITION.TOP_CENTER"> TOP_CENTER </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.TOP_START"> TOP_START </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.TOP_END"> TOP_END </PotButton>

            <!-- Bottom -->
            <PotButton @click="kamal = POT_POPOVER_POSITION.BOTTOM_CENTER">
                BOTTOM_CENTER
            </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.BOTTOM_START"> BOTTOM_START </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.BOTTOM_END"> BOTTOM_END </PotButton>

            <!-- Left -->
            <PotButton @click="kamal = POT_POPOVER_POSITION.LEFT_CENTER"> LEFT_CENTER </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.LEFT_START"> LEFT_START </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.LEFT_END"> LEFT_END </PotButton>

            <!-- Right -->
            <PotButton @click="kamal = POT_POPOVER_POSITION.RIGHT_CENTER"> RIGHT_CENTER </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.RIGHT_START"> RIGHT_START </PotButton>

            <PotButton @click="kamal = POT_POPOVER_POSITION.RIGHT_END"> RIGHT_END </PotButton>
        </div>
    </main>
</template>

<style>
.main {
    overflow: auto;
    display: flex;
    justify-content: left;
    align-items: center;
    min-height: 300vh;
    gap: 4rem;
    /* background-color: var(--pot-base-600); */
}
</style>
