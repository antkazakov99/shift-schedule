<script lang="ts">
/** Line icons (24×24 grid, stroke = currentColor), drawn to match the Figma icon set. */
export type IconName =
    | 'home'
    | 'calendar'
    | 'logout'
    | 'sidebar'
    | 'menu'
    | 'chevron-left'
    | 'chevron-right'
    | 'search'
    | 'plus'
    | 'template'
    | 'trash'
    | 'close'
    | 'check'
    | 'bell';
</script>

<script setup lang="ts">
withDefaults(defineProps<{ name: IconName; size?: number; stroke?: number }>(), { size: 24, stroke: 1.5 });
</script>

<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="stroke"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="shrink-0"
    >
        <template v-if="name === 'home'">
            <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
        </template>
        <template v-else-if="name === 'calendar'">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" />
        </template>
        <template v-else-if="name === 'logout'">
            <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
        </template>
        <template v-else-if="name === 'sidebar'">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M10 4v16" />
        </template>
        <template v-else-if="name === 'menu'">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </template>
        <template v-else-if="name === 'chevron-left'">
            <path d="m14.5 7-5 5 5 5" />
        </template>
        <template v-else-if="name === 'chevron-right'">
            <path d="m9.5 7 5 5-5 5" />
        </template>
        <template v-else-if="name === 'search'">
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 3.5 3.5" />
        </template>
        <template v-else-if="name === 'plus'">
            <path d="M12 6v12M6 12h12" />
        </template>
        <template v-else-if="name === 'template'">
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <path d="M16.5 13v7M13 16.5h7" />
        </template>
        <template v-else-if="name === 'trash'">
            <path d="M5 7h14M10 4h4M7 7l.8 12a1 1 0 0 0 1 1h6.4a1 1 0 0 0 1-1L17 7M10.5 11v5M13.5 11v5" />
        </template>
        <template v-else-if="name === 'close'">
            <path d="m7 7 10 10M17 7 7 17" />
        </template>
        <template v-else-if="name === 'bell'">
            <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5zM10 20.5h4" />
        </template>
        <template v-else-if="name === 'check'">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </template>
    </svg>
</template>
