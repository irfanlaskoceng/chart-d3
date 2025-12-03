import { watch, ref } from 'vue'
import HelloWorld from './components/HelloWorld/HelloWorld.vue'
import { RouterLink, RouterView } from 'vue-router'

export function useAppLogic() {
    const count = ref(0)

    watch(count, (val) => {
        console.log("Count berubah:", val)
    })

    return {
        count,
        HelloWorld,
        RouterLink,
        RouterView
    }
}
