// Types
import type { ComputedRef, MaybeRef, Ref } from 'vue';
import type {
    IAttach,
    IAttachOptions,
    IAttachSurroundingData,
    EAttachedBoxPosition,
} from '@/types/composables/attach';

// Vue
import { computed, readonly, ref, toRef, unref, watch } from 'vue';

// Composables
import { useComponentSubscriptions, useSubscriptions } from '@/composables/subscriptions';
import { useDebounce, useThrottle } from '@/composables/timer';

// Constants
import { ATTACHED_BOX_POSITION } from '@/types/composables/attach';

const STICKY_X_POSITIONS: EAttachedBoxPosition[] = [
    ATTACHED_BOX_POSITION.TOP_START,
    ATTACHED_BOX_POSITION.TOP_END,
    ATTACHED_BOX_POSITION.TOP_CENTER,
    ATTACHED_BOX_POSITION.BOTTOM_START,
    ATTACHED_BOX_POSITION.BOTTOM_END,
    ATTACHED_BOX_POSITION.BOTTOM_CENTER,
];

const STICKY_Y_POSITIONS: EAttachedBoxPosition[] = [
    ATTACHED_BOX_POSITION.LEFT_START,
    ATTACHED_BOX_POSITION.LEFT_END,
    ATTACHED_BOX_POSITION.LEFT_CENTER,
    ATTACHED_BOX_POSITION.RIGHT_START,
    ATTACHED_BOX_POSITION.RIGHT_END,
    ATTACHED_BOX_POSITION.RIGHT_CENTER,
];

const X_OPPOSITE_POSITIONS: Record<EAttachedBoxPosition, EAttachedBoxPosition | null> = {
    [ATTACHED_BOX_POSITION.TOP_START]: null,
    [ATTACHED_BOX_POSITION.TOP_END]: null,
    [ATTACHED_BOX_POSITION.TOP_CENTER]: null,

    [ATTACHED_BOX_POSITION.BOTTOM_START]: null,
    [ATTACHED_BOX_POSITION.BOTTOM_END]: null,
    [ATTACHED_BOX_POSITION.BOTTOM_CENTER]: null,

    [ATTACHED_BOX_POSITION.LEFT_START]: ATTACHED_BOX_POSITION.RIGHT_START,
    [ATTACHED_BOX_POSITION.LEFT_END]: ATTACHED_BOX_POSITION.RIGHT_END,
    [ATTACHED_BOX_POSITION.LEFT_CENTER]: ATTACHED_BOX_POSITION.RIGHT_CENTER,

    [ATTACHED_BOX_POSITION.RIGHT_START]: ATTACHED_BOX_POSITION.LEFT_START,
    [ATTACHED_BOX_POSITION.RIGHT_END]: ATTACHED_BOX_POSITION.LEFT_END,
    [ATTACHED_BOX_POSITION.RIGHT_CENTER]: ATTACHED_BOX_POSITION.LEFT_CENTER,
};

const Y_OPPOSITE_POSITIONS: Record<EAttachedBoxPosition, EAttachedBoxPosition | null> = {
    [ATTACHED_BOX_POSITION.TOP_START]: ATTACHED_BOX_POSITION.BOTTOM_START,
    [ATTACHED_BOX_POSITION.TOP_END]: ATTACHED_BOX_POSITION.BOTTOM_END,
    [ATTACHED_BOX_POSITION.TOP_CENTER]: ATTACHED_BOX_POSITION.BOTTOM_CENTER,

    [ATTACHED_BOX_POSITION.BOTTOM_START]: ATTACHED_BOX_POSITION.TOP_START,
    [ATTACHED_BOX_POSITION.BOTTOM_END]: ATTACHED_BOX_POSITION.TOP_END,
    [ATTACHED_BOX_POSITION.BOTTOM_CENTER]: ATTACHED_BOX_POSITION.TOP_CENTER,

    [ATTACHED_BOX_POSITION.LEFT_START]: null,
    [ATTACHED_BOX_POSITION.LEFT_END]: null,
    [ATTACHED_BOX_POSITION.LEFT_CENTER]: null,

    [ATTACHED_BOX_POSITION.RIGHT_START]: null,
    [ATTACHED_BOX_POSITION.RIGHT_END]: null,
    [ATTACHED_BOX_POSITION.RIGHT_CENTER]: null,
};

