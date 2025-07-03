<script setup lang="ts">
// Types
import type { EPotAttachedBoxPosition } from './types/components/attach-target';

// Constants
import { POT_ATTACHED_BOX_POSITION } from './types/components/attach-target';

// Vue
import { onMounted, onUnmounted, ref } from 'vue';

// Components
import PotButton from './components/ui/PotButton.vue';
import PotPopover from './components/ui/PotPopover.vue';
import PotTooltip from './components/ui/PotTooltip.vue';
import PotDrawer from './components/ui/PotDrawer.vue';
import PotDialog from './components/ui/PotDialog.vue';

// Composables
import { setup as setupDialogs, terminate as terminateDialogs } from '@/composables/dialog';
import { setup as setupDeviceIs, terminate as terminateDeviceIs } from '@/composables/device-is';

const kamal = ref<EPotAttachedBoxPosition>(POT_ATTACHED_BOX_POSITION.TOP_CENTER);
const isVisible = ref<boolean>(false);

const mainRef = ref<Element | null>(null);
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
        ref="mainRef"
        id="main"
        class="main"
        style="display: flex; flex-direction: column; justify-content: center; width: 100vw"
    >
        <PotDrawer
            v-model="isVisible"
            position="right"
            radius="large"
            color="pot"
            size="medium"
            aria-labelledby="dialog-header"
        >
            <div
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 4rem;
                    height: 100%;
                "
            >
                <h2 id="dialog-header">Header</h2>

                <PotTooltip
                    color="pot"
                    size="large"
                    text="lox"
                >
                    <PotButton
                        color="pot"
                        size="large"
                    >
                        Jabuk
                    </PotButton>
                </PotTooltip>
                <input />
            </div>
        </PotDrawer>

        <PotButton
            color="pot"
            size="medium"
            @click="isVisible = !isVisible"
        >
            TOGGLE
        </PotButton>
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
