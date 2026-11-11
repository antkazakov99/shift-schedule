import { computed, reactive, watch } from 'vue';
import type { CellKey, CellRef } from '@/types/schedule';
import { cellKey, parseCellKey, useSchedule } from './schedule';

/*
 * Selected calendar cells.
 *   click            — select one cell
 *   Ctrl/Cmd + click — toggle a cell
 *   Shift + click    — rectangle from the last clicked cell
 *   mouse drag       — rectangle (with Ctrl/Cmd — added to the current selection)
 */

const selected = reactive(new Set<CellKey>());
let anchorCell: CellRef | null = null;

// Drag-to-select state
let dragging = false;
let dragStart: CellRef | null = null;
let dragBase = new Set<CellKey>();

const schedule = useSchedule();

const count = computed(() => selected.size);

/** For the selection bar: "6 ячеек · 2 сотрудника · 4 дн." */
const summary = computed(() => {
    const employees = new Set<number>();
    const dates = new Set<string>();
    for (const key of selected) {
        const { employeeId, date } = parseCellKey(key);
        employees.add(employeeId);
        dates.add(date);
    }
    return { cells: selected.size, employees: employees.size, days: dates.size };
});

function cells(): CellRef[] {
    return [...selected].map(parseCellKey);
}

function rectKeys(a: CellRef, b: CellRef): CellKey[] {
    const empIds = schedule.visibleEmployees.value.map((e) => e.id);
    const dates = schedule.dates.value;
    const r1 = empIds.indexOf(a.employeeId);
    const r2 = empIds.indexOf(b.employeeId);
    const c1 = dates.indexOf(a.date);
    const c2 = dates.indexOf(b.date);
    if (r1 < 0 || r2 < 0 || c1 < 0 || c2 < 0) {
        return [cellKey(b.employeeId, b.date)];
    }
    const keys: CellKey[] = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
        for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
            keys.push(cellKey(empIds[r]!, dates[c]!));
        }
    }
    return keys;
}

function replaceWith(keys: Iterable<CellKey>) {
    selected.clear();
    for (const k of keys) {
        selected.add(k);
    }
}

function selectOnly(cell: CellRef) {
    replaceWith([cellKey(cell.employeeId, cell.date)]);
    anchorCell = cell;
}

function clear() {
    selected.clear();
    anchorCell = null;
}

function onCellMouseDown(cell: CellRef, e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    const key = cellKey(cell.employeeId, cell.date);
    const additive = e.ctrlKey || e.metaKey;
    const fromDraggable = (e.target as HTMLElement | null)?.closest('[draggable="true"]');

    if (e.shiftKey && anchorCell) {
        const rect = rectKeys(anchorCell, cell);
        replaceWith(additive ? [...selected, ...rect] : rect);
        return;
    }

    if (fromDraggable) {
        // Mouse down on a shift chip: it may start a native drag, so no rectangle selection.
        if (additive) {
            selected.has(key) ? selected.delete(key) : selected.add(key);
        } else if (!selected.has(key)) {
            selectOnly(cell);
        }
        anchorCell = cell;
        return;
    }

    e.preventDefault(); // no text selection while dragging
    if (additive) {
        selected.has(key) ? selected.delete(key) : selected.add(key);
        dragBase = new Set(selected);
    } else {
        replaceWith([key]);
        dragBase = new Set();
    }
    anchorCell = cell;
    dragging = true;
    dragStart = cell;
}

function onCellMouseEnter(cell: CellRef) {
    if (!dragging || !dragStart) {
        return;
    }
    replaceWith([...dragBase, ...rectKeys(dragStart, cell)]);
}

function stopDragging() {
    dragging = false;
    dragStart = null;
}

window.addEventListener('mouseup', stopDragging);
window.addEventListener('dragstart', stopDragging);

// Selection only makes sense within the visible cells.
watch([schedule.period, schedule.visibleEmployees], () => {
    const visibleIds = new Set(schedule.visibleEmployees.value.map((e) => e.id));
    const { from, to } = schedule.period.value;
    for (const key of [...selected]) {
        const { employeeId, date } = parseCellKey(key);
        if (!visibleIds.has(employeeId) || date < from || date > to) {
            selected.delete(key);
        }
    }
});

export function useSelection() {
    return {
        count,
        summary,
        has: (key: CellKey) => selected.has(key),
        cells,
        selectOnly,
        clear,
        onCellMouseDown,
        onCellMouseEnter,
    };
}
