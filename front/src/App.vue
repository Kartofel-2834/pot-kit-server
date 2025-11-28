<script setup lang="ts">
// Vue
import { onMounted, onUnmounted, ref } from 'vue';

// Composables
import { useToast } from './composables/toast';

import { POT_TOAST_POSITION, type EPotToastPosition } from './types/components/toast';

// Components
import PotButton from './components/ui/PotButton.vue';
import PotTooltip from './components/ui/PotTooltip.vue';
import PotDialog from './components/ui/PotDialog.vue';
import PotToast from './components/ui/PotToast.vue';
import PotInput from './components/ui/PotInput.vue';
import PotPopover from './components/ui/PotPopover.vue';
import PotDrawer from './components/ui/PotDrawer.vue';
import PotAccordion from './components/ui/PotAccordion.vue';
import PotAccordionGroup from './components/ui/PotAccordionGroup.vue';
import PotSelect from './components/ui/PotSelect.vue';

const isVisible = ref<boolean>(false);
const isPopoverVisible = ref<boolean>(false);
const isPopoverVisible2 = ref<boolean>(true);

const test = ref<string>('test');
const isOpen = ref<boolean>(false);

const mainRef = ref<Element | null>(null);
const buttonRef = ref<Element | null>(null);

const $toast = useToast<string>();
const position = ref<EPotToastPosition>(POT_TOAST_POSITION.TOP_LEFT);

const openedAccordions = ref<string[]>([]);

const someValue = ref<any>(null);
const text = ref<string>('');

const optionsA = ref<string[]>(['a', 'b', 'c']);
const optionsB = ref<number[]>([1, 2, 3]);
const optionsC = ref<boolean[]>([true, false]);
const optionsD = ref<Array<{ name: string; value: number }>>([
    { name: 'a', value: 1 },
    { name: 'b', value: 2 },
]);
</script>

<template>
    <main
        ref="mainRef"
        id="main"
        class="main"
        style="
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 300vh;
            overflow: visible;
        "
    >
        <PotSelect
            v-model="someValue"
            v-model:text="text"
            :options="optionsA"
            :nudge="20"
            :position="['bottom-center', 'left-center']"
            color="pot"
            size="medium"
            radius="circle"
            style="width: 20rem"
        >
            <template #header>
                <button>KAMAL: {{ text }}</button>
            </template>

            <template #footer>
                <button>Filter</button>
            </template>
        </PotSelect>

        <PotTooltip text="Kamal">
            <button>Kamal</button>
        </PotTooltip>

        <PotButton :square="isOpen"> Test {{ isOpen }}</PotButton>

        <PotButton @click="isOpen = !isOpen">Kamal</PotButton>
    </main>
</template>

<style>
html {
    font-size: 10px !important;
}

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
