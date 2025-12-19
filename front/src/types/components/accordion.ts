export interface IPotAccordionProps {
    /** Accordion open flag */
    opened?: boolean;

    /** Accordion open flag */
    modelValue?: boolean;

    /** If true, the accordion will be disabled and inactive */
    disabled?: boolean;
}

export interface IPotAccordionGroupProps {
    values?: unknown[];
    modelValue?: unknown[];
}
