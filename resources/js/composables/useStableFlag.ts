import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

/**
 * A loading flag that doesn't blink:
 *  - turns on only if the source stays true longer than `delay` (fast responses show nothing);
 *  - once on, stays on for at least `minDuration`.
 */
export function useStableFlag(source: Ref<boolean>, { delay = 200, minDuration = 400 } = {}): Ref<boolean> {
    const visible = ref(false);
    let shownAt = 0;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    watch(
        source,
        (on) => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            if (on) {
                if (visible.value) return;
                showTimer = setTimeout(() => {
                    visible.value = true;
                    shownAt = performance.now();
                }, delay);
            } else if (visible.value) {
                const rest = minDuration - (performance.now() - shownAt);
                hideTimer = setTimeout(() => (visible.value = false), Math.max(0, rest));
            }
        },
        { immediate: true },
    );

    onBeforeUnmount(() => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
    });

    return visible;
}
