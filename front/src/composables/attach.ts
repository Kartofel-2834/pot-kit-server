// Types
import type { EPotAttachedBoxPosition } from '@/types/components/attach-target';
import type { IAttach, IAttachOptions } from '@/types/composables/attach';
import type { ISurroundingData } from '@/types/composables/surrounding';

// Constants
import { POT_ATTACHED_BOX_POSITION } from '@/types/components/attach-target';

// Vue
import { computed, ref } from 'vue';

// Composables
import { useSurrounding } from '@/composables/surrounding';
import { useDebounce } from '@/composables/timer';

const STICKY_X_POSITIONS: EPotAttachedBoxPosition[] = [
    POT_ATTACHED_BOX_POSITION.TOP_START,
    POT_ATTACHED_BOX_POSITION.TOP_END,
    POT_ATTACHED_BOX_POSITION.TOP_CENTER,
    POT_ATTACHED_BOX_POSITION.BOTTOM_START,
    POT_ATTACHED_BOX_POSITION.BOTTOM_END,
    POT_ATTACHED_BOX_POSITION.BOTTOM_CENTER,
];

const STICKY_Y_POSITIONS: EPotAttachedBoxPosition[] = [
    POT_ATTACHED_BOX_POSITION.LEFT_START,
    POT_ATTACHED_BOX_POSITION.LEFT_END,
    POT_ATTACHED_BOX_POSITION.LEFT_CENTER,
    POT_ATTACHED_BOX_POSITION.RIGHT_START,
    POT_ATTACHED_BOX_POSITION.RIGHT_END,
    POT_ATTACHED_BOX_POSITION.RIGHT_CENTER,
];

const X_OPPOSITE_POSITIONS: Record<EPotAttachedBoxPosition, EPotAttachedBoxPosition | null> = {
    [POT_ATTACHED_BOX_POSITION.TOP_START]: null,
    [POT_ATTACHED_BOX_POSITION.TOP_END]: null,
    [POT_ATTACHED_BOX_POSITION.TOP_CENTER]: null,

    [POT_ATTACHED_BOX_POSITION.BOTTOM_START]: null,
    [POT_ATTACHED_BOX_POSITION.BOTTOM_END]: null,
    [POT_ATTACHED_BOX_POSITION.BOTTOM_CENTER]: null,

    [POT_ATTACHED_BOX_POSITION.LEFT_START]: POT_ATTACHED_BOX_POSITION.RIGHT_START,
    [POT_ATTACHED_BOX_POSITION.LEFT_END]: POT_ATTACHED_BOX_POSITION.RIGHT_END,
    [POT_ATTACHED_BOX_POSITION.LEFT_CENTER]: POT_ATTACHED_BOX_POSITION.RIGHT_CENTER,

    [POT_ATTACHED_BOX_POSITION.RIGHT_START]: POT_ATTACHED_BOX_POSITION.LEFT_START,
    [POT_ATTACHED_BOX_POSITION.RIGHT_END]: POT_ATTACHED_BOX_POSITION.LEFT_END,
    [POT_ATTACHED_BOX_POSITION.RIGHT_CENTER]: POT_ATTACHED_BOX_POSITION.LEFT_CENTER,
};

const Y_OPPOSITE_POSITIONS: Record<EPotAttachedBoxPosition, EPotAttachedBoxPosition | null> = {
    [POT_ATTACHED_BOX_POSITION.TOP_START]: POT_ATTACHED_BOX_POSITION.BOTTOM_START,
    [POT_ATTACHED_BOX_POSITION.TOP_END]: POT_ATTACHED_BOX_POSITION.BOTTOM_END,
    [POT_ATTACHED_BOX_POSITION.TOP_CENTER]: POT_ATTACHED_BOX_POSITION.BOTTOM_CENTER,

    [POT_ATTACHED_BOX_POSITION.BOTTOM_START]: POT_ATTACHED_BOX_POSITION.TOP_START,
    [POT_ATTACHED_BOX_POSITION.BOTTOM_END]: POT_ATTACHED_BOX_POSITION.TOP_END,
    [POT_ATTACHED_BOX_POSITION.BOTTOM_CENTER]: POT_ATTACHED_BOX_POSITION.TOP_CENTER,

    [POT_ATTACHED_BOX_POSITION.LEFT_START]: null,
    [POT_ATTACHED_BOX_POSITION.LEFT_END]: null,
    [POT_ATTACHED_BOX_POSITION.LEFT_CENTER]: null,

    [POT_ATTACHED_BOX_POSITION.RIGHT_START]: null,
    [POT_ATTACHED_BOX_POSITION.RIGHT_END]: null,
    [POT_ATTACHED_BOX_POSITION.RIGHT_CENTER]: null,
};

