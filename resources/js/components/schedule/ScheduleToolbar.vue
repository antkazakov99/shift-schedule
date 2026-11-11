<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '../ui/AppIcon.vue';
import { useStableFlag } from '@/composables/useStableFlag';
import { formatPeriod } from '@/lib/date';
import { useSchedule } from '@/stores/schedule';
import type { ViewMode } from '@/types/schedule';

/* Figma: Search (398×48) · period switcher "‹ | period | ›" · Tab "Месяц | Неделя". */

const schedule = useSchedule();

// Shown only for slow responses (>200 ms) and then for at least 400 ms — no 20 ms flashes.
const showSpinner = useStableFlag(computed(() => schedule.loading.value && schedule.ready.value));

const periodLabel = computed(() =>
    formatPeriod(schedule.view.value, schedule.period.value.from, schedule.period.value.to),
);

const views: { value: ViewMode; label: string }[] = [
    { value: 'month', label: 'Месяц' },
    { value: 'week', label: 'Неделя' },
];
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <label
            class="flex h-12 w-full items-center gap-2.5 rounded-xl bg-surface p-3 focus-within:ring-2 focus-within:ring-brand/40 sm:w-auto sm:flex-1 lg:max-w-[398px]"
        >
            <AppIcon name="search" :size="24" class="text-subtle" />
            <span class="sr-only">Поиск по ФИО</span>
            <input
                v-model="schedule.search.value"
                type="search"
                placeholder="Поиск по ФИО"
                class="text-m min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
            />
        </label>

        <div class="flex h-12 flex-1 items-stretch sm:flex-none" role="group" aria-label="Период">
            <button
                type="button"
                class="flex w-12 shrink-0 items-center justify-center rounded-l-lg border-r border-white bg-surface hover:bg-surface-2"
                aria-label="Предыдущий период"
                @click="schedule.step(-1)"
            >
                <AppIcon name="chevron-left" />
            </button>
            <button
                type="button"
                class="text-m flex min-w-40 flex-1 items-center justify-center gap-2 border-r border-white bg-surface px-3 whitespace-nowrap hover:bg-surface-2 sm:w-56 sm:flex-none"
                title="Вернуться к текущему периоду"
                :aria-busy="schedule.loading.value"
                @click="schedule.goToday()"
            >
                {{ periodLabel }}
                <!-- The slot is always there (fixed width), only its visibility changes: no text jump. -->
                <span
                    class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-surface-2 border-t-brand"
                    :class="showSpinner ? 'visible' : 'invisible'"
                    aria-hidden="true"
                />
            </button>
            <button
                type="button"
                class="flex w-12 shrink-0 items-center justify-center rounded-r-lg bg-surface hover:bg-surface-2"
                aria-label="Следующий период"
                @click="schedule.step(1)"
            >
                <AppIcon name="chevron-right" />
            </button>
        </div>

        <div class="flex h-12 w-full items-center rounded-xl bg-surface p-0.5 sm:w-auto" role="tablist" aria-label="Вид">
            <button
                v-for="v in views"
                :key="v.value"
                type="button"
                role="tab"
                :aria-selected="schedule.view.value === v.value"
                class="text-m h-11 flex-1 rounded-[10px] px-6 font-semibold transition-colors sm:w-37 sm:flex-none"
                :class="schedule.view.value === v.value ? 'bg-dark text-white' : 'text-ink hover:bg-surface-2'"
                @click="schedule.setView(v.value)"
            >
                {{ v.label }}
            </button>
        </div>
    </div>
</template>
