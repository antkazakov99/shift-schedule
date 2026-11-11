/** Calendar date in "YYYY-MM-DD" format (local, no timezone). */
export type ISODate = string;

/** Time of day in "HH:MM" format. */
export type TimeString = string;

export type ViewMode = 'week' | 'month';

export type TemplateColor = 'cornflower' | 'lavanda' | 'mint';

export interface Employee {
    id: number;
    full_name: string;
    position: string | null;
}

export interface ShiftTemplate {
    id: number;
    name: string;
    start_time: TimeString;
    end_time: TimeString;
    color: TemplateColor;
}

export interface NewShiftTemplate {
    name: string;
    start_time: TimeString;
    end_time: TimeString;
    color: TemplateColor;
}

/** What a calendar cell holds: the shift's own times + the template it came from (if any). */
export interface ShiftData {
    start_time: TimeString;
    end_time: TimeString;
    shift_template_id: number | null;
}

/** A shift as stored on the server. */
export interface Shift extends ShiftData {
    id: number;
    employee_id: number;
    date: ISODate;
}

/** One calendar cell: employee × date. */
export interface CellRef {
    employeeId: number;
    date: ISODate;
}

/** Stable string key of a cell, "employeeId|date". */
export type CellKey = `${number}|${ISODate}`;

/** One item of the batch save request; `shift: null` clears the cell. */
export interface SyncItem {
    employee_id: number;
    date: ISODate;
    shift: ShiftData | null;
}
