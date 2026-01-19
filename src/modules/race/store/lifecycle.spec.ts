import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { seedFaker, stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { useSessionStore, SessionStatus } from '@/modules/session'
import { useRacesStore, RoundStatus } from '@/modules/race'

describe('session lifecycle integration', () => {
  it('auto-chains rounds and completes the session', async () => {
    createTestPinia()
    const restoreFaker = seedFaker(451)
    const restoreRandom = stubMathRandomSequence([0.12, 0.44, 0.68])

    const sessionStore = useSessionStore()
    const racesStore = useRacesStore()

    sessionStore.startSession()

    restoreRandom()
    restoreFaker()

    expect(sessionStore.sessionStatus).toBe(SessionStatus.Initialized)
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Pending)

    const lastRoundIndex = racesStore.rounds.length - 1

    for (let roundIndex = 0; roundIndex < lastRoundIndex; roundIndex += 1) {
      if (racesStore.currentRound?.status !== RoundStatus.Running) {
        racesStore.toggleRound()
      }

      expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

      racesStore.finishRound()
      await nextTick()
      await nextTick()

      expect(racesStore.currentRoundIndex).toBe(roundIndex + 1)
      expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)
      expect(sessionStore.sessionStatus).toBe(SessionStatus.Initialized)
    }

    if (racesStore.currentRound?.status !== RoundStatus.Running) {
      racesStore.toggleRound()
    }

    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

    racesStore.finishRound()
    await nextTick()
    await nextTick()

    expect(racesStore.currentRoundIndex).toBe(lastRoundIndex)
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Finished)
    expect(sessionStore.sessionStatus).toBe(SessionStatus.Completed)

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Finished)
  })
})