export function useAttach(options: IAttachOptions): IAttach {
    const $subscriptions = useComponentSubscriptions();

    const change = useThrottle({
        delay: 50,
        action: () => options.onChange?.(),
    });

    const { handler: targetResizeHandler, isResizing: isTargetResizing } = getResizeHandler(
        entries => updateTargetRect(entries[0].target).then(),
        () => change(),
    );

    const { handler: boxResizeHandler, isResizing: isBoxResizing } = getResizeHandler(
        entries => updateBoxRect(entries[0].target).then(),
        () => change(),
    );

    const targetResizeObserver = new ResizeObserver(targetResizeHandler);
    const boxResizeObserver = new ResizeObserver(boxResizeHandler);

    const targetRect = ref<DOMRect | null>(null);
    const boxRect = ref<DOMRect | null>(null);

    // Computed
    const target = computed<Element | null>(() => {
        const currentTarget = unref(options.target);
        const currentBox = unref(options.box);

        return currentTarget && currentBox ? currentTarget : null;
    });

    const box = computed<Element | null>(() => {
        const currentTarget = unref(options.target);
        const currentBox = unref(options.box);

        return currentTarget && currentBox ? currentBox : null;
    });

    const { currentSurrounding, initialSurrounding } = useSurrounding({
        target: target,
        onChange: () => change(),
        onResize: () => {
            if (!isTargetResizing.value) updateTargetRect().then();
            if (!isBoxResizing.value) updateBoxRect().then();
        },
    });

    const offset = useOffset(initialSurrounding, currentSurrounding);
    const offsetX = toRef(() => offset.value[0]);
    const offsetY = toRef(() => offset.value[1]);

    const position = usePosition({
        targetRect,
        boxRect,
        offset,
        position: options.position,
        persistent: options.persistent,
        nudge: options.nudge,
        edgeMargin: options.edgeMargin,
        oppositeSideX: options.oppositeSideX,
        oppositeSideY: options.oppositeSideY,
    });

    const x = useX({
        targetRect,
        boxRect,
        position,
        offset: offsetX,
        edgeMargin: options.edgeMargin,
        nudge: options.nudge,
        sticky: options.sticky,
    });

    const y = useY({
        targetRect,
        boxRect,
        position,
        offset: offsetY,
        edgeMargin: options.edgeMargin,
        nudge: options.nudge,
        sticky: options.sticky,
    });

    // Watchers
    watch(
        () => target.value,
        async newValue => updateTargetRect(newValue),
    );

    watch(
        () => box.value,
        async newValue => updateBoxRect(newValue),
    );

    // Subscriptions
    $subscriptions.observe({
        target: target,
        observer: targetResizeObserver,
    });

    $subscriptions.observe({
        target: box,
        observer: boxResizeObserver,
    });

    async function updateTargetRect(element?: Element | null) {
        const data = element === undefined ? unref(options.target) : element;
        targetRect.value = data instanceof Element ? await getElementBounding(data) : null;
    }

    async function updateBoxRect(element?: Element | null) {
        const data = element === undefined ? unref(options.box) : element;
        boxRect.value = data instanceof Element ? await getElementBounding(data) : null;
    }

    return {
        x,
        y,
        targetRect: readonly(targetRect),
        boxRect: readonly(boxRect),
    };
}

function useOffset(
    initialSurrounding: MaybeRef<IAttachSurroundingData[]>,
    currentSurrounding: MaybeRef<IAttachSurroundingData[]>,
): ComputedRef<[x: number, y: number]> {
    return computed(() => {
        const initial = unref(initialSurrounding);
        const current = unref(currentSurrounding);

        return current.reduce(
            ([x, y], data, index) => {
                const initialData = initial[index];

                return [
                    x + (initialData.scrollX - data.scrollX),
                    y + (initialData.scrollY - data.scrollY),
                ];
            },
            [0, 0],
        );
    });
}

