// Types
import type {
    EDialogLayers,
    IDialog,
    IDialogManager,
    IDialogOptions,
    IDialogsSetupOptions,
} from '@/types/composables/dialog';
import type { ComputedRef, MaybeRef } from 'vue';

// Constants
import { DIALOG_LAYERS } from '@/types/composables/dialog';

// Vue
import { computed, onUnmounted, ref, unref, watch } from 'vue';

// Composables
import { useSubscriptions } from '@/composables/subscriptions';
import { useKeyboard } from '@/composables/keyboard';

const $subscriptions = useSubscriptions();

const defaultConfig: IDialogsSetupOptions = {
    triggersStartDelays: {
        clickoutside: 100,
        escape: 0,
    },
};

const config = ref<IDialogsSetupOptions>({ ...defaultConfig });
const layers = Object.values(DIALOG_LAYERS).sort((a, b) => a - b);

const dialogsQueue = ref<IDialogManager[]>([]);

/** Setup dialogs trigger listeners */
export function setup(options: Partial<IDialogsSetupOptions> = {}) {
    dialogsQueue.value = [];

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

    config.value = {
        ...defaultConfig,
        ...options,
        triggersStartDelays: {
            ...defaultConfig.triggersStartDelays,
            ...(options.triggersStartDelays ?? {}),
        },
    };
}

/** Terminate dialogs trigger listeners */
export function terminate() {
    $subscriptions.clear();
    config.value = { ...defaultConfig };
}

/** Composable for getting dialog's current z-index */
export function useDialogZIndex(dialog: IDialog): ComputedRef<number> {
    return computed(() => {
        const currentLayer = dialog.layer.value;
        const nextLayer = layers[layers.indexOf(currentLayer) + 1] ?? Infinity;

        const layerQueue = dialogsQueue.value.filter(v => v.layer === currentLayer);
        const index = layerQueue.findIndex(v => v.id === dialog.id);

        const zIndex = currentLayer + Math.max(0, index);

        return zIndex < nextLayer ? zIndex : nextLayer - 1;
    });
}

export function useDialogLayer(
    ...layers: MaybeRef<EDialogLayers | undefined>[]
): ComputedRef<EDialogLayers> {
    return computed(() => {
        const layersValues = layers.map(v => unref(v));
        return Math.max(...layersValues.filter(v => v !== undefined)) as EDialogLayers;
    });
}

/** Composable for adding dialogs to global queue with triggers */
export function useDialog(options: IDialogOptions): IDialog {
    const id = generateDialogId();
    const createdAt = Date.now();

    const dialogManager = computed<IDialogManager>(() => ({
        id,
        createdAt,
        isOpen: unref(options.isOpen),
        layer: unref(options.layer),
        triggers: unref(options.triggers) ?? ['escape'],
        updatedAt: Date.now(),
        open: () => options.open(),
        close: () => options.close(),
    }));

    const unwatch = watch(
        () => dialogManager.value,
        (newManager, oldManager) => {
            if (oldManager && newManager.isOpen === oldManager.isOpen) return;

            const updatedQueue = dialogsQueue.value.filter(v => v.id !== id);

            if (newManager.isOpen) updatedQueue.push(newManager);

            dialogsQueue.value = updatedQueue.sort(
                (a, b) => a.layer - b.layer || a.createdAt - b.createdAt,
            );
        },
        { immediate: true },
    );

    onUnmounted(() => {
        unwatch();
        dialogsQueue.value = dialogsQueue.value.filter(v => v.id !== id);
    });

    return {
        id,
        isOpen: computed(() => dialogManager.value.isOpen),
        triggers: computed(() => dialogManager.value.triggers),
        layer: computed(() => dialogManager.value.layer),
        close: () => options.close(),
        open: () => options.open(),
    };
}

/** Generate unique id for dialog */
function generateDialogId(): Symbol {
    return Symbol(Math.random().toString(36).slice(2, 9));
}

/** Handle clickoutside event */
function handleClick(event: MouseEvent) {
    if (!dialogsQueue.value.length) return;

    const clickTriggerDialogs = dialogsQueue.value.filter(v => v.triggers.includes('clickoutside'));
    const dialogManager = clickTriggerDialogs[clickTriggerDialogs.length - 1] ?? null;

    if (!dialogManager || !dialogManager.id.description) return;

    const path = event.composedPath();
    const dialogIdAttributes = path
        .map(v => (v instanceof HTMLElement ? v.dataset.potDialogId : null))
        .filter(Boolean) as string[];

    if (dialogIdAttributes.includes(dialogManager.id.description)) return;

    const delay = Date.now() - dialogManager.updatedAt;
    const configDelay = config.value.triggersStartDelays.clickoutside;

    if (configDelay && delay < configDelay) return;

    dialogManager.close();
}

/** Handle escape keydown event */
function handleEscape() {
    const escapeTriggerDialogs = dialogsQueue.value.filter(v => v.triggers.includes('escape'));
    const dialogManager = escapeTriggerDialogs[escapeTriggerDialogs.length - 1] ?? null;

    if (!dialogManager) return;

    const delay = Date.now() - dialogManager.updatedAt;
    const configDelay = config.value.triggersStartDelays.escape;

    if (configDelay && delay < configDelay) return;

    dialogManager.close();
}
