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
        style="display: flex; flex-direction: column; justify-content: center; width: 100vw"
    >
        <PotTooltip text="Tooltip">
            <PotButton @click="$toast.add({ data: 'bebra' })"> TOGGLE </PotButton>
        </PotTooltip>

        <PotButton @click="position = POT_TOAST_POSITION.BOTTOM_LEFT"> bottom-left </PotButton>
        <PotButton @click="position = POT_TOAST_POSITION.BOTTOM_CENTER"> bottom-center </PotButton>
        <PotButton @click="position = POT_TOAST_POSITION.BOTTOM_RIGHT"> bottom-right </PotButton>
        <PotButton @click="position = POT_TOAST_POSITION.TOP_LEFT"> top-left </PotButton>
        <PotButton @click="position = POT_TOAST_POSITION.TOP_CENTER"> top-center </PotButton>
        <PotButton @click="position = POT_TOAST_POSITION.TOP_RIGHT"> top-right </PotButton>

        <PotButton @click="isVisible = !isVisible">DIALOG</PotButton>

        <PotToast
            v-slot="{ data, close, index }"
            :toast="$toast"
            :position="position"
        >
            <div @click="close">{{ data }} {{ index }}</div>
        </PotToast>

        <PotDialog v-model="isVisible">
            <div style="background-color: aquamarine; padding: 2rem">
                <button @click="isPopoverVisible = !isPopoverVisible">
                    KAMAL {{ isPopoverVisible }}
                </button>
                <input value="KAMAL" />

                <!-- <button>KAMAL</button> -->
                KAMAL
            </div>
        </PotDialog>

        <PotDialog v-model="isPopoverVisible">
            <div style="background-color: aquamarine; padding: 2rem">
                <button>KAMAL</button>
                <input value="KAMAL" />

                <!-- <button>KAMAL</button> -->
                KAMAL 2
            </div>
        </PotDialog>
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
