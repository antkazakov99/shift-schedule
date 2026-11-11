<script setup lang="ts">
import { computed, ref } from 'vue';
import TemplateMenu from './TemplateMenu.vue';
import AppIcon from '../ui/AppIcon.vue';
import { plural } from '@/lib/plural';
import { shiftFromTemplate } from '@/lib/time';
import { useSchedule } from '@/stores/schedule';
import { useSelection } from '@/stores/selection';
import type { ShiftTemplate } from '@/types/schedule';

/*
 * Figma "SelectionBar": takes the toolbar's place while cells are selected.
 * "Выделено: [6 ячеек] 2 сотрудника(-ов) · 4 дн." · Применить шаблон · Очистить · Снять
 */

const schedule = useSchedule();
const selection = useSelection();
const menuOpen = ref(false);

const s = computed(() => selection.summary.value);
const cellsLabel = computed(() => `${s.value.cells} ${plural(s.value.cells, ['ячейка', 'ячейки', 'ячеек'])}`);
const detailsLabel = computed(
    () =>
        `${s.value.employees} ${plural(s.value.employees, ['сотрудник', 'сотрудника', 'сотрудников'])} · ${s.value.days} дн.`,
);

function apply(template: ShiftTemplate) {
    schedule.setShift(selection.cells(), shiftFromTemplate(template));
    menuOpen.value = false;
}

function clearShifts() {
    schedule.setShift(selection.cells(), null);
}
</script>

<template>
    <div
        class="text-caption-s flex min-h-12 flex-wrap items-center justify-between gap-x-2.5 gap-y-1 rounded-lg bg-dark px-3 py-1.5 text-white"
        role="toolbar"
        aria-label="Действия с выделенными ячейками"
    >
        <div class="flex flex-wrap items-center gap-2.5">
            <span>Выделено:</span>
            <span class="rounded-full bg-dark-2 px-2 py-0.5">{{ cellsLabel }}</span>
            <span>{{ detailsLabel }}</span>
        </div>

        <div class="flex items-center gap-2">
            <div class="relative">
                <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg p-2 hover:bg-white/10"
                    aria-haspopup="menu"
                    :aria-expanded="menuOpen"
                    @click="menuOpen = !menuOpen"
                >
                    <AppIcon name="template" :size="16" />
                    Применить шаблон
                </button>
                <TemplateMenu v-if="menuOpen" align="right" @pick="apply" @close="menuOpen = false" />
            </div>
            <button
                type="button"
                class="flex items-center gap-1 rounded-lg p-2 hover:bg-white/10"
                title="Удалить смены в выделенных ячейках (Delete)"
                @click="clearShifts"
            >
                <AppIcon name="trash" :size="16" />
                Очистить
            </button>
            <button
                type="button"
                class="flex items-center gap-1 rounded-lg p-2 hover:bg-white/10"
                title="Снять выделение (Esc)"
                @click="selection.clear()"
            >
                <AppIcon name="close" :size="16" />
                Снять
            </button>
        </div>
    </div>
</template>
