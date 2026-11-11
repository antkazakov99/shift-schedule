<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppButton from '../ui/AppButton.vue';
import { TEMPLATE_COLORS } from '@/lib/colors';
import { durationMinutes, formatDuration, isOvernight, isValidTime } from '@/lib/time';
import { cellKey, useSchedule } from '@/stores/schedule';
import { useSelection } from '@/stores/selection';

/* Figma "Своя смена": "Начало" / "Конец" inputs + "+ Поставить в выделенные". */

const schedule = useSchedule();
const selection = useSelection();

const start = ref('');
const end = ref('');
const templateName = ref('');
const savingTemplate = ref(false);
const showTemplateForm = ref(false);

const filled = computed(() => isValidTime(start.value) && isValidTime(end.value));
const error = computed(() => (filled.value && start.value === end.value ? 'Начало и конец совпадают' : null));
const valid = computed(() => filled.value && !error.value);
const hint = computed(() => {
    if (error.value) return error.value;
    if (!valid.value) return '';
    const label = formatDuration(durationMinutes(start.value, end.value));
    return isOvernight(start.value, end.value) ? `${label}, заканчивается на следующий день` : label;
});

// Editing: when all selected shifts share the same times, show them in the inputs.
watch(
    () => selection.cells().map((c) => cellKey(c.employeeId, c.date)).join(','),
    () => {
        const shifts = selection.cells().map((c) => schedule.getShift(cellKey(c.employeeId, c.date)));
        const first = shifts[0];
        if (first && shifts.every((s) => s && s.start_time === first.start_time && s.end_time === first.end_time)) {
            start.value = first.start_time;
            end.value = first.end_time;
        }
    },
);

function apply() {
    if (!valid.value || !selection.count.value) return;
    schedule.setShift(selection.cells(), { start_time: start.value, end_time: end.value, shift_template_id: null });
}

async function saveAsTemplate() {
    const name = templateName.value.trim();
    if (!name || !valid.value) return;
    savingTemplate.value = true;
    const used = new Set(schedule.templates.value.map((t) => t.color));
    const color = TEMPLATE_COLORS.find((c) => !used.has(c)) ?? TEMPLATE_COLORS[schedule.templates.value.length % 3]!;
    const created = await schedule.createTemplate({ name, start_time: start.value, end_time: end.value, color });
    savingTemplate.value = false;
    if (created) {
        templateName.value = '';
        showTemplateForm.value = false;
    }
}
</script>

<template>
    <form class="flex flex-col gap-2" @submit.prevent="apply">
        <div class="grid grid-cols-2 gap-2">
            <label class="flex flex-col gap-1">
                <span class="text-xs leading-[1.4] text-muted">Начало</span>
                <input
                    v-model="start"
                    type="text"
                    inputmode="numeric"
                    maxlength="5"
                    placeholder="09:00"
                    pattern="([01]\d|2[0-3]):[0-5]\d"
                    class="text-m h-12 w-full rounded-lg bg-surface py-2 pr-2 pl-4 tabular-nums outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40"
                    @input="start = start.replace(/[^\d:]/g, '').replace(/^(\d{2})(\d)/, '$1:$2')"
                />
            </label>
            <label class="flex flex-col gap-1">
                <span class="text-xs leading-[1.4] text-muted">Конец</span>
                <input
                    v-model="end"
                    type="text"
                    inputmode="numeric"
                    maxlength="5"
                    placeholder="17:00"
                    pattern="([01]\d|2[0-3]):[0-5]\d"
                    class="text-m h-12 w-full rounded-lg bg-surface py-2 pr-2 pl-4 tabular-nums outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40"
                    @input="end = end.replace(/[^\d:]/g, '').replace(/^(\d{2})(\d)/, '$1:$2')"
                />
            </label>
        </div>
        <!-- Always rendered with a fixed height: the button below must not move while typing. -->
        <p class="text-caption-xs h-4 truncate" :class="error ? 'text-danger' : 'text-muted'" aria-live="polite">
            {{ hint }}
        </p>

        <AppButton type="submit" icon="plus" block :disabled="!valid || !selection.count.value">
            Поставить в выделенные
        </AppButton>

        <button
            v-if="!showTemplateForm"
            type="button"
            class="text-caption-s self-start text-brand-strong hover:underline disabled:opacity-50 disabled:hover:no-underline"
            :disabled="!valid"
            @click="showTemplateForm = true"
        >
            Сохранить как шаблон
        </button>
        <div v-else class="flex gap-2">
            <input
                v-model="templateName"
                type="text"
                maxlength="50"
                placeholder="Название шаблона"
                class="text-m h-12 min-w-0 flex-1 rounded-lg bg-surface px-4 outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40"
                @keydown.enter.prevent="saveAsTemplate"
                @keydown.esc.stop="showTemplateForm = false"
            />
            <AppButton :disabled="!templateName.trim() || savingTemplate" @click="saveAsTemplate">OK</AppButton>
        </div>
    </form>
</template>
