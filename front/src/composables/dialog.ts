// Types
import type {
    EDialogLayers,
    IDialog,
    IDialogOptions,
    TDialogTriggersDelays,
} from '@/types/composables/dialog';
import type { ComputedRef, MaybeRef } from 'vue';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, inject, provide, ref, unref, watch } from 'vue';

// Composables
import { useComponentSubscriptions, useSubscriptions } from '@/composables/subscriptions';
import { useKeyboard } from '@/composables/keyboard';

const $subscriptions = useSubscriptions();

const layers = Object.values(DIALOG_LAYERS).sort((a, b) => a - b);
const defaultConfig: TDialogTriggersDelays = {
    clickoutside: 100,
    escape: 0,
};

const config = ref<TDialogTriggersDelays>({ ...defaultConfig });
const queue = ref<symbol[]>([]);

const dialogs: Map<symbol, IDialog> = new Map<symbol, IDialog>();

const queueDialogs = computed<IDialog[]>(() => {
    return queue.value.map(v => dialogs.get(v)).filter(Boolean) as IDialog[];
});

/** Setup dialogs trigger listeners */
export function setup(options: Partial<TDialogTriggersDelays> = {}) {
    queue.value = [];
    dialogs.clear();
    config.value = { ...defaultConfig, ...options };

    $subscriptions.add(
        () => useKeyboard(window, { escape: handleEscape }, { capture: true }),
        controller => controller.abort(),
    );

    $subscriptions.addEventListener({
        target: window,
        eventName: 'click',
        listener: handleClick,
        options: { capture: true },
    });
}

/** Terminate dialogs trigger listeners */
export function terminate() {
    $subscriptions.clear();
    queue.value = [];
    dialogs.clear();
    config.value = { ...defaultConfig };
}

export function useDialog(options: IDialogOptions): IDialog {
    const $subscriptions = useComponentSubscriptions();
    const $parentLayer = inject<MaybeRef<EDialogLayers>>('pot-dialog-layer', DIALOG_LAYERS.NONE);

    const marker = Math.random().toString(36).slice(2, 9);
    const id = Symbol(marker);
    const layer = useDialogLayer(options.layer, $parentLayer);
    const triggers = computed(() => unref(options.triggers));
    const isOpen = computed(() => unref(options.isOpen));
    const createdAt = ref(Date.now());
    const updatedAt = ref(Date.now());

    const newDialog: IDialog = {
        id,
        triggers,
        isOpen,
        layer,
        createdAt,
        updatedAt,
        zIndex: useDialogZIndex(id, layer),
        open: () => options.open(),
        close: () => options.close(),
        controller: $subscriptions.add(
            () => provide('pot-dialog-layer', layer),
            () => {
                unwatch();
                queue.value = queue.value.filter(dialogId => dialogId !== id);
                dialogs.delete(id);
            },
        ),
        marker: { 'data-pot-dialog-id': marker },
    };

    dialogs.set(id, newDialog);

    const unwatch = watch(
        () => isOpen.value,
        (newValue, oldValue) => {
            if (newValue === oldValue) return;

            updatedAt.value = Date.now();

            const updatedQueue = queue.value.filter(dialogId => dialogId !== id);

            if (newValue) updatedQueue.push(id);

            const currentQueueDialogs = updatedQueue
                .map(v => dialogs.get(v))
                .filter(Boolean) as IDialog[];

            queue.value = currentQueueDialogs
                .sort((a, b) => {
                    return a.layer.value - b.layer.value || a.createdAt.value - b.createdAt.value;
                })
                .map(dialog => dialog.id);
        },
        { immediate: true },
    );

    return newDialog;
}

export function useDialogLayer(
    ...layers: MaybeRef<EDialogLayers | undefined>[]
): ComputedRef<EDialogLayers> {
    return computed(() => {
        const layersValues = layers.map(v => unref(v));
        return Math.max(...layersValues.filter(v => v !== undefined)) as EDialogLayers;
    });
}

/** Composable for getting dialog's current z-index */
export function useDialogZIndex(
    dialogId: MaybeRef<symbol>,
    layer: MaybeRef<EDialogLayers>,
): ComputedRef<number> {
    return computed(() => {
        const currentLayer = unref(layer);
        const nextLayer = layers[layers.indexOf(currentLayer) + 1] ?? Infinity;

        const layerQueue = queue.value
            .map(someDialogId => dialogs.get(someDialogId))
            .filter(dialog => dialog && dialog.layer.value === currentLayer);

        const index = layerQueue.findIndex(dialog => dialog && dialog.id === unref(dialogId));

        const zIndex = currentLayer + Math.max(0, index);

        return zIndex < nextLayer ? zIndex : nextLayer - 1;
    });
}

/** Handle clickoutside event */
function handleClick(event: MouseEvent) {
    if (!queue.value.length) return;

    const clickTriggerDialogs = queueDialogs.value.filter(dialog =>
        dialog.triggers.value.includes('clickoutside'),
    );

    const dialog = clickTriggerDialogs[clickTriggerDialogs.length - 1] ?? null;

    if (!dialog || !dialog.id.description) return;

    const path = event.composedPath();
    const dialogIdAttributes = path
        .map(v => (v instanceof HTMLElement ? v.dataset.potDialogId : null))
        .filter(Boolean) as string[];

    if (dialogIdAttributes.includes(dialog.id.description)) return;

    const delay = Date.now() - dialog.updatedAt.value;
    const configDelay = config.value.clickoutside;

    if (configDelay && delay < configDelay) return;

    dialog.close();
}

/** Handle escape keydown event */
function handleEscape() {
    const escapeTriggerDialogs = queueDialogs.value.filter(v =>
        v.triggers.value.includes('escape'),
    );

    const dialog = escapeTriggerDialogs[escapeTriggerDialogs.length - 1] ?? null;

    if (!dialog) return;

    const delay = Date.now() - dialog.updatedAt.value;
    const configDelay = config.value.escape;

    if (configDelay && delay < configDelay) return;

    dialog.close();
}
