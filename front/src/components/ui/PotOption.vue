<script setup lang="ts" generic="VALUE = unknown">
// Types
import type { IPotOptionExpose, IPotOptionProps } from '@/types/components/option';

// Vue
import { toRef, useTemplateRef } from 'vue';

// Composables
import { useClassList } from '@/composables/class-list';

const $props = withDefaults(defineProps<IPotOptionProps<VALUE>>(), {
    tag: 'div',
    label: '',
    selected: false,
    focused: false,
    disabled: false,
    fluid: false,
});

// Refs
const container = useTemplateRef<HTMLElement>('container');

// Composables
const $classList = useClassList(
    {
        selected: toRef(() => $props.selected),
        focused: toRef(() => $props.focused),
        disabled: toRef(() => $props.disabled),
        fluid: toRef(() => $props.fluid),
    },
    'option',
);

// Exports
defineExpose<IPotOptionExpose>({
    element: container,
});
</script>

<template>
    <component
        ref="container"
        :is="tag"
        :class="['pot-option', $classList]"
        :data-label="label"
        :data-value="value"
    >
        <div
            v-if="$slots.preicon"
            class="pot-option-icon pot-option-icon_left"
        >
            <slot name="preicon" />
        </div>

        <slot name="content">
            <div class="pot-option-text">
                <slot> {{ label }} </slot>
            </div>
        </slot>

        <div
            v-if="$slots.icon"
            class="pot-option-icon pot-option-icon_right"
        >
            <slot name="icon" />
        </div>
    </component>
</template>

<style>
.pot-option {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    cursor: pointer;
    user-select: none;
    border-style: solid;
    transition:
        color var(--pot-option-transition-duration, 0.2s)
            var(--pot-option-transition-function, ease),
        border-color var(--pot-option-transition-duration, 0.2s)
            var(--pot-option-transition-function, ease),
        outline-color var(--pot-option-transition-duration, 0.2s)
            var(--pot-option-transition-function, ease),
        background-color var(--pot-option-transition-duration, 0.2s)
            var(--pot-option-transition-function, ease);

    /* --- PotOption - Color --- */
    border-color: var(--pot-option-color-border, transparent);
    background-color: var(--pot-option-color-background, transparent);
    color: var(--pot-option-color-text, inherit);
    outline-color: var(--pot-option-color-outline, initial);

    /* --- PotOption - Size --- */
    height: var(--pot-option-size-height, auto);
    gap: var(--pot-option-size-gap, 0.8em);
    padding: var(--pot-option-size-padding, 0);
    border-width: var(--pot-option-size-border, 0);
    font-size: var(--pot-option-size-text, inherit);
    font-weight: var(--pot-option-size-text-weight, 400);
    line-height: var(--pot-option-size-text-height, 1);
    outline-width: var(--pot-option-size-outline, initial);
    outline-offset: var(--pot-option-size-outline-offset, initial);

    /* --- PotOption - Radius --- */
    border-radius: var(--pot-option-radius-value, 0);
}

.pot-option._option-fluid {
    width: 100%;
}

.pot-option._option-disabled {
    cursor: default;
    pointer-events: none;
}

.pot-option-text {
    flex-basis: 100%;
    height: 100%;
}

.pot-option-icon {
    flex-shrink: 0;
    pointer-events: none;
    font-size: inherit;

    /* --- PotOption - Color --- */
    color: var(--pot-option-color-icon, initial);
    fill: var(--pot-option-color-icon, initial);

    /* --- PotOption - Size --- */
    width: var(--pot-option-size-icon, auto);
}
</style>
