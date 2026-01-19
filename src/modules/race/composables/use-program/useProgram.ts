import { computed, ref } from 'vue'
import { useRacesStore } from '@/modules/race/store/races.store'

export const useProgram = () => {
  const racesStore = useRacesStore()

  const collapsedState = ref<string[]>([])

  const allRoundNumbers = computed(() => Object.keys(racesStore.indexByRoundNumber))

  const toggleRoundCollapsed = (roundNumber: number) => {
    const roundNumberString = roundNumber.toString()
    const index = collapsedState.value.indexOf(roundNumberString)

    if (index !== -1) {
      collapsedState.value.splice(index, 1)
    } else {
      collapsedState.value.push(roundNumberString)
    }
  }

  const toggleAllCollapsed = () => {
    const allCollapsed = collapsedState.value.length === allRoundNumbers.value.length
    const newState = !allCollapsed

    collapsedState.value = newState ? allRoundNumbers.value : []
  }

  const isAllCollapsed = computed(
    () => collapsedState.value.length === allRoundNumbers.value.length,
  )

  return {
    collapsedState,
    toggleRoundCollapsed,
    toggleAllCollapsed,
    isAllCollapsed,
  }
}
