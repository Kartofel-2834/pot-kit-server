<script setup lang="ts">
// Types
import type { EPotAttachedBoxPosition } from './types/components/attach-target';

// Constants
import { POT_ATTACHED_BOX_POSITION } from './types/components/attach-target';

// Vue
import { onMounted, onUnmounted, ref } from 'vue';

// Composables
import { useToast } from './composables/toast';

import { POT_TOAST_POSITION, type EPotToastPosition } from './types/components/toast';

// Components
import PotButton from './components/ui/PotButton.vue';
import PotPopover from './components/ui/PotPopover.vue';
import PotTooltip from './components/ui/PotTooltip.vue';
import PotDrawer from './components/ui/PotDrawer.vue';
import PotDialog from './components/ui/PotDialog.vue';
import PotToast from './components/ui/PotToast.vue';
import PotAccordion from './components/ui/PotAccordion.vue';
import PotAccordionGroup from './components/ui/PotAccordionGroup.vue';

const kamal = ref<EPotAttachedBoxPosition>(POT_ATTACHED_BOX_POSITION.TOP_CENTER);
const isVisible = ref<boolean>(false);
const isPopoverVisible = ref<boolean>(false);
const isPopoverVisible2 = ref<boolean>(true);

const mainRef = ref<Element | null>(null);
const buttonRef = ref<Element | null>(null);

const $toast = useToast<string>();
const position = ref<EPotToastPosition>(POT_TOAST_POSITION.TOP_LEFT);

const openedAccordions = ref<string[]>([]);
</script>

<template>
    <main
        ref="mainRef"
        id="main"
        class="main"
        style="display: flex; flex-direction: column; width: 100vw"
    >
        <div style="width: 400px">
            <PotAccordionGroup
                v-model="openedAccordions"
                v-slot="{ multipleBind, singleBind }"
            >
                <PotAccordion v-bind="multipleBind('Kamal')">
                    <template #title> Kamal </template>

                    <div style="height: 400px; background-color: green"><button>TEST</button></div>
                    <div
                        v-if="isPopoverVisible"
                        style="height: 200px; background-color: red"
                    >
                        <button>TEST</button>
                    </div>
                </PotAccordion>

                <PotAccordion v-bind="multipleBind('Ambal')">
                    <template #title> Ambal </template>

                    <div style="height: 400px; background-color: green">TEST</div>
                </PotAccordion>

                <PotAccordion v-bind="singleBind('Jabuk')">
                    <template #title> Jabuk </template>

                    <div style="height: 400px; background-color: green">TEST</div>
                </PotAccordion>
            </PotAccordionGroup>

            <button @click="isPopoverVisible = !isPopoverVisible">Kamal</button>
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
