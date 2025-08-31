export interface IPotAccordionSlots {
    default?: () => unknown;
    title?: () => unknown;
    icon?: () => unknown;
    header?: (options: { toggle: () => void; open: () => void; close: () => void }) => unknown;
}

export interface IPotAccordionProps {
    /** Accordion open flag */
    opened?: boolean;

    /** Accordion open flag */
    modelValue?: boolean;

    /** If true, the accordion will be disabled and inactive */
    disabled?: boolean;
}
