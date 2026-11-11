<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AppSidebar from './components/layout/AppSidebar.vue';
import PageHeader from './components/layout/PageHeader.vue';
import ScheduleCard from './components/schedule/ScheduleCard.vue';
import SidePanel from './components/schedule/SidePanel.vue';
import { shiftFromTemplate } from './lib/time';
import { useSchedule } from './stores/schedule';
import { useSelection } from './stores/selection';

const schedule = useSchedule();
const selection = useSelection();

const sidebarCollapsed = ref(false);
const drawerOpen = ref(false);

function isTyping(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    );
}

function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        schedule.save();
        return;
    }
    if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) {
        return;
    }
    if (e.key === 'Escape') {
        drawerOpen.value = false;
        selection.clear();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selection.count.value) {
        e.preventDefault();
        schedule.setShift(selection.cells(), null);
    } else if (/^[1-9]$/.test(e.key) && selection.count.value) {
        // Template hotkeys, shown on the template cards.
        const template = schedule.templates.value[Number(e.key) - 1];
        if (template) {
            schedule.setShift(selection.cells(), shiftFromTemplate(template));
        }
    }
}

function onBeforeUnload(e: BeforeUnloadEvent) {
    if (schedule.changesCount.value) {
        e.preventDefault();
    }
}

onMounted(() => {
    schedule.init();
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('beforeunload', onBeforeUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('beforeunload', onBeforeUnload);
});
</script>

<template>
    <div class="flex min-h-dvh bg-surface lg:h-dvh">
        <!-- ≥1024: static menu -->
        <AppSidebar
            class="hidden shrink-0 lg:flex"
            :collapsed="sidebarCollapsed"
            @toggle="sidebarCollapsed = !sidebarCollapsed"
        />

        <!-- <1024: the same menu in a drawer (overlay) -->
        <Transition
            enter-from-class="opacity-0"
            enter-active-class="transition-opacity duration-200"
            leave-to-class="opacity-0"
            leave-active-class="transition-opacity duration-200"
        >
            <div v-if="drawerOpen" class="fixed inset-0 z-50 flex bg-ink/30 lg:hidden" @click.self="drawerOpen = false">
                <AppSidebar drawer class="shadow-xl" @toggle="drawerOpen = false" />
            </div>
        </Transition>

        <main class="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:px-6 lg:min-h-0 lg:py-6 lg:pr-7.5 lg:pl-7.5">
            <PageHeader @open-menu="drawerOpen = true" />

            <div class="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
                <ScheduleCard class="h-[min(75dvh,760px)] lg:h-auto lg:flex-1" />
                <SidePanel class="lg:w-84 lg:shrink-0 lg:overflow-y-auto" />
            </div>
        </main>

        <Transition
            enter-from-class="translate-y-2 opacity-0"
            enter-active-class="transition duration-200"
            leave-to-class="translate-y-2 opacity-0"
            leave-active-class="transition duration-200"
        >
            <div
                v-if="schedule.notice.value"
                role="status"
                class="text-caption-s fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-white shadow-lg"
                :class="schedule.notice.value.type === 'error' ? 'bg-danger' : 'bg-dark'"
            >
                {{ schedule.notice.value.text }}
            </div>
        </Transition>
    </div>
</template>
