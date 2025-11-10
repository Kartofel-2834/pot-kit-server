export interface IPotOptionProps<VALUE = unknown> {
    tag?: string;
    value?: VALUE;
    label?: string;
    selected?: boolean;
    focused?: boolean;
    disabled?: boolean;
    fluid?: boolean;
}
