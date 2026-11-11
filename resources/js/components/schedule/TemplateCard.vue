<script setup lang="ts">
import { SHIFT_COLORS } from '@/lib/colors';
import { durationMinutes, formatDuration, formatTimeRange } from '@/lib/time';
import { useShiftDnd } from '@/composables/useShiftDnd';
import type { ShiftTemplate } from '@/types/schedule';

/*
 * Figma "ConinerShedule/<Color>/Template": stripe on the left, name, "07:00 - 15:00 · 8 ч",
 * KeyButton with the hotkey. Click — assign to selection, drag — drop onto a cell.
 */

defineProps<{
    template: ShiftTemplate;
    hotkey: number;
    canApply: boolean;
}>();
defineEmits<{ apply: []; remove: [] }>();

const dnd = useShiftDnd();
</script>

<template>
    <div class="group flex items-start gap-3 rounded-lg border-l-[3px] bg-surface py-2 pr-2 pl-4" :class="SHIFT_COLORS[template.color].stripe">
        <button
            type="button"
            draggable="true"
            class="flex min-w-0 flex-1 cursor-grab flex-col items-start text-left text-black active:cursor-grabbing"
            :title="canApply ? `Поставить в выделенные (${hotkey})` : 'Перетащите на ячейку или выделите ячейки'"
            @click="$emit('apply')"
            @dragstart="dnd.startTemplateDrag($event, template.id)"
        >
            <span class="text-m truncate font-semibold">{{ template.name }}</span>
            <span class="text-m whitespace-nowrap">
                {{ formatTimeRange(template.start_time, template.end_time) }}
                <span class="text-ink">·</span>
                {{ formatDuration(durationMinutes(template.start_time, template.end_time)) }}
            </span>
        </button>
        <div class="flex shrink-0 items-center gap-1">
            <button
                type="button"
                class="text-caption-xs flex h-5 items-center rounded px-1.5 text-muted opacity-0 group-hover:opacity-100 hover:bg-white hover:text-danger focus-visible:opacity-100"
                :aria-label="`Удалить шаблон «${template.name}»`"
                @click="$emit('remove')"
            >
                Удалить
            </button>
            <kbd class="text-caption-xs flex h-5 min-w-5.5 items-center justify-center rounded bg-white px-2 font-sans font-semibold text-ink">
                {{ hotkey }}
            </kbd>
        </div>
    </div>
</template>