function useSurrounding(options: {
    target: MaybeRef<Element | null>;
    onResize?: () => void;
    onScroll?: () => void;
    onChange?: () => void;
}): {
    currentSurrounding: Readonly<Ref<IAttachSurroundingData[]>>;
    initialSurrounding: Readonly<Ref<IAttachSurroundingData[]>>;
    controller: AbortController;
} {
    const $subscriptions = useComponentSubscriptions();
    const $surroundingSubscriptions = useSubscriptions();

    const currentSurrounding = ref<IAttachSurroundingData[]>([]);
    const initialSurrounding = ref<IAttachSurroundingData[]>([]);

    function setupSurrounding(target: Element) {
        const surroundingData = getSurrounding(target);

        const resizeHandler = getSurroundingResizeHandler();
        const observer = new ResizeObserver(resizeHandler);

        surroundingData.forEach(data => {
            const scrollHandler = getSurroundingScrollHandler(data);

            $surroundingSubscriptions.addEventListener({
                eventName: 'scroll',
                target: data.target,
                listener: scrollHandler,
                options: { passive: true },
            });

            if (data.target === window) {
                $surroundingSubscriptions.addEventListener({
                    eventName: 'resize',
                    target: data.target,
                    listener: resizeHandler,
                    options: { capture: true },
                });
            } else if (data.target instanceof Element) {
                $surroundingSubscriptions.observe({
                    key: data.target,
                    target: data.target,
                    observer: observer,
                });
            }
        });

        initialSurrounding.value = surroundingData;
        currentSurrounding.value = surroundingData.map(v => ({ ...v }));
    }

    function clearSurrounding() {
        $surroundingSubscriptions.clear();
        initialSurrounding.value = [];
        currentSurrounding.value = [];
    }

    function getSurroundingResizeHandler(): (entries: ResizeObserverEntry[]) => void {
        const { handler } = getResizeHandler(
            () => {
                const target = unref(options.target);

                if (!target) return;

                options.onResize?.();
                clearSurrounding();
                setupSurrounding(target);
            },
            () => options.onChange?.(),
        );

        return handler;
    }

    function getSurroundingScrollHandler(data: IAttachSurroundingData) {
        return () => {
            options.onChange?.();

            const x = data.target instanceof Element ? data.target.scrollLeft : window.scrollX;
            const y = data.target instanceof Element ? data.target.scrollTop : window.scrollY;

            currentSurrounding.value = [
                ...currentSurrounding.value.filter(v => v.id !== data.id),
                { ...data, scrollX: x, scrollY: y },
            ];
        };
    }

    const controller = $subscriptions.bind(
        options.target,
        element => setupSurrounding(element),
        () => clearSurrounding(),
    );

    return {
        currentSurrounding,
        initialSurrounding,
        controller,
    };
}

function usePosition(options: {
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    offset: MaybeRef<[x: number, y: number]>;
    position: MaybeRef<EAttachedBoxPosition | null>;
    persistent: MaybeRef<boolean>;
    nudge: MaybeRef<number>;
    edgeMargin: MaybeRef<number>;
    oppositeSideX?: MaybeRef<EAttachedBoxPosition>;
    oppositeSideY?: MaybeRef<EAttachedBoxPosition>;
}): ComputedRef<EAttachedBoxPosition | null> {
    return computed(() => {
        const targetRect = unref(options.targetRect);
        const boxRect = unref(options.boxRect);
        const position = unref(options.position);
        const persistent = unref(options.persistent);

        if (!boxRect || !targetRect || !position) return null;

        if (persistent) return position;

        const currentOffset = unref(options.offset);
        const oppositeSideX = unref(options.oppositeSideX) ?? X_OPPOSITE_POSITIONS[position];
        const oppositeSideY = unref(options.oppositeSideY) ?? Y_OPPOSITE_POSITIONS[position];
        const nudge = unref(options.nudge);
        const edgeMargin = unref(options.edgeMargin) || 0;

        const { height: boxHeight, width: boxWidth } = boxRect;
        const {
            y: yTargetInitial,
            x: xTargetInitial,
            width: targetWidth,
            height: targetHeight,
        } = targetRect;
        const [offsetX, offsetY] = currentOffset;

        const yTargetStart = yTargetInitial + offsetY;
        const yTargetEnd = yTargetStart + targetHeight;
        const xTargetStart = xTargetInitial + offsetX;
        const xTargetEnd = xTargetStart + targetWidth;

        const yStart = calculateYForPosition({
            position,
            targetRect: targetRect,
            boxRect: boxRect,
            nudge,
            offset: offsetY,
        });
        const xStart = calculateXForPosition({
            position,
            targetRect: targetRect,
            boxRect: boxRect,
            nudge,
            offset: offsetX,
        });
        const yEnd = yStart + boxHeight;
        const xEnd = xStart + boxWidth;

        const topLimit = edgeMargin;
        const bottomLimit = window.innerHeight - edgeMargin;
        const leftLimit = edgeMargin;
        const rightLimit = window.innerWidth - edgeMargin;

        if (oppositeSideY && yStart < topLimit && yEnd <= yTargetStart) {
            // If it goes beyond the TOP edge of the screen
            return oppositeSideY;
        } else if (oppositeSideY && yEnd > bottomLimit && yStart >= yTargetEnd) {
            // If it goes beyond the BOTTOM edge of the screen
            return oppositeSideY;
        } else if (oppositeSideX && xStart < leftLimit && xEnd <= xTargetStart) {
            // If it goes beyond the LEFT edge of the screen
            return oppositeSideX;
        } else if (oppositeSideX && xEnd > rightLimit && xStart >= xTargetEnd) {
            // If it goes beyond the RIGHT edge of the screen
            return oppositeSideX;
        }

        return position;
    });
}

