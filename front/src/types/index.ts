/* NOT EDIT! THIS ENUMS GENERATED AUTOMATICALLY! */
export const POT_DEVICE = {
    MOBILE: 'mobile',
    TABLET: 'tablet',
    LAPTOP: 'laptop',
    DESKTOP: 'desktop',
} as const;

export type EPotDevice = (typeof POT_DEVICE)[keyof typeof POT_DEVICE];

export const POT_BREAKPOINT: { readonly [key in EPotDevice]: number } = {
    mobile: 0,
    tablet: 768,
    laptop: 1280,
    desktop: 1440,
};

export const ALL_DEVICES = Object.keys(POT_BREAKPOINT) as EPotDevice[];

export const ALL_DEVICES_REVERSED = Object.keys(POT_BREAKPOINT).reverse() as EPotDevice[];
