import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useRaceAnimation } from '@/modules/race'
import type { Horse } from '@/modules/horses'

const buildHorse = (id: number, condition: number): Horse => ({
  id,
  name: `Horse ${id}`,
  color: '#000000',
  condition,
})

const setupAnimation = (horses: Horse[]) => {
  const distance = ref(1200)
  const horsesInCurrentRound = ref(horses)
  const finishRoundCallback = vi.fn()
  const updateResultsCallback = vi.fn()

  const animation = useRaceAnimation({
    roundDistance: computed(() => distance.value),
    horsesInCurrentRound: computed(() => horsesInCurrentRound.value),
    finishRoundCallback,
    updateResultsCallback,
  })

  return { animation, finishRoundCallback, updateResultsCallback }
}

describe('useRaceAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates progress and results with deterministic tie ordering', () => {
    const horses = [buildHorse(1, 100), buildHorse(2, 100)]
    const { animation, updateResultsCallback } = setupAnimation(horses)

    animation.initializeRoundRuntime()
    animation.startAnimationLoop()

    vi.advanceTimersByTime(17)

    const lastResults =
      updateResultsCallback.mock.calls[updateResultsCallback.mock.calls.length - 1]?.[0] ?? []

    expect(lastResults.map((result: { horseId: number }) => result.horseId)).toEqual([1, 2])
    expect(animation.progressByHorse.value[1]).toBeGreaterThan(0)
    expect(animation.progressByHorse.value[2]).toBeGreaterThan(0)

    animation.stopAnimationLoop()
  })

  it('pauses and resumes progress updates', () => {
    const horses = [buildHorse(1, 100), buildHorse(2, 100)]
    const { animation } = setupAnimation(horses)

    animation.initializeRoundRuntime()
    animation.startAnimationLoop()

    vi.advanceTimersByTime(500)
    const progressBeforePause = animation.progressByHorse.value[1] ?? 0

    animation.stopAnimationLoop()
    vi.advanceTimersByTime(500)

    expect(animation.progressByHorse.value[1]).toBeCloseTo(progressBeforePause, 5)

    animation.startAnimationLoop()
    vi.advanceTimersByTime(500)

    expect(animation.progressByHorse.value[1]).toBeGreaterThan(progressBeforePause)

    animation.stopAnimationLoop()
  })

  it('finishes the round when all horses reach 100', () => {
    const horses = [buildHorse(1, 100), buildHorse(2, 100)]
    const { animation, finishRoundCallback } = setupAnimation(horses)

    animation.initializeRoundRuntime()
    animation.startAnimationLoop()

    vi.advanceTimersByTime(9000)

    expect(finishRoundCallback).toHaveBeenCalledTimes(1)
    expect(animation.progressByHorse.value[1]).toBe(100)
    expect(animation.progressByHorse.value[2]).toBe(100)
  })
})