function useY(options: {
    sticky: MaybeRef<boolean>;
    offset: MaybeRef<number>;
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    position: MaybeRef<EAttachedBoxPosition | null>;
    edgeMargin: MaybeRef<number>;
    nudge: MaybeRef<number>;
}): ComputedRef<number | null> {
    const yPure = usePureY(options);

    return computed(() => {
        const sticky = unref(options.sticky);

        if (!sticky || !yPure.value) return yPure.value;

        const ySticky = useStickyY({
            ...options,
            y: yPure.value,
        });

        return unref(ySticky);
    });
}

function useX(options: {
    sticky: MaybeRef<boolean>;
    offset: MaybeRef<number>;
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    position: MaybeRef<EAttachedBoxPosition | null>;
    edgeMargin: MaybeRef<number>;
    nudge: MaybeRef<number>;
}): ComputedRef<number | null> {
    const xPure = usePureX(options);

    return computed(() => {
        const sticky = unref(options.sticky);

        if (!sticky || !xPure.value) return xPure.value;

        const xSticky = useStickyX({
            ...options,
            x: xPure.value,
        });

        return unref(xSticky);
    });
}

function useStickyY(options: {
    y: MaybeRef<number>;
    offset: MaybeRef<number>;
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    position: MaybeRef<EAttachedBoxPosition | null>;
    edgeMargin: MaybeRef<number>;
}): ComputedRef<number> {
    return computed(() => {
        const y = unref(options.y);
        const position = unref(options.position);
        const targetRect = unref(options.targetRect);
        const boxRect = unref(options.boxRect);

        if (!targetRect || !boxRect || !position) return y;

        if (!STICKY_Y_POSITIONS.includes(position)) return y;

        const offsetY = unref(options.offset);
        const edgeMargin = unref(options.edgeMargin);

        const { y: targetYInitial, height: targetHeight } = targetRect;
        const { height: boxHeight } = boxRect;

        const yStart = y;
        const yEnd = yStart + boxHeight;

        const targetStartY = targetYInitial + offsetY;
        const targetEndY = targetStartY + targetHeight;

        const topLimit = edgeMargin;
        const bottomLimit = window.innerHeight - edgeMargin;

        if (yStart < topLimit) {
            const stickyLimit = targetEndY;
            return Math.min(Math.max(yStart, topLimit), stickyLimit);
        } else if (yEnd > bottomLimit) {
            const stickyLimit = targetStartY;
            return Math.max(Math.min(yEnd, bottomLimit), stickyLimit) - boxHeight - edgeMargin;
        }

        return y;
    });
}

