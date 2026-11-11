<script setup lang="ts">
import AppIcon, { type IconName } from '../ui/AppIcon.vue';

/*
 * Figma "menu": "CRM" + bell, main menu, "Свернуть меню" at the bottom.
 * ≥1024: static column 280px (72px icon rail when collapsed).
 * <1024: the same content inside a drawer (see App.vue).
 */

const props = defineProps<{ collapsed?: boolean; drawer?: boolean }>();
defineEmits<{ toggle: [] }>();

interface MenuItem {
    label: string;
    icon: IconName;
    href: string;
    active?: boolean;
}

const menu: MenuItem[] = [
    { label: 'Главная', icon: 'home', href: '#' },
    { label: 'Смены', icon: 'calendar', href: '/', active: true },
];

const short = () => props.collapsed && !props.drawer;
</script>

<template>
    <nav
        class="flex h-full flex-col justify-between gap-6 bg-surface py-4 pr-4 pl-3.5"
        :class="drawer ? 'w-70' : ['border-r border-line', collapsed ? 'w-18' : 'w-70']"
        aria-label="Основное меню"
    >
        <div class="flex flex-col gap-4">
            <div class="flex h-10 items-center justify-between gap-6">
                <span v-if="!short()" class="text-headline-l">CRM</span>
                <button
                    type="button"
                    class="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-2"
                    :aria-label="drawer ? 'Закрыть меню' : 'Уведомления'"
                    @click="drawer && $emit('toggle')"
                >
                    <AppIcon :name="drawer ? 'close' : 'bell'" />
                </button>
            </div>

            <ul class="flex flex-col gap-0.5">
                <li v-for="item in menu" :key="item.label">
                    <a
                        :href="item.href"
                        :title="short() ? item.label : undefined"
                        :aria-current="item.active ? 'page' : undefined"
                        class="text-m flex h-10 items-center gap-3 rounded-lg p-2 font-semibold text-ink transition-colors"
                        :class="item.active ? 'bg-white' : 'hover:bg-surface-2'"
                    >
                        <AppIcon :name="item.icon" />
                        <span v-if="!short()" class="truncate">{{ item.label }}</span>
                    </a>
                </li>
            </ul>
        </div>

        <button
            v-if="!drawer"
            type="button"
            class="text-m flex h-10 w-full items-center gap-3 rounded-lg p-2 text-left font-semibold text-ink hover:bg-surface-2"
            :title="short() ? 'Развернуть меню' : undefined"
            :aria-expanded="!collapsed"
            @click="$emit('toggle')"
        >
            <AppIcon name="sidebar" />
            <span v-if="!short()" class="truncate">Свернуть меню</span>
        </button>
    </nav>
</template>
