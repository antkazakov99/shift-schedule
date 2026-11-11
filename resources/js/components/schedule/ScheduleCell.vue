<script setup lang="ts">
import { computed, ref } from 'vue';
import ShiftChip from './ShiftChip.vue';
import AppIcon from '../ui/AppIcon.vue';
import { useShiftDnd } from '@/composables/useShiftDnd';
import { cellKey, useSchedule } from '@/stores/schedule';
import { useSelection } from '@/stores/selection';
import type { ISODate } from '@/types/schedule';

/*
 * Figma "CellShedule" (110×72 week / 64×72 month, padding 4):
 *   Default — dashed container; Active (selected / drop target) — #EBEFFD + 1px brand border,
 *   empty active cell shows the round "+"; Shedule — shift chip.
 */

const props = defineProps<{
    employeeId: number;
    date: ISODate;
    compact: boolean;
}>();

const schedule = useSchedule();
const selection = useSelection();
const dnd = useShiftDnd();

const cell = computed(() => ({ employeeId: props.employeeId, date: props.date }));
const key = computed(() => cellKey(props.employeeId, props.date));
const shift = computed(() => schedule.getShift(key.value));
const dropTarget = ref(false);
const active = computed(() => selection.has(key.value) || dropTarget.value);

function onDragOver(e: DragEvent) {
    dropTarget.value = dnd.accept(e);
}

function onDrop(e: DragEvent) {
    dropTarget.value = false;
    dnd.drop(e, cell.value);
}
</script>

<template>
    <td
        class="h-18 p-1 align-middle"
        :class="[
            compact ? 'w-16 max-w-16 min-w-16' : 'min-w-[100px]',
            active ? 'bg-selected shadow-[inset_0_0_0_1px_var(--color-brand)]' : '',
        ]"
        :aria-selected="selection.has(key)"
        @mousedown="selection.onCellMouseDown(cell, $event)"
        @mouseenter="selection.onCellMouseEnter(cell)"
        @dragover="onDragOver"
        @dragleave="dropTarget = false"
        @drop.prevent="onDrop"
    >
        <div class="h-16">
            <ShiftChip v-if="shift" :shift="shift" :compact="compact" @dragstart="dnd.startShiftDrag($event, key)" />
            <div
                v-else
                class="flex h-full items-center justify-center rounded-lg"
                :class="active ? '' : 'border border-dashed border-line'"
            >
                <span v-if="active" class="flex size-5 items-center justify-center rounded-full bg-brand text-white">
                    <AppIcon name="plus" :size="14" :stroke="1.6" />
                </span>
            </div>
        </div>
    </td>
</template>
