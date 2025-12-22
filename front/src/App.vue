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
import PotGrid from './components/ui/PotGrid.vue';
import PotGroup from './components/ui/PotGroup.vue';
import PotOption from './components/ui/PotOption.vue';
import PotCheckbox from './components/ui/PotCheckbox.vue';
import PotRadio from './components/ui/PotRadio.vue';
import PotSwitch from './components/ui/PotSwitch.vue';
import PotIcon from './components/ui/PotIcon.vue';
import PotTag from './components/ui/PotTag.vue';

const isVisible = ref<boolean>(false);
const isPopoverVisible = ref<boolean>(false);
const isPopoverVisible2 = ref<boolean>(true);

const test = ref<string>('test');
const isOpen = ref<boolean>(false);
const checkboxCustom = ref<'kamal' | 'ambal'>('ambal');

const mainRef = ref<Element | null>(null);
const buttonRef = ref<Element | null>(null);

const $toast = useToast<string>();
const position = ref<EPotToastPosition>(POT_TOAST_POSITION.TOP_LEFT);

const openedAccordions = ref<string[]>([]);

const someValue = ref<any>(['a']);
const text = ref<string>('');

const radioValue = ref<string | number>('option1');
const switchValue = ref<boolean>(false);
const switchCustomValue = ref<'on' | 'off'>('off');

const optionsA = ref<string[]>(['a', 'b', 'c']);
const optionsB = ref<number[]>([1, 2, 3]);
const optionsC = ref<boolean[]>([true, false]);
const optionsD = ref<Array<{ name: string; value: number }>>([
    { name: 'a', value: 1 },
    { name: 'b', value: 2 },
    { name: 'c', value: 3 },
    { name: 'd', value: 4 },
    { name: 'e', value: 5 },
    { name: 'aa', value: 11 },
    { name: 'bb', value: 22 },
    { name: 'cc', value: 33 },
    { name: 'dd', value: 44 },
    { name: 'ee', value: 55 },
    { name: 'aaa', value: 111 },
    { name: 'bbb', value: 222 },
    { name: 'ccc', value: 333 },
    { name: 'ddd', value: 444 },
    { name: 'eee', value: 555 },
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
            overflow: visible;
        "
    >
        <!-- <PotSelect
            v-model="someValue"
            :options="optionsD"
            option-label="name"
            option-value="value"
            color="pot"
            size="medium"
            radius="circle"
            multiple
        >
            <template #dropdown-footer><button>Test</button></template>

            <template #dropdown-header>
                <button>
                    Kamal
                    <PotIcon icon="example-icon" />
                </button>
            </template>
        </PotSelect> -->
        <input type="checkbox" />

        <div style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem">
            <div style="display: flex; flex-direction: column; gap: 1rem">
                <h3>PotCheckbox</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem">
                    <div style="display: flex; align-items: center; gap: 1rem">
                        <div>Boolean value: {{ isOpen }}</div>
                        <PotCheckbox v-model="isOpen"> Simple Checkbox </PotCheckbox>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem">
                        <div>Custom value: {{ checkboxCustom }}</div>
                        <PotCheckbox
                            v-model="checkboxCustom"
                            :true-value="'kamal'"
                            :false-value="'ambal'"
                        >
                            Custom Checkbox
                        </PotCheckbox>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem">
                <h3>PotRadio</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem">
                    <div>Selected: {{ radioValue }}</div>
                    <PotRadio
                        v-model="radioValue"
                        radio-value="option1"
                        input-name="example-radio"
                    >
                        Option 1
                    </PotRadio>
                    <PotRadio
                        v-model="radioValue"
                        radio-value="option2"
                        input-name="example-radio"
                    >
                        Option 2
                    </PotRadio>
                    <PotRadio
                        v-model="radioValue"
                        radio-value="option3"
                        input-name="example-radio"
                    >
                        Option 3
                    </PotRadio>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem">
                <h3>PotSwitch</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem">
                    <div>Switch value: {{ switchValue }}</div>
                    <PotSwitch v-model="switchValue"> Toggle Switch </PotSwitch>
                    <div style="margin-top: 1rem">
                        <div>Custom values: {{ switchCustomValue }}</div>
                        <PotSwitch
                            v-model="switchCustomValue"
                            true-value="on"
                            false-value="off"
                        >
                            Custom Switch (on/off)
                        </PotSwitch>
                    </div>
                </div>
            </div>
        </div>
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
