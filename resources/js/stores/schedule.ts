import { computed, reactive, ref } from 'vue';
import { scheduleApi } from '@/api/schedule';
import { ApiError } from '@/api/http';
import { eachDay, periodFor, shiftPeriod, today } from '@/lib/date';
import { durationMinutes, sameShift } from '@/lib/time';
import type {
    CellKey,
    CellRef,
    Employee,
    ISODate,
    NewShiftTemplate,
    Shift,
    ShiftData,
    ShiftTemplate,
    SyncItem,
    ViewMode,
} from '@/types/schedule';

export function cellKey(employeeId: number, date: ISODate): CellKey {
    return `${employeeId}|${date}`;
}

export function parseCellKey(key: CellKey): CellRef {
    const [id, date] = key.split('|') as [string, ISODate];
    return { employeeId: Number(id), date };
}

const normalize = (s: string) => s.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').trim();

/*
 * Data model:
 *   `server`  — last known server state, per cell.
 *   `changes` — local unsaved edits on top of it (null = cell cleared).
 * The calendar always shows `changes` over `server`. "Сохранить" sends `changes` in one request.
 * An edit that brings a cell back to its server value removes it from `changes`,
 * so the unsaved counter reflects real differences only.
 */

const employees = ref<Employee[]>([]);
const templates = ref<ShiftTemplate[]>([]);
const server = reactive(new Map<CellKey, Shift>());
const changes = reactive(new Map<CellKey, ShiftData | null>());

const view = ref<ViewMode>('week');
const anchor = ref<ISODate>(today());
const search = ref('');

const loading = ref(false);
const saving = ref(false);
const notice = ref<{ type: 'error' | 'success'; text: string } | null>(null);

const period = computed(() => periodFor(view.value, anchor.value));
const dates = computed(() => eachDay(period.value.from, period.value.to));

const visibleEmployees = computed(() => {
    const q = normalize(search.value);
    return q ? employees.value.filter((e) => normalize(e.full_name).includes(q)) : employees.value;
});

const templateById = computed(() => new Map(templates.value.map((t) => [t.id, t])));

function getShift(key: CellKey): ShiftData | null {
    if (changes.has(key)) {
        return changes.get(key) ?? null;
    }
    return server.get(key) ?? null;
}

/** Number of assigned shifts per date across all employees (drives the coverage indicator). */
const coverage = computed(() => {
    const result = new Map<ISODate, number>();
    for (const date of dates.value) {
        let count = 0;
        for (const e of employees.value) {
            if (getShift(cellKey(e.id, date))) {
                count++;
            }
        }
        result.set(date, count);
    }
    return result;
});

/** Total shifts and minutes per employee in the visible period. */
const employeeTotals = computed(() => {
    const result = new Map<number, { shifts: number; minutes: number }>();
    for (const e of employees.value) {
        let shifts = 0;
        let minutes = 0;
        for (const date of dates.value) {
            const s = getShift(cellKey(e.id, date));
            if (s) {
                shifts++;
                minutes += durationMinutes(s.start_time, s.end_time);
            }
        }
        result.set(e.id, { shifts, minutes });
    }
    return result;
});

const changesCount = computed(() => changes.size);

function notify(type: 'error' | 'success', text: string) {
    notice.value = { type, text };
    const current = notice.value;
    setTimeout(() => {
        if (notice.value === current) {
            notice.value = null;
        }
    }, type === 'error' ? 6000 : 2500);
}

function errorText(e: unknown, fallback: string): string {
    if (e instanceof ApiError) {
        const first = Object.values(e.errors)[0]?.[0];
        return first ?? e.message;
    }
    return fallback;
}

/** Set (or clear with null) the shift in each of the given cells. */
function setShift(cells: CellRef[], data: ShiftData | null) {
    for (const cell of cells) {
        const key = cellKey(cell.employeeId, cell.date);
        if (sameShift(server.get(key) ?? null, data)) {
            changes.delete(key);
        } else {
            changes.set(key, data ? { ...data } : null);
        }
    }
}

let shiftsRequest = 0;

/**
 * Switch the visible period. The new dates are shown only after their shifts arrive,
 * so the table never flashes empty cells; the previous period stays on screen meanwhile.
 */