/** Composable for calculating attached to target box position */
export function useAttach(options: IAttachOptions): IAttach {
    const coordinates = computed<[x: number, y: number]>(getPosition);

    const targetElement = ref<Element | null>(null);
    const boxElement = ref<Element | null>(null);

    const surrounding = useSurrounding({
        onResize: handleSurroundingResize(),
        onScroll: handleSurroundingScroll(),
    });

    const isTargetResizing = ref<boolean>(false);
    const isBoxResizing = ref<boolean>(false);
    const isSurroundingResizing = ref<boolean>(false);
    const isScrolling = ref<boolean>(false);

    const targetRect = ref<DOMRect | null>(null);
    const boxRect = ref<DOMRect | null>(null);

    const currentSurrounding = ref<ISurroundingData[]>([]);

    const targetResizeObserver = new ResizeObserver(
        useDebounce<[ResizeObserverEntry[]]>({
            delay: 100,
            immediateAction: async entries => {
                if (targetRect.value === null) {
                    await updateTargetRect(entries[0].target);
                } else {
                    isTargetResizing.value = true;
                }
            },
            action: async entries => {
                if (!isTargetResizing.value) return;

                isTargetResizing.value = false;
                await updateTargetRect(entries[0].target);
            },
        }),
    );

    const boxResizeObserver = new ResizeObserver(
        useDebounce<[ResizeObserverEntry[]]>({
            delay: 100,
            immediateAction: async entries => {
                if (boxRect.value === null) {
                    await updateBoxRect(entries[0].target);
                } else {
                    isBoxResizing.value = true;
                }
            },
            action: async entries => {
                if (!isBoxResizing.value) return;

                isBoxResizing.value = false;
                await updateBoxRect(entries[0].target);
            },
        }),
    );

    /** Set box target element */
    function setTarget(target: Element) {
        targetElement.value = target;
    }

    /** Set box element */
    function setBox(box: Element) {
        boxElement.value = box;
    }

    /** Setup box, target and their surrounding observers */
    function setup() {
        if (!targetElement.value || !boxElement.value) return;

        targetResizeObserver.observe(targetElement.value);
        boxResizeObserver.observe(boxElement.value);

        surrounding.setup(targetElement.value);
        currentSurrounding.value = surrounding.data.value.map(v => ({ ...v }));
    }

    /** Terminate box, target and their surrounding observers */
    function terminate() {
        targetElement.value = null;
        boxElement.value = null;

        currentSurrounding.value = [];
        targetRect.value = null;
        boxRect.value = null;

        targetResizeObserver.disconnect();
        boxResizeObserver.disconnect();
        surrounding.terminate();
    }

    function getPosition(): [x: number, y: number] {
        if (!targetRect.value || !boxRect.value) {
            return [0, 0];
        }

        const offset = getOffset(currentSurrounding.value, surrounding.data.value);

        const { coordinates, position } = getCurrentPosition(
            options,
            offset,
            targetRect.value,
            boxRect.value,
        );

        return getStickyPosition(
            coordinates,
            { ...options, position },
            offset,
            targetRect.value,
            boxRect.value,
        );
    }

    function getOffset(
        currentSurrounding: ISurroundingData[],
        initialSurrounding: ISurroundingData[],
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

    /** Update target sizes */
    async function updateTargetRect(targetElement: Element) {
        targetRect.value = await getElementBounding(targetElement);
    }

    /** Update box sizes */
    async function updateBoxRect(targetElement: Element) {
        boxRect.value = await getElementBounding(targetElement);
    }

    /** Update surrounding scroll-data on scroll event */
    function onScroll(data: ISurroundingData) {
        const x = data.target === window ? window.scrollX : (data.target as Element).scrollLeft;
        const y = data.target === window ? window.scrollY : (data.target as Element).scrollTop;

        currentSurrounding.value = [
            ...currentSurrounding.value.filter(v => v.id !== data.id),
            { ...data, scrollX: x, scrollY: y },
        ];
    }

    /** Update surrounding after resize event */
    async function onResize() {
        if (!targetElement.value || !boxElement.value) return;

        getElementBounding(targetElement.value).then(rect => (targetRect.value = rect));
        getElementBounding(boxElement.value).then(rect => (boxRect.value = rect));

        surrounding.setup(targetElement.value);
        currentSurrounding.value = surrounding.data.value.map(v => ({ ...v }));
    }

    function handleSurroundingResize(): () => void {
        return useDebounce({
            delay: 200,
            immediateAction: () => (isSurroundingResizing.value = true),
            action: () => {
                if (!isSurroundingResizing.value) return;
                isSurroundingResizing.value = false;
                onResize();
            },
        });
    }

    function handleSurroundingScroll(): (data: ISurroundingData) => void {
        return useDebounce<[ISurroundingData]>({
            delay: 100,
            immediateAction: data => {
                isScrolling.value = true;

                if (data.target === window || data.target instanceof Element) {
                    onScroll(data);
                }
            },
            action: () => {
                if (!isScrolling.value) return;
                isScrolling.value = false;
            },
        });
    }

    return {
        coordinates,
        targetRect,
        boxRect,
        isTargetResizing,
        isBoxResizing,
        isSurroundingResizing,
        isScrolling,
        setup,
        terminate,
        setTarget,
        setBox,
    };
}

function getCurrentPosition(
    options: IAttachOptions,
    offset: [x: number, y: number],
    targetRect: DOMRect,
    boxRect: DOMRect,
): {
    coordinates: [x: number, y: number];
    position: EPotAttachedBoxPosition;
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
        case POT_ATTACHED_BOX_POSITION.TOP_START:
        case POT_ATTACHED_BOX_POSITION.TOP_END:
        case POT_ATTACHED_BOX_POSITION.TOP_CENTER:
            return targetY - boxHeight - options.nudge;

        case POT_ATTACHED_BOX_POSITION.BOTTOM_START:
        case POT_ATTACHED_BOX_POSITION.BOTTOM_END:
        case POT_ATTACHED_BOX_POSITION.BOTTOM_CENTER:
            return targetY + targetHeight + options.nudge;

        case POT_ATTACHED_BOX_POSITION.RIGHT_START:
        case POT_ATTACHED_BOX_POSITION.LEFT_START:
            return targetY;

        case POT_ATTACHED_BOX_POSITION.RIGHT_END:
        case POT_ATTACHED_BOX_POSITION.LEFT_END:
            return targetY + targetHeight - boxHeight;

        case POT_ATTACHED_BOX_POSITION.RIGHT_CENTER:
        case POT_ATTACHED_BOX_POSITION.LEFT_CENTER:
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
        case POT_ATTACHED_BOX_POSITION.TOP_CENTER:
        case POT_ATTACHED_BOX_POSITION.BOTTOM_CENTER:
            return targetX + targetWidth / 2 - boxWidth / 2;

        case POT_ATTACHED_BOX_POSITION.TOP_START:
        case POT_ATTACHED_BOX_POSITION.BOTTOM_START:
            return targetX;

        case POT_ATTACHED_BOX_POSITION.TOP_END:
        case POT_ATTACHED_BOX_POSITION.BOTTOM_END:
            return targetX + targetWidth - boxWidth;

        case POT_ATTACHED_BOX_POSITION.RIGHT_END:
        case POT_ATTACHED_BOX_POSITION.RIGHT_START:
        case POT_ATTACHED_BOX_POSITION.RIGHT_CENTER:
            return targetX + targetWidth + options.nudge;

        case POT_ATTACHED_BOX_POSITION.LEFT_END:
        case POT_ATTACHED_BOX_POSITION.LEFT_START:
        case POT_ATTACHED_BOX_POSITION.LEFT_CENTER:
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
