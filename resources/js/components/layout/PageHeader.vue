<script setup lang="ts">
import AppButton from '../ui/AppButton.vue';
import AppIcon from '../ui/AppIcon.vue';
import { useSchedule } from '@/stores/schedule';

/* Figma "title" + "Title": back link "Графики смен", page title "График", "Опубликовать" / "Сохранить". */

defineEmits<{ openMenu: [] }>();

const schedule = useSchedule();
</script>

<template>
    <header class="flex flex-col gap-4 lg:gap-6">
        <div class="flex items-center gap-3">
            <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full bg-white lg:hidden"
                aria-label="Открыть меню"
                @click="$emit('openMenu')"
            >
                <AppIcon name="menu" />
            </button>
            <a href="/" class="flex items-center gap-3 text-ink">
                <span class="flex size-10 items-center justify-center rounded-full bg-white">
                    <AppIcon name="chevron-left" />
                </span>
                <span class="text-m leading-[1.4]">Графики смен</span>
            </a>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <h1 class="text-title-2xl">График</h1>
            <div class="flex w-full items-center gap-1 sm:w-auto">
                <span v-if="schedule.changesCount.value" class="text-caption-s mr-3 hidden text-muted sm:inline">
                    Не сохранено: {{ schedule.changesCount.value }}
                </span>
                <!-- Publishing is not part of the task: the button is shown as in the layout, but inactive. -->
                <AppButton class="flex-1 sm:flex-none" disabled title="Публикация графика не входит в задание">
                    Опубликовать
                </AppButton>
                <AppButton
                    variant="primary"
                    class="flex-1 sm:flex-none"
                    :disabled="!schedule.changesCount.value || schedule.saving.value"
                    aria-keyshortcuts="Control+S"
                    @click="schedule.save()"
                >
                    {{ schedule.saving.value ? 'Сохранение…' : 'Сохранить' }}
                </AppButton>
            </div>
        </div>
    </header>
</template>
