<script setup lang="ts">
import CustomShiftForm from './CustomShiftForm.vue';
import TemplateCard from './TemplateCard.vue';
import { shiftFromTemplate } from '@/lib/time';
import { useSchedule } from '@/stores/schedule';
import { useSelection } from '@/stores/selection';
import type { ShiftTemplate } from '@/types/schedule';

/* Figma right panel: "Шаблоны смен" + "Своя смена". Below 1024px it moves under the table. */

const schedule = useSchedule();
const selection = useSelection();

function apply(template: ShiftTemplate) {
    if (selection.count.value) {
        schedule.setShift(selection.cells(), shiftFromTemplate(template));
    }
}

function remove(template: ShiftTemplate) {
    if (confirm(`Удалить шаблон «${template.name}»? Уже назначенные смены останутся как свои.`)) {
        schedule.deleteTemplate(template.id);
    }
}
</script>

<template>
    <aside class="grid content-start gap-6 rounded-xl bg-white p-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Назначение смен">
        <section class="flex flex-col gap-2">
            <h2 class="text-m">Шаблоны смен</h2>
            <!-- Skeleton of the same size as the cards: the "Своя смена" block must not jump down. -->
            <div v-if="!schedule.ready.value" class="flex flex-col gap-1" aria-hidden="true">
                <div v-for="n in 3" :key="n" class="h-16 animate-pulse rounded-lg bg-surface" />
            </div>
            <div v-else class="flex animate-fade-in flex-col gap-1">
                <TemplateCard
                    v-for="(t, i) in schedule.templates.value"
                    :key="t.id"
                    :template="t"
                    :hotkey="i + 1"
                    :can-apply="selection.count.value > 0"
                    @apply="apply(t)"
                    @remove="remove(t)"
                />
                <p v-if="!schedule.templates.value.length" class="text-caption-s text-muted">Шаблонов пока нет</p>
            </div>
        </section>

        <section class="flex flex-col gap-2">
            <h2 class="text-m">Своя смена</h2>
            <CustomShiftForm />
        </section>
    </aside>
</template>
