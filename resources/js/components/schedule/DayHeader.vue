<script setup lang="ts">
import { computed } from 'vue';
import TemplateMenu from './TemplateMenu.vue';
import { formatFullDate, formatWeekday, fromISO, today } from '@/lib/date';
import { shiftFromTemplate } from '@/lib/time';
import { cellKey, useSchedule } from '@/stores/schedule';
import type { ISODate, ShiftTemplate } from '@/types/schedule';

/*
 * Day column header: week — "пн 1" (Text/M, muted), month — "пн" over "1" (Caption/S).
 * Click → quick assignment menu: the template goes to every visible employee without a shift that day.
 */

const props = defineProps<{
    date: ISODate;
    compact: boolean;
    menuOpen: boolean;
    alignMenuRight: boolean;
}>();
const emit = defineEmits<{ toggleMenu: []; closeMenu: [] }>();

const schedule = useSchedule();

const day = computed(() => fromISO(props.date).getDate());
const isToday = computed(() => props.date === today());

const visibleCells = computed(() =>
    schedule.visibleEmployees.value.map((e) => ({ employeeId: e.id, date: props.date })),
);
const emptyCells = computed(() =>
    visibleCells.value.filter((c) => !schedule.getShift(cellKey(c.employeeId, c.date))),
);

function assign(template: ShiftTemplate) {
    schedule.setShift(emptyCells.value, shiftFromTemplate(template));
    emit('closeMenu');
}

function clearDay() {
    schedule.setShift(visibleCells.value, null);
    emit('closeMenu');
}
</script>

<template>
    <th
        scope="col"
        class="sticky top-0 z-20 border-b border-line bg-white p-0 font-normal"
        :class="compact ? 'h-14 w-16 max-w-16 min-w-16' : 'h-12 min-w-[100px]'"
    >
        <div class="relative h-full">
            <button
                type="button"
                :title="`${formatFullDate(date)} — быстрое назначение смены`"
                :aria-expanded="menuOpen"
                aria-haspopup="menu"
                class="flex h-full w-full items-center justify-center whitespace-nowrap transition-colors hover:bg-hover"
                :class="[
                    compact ? 'text-caption-s flex-col' : 'text-m gap-1',
                    menuOpen ? 'bg-selected text-brand-strong' : isToday ? 'text-brand-strong' : 'text-muted',
                ]"
                @click="emit('toggleMenu')"
            >
                <span :class="compact ? 'text-caption-xs' : ''">{{ formatWeekday(date) }}</span>
                <span class="tabular-nums" :class="compact && !menuOpen && !isToday ? 'text-ink' : ''">{{ day }}</span>
            </button>

            <TemplateMenu
                v-if="menuOpen"
                :align="alignMenuRight ? 'right' : 'left'"
                :disabled="!emptyCells.length"
                @pick="assign"
                @close="emit('closeMenu')"
            >
                <template #header>
                    <div class="flex flex-col px-2 pt-1 pb-2">
                        <span class="text-m font-semibold first-letter:uppercase">{{ formatFullDate(date) }}</span>
                        <span class="text-caption-xs text-muted">
                            Без смены: {{ emptyCells.length }} из {{ visibleCells.length }} — назначить всем
                        </span>
                    </div>
                </template>
                <template #footer>
                    <button
                        type="button"
                        role="menuitem"
                        class="text-caption-s mt-1 w-full rounded-lg px-2 py-2 text-left text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="emptyCells.length === visibleCells.length"
                        @click="clearDay"
                    >
                        Очистить день
                    </button>
                </template>
            </TemplateMenu>
        </div>
    </th>
</template>
