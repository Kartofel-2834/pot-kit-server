// Types
import type {
    IDialog,
    IDialogManager,
    IDialogOptions,
    IDialogsSetupOptions,
} from '@/types/composables/dialog';

// Vue
import { computed, ref, watch } from 'vue';

const defaultConfig: IDialogsSetupOptions = {
    startZIndex: 1000,
    triggersStartDelays: {
        clickoutside: 100,
        escape: 0,
    },
};

const config = ref<IDialogsSetupOptions>({ ...defaultConfig });
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
    return config.value.startZIndex + Math.max(0, dialog.queueIndex.value);
}

/** Composable for adding dialogs to global queue with triggers */
export function useDialog(options: IDialogOptions): IDialog {
    const newDialogId = generateDialogId();
    const dialogManager: IDialogManager = {
        id: newDialogId,
        triggers: options.triggers ?? ['escape'],
        updatedAt: Date.now(),
        open: () => options.open(),
        close: () => options.close(),
    };

    const unwatch = watch(
        () => options.isOpen.value,
        (newValue, oldValue) => {
            if (newValue === oldValue) return;

            dialogManager.updatedAt = Date.now();
            const updatedQueue = dialogsQueue.value.filter(v => v.id !== newDialogId);

            if (newValue) {
                updatedQueue.push(dialogManager);
            }

            dialogsQueue.value = updatedQueue;
        },
        { immediate: true },
    );

    return {
        id: newDialogId,
        isOpen: options.isOpen,
        triggers: options.triggers,
        queueIndex: computed(() => dialogsQueue.value.findIndex(v => v.id === newDialogId)),
        close: () => options.close(),
        open: () => options.open(),
        terminate: () => {
            options.close();
            unwatch();
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

    dialogManager.close();
}

/** Handle keydown event */
function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !dialogsQueue.value.length) return;

    const escapeTriggerDialogs = dialogsQueue.value.filter(v => v.triggers.includes('escape'));
    const dialogManager = escapeTriggerDialogs[escapeTriggerDialogs.length - 1] ?? null;

    if (!dialogManager) return;

    const delay = Date.now() - dialogManager.updatedAt;
    const configDelay = config.value.triggersStartDelays.escape;

    if (configDelay && delay < configDelay) return;

    dialogManager.close();
}
