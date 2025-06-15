// Types
import type { ISurrounding, ISurroundingData } from '@/types/composables/surrounding';

// Vue
import { ref } from 'vue';

/** Composable for work with elements, that surrounding target element */
export function useSurrounding({
    onScroll,
    onResize,
}: {
    onScroll?: (data: ISurroundingData, event: Event) => void;
    onResize?: (entries: ResizeObserverEntry[] | null) => void;
}): ISurrounding {
    let isInited = false;
    const surrounding = ref<ISurroundingData[]>([]);

    const listeners = new Map<Element | Window, Record<string, EventListener>>();
    const surroundingResizeObserver = new ResizeObserver(entries => {
        if (isInited && onResize) {
            onResize(entries);
        }
    });

    /** Remove surrounding elements conditions listeners */
    function terminateSurrounding() {
        isInited = false;
        surroundingResizeObserver.disconnect();
        surrounding.value.forEach(data => {
            const surroundingListeners = listeners.get(data.target);

            for (const key in surroundingListeners) {
                data.target.removeEventListener(key, surroundingListeners[key]);
                listeners.delete(data.target);
            }
        });

        surrounding.value = [];
    }

    /** Add surrounding elements conditions listeners */
    function setupSurrounding(element: Element) {
        terminateSurrounding();
        const currentSurrounding = getSurrounding(element);

        surrounding.value = [...currentSurrounding];

        currentSurrounding.forEach(data => {
            const dataListeners: Record<string, EventListener> = {};

            const scrollListener = getScrollListener(data);
            const resizeListener = getResizeListener(null);

            // For window using resize listener, and for other elements using resize-observer
            if (resizeListener && data.target === window) {
                dataListeners.resize = resizeListener;
                window.addEventListener('resize', resizeListener);
            } else if (resizeListener) {
                surroundingResizeObserver.observe(data.target as Element);
            }

            if (scrollListener) {
                dataListeners.scroll = scrollListener;
                data.target.addEventListener('scroll', scrollListener);
            }

            listeners.set(data.target, dataListeners);
        });

        setTimeout(() => (isInited = true));
    }

    function getScrollListener(data: ISurroundingData) {
        if (!onScroll) return null;
        return (event: Event) => onScroll(data, event);
    }

    function getResizeListener(entries: ResizeObserverEntry[] | null) {
        if (!onResize) return null;
        return () => onResize(entries);
    }

    return {
        data: surrounding,
        terminate: terminateSurrounding,
        setup: setupSurrounding,
    };
}

/** Get surrounding elements, with scroll\size characteristics */
function getSurrounding(element: Element): ISurroundingData[] {
    const position = getComputedStyle(element).position;

    const windowSurrounding: ISurroundingData = {
        id: 0,
        target: window,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        width: window.innerWidth,
        height: window.innerHeight,
    };

    if (position === 'fixed') {
        return [windowSurrounding];
    }

    const parents = getAllParents(element);
    const parentsSurrounding: ISurroundingData[] = [];

    let searchingRelative: boolean = position === 'absolute' || position === 'sticky';

    parents.forEach((parent, index) => {
        const parentPosition = getComputedStyle(parent).position;

        if (searchingRelative && parentPosition !== 'relative') {
            return;
        } else if (parentPosition === 'relative') {
            searchingRelative = false;
        }

        if (parentPosition === 'absolute' || parentPosition === 'sticky') {
            searchingRelative = true;
        }

        parentsSurrounding.push({
            id: index + 1,
            target: parent,
            scrollY: parent.scrollTop,
            scrollX: parent.scrollLeft,
            width: parent.clientWidth,
            height: parent.clientHeight,
        });
    });

    return [windowSurrounding, ...parentsSurrounding];
}

/** Get all parents of element */
function getAllParents(element: Element): Element[] {
    const result = [];
    let currentElement: Element | null = element;

    while (currentElement) {
        currentElement = currentElement.parentElement;
        result.push(currentElement);
    }

    return result.filter(Boolean) as Element[];
}
