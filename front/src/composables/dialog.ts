// Types
import {
    POT_DIALOG_LAYERS,
    type EPotDialogLayers,
    type IDialog,
    type IDialogManager,
    type IDialogOptions,
    type IDialogsSetupOptions,
    type TDialogsQueue,
} from '@/types/composables/dialog';

// Vue
import { ref, watch } from 'vue';

const defaultConfig: IDialogsSetupOptions = {
    triggersStartDelays: {
        clickoutside: 100,
        escape: 0,
    },
};

const config = ref<IDialogsSetupOptions>({ ...defaultConfig });
// const dialogsQueue = ref<TDialogsQueue>({});
const layers = Object.values(POT_DIALOG_LAYERS).sort((a, b) => a - b);

const dialogsQueue = ref<IDialogManager[]>([]);

/** Setup dialogs trigger listeners */
export function setup(options: Partial<IDialogsSetupOptions> = {}) {
    dialogsQueue.value = [];
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('click', handleClick);

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
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('click', handleClick);

    config.value = { ...defaultConfig };
}

/** Composable for getting dialog's current z-index */
export function useDialogZIndex(dialog: IDialog): number {
    const currentLayer = dialog.layer.value;
    const nextLayer = layers[layers.indexOf(currentLayer) + 1] ?? Infinity;

    const layerQueue = dialogsQueue.value.filter(v => v.layer === currentLayer);
    const index = layerQueue.findIndex(v => v.id === dialog.id);

    const zIndex = currentLayer + Math.max(0, index);

    return zIndex < nextLayer ? zIndex : nextLayer;
}

export function useDialogLayer(...layers: Array<EPotDialogLayers | undefined>): EPotDialogLayers {
    return Math.max(...layers.filter(v => v !== undefined)) as EPotDialogLayers;
}

/** Composable for adding dialogs to global queue with triggers */
export function useDialog(options: IDialogOptions): IDialog {
    const newDialogId = generateDialogId();
    const dialogManager: IDialogManager = {
        id: newDialogId,
        layer: options.layer.value,
        triggers: options.triggers ?? ['escape'],
        updatedAt: Date.now(),
        open: () => options.open(),
        close: () => options.close(),
    };

    const unwatch = watch(
        () => [options.isOpen.value, options.layer.value],
        (newValue, oldValue) => {
            const [newIsOpen, newLayer] = newValue as [boolean, EPotDialogLayers];
            const [oldIsOpen] = oldValue ?? [false, 0];

            if (newIsOpen === oldIsOpen) return;

            dialogManager.updatedAt = Date.now();
            dialogManager.layer = newLayer;

            const updatedQueue = dialogsQueue.value.filter(v => v.id !== newDialogId);

            if (newIsOpen) {
                updatedQueue.push(dialogManager);
            } else {
                console.log('close', newDialogId);
            }

            dialogsQueue.value = updatedQueue.sort(
                (a, b) => a.layer - b.layer || a.updatedAt - b.updatedAt,
            );

            console.log('dialogsQueue', JSON.parse(JSON.stringify(dialogsQueue.value)));
        },
        { immediate: true },
    );

    return {
        id: newDialogId,
        isOpen: options.isOpen,
        triggers: options.triggers,
        layer: options.layer,
        close: () => options.close(),
        open: () => options.open(),
        terminate: () => {
            unwatch();
            dialogsQueue.value = dialogsQueue.value.filter(v => v.id !== newDialogId);
        },
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
        .map(v => (v instanceof Element ? v.getAttribute('pot-dialog-id') : null))
        .filter(Boolean) as string[];

    if (dialogIdAttributes.includes(dialogManager.id.description)) return;

    const delay = Date.now() - dialogManager.updatedAt;
    const configDelay = config.value.triggersStartDelays.clickoutside;

    if (configDelay && delay < configDelay) return;
    console.log('clickoutside', dialogManager);
    dialogManager.close();
}

/** Handle keydown event */
function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;

    const escapeTriggerDialogs = dialogsQueue.value.filter(v => v.triggers.includes('escape'));
    const dialogManager = escapeTriggerDialogs[escapeTriggerDialogs.length - 1] ?? null;

    if (!dialogManager) return;

    const delay = Date.now() - dialogManager.updatedAt;
    const configDelay = config.value.triggersStartDelays.escape;

    if (configDelay && delay < configDelay) return;

    console.log('escape', dialogManager);
    dialogManager.close();
}
