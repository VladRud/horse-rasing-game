import { describe, expect, it } from 'vitest'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { seedFaker } from '@/__tests__/helpers/determinism'
import { useHorsesStore, CONDITION_MAX, CONDITION_MIN } from '@/modules/horses'

describe('horses store', () => {
  it('generates 20 horses with unique ids and valid condition range', () => {
    createTestPinia()
    const restore = seedFaker(1234)

    const horsesStore = useHorsesStore()
    horsesStore.generateHorses()

    restore()

    const horses = horsesStore.allHorses
    expect(horses).toHaveLength(20)

    const ids = horses.map((horse) => horse.id)
    expect(new Set(ids).size).toBe(horses.length)

    horses.forEach((horse) => {
      expect(horse.condition).toBeGreaterThanOrEqual(CONDITION_MIN)
      expect(horse.condition).toBeLessThanOrEqual(CONDITION_MAX)
      expect(typeof horse.name).toBe('string')
      expect(typeof horse.color).toBe('string')
    })
  })

  it('is deterministic with a fixed seed', () => {
    const runWithSeed = (seed: number) => {
      createTestPinia()
      const restore = seedFaker(seed)

      const horsesStore = useHorsesStore()
      horsesStore.generateHorses()

      const snapshot = horsesStore.allHorses.map((horse) => ({
        id: horse.id,
        name: horse.name,
        color: horse.color,
        condition: horse.condition,
      }))

      restore()

      return snapshot
    }

    const firstRun = runWithSeed(4242)
    const secondRun = runWithSeed(4242)

    expect(secondRun).toEqual(firstRun)
  })
})