function useStickyX(options: {
    x: MaybeRef<number>;
    offset: MaybeRef<number>;
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    position: MaybeRef<EAttachedBoxPosition | null>;
    edgeMargin: MaybeRef<number>;
}): ComputedRef<number> {
    return computed(() => {
        const x = unref(options.x);
        const position = unref(options.position);
        const targetRect = unref(options.targetRect);
        const boxRect = unref(options.boxRect);

        if (!targetRect || !boxRect || !position) return x;

        if (!STICKY_X_POSITIONS.includes(position)) return x;

        const offsetX = unref(options.offset);
        const edgeMargin = unref(options.edgeMargin);

        const { x: targetXInitial, width: targetWidth } = targetRect;
        const { width: boxWidth } = boxRect;

        const xStart = x;
        const xEnd = xStart + boxWidth;

        const targetStartX = targetXInitial + offsetX;
        const targetEndX = targetStartX + targetWidth;

        const leftLimit = edgeMargin;
        const rightLimit = window.innerWidth - edgeMargin;

        if (xStart < leftLimit) {
            const stickyLimit = targetEndX;
            return Math.min(Math.max(xStart, leftLimit), stickyLimit);
        } else if (xEnd > rightLimit) {
            const stickyLimit = targetStartX;
            return Math.max(Math.min(xEnd, rightLimit), stickyLimit) - boxWidth - edgeMargin;
        }

        return x;
    });
}

/** Get pure box Y coordinate, without limited by screen and target sizes */
function usePureY(options: {
    position: MaybeRef<EAttachedBoxPosition | null>;
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    nudge: MaybeRef<number>;
    offset: MaybeRef<number>;
}): ComputedRef<number | null> {
    return computed(() => {
        const targetRect = unref(options.targetRect);
        const boxRect = unref(options.boxRect);
        const position = unref(options.position);

        if (!targetRect || !boxRect || !position) return null;

        const nudge = unref(options.nudge);
        const offset = unref(options.offset);

        return calculateYForPosition({
            position,
            nudge,
            offset,
            targetRect,
            boxRect,
        });
    });
}

/** Get pure box X coordinate, without limited by screen and target sizes */
function usePureX(options: {
    position: MaybeRef<EAttachedBoxPosition | null>;
    targetRect: MaybeRef<DOMRect | null>;
    boxRect: MaybeRef<DOMRect | null>;
    nudge: MaybeRef<number>;
    offset: MaybeRef<number>;
}): ComputedRef<number | null> {
    return computed(() => {
        const targetRect = unref(options.targetRect);
        const boxRect = unref(options.boxRect);
        const position = unref(options.position);

        if (!targetRect || !boxRect || !position) return null;

        const nudge = unref(options.nudge);
        const offset = unref(options.offset);

        return calculateXForPosition({
            position,
            nudge,
            offset,
            targetRect,
            boxRect,
        });
    });
}

/** Get pure box Y coordinate, without limited by screen and target sizes */
function calculateYForPosition(options: {
    position: EAttachedBoxPosition;
    targetRect: DOMRect;
    boxRect: DOMRect;
    nudge: number;
    offset: number;
}): number {
    const { y: targetYInitial, height: targetHeight } = options.targetRect;
    const { height: boxHeight } = options.boxRect;
    const targetY = targetYInitial + options.offset;

    switch (options.position) {
        case ATTACHED_BOX_POSITION.TOP_START:
        case ATTACHED_BOX_POSITION.TOP_END:
        case ATTACHED_BOX_POSITION.TOP_CENTER:
            return targetY - boxHeight - options.nudge;

        case ATTACHED_BOX_POSITION.BOTTOM_START:
        case ATTACHED_BOX_POSITION.BOTTOM_END:
        case ATTACHED_BOX_POSITION.BOTTOM_CENTER:
            return targetY + targetHeight + options.nudge;

        case ATTACHED_BOX_POSITION.RIGHT_START:
        case ATTACHED_BOX_POSITION.LEFT_START:
            return targetY;

        case ATTACHED_BOX_POSITION.RIGHT_END:
        case ATTACHED_BOX_POSITION.LEFT_END:
            return targetY + targetHeight - boxHeight;

        case ATTACHED_BOX_POSITION.RIGHT_CENTER:
        case ATTACHED_BOX_POSITION.LEFT_CENTER:
            return targetY + targetHeight / 2 - boxHeight / 2;

        default:
            return 0;
    }
}

