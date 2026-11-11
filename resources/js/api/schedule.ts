import type { Employee, ISODate, NewShiftTemplate, Shift, ShiftTemplate, SyncItem } from '@/types/schedule';
import { request } from './http';

interface DataWrapper<T> {
    data: T;
}

export const scheduleApi = {
    async employees(): Promise<Employee[]> {
        return (await request<DataWrapper<Employee[]>>('GET', '/employees')).data;
    },

    async templates(): Promise<ShiftTemplate[]> {
        return (await request<DataWrapper<ShiftTemplate[]>>('GET', '/shift-templates')).data;
    },

    async createTemplate(payload: NewShiftTemplate): Promise<ShiftTemplate> {
        return (await request<DataWrapper<ShiftTemplate>>('POST', '/shift-templates', payload)).data;
    },

    async deleteTemplate(id: number): Promise<void> {
        await request<void>('DELETE', `/shift-templates/${id}`);
    },

    async shifts(from: ISODate, to: ISODate): Promise<Shift[]> {
        const query = new URLSearchParams({ from, to });
        return (await request<DataWrapper<Shift[]>>('GET', `/shifts?${query}`)).data;
    },

    /** Saves a batch of cell changes; returns shifts existing in the touched cells after save. */
    async sync(items: SyncItem[]): Promise<Shift[]> {
        return (await request<DataWrapper<Shift[]>>('PUT', '/shifts', { items })).data;
    },
};
