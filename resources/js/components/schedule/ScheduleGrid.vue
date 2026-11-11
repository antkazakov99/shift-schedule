<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DayHeader from './DayHeader.vue';
import EmployeeCell from './EmployeeCell.vue';
import ScheduleCell from './ScheduleCell.vue';
import { today } from '@/lib/date';
import { useSchedule } from '@/stores/schedule';
import type { ISODate } from '@/types/schedule';

/*
 * Table: "Сотрудник" column + one column per day; "Покрытие" row pinned to the bottom.
 * Header row, employee column and coverage row are sticky inside the scroll area.
 */

const schedule = useSchedule();

/** "Сотрудник" column: 220px as in Figma, 144px on phones. Fixed so long names truncate. */
const EMPLOYEE_COL = 'w-36 min-w-36 max-w-36 sm:w-55 sm:min-w-55 sm:max-w-55';
const SKELETON_ROWS = 8;

const compact = computed(() => schedule.view.value === 'month');
const todayISO = today();
const menuDate = ref<ISODate | null>(null);
const scroller = ref<HTMLElement | null>(null);

watch(schedule.period, () => (menuDate.value = null));

// Month is wider than the card: keep today's column in view when the period changes.
watch(
    schedule.period,
    () => {
        const el = scroller.value;
        if (!el) return;
        const todayCell = compact.value ? el.querySelector<HTMLElement>('th[data-today]') : null;
        const stickyWidth = el.querySelector<HTMLElement>('thead th')?.offsetWidth ?? 0;
        // Today two columns after the sticky "Сотрудник" column.
        el.scrollLeft = todayCell ? Math.max(0, todayCell.offsetLeft - stickyWidth - todayCell.offsetWidth * 2) : 0;
    },
    { flush: 'post' },
);

function toggleMenu(date: ISODate) {
    menuDate.value = menuDate.value === date ? null : date;
}
</script>

<template>
    <div ref="scroller" class="min-h-0 flex-1 overflow-auto overscroll-contain select-none" :aria-busy="!schedule.ready.value">
        <table class="w-full border-separate border-spacing-0">
            <thead>
                <tr>
                    <th
                        scope="col"
                        class="text-m sticky top-0 left-0 z-30 border-b border-line bg-white p-3 text-left font-normal text-muted"
                        :class="EMPLOYEE_COL"
                    >
                        Сотрудник
                    </th>
                    <DayHeader
                        v-for="(date, i) in schedule.dates.value"
                        :key="date"
                        :data-today="date === todayISO || undefined"
                        :date="date"
                        :compact="compact"
                        :menu-open="menuDate === date"
                        :align-menu-right="i > schedule.dates.value.length - 4"
                        @toggle-menu="toggleMenu(date)"
                        @close-menu="menuDate = null"
                    />
                </tr>
            </thead>

            <!-- First load: skeleton rows of the real row height, so nothing jumps when data arrives. -->
            <tbody v-if="!schedule.ready.value" aria-hidden="true">
                <tr v-for="n in SKELETON_ROWS" :key="n" class="bg-white even:bg-hover">
                    <th class="sticky left-0 z-10 bg-inherit p-0" :class="EMPLOYEE_COL">
                        <div class="flex h-18 items-center gap-2 py-3 pr-3 pl-2">
                            <span class="hidden size-10 shrink-0 animate-pulse rounded bg-surface-2 sm:block" />
                            <span class="flex flex-1 flex-col gap-1.5">
                                <span class="h-3.5 w-4/5 animate-pulse rounded bg-surface-2" />
                                <span class="h-2.5 w-1/2 animate-pulse rounded bg-surface-2" />
                            </span>
                        </div>
                    </th>
                    <td
                        v-for="date in schedule.dates.value"
                        :key="date"
                        class="h-18 p-1"
                        :class="compact ? 'w-16 max-w-16 min-w-16' : 'min-w-[100px]'"
                    >
                        <div class="h-16 rounded-lg border border-dashed border-line" />
                    </td>
                </tr>
            </tbody>

            <tbody v-else class="animate-fade-in">
                <tr
                    v-for="employee in schedule.visibleEmployees.value"
                    :key="employee.id"
                    class="bg-white even:bg-hover"
                >
                    <th scope="row" class="sticky left-0 z-10 bg-inherit p-0 font-normal" :class="EMPLOYEE_COL">
                        <EmployeeCell
                            :employee="employee"
                            :minutes="schedule.employeeTotals.value.get(employee.id)?.minutes ?? 0"
                        />
                    </th>
                    <ScheduleCell
                        v-for="date in schedule.dates.value"
                        :key="date"
                        :employee-id="employee.id"
                        :date="date"
                        :compact="compact"
                    />
                </tr>
                <tr v-if="!schedule.visibleEmployees.value.length">
                    <td :colspan="schedule.dates.value.length + 1" class="text-m px-3 py-12 text-muted">
                        <span class="sticky left-3">
                            <template v-if="schedule.search.value">
                                Никого не нашли по запросу «{{ schedule.search.value }}»
                            </template>
                            <template v-else>Нет сотрудников</template>
                        </span>
                    </td>
                </tr>
            </tbody>

            <tfoot>
                <tr>
                    <th
                        scope="row"
                        class="text-m sticky bottom-0 left-0 z-30 h-12 border-t border-line bg-white p-3 text-left font-normal text-muted"
                    >
                        Покрытие
                    </th>
                    <td
                        v-for="date in schedule.dates.value"
                        :key="date"
                        class="text-m sticky bottom-0 z-20 h-12 border-t border-line p-3 text-center tabular-nums"
                        :class="
                            !schedule.ready.value
                                ? 'bg-white text-transparent'
                                : (schedule.coverage.value.get(date) ?? 0) > 0
                                  ? 'animate-fade-in bg-selected text-brand-strong'
                                  : 'animate-fade-in bg-danger-soft text-danger'
                        "
                        :data-covered="(schedule.coverage.value.get(date) ?? 0) > 0"
                        :title="`Смен в этот день: ${schedule.coverage.value.get(date) ?? 0}`"
                    >
                        <template v-if="schedule.ready.value">{{ schedule.coverage.value.get(date) ?? 0 }}</template>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>
