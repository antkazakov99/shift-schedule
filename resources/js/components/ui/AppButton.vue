<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue';

/** Figma "Button": primary (Brand) / secondary (Cornflower), 48px, radius 8, Text/M-SemiBold. */
withDefaults(
    defineProps<{
        variant?: 'primary' | 'secondary';
        icon?: IconName;
        type?: 'button' | 'submit';
        block?: boolean;
    }>(),
    { variant: 'secondary', type: 'button', icon: undefined, block: false },
);
</script>

<template>
    <button
        :type="type"
        class="text-m inline-flex min-h-12 items-center justify-center gap-1 rounded-lg px-4 py-3 font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
            variant === 'primary'
                ? 'bg-brand text-white hover:enabled:bg-brand-strong'
                : 'bg-brand-soft text-brand-strong hover:enabled:bg-selected',
            block ? 'w-full' : '',
        ]"
    >
        <AppIcon v-if="icon" :name="icon" />
        <slot />
    </button>
</template>
