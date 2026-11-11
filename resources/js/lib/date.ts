import type { ISODate, ViewMode } from '@/types/schedule';

const LOCALE = 'ru-RU';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): ISODate {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(s: ISODate): Date {
    const [y = 1970, m = 1, d = 1] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function today(): ISODate {
    return toISO(new Date());
}

export function addDays(s: ISODate, days: number): ISODate {
    const d = fromISO(s);
    d.setDate(d.getDate() + days);
    return toISO(d);
}

export function addMonths(s: ISODate, months: number): ISODate {
    const d = fromISO(s);
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    return toISO(d);
}

/** Monday of the week containing the date. */
export function startOfWeek(s: ISODate): ISODate {
    const d = fromISO(s);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return toISO(d);
}

export function startOfMonth(s: ISODate): ISODate {
    const d = fromISO(s);
    return toISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonth(s: ISODate): ISODate {
    const d = fromISO(s);
    return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function eachDay(from: ISODate, to: ISODate): ISODate[] {
    const days: ISODate[] = [];
    for (let d = from; d <= to; d = addDays(d, 1)) {
        days.push(d);
    }
    return days;
}

export function isWeekend(s: ISODate): boolean {
    const wd = fromISO(s).getDay();
    return wd === 0 || wd === 6;
}

export function periodFor(view: ViewMode, anchor: ISODate): { from: ISODate; to: ISODate } {
    if (view === 'week') {
        const from = startOfWeek(anchor);
        return { from, to: addDays(from, 6) };
    }
    return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

export function shiftPeriod(view: ViewMode, anchor: ISODate, step: number): ISODate {
    return view === 'week' ? addDays(anchor, step * 7) : addMonths(anchor, step);
}

const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });
const dayMonthFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' });
const dayMonthShortFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const monthYearFmt = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const fullFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "пн", "вт", … */
export function formatWeekday(s: ISODate): string {
    return weekdayFmt.format(fromISO(s));
}

/** "понедельник, 10 ноября" */
export function formatFullDate(s: ISODate): string {
    return fullFmt.format(fromISO(s));
}

export function formatPeriod(view: ViewMode, from: ISODate, to: ISODate): string {
    const a = fromISO(from);
    const b = fromISO(to);
    if (view === 'month') {
        return capitalize(monthYearFmt.format(a).replace(' г.', ''));
    }
    if (a.getMonth() === b.getMonth()) {
        return `${a.getDate()}–${dayMonthFmt.format(b)} ${b.getFullYear()}`;
    }
    return `${dayMonthShortFmt.format(a)} – ${dayMonthShortFmt.format(b)} ${b.getFullYear()}`;
}
