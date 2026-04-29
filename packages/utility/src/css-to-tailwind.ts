/**
 * Lazy, growing reverse lookup from `(cssProperty, value)` to a Tailwind utility class.
 *
 * The Style panel calls `cssToTailwind('padding', '16px')` to decide whether to write
 * a class or fall back to inline. We start with a small high-confidence set (the
 * spacing scale, common displays, common font weights, opacity) and grow over time
 * as the panel produces more property/value pairs.
 *
 * The map intentionally does NOT cover arbitrary values — anything not in the table
 * returns `null`, signalling the caller should fall back to inline. The Style panel
 * still works fully; the user just sees "inline" on the chip instead of "tw".
 */

const SPACING_SCALE: Record<string, string> = {
    '0px': '0',
    '1px': 'px',
    '2px': '0.5',
    '4px': '1',
    '6px': '1.5',
    '8px': '2',
    '10px': '2.5',
    '12px': '3',
    '14px': '3.5',
    '16px': '4',
    '20px': '5',
    '24px': '6',
    '28px': '7',
    '32px': '8',
    '36px': '9',
    '40px': '10',
    '44px': '11',
    '48px': '12',
    '56px': '14',
    '64px': '16',
    '80px': '20',
    '96px': '24',
};

const DISPLAY_MAP: Record<string, string> = {
    block: 'block',
    'inline-block': 'inline-block',
    inline: 'inline',
    flex: 'flex',
    'inline-flex': 'inline-flex',
    grid: 'grid',
    'inline-grid': 'inline-grid',
    contents: 'contents',
    none: 'hidden',
};

const FLEX_DIRECTION: Record<string, string> = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    column: 'flex-col',
    'column-reverse': 'flex-col-reverse',
};

const JUSTIFY_CONTENT: Record<string, string> = {
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
    start: 'justify-start',
    end: 'justify-end',
};

const ALIGN_ITEMS: Record<string, string> = {
    'flex-start': 'items-start',
    'flex-end': 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
    start: 'items-start',
    end: 'items-end',
};

const TEXT_ALIGN: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
    start: 'text-start',
    end: 'text-end',
};

const FONT_WEIGHT: Record<string, string> = {
    '100': 'font-thin',
    '200': 'font-extralight',
    '300': 'font-light',
    '400': 'font-normal',
    '500': 'font-medium',
    '600': 'font-semibold',
    '700': 'font-bold',
    '800': 'font-extrabold',
    '900': 'font-black',
};

const POSITION_MAP: Record<string, string> = {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
};

const OVERFLOW_MAP: Record<string, string> = {
    visible: 'overflow-visible',
    hidden: 'overflow-hidden',
    clip: 'overflow-clip',
    scroll: 'overflow-scroll',
    auto: 'overflow-auto',
};

const CURSOR_MAP: Record<string, string> = {
    auto: 'cursor-auto',
    default: 'cursor-default',
    pointer: 'cursor-pointer',
    wait: 'cursor-wait',
    text: 'cursor-text',
    move: 'cursor-move',
    'not-allowed': 'cursor-not-allowed',
    grab: 'cursor-grab',
    grabbing: 'cursor-grabbing',
};

const BOX_SIZING_MAP: Record<string, string> = {
    'border-box': 'box-border',
    'content-box': 'box-content',
};

const FOUR_SIDE_PROPS = ['padding', 'margin'] as const;
type FourSideProp = (typeof FOUR_SIDE_PROPS)[number];

function spacingToken(
    prop: 'p' | 'm',
    side: '' | 't' | 'r' | 'b' | 'l' | 'x' | 'y',
    value: string,
) {
    const token = SPACING_SCALE[value];
    if (!token) return null;
    return `${prop}${side}-${token}`;
}

/**
 * Returns a Tailwind class for the given CSS property+value, or `null` if no
 * known utility matches.
 */
export function cssToTailwind(property: string, value: string): string | null {
    if (!value || value === 'inherit' || value === 'initial' || value === 'unset') return null;

    switch (property) {
        case 'display':
            return DISPLAY_MAP[value] ?? null;
        case 'flex-direction':
            return FLEX_DIRECTION[value] ?? null;
        case 'justify-content':
            return JUSTIFY_CONTENT[value] ?? null;
        case 'align-items':
            return ALIGN_ITEMS[value] ?? null;
        case 'text-align':
            return TEXT_ALIGN[value] ?? null;
        case 'font-weight':
            return FONT_WEIGHT[value] ?? null;
        case 'position':
            return POSITION_MAP[value] ?? null;
        case 'overflow':
            return OVERFLOW_MAP[value] ?? null;
        case 'overflow-x':
            return OVERFLOW_MAP[value]
                ? OVERFLOW_MAP[value].replace('overflow-', 'overflow-x-')
                : null;
        case 'overflow-y':
            return OVERFLOW_MAP[value]
                ? OVERFLOW_MAP[value].replace('overflow-', 'overflow-y-')
                : null;
        case 'cursor':
            return CURSOR_MAP[value] ?? null;
        case 'box-sizing':
            return BOX_SIZING_MAP[value] ?? null;
        case 'padding':
            return spacingToken('p', '', value);
        case 'padding-top':
            return spacingToken('p', 't', value);
        case 'padding-right':
            return spacingToken('p', 'r', value);
        case 'padding-bottom':
            return spacingToken('p', 'b', value);
        case 'padding-left':
            return spacingToken('p', 'l', value);
        case 'margin':
            return spacingToken('m', '', value);
        case 'margin-top':
            return spacingToken('m', 't', value);
        case 'margin-right':
            return spacingToken('m', 'r', value);
        case 'margin-bottom':
            return spacingToken('m', 'b', value);
        case 'margin-left':
            return spacingToken('m', 'l', value);
        case 'gap':
            return spacingToken('p', '', value)?.replace(/^p-/, 'gap-') ?? null;
        case 'opacity': {
            const num = Number.parseFloat(value);
            if (Number.isNaN(num)) return null;
            const pct = Math.round(num <= 1 ? num * 100 : num);
            return `opacity-${pct}`;
        }
        case 'border-radius': {
            const map: Record<string, string> = {
                '0': 'rounded-none',
                '0px': 'rounded-none',
                '2px': 'rounded-sm',
                '4px': 'rounded',
                '6px': 'rounded-md',
                '8px': 'rounded-lg',
                '12px': 'rounded-xl',
                '16px': 'rounded-2xl',
                '24px': 'rounded-3xl',
                '9999px': 'rounded-full',
            };
            return map[value] ?? null;
        }
        default:
            return null;
    }
}

/** True when the property is one we know how to write as a Tailwind class. */
export function hasTailwindEquivalent(property: string, value: string): boolean {
    return cssToTailwind(property, value) !== null;
}

/** Properties that have a `-top/-right/-bottom/-left` shorthand counterpart. */
export function isFourSideProperty(property: string): property is FourSideProp {
    return (FOUR_SIDE_PROPS as readonly string[]).includes(property);
}
