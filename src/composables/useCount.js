import { ref } from 'vue';

export function useCounter() {
    const count = ref(0);

    function increment(step = 1) {
        count.value += step;
    }

    function decrement(step = 1) {
        count.value -= step;
    }

    return { count, increment, decrement }
}
