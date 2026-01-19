import { describe, expect, it } from 'vitest'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { seedFaker, stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { useSessionStore } from '@/modules/session'
import { useRacesStore, RoundStatus } from '@/modules/race'

describe('session and races integration', () => {
  it('initializes the first round and waits for toggle to start', () => {
    createTestPinia()
    const restoreFaker = seedFaker(77)
    const restoreRandom = stubMathRandomSequence([0.19, 0.51, 0.88])

    const sessionStore = useSessionStore()
    const racesStore = useRacesStore()

    sessionStore.startSession()

    restoreRandom()
    restoreFaker()

    expect(racesStore.currentRound?.status).toBe(RoundStatus.Pending)

    racesStore.toggleRound()

    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)
  })
})
