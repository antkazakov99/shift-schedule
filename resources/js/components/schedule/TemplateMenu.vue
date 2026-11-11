<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { SHIFT_COLORS } from '@/lib/colors';
import { durationMinutes, formatDuration, formatTimeRange } from '@/lib/time';
import { useSchedule } from '@/stores/schedule';
import type { ShiftTemplate } from '@/types/schedule';

/*
 * Dropdown list of templates (used by "Применить шаблон" and quick assignment by date).
 * A popover anchored to its trigger — the only kind of positioned element we allow.
 */

withDefaults(defineProps<{ align?: 'left' | 'right'; disabled?: boolean }>(), {
    align: 'left',
    disabled: false,
});
const emit = defineEmits<{ pick: [template: ShiftTemplate]; close: [] }>();

const schedule = useSchedule();
const root = ref<HTMLElement | null>(null);

function onOutside(e: MouseEvent) {
    if (root.value && !root.value.parentElement?.contains(e.target as Node)) {
        emit('close');
    }
}

function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        e.stopPropagation();
        emit('close');
    }
}

onMounted(() => {
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey, true);
});
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onOutside);
    document.removeEventListener('keydown', onKey, true);
});
</script>

<template>
    <div
        ref="root"
        role="menu"
        class="absolute top-full z-40 mt-1 flex w-72 flex-col gap-1 rounded-xl bg-white p-2 text-left text-ink shadow-[0_8px_24px_rgb(16_16_18/0.16)]"
        :class="align === 'right' ? 'right-0' : 'left-0'"
        @mousedown.stop
    >
        <slot name="header" />
        <button
            v-for="t in schedule.templates.value"
            :key="t.id"
            type="button"
            role="menuitem"
            class="flex w-full flex-col items-start rounded-lg border-l-[3px] bg-surface py-2 pr-2 pl-4 text-left transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
            :class="SHIFT_COLORS[t.color].stripe"
            :disabled="disabled"
            @click="emit('pick', t)"
        >
            <span class="text-m font-semibold text-black">{{ t.name }}</span>
            <span class="text-caption-s">
                {{ formatTimeRange(t.start_time, t.end_time) }} ·
                {{ formatDuration(durationMinutes(t.start_time, t.end_time)) }}
            </span>
        </button>
        <p v-if="!schedule.templates.value.length" class="text-caption-s px-2 py-1 text-muted">Шаблонов нет</p>
        <slot name="footer" />
    </div>
</template>
