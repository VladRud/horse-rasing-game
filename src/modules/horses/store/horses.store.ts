import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type Horse, CONDITION_MAX, CONDITION_MIN, HORSE_COUNT } from '@/modules/horses'
import { faker } from '@faker-js/faker'

export const useHorsesStore = defineStore('horses', () => {
  const horses = ref<Horse[]>([])

  const allHorses = computed(() => horses.value)

  const allHorsesMap = computed<Map<number, Horse>>(() => {
    return new Map(horses.value.map((horse) => [horse.id, horse]))
  })

  const getHorsesByIds = (ids: number[]): Horse[] => {
    return ids.reduce<Horse[]>((acc, id) => {
      const horse = allHorsesMap.value.get(id)
      if (horse) acc.push(horse)
      return acc
    }, [])
  }

  const generateHorses = () => {
    const uniqueConditions = new Set<number>()

    const getUniqueCondition = () => {
      const condition = faker.number.int({ min: CONDITION_MIN, max: CONDITION_MAX })
      if (uniqueConditions.has(condition)) {
        return getUniqueCondition()
      }
      uniqueConditions.add(condition)
      return condition
    }

    horses.value = Array.from({ length: HORSE_COUNT }, (_, index) => {
      const condition = getUniqueCondition()

      return {
        id: index + 1,
        name: faker.animal.horse(),
        color: faker.color.rgb(),
        condition,
      }
    })
  }

  return {
    horses,
    allHorses,
    allHorsesMap,
    getHorsesByIds,
    generateHorses,
  }
})
