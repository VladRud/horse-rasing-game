import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { seedFaker, stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { useSessionStore, SessionStatus } from '@/modules/session'
import { useRacesStore, RoundStatus } from '@/modules/race'

describe('regenerate integration', () => {
  it('resets state when regenerating during a paused round', async () => {
    createTestPinia()
    const restoreFaker = seedFaker(310)
    const restoreRandom = stubMathRandomSequence([0.13, 0.55, 0.91])

    const sessionStore = useSessionStore()
    const racesStore = useRacesStore()

    sessionStore.startSession()

    restoreRandom()
    restoreFaker()

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Paused)

    racesStore.updateRoundResults(racesStore.currentRound!.roundNumber!, [
      { horseId: racesStore.currentRound!.participants[0]!, position: 1 },
    ])

    const restoreRestartFaker = seedFaker(311)
    const restoreRestartRandom = stubMathRandomSequence([0.22, 0.44, 0.66])

    await sessionStore.restartSession()
    await nextTick()

    restoreRestartRandom()
    restoreRestartFaker()

    expect(sessionStore.sessionStatus).toBe(SessionStatus.Initialized)
    expect(racesStore.currentRoundIndex).toBe(0)

    racesStore.rounds.forEach((round) => {
      expect(round.status).toBe(RoundStatus.Pending)
      expect(round.results).toEqual([])
    })
  })
})
