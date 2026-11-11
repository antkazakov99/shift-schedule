import type { ShiftData, ShiftTemplate, TimeString } from '@/types/schedule';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(value: string): value is TimeString {
    return TIME_RE.test(value);
}

export function toMinutes(t: TimeString): number {
    const [h = 0, m = 0] = t.split(':').map(Number);
    return h * 60 + m;
}

/** Shift length in minutes; end <= start means the shift ends on the next day. */
export function durationMinutes(start: TimeString, end: TimeString): number {
    const diff = toMinutes(end) - toMinutes(start);
    return diff > 0 ? diff : diff + 24 * 60;
}

export function isOvernight(start: TimeString, end: TimeString): boolean {
    return toMinutes(end) <= toMinutes(start);
}

/** "8 ч", "7,5 ч", "45 мин" */
export function formatDuration(minutes: number): string {
    if (minutes === 0) {
        return '0 ч';
    }
    if (minutes < 60) {
        return `${minutes} мин`;
    }
    const hours = Math.round((minutes / 60) * 10) / 10;
    return `${String(hours).replace('.', ',')} ч`;
}

/** Full (templates): "07:00 - 15:00". Short (calendar chip): "08 - 18", "08:30 - 18" when minutes matter. */
export function formatTimeRange(start: TimeString, end: TimeString, short = false): string {
    if (!short) {
        return `${start} - ${end}`;
    }
    const s = (t: TimeString) => (t.endsWith(':00') ? t.slice(0, 2) : t);
    return `${s(start)} - ${s(end)}`;
}

export function shiftFromTemplate(template: ShiftTemplate): ShiftData {
    return { start_time: template.start_time, end_time: template.end_time, shift_template_id: template.id };
}

export function sameShift(a: ShiftData | null | undefined, b: ShiftData | null | undefined): boolean {
    if (!a || !b) {
        return !a && !b;
    }
    return a.start_time === b.start_time && a.end_time === b.end_time && a.shift_template_id === b.shift_template_id;
}
