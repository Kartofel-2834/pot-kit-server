export interface IPotAccordionSlots {
    default?: () => unknown;
    header?: () => unknown;
    title?: () => unknown;
    icon?: () => unknown;
}

export interface IPotAccordionProps {
    /** Accordion open flag */
    opened?: boolean;

    /** Accordion open flag */
    modelValue?: boolean;

    /** If true, the accordion will be disabled and inactive */
    disabled?: boolean;
}
