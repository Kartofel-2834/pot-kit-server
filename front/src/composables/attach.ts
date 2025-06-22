// Types
import type { EPotAttachedBoxPosition } from '@/types/components/attached-box';
import type { IAttach, IAttachOptions } from '@/types/composables/attach';
import type { ISurroundingData } from '@/types/composables/surrounding';

// Constants
import { POT_ATTACHED_BOX_POSITION } from '@/types/components/attached-box';

// Vue
import { computed, ref } from 'vue';

// Composables
import { useSurrounding } from '@/composables/surrounding';
import { useDebounce } from '@/composables/timer';

// TODO: add arrow to popups
const arrowSize = 16;

const xOppositePositions: Record<EPotAttachedBoxPosition, EPotAttachedBoxPosition | null> = {
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

const yOppositePositions: Record<EPotAttachedBoxPosition, EPotAttachedBoxPosition | null> = {
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
    const x = computed<number>(getX);
    const y = computed<number>(getY);

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

    /** Get box Y coordinate */
    function getY(): number {
        if (!targetRect.value || !boxRect.value) return 0;

        const offset = getYOffset();

        return calculateLimitedY(options, offset, targetRect.value, boxRect.value);
    }

    /** Get box X coordinate */
    function getX(): number {
        if (!targetRect.value || !boxRect.value) return 0;

        const offset = getXOffset();

        return calculateLimitedX(options, offset, targetRect.value, boxRect.value);
    }

    /** Get box Y scroll-offset */
    function getYOffset(): number {
        return currentSurrounding.value.reduce((res, data, index) => {
            const initialData = surrounding.data.value[index];
            return res + (initialData.scrollY - data.scrollY);
        }, 0);
    }

    /** Get box X scroll-offset */
    function getXOffset(): number {
        return currentSurrounding.value.reduce((res, data, index) => {
            const initialData = surrounding.data.value[index];
            return res + (initialData.scrollX - data.scrollX);
        }, 0);
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
        x,
        y,
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

/** Get box Y coordinate that limited by screen and target sizes */
function calculateLimitedY(
    options: IAttachOptions,
    offset: number,
    targetRect: DOMRect,
    boxRect: DOMRect,
): number {
    const { y: targetYInitial, height: targetHeight } = targetRect;
    const { height: boxHeight } = boxRect;

    const targetStartY = targetYInitial + offset;
    const targetEndY = targetStartY + targetHeight;

    const yStart = calculateYForPosition(options, offset, targetRect, boxRect);
    const yEnd = yStart + boxHeight;

    const edgeMargin = options.edgeMargin || 0;
    const topLimit = edgeMargin;
    const bottomLimit = window.innerHeight - edgeMargin;

    const oppositeSide = yOppositePositions[options.position];
    const oppositeOptions = {
        ...options,
        position: oppositeSide as EPotAttachedBoxPosition,
    };

    const isReplaced = !options.persistent && oppositeSide;
    const isSticky = options.sticky && !isReplaced;

    // If box goes beyond the TOP edge of the screen,
    // then try to move it to the other side
    if (isReplaced && yStart < topLimit) {
        const yOpposite = calculateYForPosition(oppositeOptions, offset, targetRect, boxRect);
        return Math.max(yOpposite, yStart);
    }

    // If box goes beyond the TOP edge of the screen and there is nowhere to move it,
    // then we try to imitate sticky behavior
    if (isSticky && yStart < topLimit) {
        const stickyLimit = targetEndY - arrowSize;
        return Math.min(Math.max(yStart, topLimit), stickyLimit);
    }

    // If box goes beyond the BOTTOM edge of the screen,
    // then try to move it to the other side
    if (isReplaced && yEnd > bottomLimit) {
        const yOpposite = calculateYForPosition(oppositeOptions, offset, targetRect, boxRect);
        return Math.min(yOpposite, yStart);
    }

    // If box goes beyond the BOTTOM edge of the screen and there is nowhere to move it,
    // then we try to imitate sticky behavior
    if (isSticky && yEnd > bottomLimit) {
        const stickyLimit = targetStartY + arrowSize;
        return Math.max(Math.min(yEnd, bottomLimit), stickyLimit) - boxHeight - edgeMargin;
    }

    return yStart;
}

/** Get box X coordinate that limited by screen and target sizes */
function calculateLimitedX(
    options: IAttachOptions,
    offset: number,
    targetRect: DOMRect,
    boxRect: DOMRect,
): number {
    const { x: targetXInitial, width: targetWidth } = targetRect;
    const { width: boxWidth } = boxRect;

    const targetStartX = targetXInitial + offset;
    const targetEndX = targetStartX + targetWidth;

    const xStart = calculateXForPosition(options, offset, targetRect, boxRect);
    const xEnd = xStart + boxWidth;

    const edgeMargin = options.edgeMargin || 0;
    const leftLimit = edgeMargin;
    const rightLimit = window.innerWidth - edgeMargin;

    const oppositeSide = xOppositePositions[options.position];
    const oppositeOptions = {
        ...options,
        position: oppositeSide as EPotAttachedBoxPosition,
    };

    const isReplaced = !options.persistent && oppositeSide;
    const isSticky = options.sticky && !isReplaced;

    // If box goes beyond the TOP edge of the screen,
    // then try to move it to the other side
    if (isReplaced && xStart < leftLimit) {
        const xOpposite = calculateXForPosition(oppositeOptions, offset, targetRect, boxRect);
        return Math.max(xOpposite, xStart);
    }

    // If box goes beyond the TOP edge of the screen and there is nowhere to move it,
    // then we try to imitate sticky behavior
    if (isSticky && xStart < leftLimit) {
        const stickyLimit = targetEndX - arrowSize;
        return Math.min(Math.max(xStart, leftLimit), stickyLimit);
    }

    // If box goes beyond the BOTTOM edge of the screen,
    // then try to move it to the other side
    if (isReplaced && xEnd > rightLimit) {
        const xOpposite = calculateXForPosition(oppositeOptions, offset, targetRect, boxRect);
        return Math.min(xOpposite, xStart);
    }

    // If box goes beyond the BOTTOM edge of the screen and there is nowhere to move it,
    // then we try to imitate sticky behavior
    if (isSticky && xEnd > rightLimit) {
        const stickyLimit = targetStartX + arrowSize;
        return Math.max(Math.min(xEnd, rightLimit), stickyLimit) - boxWidth - edgeMargin;
    }

    return xStart;
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
