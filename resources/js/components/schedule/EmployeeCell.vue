<script setup lang="ts">
import { computed } from 'vue';
import { formatDuration } from '@/lib/time';
import type { Employee } from '@/types/schedule';

/* Figma "AgentCell": avatar 40px (letter mark on #3E87FF gradient), name, "агент · 24 ч". */

const props = defineProps<{
    employee: Employee;
    minutes: number;
}>();

const initials = computed(() =>
    props.employee.full_name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p.charAt(0))
        .join('')
        .toUpperCase(),
);
</script>

<template>
    <div class="flex items-center gap-2 py-3 pr-3 pl-2">
        <span
            class="text-m hidden size-10 shrink-0 items-center justify-center rounded border-[0.5px] border-surface font-semibold text-white sm:flex"
            style="background: linear-gradient(180deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0) 100%), var(--color-avatar)"
            aria-hidden="true"
        >
            {{ initials }}
        </span>
        <div class="min-w-0 flex-1 text-left">
            <div class="text-m truncate font-normal text-black" :title="employee.full_name">{{ employee.full_name }}</div>
            <div class="text-caption-xs flex gap-1 font-normal text-muted">
                <span v-if="employee.position" class="truncate">{{ employee.position }}</span>
                <span v-if="employee.position">·</span>
                <span class="shrink-0 tabular-nums">{{ formatDuration(minutes) }}</span>
            </div>
        </div>
    </div>
</template>
