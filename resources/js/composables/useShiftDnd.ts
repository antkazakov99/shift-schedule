import { cellKey, parseCellKey, useSchedule } from '@/stores/schedule';
import { useSelection } from '@/stores/selection';
import { shiftFromTemplate } from '@/lib/time';
import type { CellKey, CellRef } from '@/types/schedule';

/*
 * Drag-and-drop of shifts:
 *   template (side panel) → cell : assign the template; if the cell is part of a multi-selection,
 *                                  assign to every selected cell
 *   shift (cell) → cell          : move; with Ctrl/Alt held — copy
 */

const MIME = 'application/x-shift-schedule';

type DragPayload = { kind: 'template'; templateId: number } | { kind: 'shift'; from: CellKey };

function read(e: DragEvent): DragPayload | null {
    const raw = e.dataTransfer?.getData(MIME);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as DragPayload;
    } catch {
        return null;
    }
}

const isCopy = (e: DragEvent) => e.ctrlKey || e.altKey || e.metaKey;

export function useShiftDnd() {
    const schedule = useSchedule();
    const selection = useSelection();

    function startTemplateDrag(e: DragEvent, templateId: number) {
        if (!e.dataTransfer) return;
        e.dataTransfer.setData(MIME, JSON.stringify({ kind: 'template', templateId } satisfies DragPayload));
        e.dataTransfer.effectAllowed = 'copy';
    }

    function startShiftDrag(e: DragEvent, from: CellKey) {
        if (!e.dataTransfer) return;
        e.dataTransfer.setData(MIME, JSON.stringify({ kind: 'shift', from } satisfies DragPayload));
        e.dataTransfer.effectAllowed = 'copyMove';
    }

    /** Returns true if the drag can be dropped on a cell (call from dragover). */
    function accept(e: DragEvent): boolean {
        if (!e.dataTransfer?.types.includes(MIME)) {
            return false;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' || isCopy(e) ? 'copy' : 'move';
        return true;
    }

    function drop(e: DragEvent, target: CellRef) {
        const payload = read(e);
        if (!payload) return;
        const targetKey = cellKey(target.employeeId, target.date);

        if (payload.kind === 'template') {
            const template = schedule.templateById.value.get(payload.templateId);
            if (!template) return;
            const targets = selection.has(targetKey) && selection.count.value > 1 ? selection.cells() : [target];
            schedule.setShift(targets, shiftFromTemplate(template));
            return;
        }

        if (payload.from === targetKey) return;
        const source = schedule.getShift(payload.from);
        if (!source) return;
        schedule.setShift([target], source);
        if (!isCopy(e)) {
            schedule.setShift([parseCellKey(payload.from)], null);
        }
        selection.selectOnly(target);
    }

    return { startTemplateDrag, startShiftDrag, accept, drop };
}
