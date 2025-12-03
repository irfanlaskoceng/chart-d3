import { useCounter } from '@/composables/useCount';
const { count, increment, decrement } = useCounter();

defineProps({
    msg: {
        type: String,
        required: true,
    },
})