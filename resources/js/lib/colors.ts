import type { TemplateColor } from '@/types/schedule';

/** Template colors + `brand` for custom shifts (Figma: Cornflower, Lavanda-100, Mint-100, Brand). */
export type ShiftColor = TemplateColor | 'brand';

interface ColorClasses {
    /** shift chip in a calendar cell */
    chip: string;
    /** accent text (hours) inside the chip */
    accent: string;
    /** left stripe of a template card */
    stripe: string;
}

// Full class strings so Tailwind can detect them statically.
export const SHIFT_COLORS: Record<ShiftColor, ColorClasses> = {
    cornflower: { chip: 'bg-cornflower text-ink', accent: 'text-cornflower-text', stripe: 'border-cornflower-stripe' },
    lavanda: { chip: 'bg-lavanda text-ink', accent: 'text-lavanda-text', stripe: 'border-lavanda-stripe' },
    mint: { chip: 'bg-mint text-ink', accent: 'text-mint-text', stripe: 'border-mint-stripe' },
    brand: { chip: 'bg-brand text-white', accent: 'text-white', stripe: 'border-brand' },
};

export const TEMPLATE_COLORS: TemplateColor[] = ['cornflower', 'lavanda', 'mint'];
