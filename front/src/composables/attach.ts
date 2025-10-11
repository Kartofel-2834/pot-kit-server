// Types
import type { Ref } from 'vue';
import type {
    IAttach,
    IAttachOptions,
    IAttachSurroundingData,
    EAttachedBoxPosition,
} from '@/types/composables/attach';

// Vue
import { computed, ref } from 'vue';

// Composables
import { useSubscriptions } from '@/composables/subscriptions';
import { useDebounce } from '@/composables/timer';

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

export function useAttach(options: Ref<IAttachOptions>, onTerminate?: () => void): IAttach {
    const $subscriptions = useSubscriptions();
    const $surroundingSubscriptions = useSubscriptions();

    const isTargetResizing = ref<boolean>(false);
    const isBoxResizing = ref<boolean>(false);

    const targetElement = ref<Element | null>(null);
    const boxElement = ref<Element | null>(null);

    const targetRect = ref<DOMRect | null>(null);
    const boxRect = ref<DOMRect | null>(null);

    const initialSurrounding = ref<IAttachSurroundingData[]>([]);
    const currentSurrounding = ref<IAttachSurroundingData[]>([]);

    const coordinates = computed<[x: number, y: number]>(getPosition);

    let isTargetFirstResize = true;
    let isBoxFirstResize = true;

    const terminate = useDebounce({
        delay: 50,
        action: () => onTerminate?.(),
    });

    const targetResizeObserver = new ResizeObserver(
        useDebounce<[ResizeObserverEntry[]]>({
            delay: 100,
            immediateAction: () => {
                if (!isTargetFirstResize && options.value.terminateOnChange) {
                    terminate();
                } else {
                    isTargetResizing.value = true;
                }
            },
            action: async entries => {
                if (isTargetFirstResize) {
                    isTargetFirstResize = false;
                } else {
                    await updateTargetRect(entries[0].target);
                }
                isTargetResizing.value = false;
            },
        }),
    );

    const boxResizeObserver = new ResizeObserver(
        useDebounce<[ResizeObserverEntry[]]>({
            delay: 100,
            immediateAction: () => {
                if (!isBoxFirstResize && options.value.terminateOnChange) {
                    terminate();
                } else {
                    isBoxResizing.value = true;
                }
            },
            action: async entries => {
                if (isBoxFirstResize) {
                    isBoxFirstResize = false;
                } else {
                    await updateBoxRect(entries[0].target);
                }
                isBoxResizing.value = false;
            },
        }),
    );

    async function start(target: Element, box: Element) {
        if (!(target instanceof Element) || !(box instanceof Element)) return;

        stop();

        isTargetFirstResize = true;
        isBoxFirstResize = true;
        targetElement.value = target;
        boxElement.value = box;

        $subscriptions.observe('target-resize', target, targetResizeObserver);
        $subscriptions.observe('box-resize', box, boxResizeObserver);
        setupSurrounding(target);

        await Promise.all([updateBoxRect(), updateTargetRect()]);
    }

    function stop() {
        targetElement.value = null;
        boxElement.value = null;
        targetRect.value = null;
        boxRect.value = null;
        isTargetFirstResize = false;
        isBoxFirstResize = false;

        $subscriptions.clear();
        clearSurrounding();
    }

    function getPosition(): [x: number, y: number] {
        if (!targetRect.value || !boxRect.value) {
            return [0, 0];
        }

        const offset = getOffset(currentSurrounding.value, initialSurrounding.value);
        const currentOptions = options.value;

        const { coordinates, position } = getCurrentPosition(
            currentOptions,
            offset,
            targetRect.value,
            boxRect.value,
        );

        return getStickyPosition(
            coordinates,
            { ...currentOptions, position },
            offset,
            targetRect.value,
            boxRect.value,
        );
    }

    function getOffset(
        currentSurrounding: IAttachSurroundingData[],
        initialSurrounding: IAttachSurroundingData[],
    ): [x: number, y: number] {
        return currentSurrounding.reduce(
            ([x, y], data, index) => {
                const initialData = initialSurrounding[index];

                return [
                    x + (initialData.scrollX - data.scrollX),
                    y + (initialData.scrollY - data.scrollY),
                ];
            },
            [0, 0],
        );
    }

    async function updateTargetRect(element: Element | null = targetElement.value) {
        if (!(element instanceof Element)) return;
        targetRect.value = await getElementBounding(element);
    }

    async function updateBoxRect(element: Element | null = boxElement.value) {
        if (!(element instanceof Element)) return;
        boxRect.value = await getElementBounding(element);
    }

    function setupSurrounding(target: Element) {
        const surroundingData = getSurrounding(target);
        const observer = new ResizeObserver(getSurroundingResizeHandler());

        surroundingData.forEach(data => {
            $surroundingSubscriptions.addEventListener({
                eventName: 'scroll',
                target: data.target,
                listener: getSurroundingScrollHandler(data),
                options: { passive: true },
            });

            if (data.target === window) {
                $surroundingSubscriptions.addEventListener({
                    eventName: 'resize',
                    target: data.target,
                    listener: getSurroundingResizeHandler(),
                    options: { capture: true },
                });
            } else if (data.target instanceof Element) {
                $surroundingSubscriptions.observe(data.target, data.target, observer);
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

    function getSurroundingResizeHandler() {
        let isFirst: boolean = true;
        let isTerminated: boolean = false;

        return useDebounce({
            delay: 100,
            immediateAction: () => {
                if (!isFirst && !isTerminated && options.value.terminateOnChange) {
                    isTerminated = true;
                    terminate();
                }
            },
            action: () => {
                if (!targetElement.value || !boxElement.value || isTerminated) return;

                if (isFirst) {
                    isFirst = false;
                    return;
                }

                if (!isTargetResizing.value) updateTargetRect().then();
                if (!isBoxResizing.value) updateBoxRect().then();

                clearSurrounding();
                setupSurrounding(targetElement.value);
            },
        });
    }

    function getSurroundingScrollHandler(data: IAttachSurroundingData) {
        let isTerminated: boolean = false;

        return () => {
            if (options.value.terminateOnChange) {
                if (!isTerminated) terminate();
                isTerminated = true;
                return;
            }

            const x = data.target === window ? window.scrollX : (data.target as Element).scrollLeft;
            const y = data.target === window ? window.scrollY : (data.target as Element).scrollTop;

            currentSurrounding.value = [
                ...currentSurrounding.value.filter(v => v.id !== data.id),
                { ...data, scrollX: x, scrollY: y },
            ];
        };
    }

    return {
        coordinates,
        target: targetElement,
        box: boxElement,
        targetRect,
        boxRect,
        start,
        stop,
    };
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

function getCurrentPosition(
    options: IAttachOptions,
    offset: [x: number, y: number],
    targetRect: DOMRect,
    boxRect: DOMRect,
): {
    coordinates: [x: number, y: number];
    position: EAttachedBoxPosition;
} {
    const { height: boxHeight, width: boxWidth } = boxRect;

    const [offsetX, offsetY] = offset;

    const yStart = calculateYForPosition(options, offsetY, targetRect, boxRect);
    const yEnd = yStart + boxHeight;
    const xStart = calculateXForPosition(options, offsetX, targetRect, boxRect);
    const xEnd = xStart + boxWidth;

    if (options.persistent) {
        return {
            coordinates: [xStart, yStart],
            position: options.position,
        };
    }

    const edgeMargin = options.edgeMargin || 0;
    const topLimit = edgeMargin;
    const bottomLimit = window.innerHeight - edgeMargin;
    const leftLimit = edgeMargin;
    const rightLimit = window.innerWidth - edgeMargin;

    const oppositeSideX = options.oppositeSideX ?? X_OPPOSITE_POSITIONS[options.position];
    const oppositeSideY = options.oppositeSideY ?? Y_OPPOSITE_POSITIONS[options.position];

    const xOptions = { ...options, position: oppositeSideX } as IAttachOptions;
    const yOptions = { ...options, position: oppositeSideY } as IAttachOptions;

    let currentPosition = options.position;
    let x: number = xStart;
    let y: number = yStart;

    if (oppositeSideY && yStart < topLimit) {
        // If it goes beyond the TOP edge of the screen
        const newY = calculateYForPosition(yOptions, offsetY, targetRect, boxRect);
        const newX = calculateXForPosition(yOptions, offsetX, targetRect, boxRect);

        y = newY > yStart ? newY : yStart;
        x = newY > yStart ? newX : xStart;
        currentPosition = oppositeSideY;
    } else if (oppositeSideY && yEnd > bottomLimit) {
        // If it goes beyond the BOTTOM edge of the screen
        const newY = calculateYForPosition(yOptions, offsetY, targetRect, boxRect);
        const newX = calculateXForPosition(yOptions, offsetX, targetRect, boxRect);

        y = newY < yStart ? newY : yStart;
        x = newY < yStart ? newX : xStart;
        currentPosition = oppositeSideY;
    } else if (oppositeSideX && xStart < leftLimit) {
        // If it goes beyond the LEFT edge of the screen
        const newY = calculateYForPosition(xOptions, offsetY, targetRect, boxRect);
        const newX = calculateXForPosition(xOptions, offsetX, targetRect, boxRect);

        y = newX > xStart ? newY : yStart;
        x = newX > xStart ? newX : xStart;
        currentPosition = oppositeSideX;
    } else if (oppositeSideX && xEnd > rightLimit) {
        // If it goes beyond the RIGHT edge of the screen
        const newY = calculateYForPosition(xOptions, offsetY, targetRect, boxRect);
        const newX = calculateXForPosition(xOptions, offsetX, targetRect, boxRect);

        y = newX < xStart ? newY : yStart;
        x = newX < xStart ? newX : xStart;
        currentPosition = oppositeSideX;
    }

    return {
        coordinates: [x, y],
        position: currentPosition,
    };
}

function getStickyPosition(
    coordinates: [x: number, y: number],
    options: IAttachOptions,
    offset: [x: number, y: number],
    targetRect: DOMRect,
    boxRect: DOMRect,
): [x: number, y: number] {
    if (!options.sticky) {
        return [...coordinates];
    }

    const {
        x: targetXInitial,
        y: targetYInitial,
        height: targetHeight,
        width: targetWidth,
    } = targetRect;
    const { height: boxHeight, width: boxWidth } = boxRect;

    const [xStart, yStart] = coordinates;
    const [offsetX, offsetY] = offset;

    const yEnd = yStart + boxHeight;
    const xEnd = xStart + boxWidth;

    const targetStartY = targetYInitial + offsetY;
    const targetEndY = targetStartY + targetHeight;
    const targetStartX = targetXInitial + offsetX;
    const targetEndX = targetStartX + targetWidth;

    const edgeMargin = options.edgeMargin || 0;
    const topLimit = edgeMargin;
    const bottomLimit = window.innerHeight - edgeMargin;
    const leftLimit = edgeMargin;
    const rightLimit = window.innerWidth - edgeMargin;

    const isXSticky = STICKY_X_POSITIONS.includes(options.position);
    const isYSticky = STICKY_Y_POSITIONS.includes(options.position);

    let x: number = xStart;
    let y: number = yStart;

    if (isXSticky && xStart < leftLimit) {
        const stickyLimit = targetEndX;
        x = Math.min(Math.max(xStart, leftLimit), stickyLimit);
    } else if (isXSticky && xEnd > rightLimit) {
        const stickyLimit = targetStartX;
        x = Math.max(Math.min(xEnd, rightLimit), stickyLimit) - boxWidth - edgeMargin;
    }

    if (isYSticky && yStart < topLimit) {
        const stickyLimit = targetEndY;
        y = Math.min(Math.max(yStart, topLimit), stickyLimit);
    } else if (isYSticky && yEnd > bottomLimit) {
        const stickyLimit = targetStartY;
        y = Math.max(Math.min(yEnd, bottomLimit), stickyLimit) - boxHeight - edgeMargin;
    }

    return [x, y];
}

/** Get pure box Y coordinate, without limited by screen and target sizes */
function calculateYForPosition(
    options: IAttachOptions,
    offset: number,
    targetRect: DOMRect,
    boxRect: DOMRect,
): number {
    const { y: targetYInitial, height: targetHeight } = targetRect;
    const { height: boxHeight } = boxRect;
    const targetY = targetYInitial + offset;

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
function calculateXForPosition(
    options: IAttachOptions,
    offset: number,
    targetRect: DOMRect,
    boxRect: DOMRect,
): number {
    const { x: targetXInitial, width: targetWidth } = targetRect;
    const { width: boxWidth } = boxRect;
    const targetX = targetXInitial + offset;

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