async function navigate(nextView: ViewMode, nextAnchor: ISODate) {
    const { from, to } = periodFor(nextView, nextAnchor);
    const requestId = ++shiftsRequest;
    loading.value = true;
    try {
        const shifts = await scheduleApi.shifts(from, to);
        if (requestId !== shiftsRequest) {
            return; // a newer period was requested meanwhile
        }
        for (const [key, shift] of server) {
            if (shift.date >= from && shift.date <= to) {
                server.delete(key);
            }
        }
        for (const shift of shifts) {
            server.set(cellKey(shift.employee_id, shift.date), shift);
        }
        view.value = nextView;
        anchor.value = nextAnchor;
    } catch (e) {
        notify('error', errorText(e, 'Не удалось загрузить смены'));
    } finally {
        if (requestId === shiftsRequest) {
            loading.value = false;
        }
    }
}

/** False until employees, templates and the first period are loaded (UI shows a skeleton). */
const ready = ref(false);

/** The skeleton stays at least this long: a skeleton that flashes for 50 ms looks like a glitch. */
const MIN_SKELETON_MS = 500;

async function init() {
    const startedAt = performance.now();
    try {
        const [emp, tpl] = await Promise.all([
            scheduleApi.employees(),
            scheduleApi.templates(),
            navigate(view.value, anchor.value),
        ]);
        employees.value = emp;
        templates.value = tpl;
    } catch (e) {
        notify('error', errorText(e, 'Не удалось загрузить данные'));
    } finally {
        const rest = MIN_SKELETON_MS - (performance.now() - startedAt);
        if (rest > 0) {
            await new Promise((resolve) => setTimeout(resolve, rest));
        }
        ready.value = true;
    }
}

async function save() {
    if (!changes.size || saving.value) {
        return;
    }
    const items: SyncItem[] = [...changes].map(([key, shift]) => {
        const { employeeId, date } = parseCellKey(key);
        return { employee_id: employeeId, date, shift };
    });
    saving.value = true;
    try {
        const saved = await scheduleApi.sync(items);
        const byKey = new Map(saved.map((s) => [cellKey(s.employee_id, s.date), s]));
        for (const item of items) {
            const key = cellKey(item.employee_id, item.date);
            const savedShift = byKey.get(key);
            if (savedShift) {
                server.set(key, savedShift);
            } else {
                server.delete(key);
            }
            // Keep edits made while the request was in flight.
            if (sameShift(changes.get(key), item.shift)) {
                changes.delete(key);
            }
        }
        notify('success', 'График сохранён');
    } catch (e) {
        notify('error', errorText(e, 'Не удалось сохранить график'));
    } finally {
        saving.value = false;
    }
}

function discard() {
    changes.clear();
}

async function createTemplate(payload: NewShiftTemplate): Promise<ShiftTemplate | null> {
    try {
        const template = await scheduleApi.createTemplate(payload);
        templates.value = [...templates.value, template];
        notify('success', `Шаблон «${template.name}» создан`);
        return template;
    } catch (e) {
        notify('error', errorText(e, 'Не удалось создать шаблон'));
        return null;
    }
}

async function deleteTemplate(id: number) {
    try {
        await scheduleApi.deleteTemplate(id);
    } catch (e) {
        notify('error', errorText(e, 'Не удалось удалить шаблон'));
        return;
    }
    templates.value = templates.value.filter((t) => t.id !== id);
    // Shifts keep their times and become custom (mirrors nullOnDelete on the server).
    for (const shift of server.values()) {
        if (shift.shift_template_id === id) {
            shift.shift_template_id = null;
        }
    }
    for (const [key, shift] of changes) {
        if (shift?.shift_template_id === id) {
            changes.set(key, { ...shift, shift_template_id: null });
        }
    }
}

// Last requested period: repeated clicks step from it, not from the one still on screen.
let target: { view: ViewMode; anchor: ISODate } = { view: view.value, anchor: anchor.value };

function go(nextView: ViewMode, nextAnchor: ISODate) {
    target = { view: nextView, anchor: nextAnchor };
    return navigate(nextView, nextAnchor);
}

function setView(mode: ViewMode) {
    return go(mode, target.anchor);
}

function step(direction: 1 | -1) {
    return go(target.view, shiftPeriod(target.view, target.anchor, direction));
}

function goToday() {
    return go(target.view, today());
}

export function useSchedule() {
    return {
        // state
        employees,
        templates,
        view,
        anchor,
        search,
        ready,
        loading,
        saving,
        notice,
        // derived
        period,
        dates,
        visibleEmployees,
        templateById,
        coverage,
        employeeTotals,
        changesCount,
        // queries
        getShift,
        isDirty: (key: CellKey) => changes.has(key),
        // actions
        init,
        setShift,
        save,
        discard,
        createTemplate,
        deleteTemplate,
        setView,
        step,
        goToday,
    };
}
