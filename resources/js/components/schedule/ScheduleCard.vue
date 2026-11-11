<script setup lang="ts">
import ScheduleGrid from './ScheduleGrid.vue';
import ScheduleToolbar from './ScheduleToolbar.vue';
import SelectionBar from './SelectionBar.vue';
import { useSelection } from '@/stores/selection';

/* Figma "Content": white card, radius 20, padding 12, gap 20. Selection bar replaces the toolbar. */

const selection = useSelection();
</script>

<template>
    <section class="flex min-h-0 min-w-0 flex-col gap-5 rounded-[20px] bg-white p-3" aria-label="График смен">
        <SelectionBar v-if="selection.count.value" />
        <ScheduleToolbar v-else />
        <ScheduleGrid />
    </section>
</template>
