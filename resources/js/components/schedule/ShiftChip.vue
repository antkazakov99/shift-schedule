<script setup lang="ts">
import { computed } from 'vue';
import { SHIFT_COLORS } from '@/lib/colors';
import { durationMinutes, formatDuration, formatTimeRange, isOvernight } from '@/lib/time';
import { useSchedule } from '@/stores/schedule';
import type { ShiftData } from '@/types/schedule';

/* Figma "ConinerShedule/<Color>/<Week|Month>": week — "08 - 18" + "10 ч", month — "10 ч" only. */

const props = defineProps<{
    shift: ShiftData;
    compact: boolean;
}>();

const schedule = useSchedule();

const template = computed(() =>
    props.shift.shift_template_id ? schedule.templateById.value.get(props.shift.shift_template_id) : undefined,
);
const colors = computed(() => SHIFT_COLORS[template.value?.color ?? 'brand']);
const hours = computed(() => formatDuration(durationMinutes(props.shift.start_time, props.shift.end_time)));
const title = computed(() => {
    const { start_time: s, end_time: e } = props.shift;
    const night = isOvernight(s, e) ? ', до следующего дня' : '';
    return `${template.value?.name ?? 'Своя смена'}: ${formatTimeRange(s, e)} (${hours.value}${night})`;
});
</script>

<template>
    <div
        draggable="true"
        :title="title"
        class="flex h-full cursor-grab flex-col items-center justify-center rounded-lg p-1 text-center active:cursor-grabbing"
        :class="colors.chip"
    >
        <template v-if="compact">
            <span class="text-m font-semibold whitespace-nowrap" :class="colors.accent">{{ hours }}</span>
        </template>
        <template v-else>
            <span class="text-m whitespace-nowrap tabular-nums">
                {{ formatTimeRange(shift.start_time, shift.end_time, true) }}
            </span>
            <span class="text-caption-xs" :class="colors.accent">{{ hours }}</span>
        </template>
    </div>
</template>
