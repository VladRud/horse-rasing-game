import { describe, expect, it } from 'vitest'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { seedFaker, stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { useSessionStore, SessionStatus } from '@/modules/session'
import { useHorsesStore } from '@/modules/horses'
import { useRacesStore, RoundStatus } from '@/modules/race'

describe('session store', () => {
  it('starts a session by generating horses and rounds', () => {
    createTestPinia()
    const restoreFaker = seedFaker(2025)
    const restoreRandom = stubMathRandomSequence([0.11, 0.44, 0.77])

    const sessionStore = useSessionStore()
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()

    sessionStore.startSession()

    restoreRandom()
    restoreFaker()

    expect(sessionStore.sessionStatus).toBe(SessionStatus.Initialized)
    expect(sessionStore.isPlayableSession).toBe(true)
    expect(horsesStore.allHorses).toHaveLength(20)
    expect(racesStore.rounds).toHaveLength(6)
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Pending)
  })

  it('restarts a session and clears previous results', async () => {
    createTestPinia()
    const restoreFaker = seedFaker(2025)
    const restoreRandom = stubMathRandomSequence([0.11, 0.44, 0.77])

    const sessionStore = useSessionStore()
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()

    sessionStore.startSession()

    restoreRandom()
    restoreFaker()

    if (racesStore.rounds && racesStore.rounds[0]) {
      racesStore.rounds[0].results = [{ horseId: 1, position: 1 }]
      racesStore.rounds[0].status = RoundStatus.Finished
    }
    racesStore.currentRoundIndex = 2

    const restoreRestartFaker = seedFaker(2026)
    const restoreRestartRandom = stubMathRandomSequence([0.2, 0.4, 0.6])

    const restartPromise = sessionStore.restartSession()
    expect(sessionStore.sessionStatus).toBe(SessionStatus.Idle)

    await restartPromise

    restoreRestartRandom()
    restoreRestartFaker()

    expect(sessionStore.sessionStatus).toBe(SessionStatus.Initialized)
    expect(sessionStore.isPlayableSession).toBe(true)
    expect(horsesStore.allHorses).toHaveLength(20)
    expect(racesStore.rounds).toHaveLength(6)
    expect(racesStore.currentRoundIndex).toBe(0)
    racesStore.rounds.forEach((round) => {
      expect(round.status).toBe(RoundStatus.Pending)
      expect(round.results).toEqual([])
    })
  })
})
