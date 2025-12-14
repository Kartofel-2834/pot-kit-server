<script lang="ts" setup generic="OPTION, VALUE_FIELD extends keyof OPTION">
// Types
import type {
    IPotSelectDropdownEmits,
    IPotSelectDropdownProps,
    IPotSelectSpecData,
} from '@/types/components/select';
import type { ISpec } from '@/types/composables/specs';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

// Vue
import { computed, ref, toRef, useTemplateRef } from 'vue';

// Composables
import { useDialog } from '@/composables/dialog';
import { useFocusableChildren, useFocusBox } from '@/composables/focus';
import { useAttach } from '@/composables/attach';
import { useDeviceProperties } from '@/composables/device-is';
import { useDebounce } from '@/composables/timer';
import { useComponentSubscriptions } from '@/composables/subscriptions';
import { useKeyboard } from '@/composables/keyboard';
import { useClassList } from '@/composables/class-list';

const $props = withDefaults(defineProps<IPotSelectDropdownProps<OPTION, VALUE_FIELD>>(), {
    to: 'body',
    fixedDropdownWidth: true,
    position: ATTACHED_BOX_POSITION.BOTTOM_CENTER,
    nudge: 0,
    edgeMargin: 0,
    transition: 'pot-select-dropdown-transition',
});

const $emit = defineEmits<IPotSelectDropdownEmits<OPTION, VALUE_FIELD>>();

// Refs
const container = useTemplateRef('container');

// Data
const headerWidth = ref<number>(0);

const resizeObserver = new ResizeObserver(
    useDebounce({
        action: ([entry]) => (headerWidth.value = entry.target.clientWidth ?? 0),
        delay: 100,
    }),
);

// Computed
const headerElement = computed(() => $props.header?.element ?? null);

const headerInput = computed(() => $props.header?.input ?? null);

const teleportTo = computed(() => $props.to ?? 'body');

const currentStyles = computed(() => {
    return {
        '--pot-select-size-dropdown-width': headerWidth.value ? `${headerWidth.value}px` : '',
        zIndex: $dialog.zIndex.value,
        transform: `translate(${$attach.x.value}px, ${$attach.y.value}px)`,
    };
});

// Composables
const $subscriptions = useComponentSubscriptions();

const { focusableChildren: $focusableChildren } = useFocusableChildren(container);

const $dialog = useDialog({
    isOpen: computed(() => $props.opened ?? false),
    triggers: ['clickoutside', 'escape'],
    layer: DIALOG_LAYERS.POPOVER,
    close,
    open,
});

const $properties = useDeviceProperties(
    {
        position: toRef(() => $props.position),
        nudge: toRef(() => $props.nudge),
        edgeMargin: toRef(() => $props.edgeMargin),
    },
    toRef(() => $props.devices),
);

const $dropdownClassList = useClassList(
    {
        hidden: computed(() => $attach.x.value === null || $attach.y.value === null),
    },
    'select-dropdown',
);

const $attach = useAttach({
    target: headerElement,
    box: container,
    position: $properties.position,
    nudge: $properties.nudge,
    edgeMargin: $properties.edgeMargin,
    persistent: toRef(() => $props.persistent),
    sticky: toRef(() => !$props.noSticky),
    onChange: () => {
        if ($props.closeOnMove) $dialog.close();
    },
});

useFocusBox({
    element: container,
    leave: () => $props.header?.focus?.(),
    leaveFromEnd: () => close(),
    leaveFromStart: event => event.preventDefault(),
});

useKeyboard({
    target: headerInput,
    handlers: {
        tab: event => {
            if (!container.value) return;

            const data = $focusableChildren.value;
            const firstFocusableElement = data[0];
            const lastFocusableElement = data[data.length - 1];

            if (!firstFocusableElement && !lastFocusableElement) {
                close();
            } else if (!event.shiftKey) {
                event.preventDefault();
                firstFocusableElement.focus();
            } else {
                close();
            }
        },
    },
});

$subscriptions.observe({
    target: headerElement,
    observer: resizeObserver,
});

// Methods
function open() {
    if ($dialog.isOpen.value) return;
    $emit('open');
}

function close() {
    if (!$dialog.isOpen.value) return;
    $emit('close');
}

function toggle() {
    if ($dialog.isOpen.value) {
        close();
    } else {
        open();
    }
}

function select(spec: ISpec<OPTION, VALUE_FIELD, IPotSelectSpecData>) {
    $emit('select', spec);
}
</script>

<template>
    <Teleport
        :to="teleportTo"
        :disabled="!to"
    >
        <Transition :name="transition">
            <div
                v-if="$dialog.isOpen.value"
                v-bind="$dialog.marker"
                ref="container"
                :class="['pot-select-dropdown', classList, $dropdownClassList]"
                :style="currentStyles"
                tabindex="-1"
            >
                <slot
                    name="dropdown-header"
                    :open="open"
                    :close="close"
                    :toggle="toggle"
                    :select="select"
                />

                <slot
                    name="options-list"
                    :specs="specs"
                    :open="open"
                    :close="close"
                    :toggle="toggle"
                    :select="select"
                >
                    <ul
                        class="pot-select-options-list"
                        role="listbox"
                    >
                        <slot
                            v-for="spec of specs"
                            name="option"
                            :key="spec.id"
                            :spec="spec"
                            :select="select"
                        />
                    </ul>
                </slot>

                <slot
                    name="dropdown-footer"
                    :open="open"
                    :close="close"
                    :toggle="toggle"
                    :select="select"
                />
            </div>
        </Transition>
    </Teleport>
</template>

<style>
.pot-select-dropdown {
    position: fixed;
    display: flex;
    overflow: hidden;
    top: 0;
    left: 0;
    border-style: solid;

    /* --- PotSelect - Color - Dropdown --- */
    border-color: var(--pot-select-color-dropdown-border, transparent);
    background-color: var(--pot-select-color-dropdown-background, transparent);
    color: var(--pot-select-color-dropdown-text, inherit);

    /* --- PotSelect - Size - Dropdown --- */
    height: var(--pot-select-size-dropdown-height, auto);
    max-height: var(--pot-select-size-dropdown-max-height, 16rem);
    border-width: var(--pot-select-size-dropdown-border, 0);
    padding: var(--pot-select-size-dropdown-padding, 0);
    box-shadow: var(--pot-select-size-dropdown-shadow, none);
    font-size: var(--pot-select-size-dropdown-text, inherit);
    font-weight: var(--pot-select-size-text-weight, 400);
    line-height: var(--pot-select-size-text-height, 1);

    /* --- PotSelect - Radius - Dropdown --- */
    border-radius: var(--pot-select-radius-dropdown-value, 0);
}

.pot-select-dropdown._select-fixed-width {
    /* --- PotSelect - Size - Dropdown --- */
    width: var(--pot-select-size-dropdown-width, fit-content);
}

.pot-select-dropdown._select-dropdown-hidden {
    opacity: 0;
}

.pot-select-options-list {
    overflow: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0;
    padding: 0;
}

/* --- PotSelect - Transition --- */
.pot-select-dropdown-transition-enter-active,
.pot-select-dropdown-transition-leave-active {
    transition: opacity var(--pot-select-transition-dropdown-duration, 0.2s)
        var(--pot-select-transition-dropdown-function, ease);
}

.pot-select-dropdown-transition-enter-from,
.pot-select-dropdown-transition-leave-to {
    opacity: 0;
}
</style>