/** Get pure box X coordinate, without limited by screen and target sizes */
function calculateXForPosition(options: {
    position: EAttachedBoxPosition;
    targetRect: DOMRect;
    boxRect: DOMRect;
    nudge: number;
    offset: number;
}): number {
    const { x: targetXInitial, width: targetWidth } = options.targetRect;
    const { width: boxWidth } = options.boxRect;
    const targetX = targetXInitial + options.offset;

    switch (options.position) {
        case ATTACHED_BOX_POSITION.TOP_CENTER:
        case ATTACHED_BOX_POSITION.BOTTOM_CENTER:
            return targetX + targetWidth / 2 - boxWidth / 2;

        case ATTACHED_BOX_POSITION.TOP_START:
        case ATTACHED_BOX_POSITION.BOTTOM_START:
            return targetX;

        case ATTACHED_BOX_POSITION.TOP_END:
        case ATTACHED_BOX_POSITION.BOTTOM_END:
            return targetX + targetWidth - boxWidth;

        case ATTACHED_BOX_POSITION.RIGHT_END:
        case ATTACHED_BOX_POSITION.RIGHT_START:
        case ATTACHED_BOX_POSITION.RIGHT_CENTER:
            return targetX + targetWidth + options.nudge;

        case ATTACHED_BOX_POSITION.LEFT_END:
        case ATTACHED_BOX_POSITION.LEFT_START:
        case ATTACHED_BOX_POSITION.LEFT_CENTER:
            return targetX - boxWidth - options.nudge;

        default:
            return 0;
    }
}

/** Get element bounding rect */
async function getElementBounding(element: Element): Promise<DOMRect | null> {
    return new Promise(resolve => {
        const observer = new IntersectionObserver(entries => {
            resolve(entries?.[0]?.boundingClientRect ?? null);
            observer.disconnect();
        });
        observer.observe(element);
    });
}

/** Get all parents of element */
function getAllParents(element: Element): Element[] {
    if (!(element instanceof Element)) return [];

    const root = element.getRootNode();

    let result = [];
    let currentElement: Element | null = element;

    while (currentElement) {
        currentElement = currentElement.parentElement;
        result.push(currentElement);
    }

    if (root instanceof ShadowRoot) {
        result = result.concat(getAllParents(root.host));
    }

    result = result.filter(Boolean) as Element[];

    return result.filter(Boolean) as Element[];
}

/** Get surrounding elements, with scroll\size characteristics */
function getSurrounding(element: Element): IAttachSurroundingData[] {
    const position = getComputedStyle(element).position;
    const windowSurrounding: IAttachSurroundingData = {
        id: 0,
        target: window,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        width: window.innerWidth,
        height: window.innerHeight,
        position: null,
    };

    if (position === 'fixed') {
        return [windowSurrounding];
    }

    const parents = getAllParents(element);
    const parentsSurrounding: IAttachSurroundingData[] = [];

    let savedPosition: string = '';

    for (const parent of parents) {
        const parentPosition = getComputedStyle(parent).position;

        if (parentPosition === 'fixed') {
            savedPosition = parentPosition;
            break;
        }

        if (['sticky', 'absolute'].includes(savedPosition) && parentPosition !== 'relative') {
            continue;
        }

        if (['sticky', 'absolute'].includes(savedPosition) && parentPosition === 'relative') {
            savedPosition = '';
        }

        if (parentPosition === 'absolute' || parentPosition === 'sticky') {
            savedPosition = parentPosition;
        }

        parentsSurrounding.push({
            id: parentsSurrounding.length + 1,
            target: parent,
            scrollY: parent.scrollTop,
            scrollX: parent.scrollLeft,
            width: parent.clientWidth,
            height: parent.clientHeight,
            position: parentPosition,
        });
    }

    if (['sticky', 'absolute'].includes(savedPosition)) {
        return parentsSurrounding;
    }

    windowSurrounding.id = parentsSurrounding.length + 1;

    return [...parentsSurrounding, windowSurrounding];
}

function getResizeHandler(
    action: (entries: ResizeObserverEntry[]) => void,
    immediateAction: (entries: ResizeObserverEntry[]) => void,
    delay: number = 100,
): {
    handler: (entries: ResizeObserverEntry[]) => void;
    isResizing: Ref<boolean>;
} {
    let isFirstResize: boolean = true;
    const isResizing = ref<boolean>(false);

    const handler = useDebounce<[ResizeObserverEntry[]]>({
        delay,
        immediateAction: entries => {
            if (isFirstResize) return;
            isResizing.value = true;
            immediateAction(entries);
        },
        action: async entries => {
            if (isFirstResize) {
                isFirstResize = false;
                return;
            }

            isResizing.value = false;
            action(entries);
        },
    });

    return { handler, isResizing };
}
