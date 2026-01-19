import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useHorsesStore } from '@/modules/horses'
import { useSessionStore, SessionStatus } from '@/modules/session'
import {
  useRacesStore,
  RoundStatus,
  HORSES_PER_ROUND,
  ROUND_COUNT,
  ROUND_DISTANCES,
} from '@/modules/race'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { HORSE_FIXTURES } from '@/__tests__/fixtures/raceFixtures'

describe('races store', () => {
  beforeEach(() => {
    createTestPinia()
  })

  it('generates a program from the current horse pool', () => {
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()

    horsesStore.horses = HORSE_FIXTURES

    const restore = stubMathRandomSequence([0.09, 0.51, 0.77])
    racesStore.generateProgram()
    restore()

    expect(racesStore.rounds).toHaveLength(ROUND_COUNT)
    expect(racesStore.currentRoundIndex).toBe(0)
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Pending)

    const horseIds = HORSE_FIXTURES.map((horse) => horse.id)

    racesStore.rounds.forEach((round, index) => {
      expect(round.distance).toBe(ROUND_DISTANCES[index])
      expect(round.status).toBe(RoundStatus.Pending)
      expect(round.results).toEqual([])
      expect(round.participants).toHaveLength(HORSES_PER_ROUND)

      const uniqueParticipants = new Set(round.participants)
      expect(uniqueParticipants.size).toBe(HORSES_PER_ROUND)

      round.participants.forEach((horseId) => {
        expect(horseIds).toContain(horseId)
      })
    })
  })

  it('is deterministic with a fixed random sequence', () => {
    const runWithSequence = (sequence: number[]) => {
      const horsesStore = useHorsesStore()
      const racesStore = useRacesStore()

      horsesStore.horses = HORSE_FIXTURES

      const restore = stubMathRandomSequence(sequence)
      racesStore.generateProgram()
      restore()

      return racesStore.rounds.map((round) => ({
        roundNumber: round.roundNumber,
        distance: round.distance,
        participants: [...round.participants],
      }))
    }

    const firstRun = runWithSequence([0.22, 0.58, 0.91])
    const secondRun = runWithSequence([0.22, 0.58, 0.91])

    expect(secondRun).toEqual(firstRun)
  })

  it('does not toggle rounds when the session is not initialized', () => {
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()

    horsesStore.horses = HORSE_FIXTURES

    const restore = stubMathRandomSequence([0.12, 0.34, 0.56])
    racesStore.generateProgram()
    restore()

    racesStore.toggleRound()

    expect(racesStore.currentRound?.status).toBe(RoundStatus.Pending)
  })

  it('toggles the round through running and paused states', () => {
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    horsesStore.horses = HORSE_FIXTURES

    const restore = stubMathRandomSequence([0.15, 0.45, 0.75])
    racesStore.generateProgram()
    restore()

    sessionStore.sessionStatus = SessionStatus.Initialized

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Paused)

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

    const currentRound = racesStore.rounds[racesStore.currentRoundIndex]
    if (currentRound) currentRound.status = RoundStatus.Finished

    racesStore.toggleRound()

    expect(racesStore.currentRound?.status).toBe(RoundStatus.Finished)
  })

  it('auto-starts the next round when finishing a non-final round', async () => {
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    horsesStore.horses = HORSE_FIXTURES

    const restore = stubMathRandomSequence([0.1, 0.2, 0.3])
    racesStore.generateProgram()
    restore()

    sessionStore.sessionStatus = SessionStatus.Initialized

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

    racesStore.finishRound()
    await nextTick()
    await nextTick()

    expect(racesStore.currentRoundIndex).toBe(1)
    expect(racesStore.rounds[0]?.status).toBe(RoundStatus.Finished)
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)
  })

  it('completes the session when finishing the final round', async () => {
    createTestPinia()
    const horsesStore = useHorsesStore()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    horsesStore.horses = HORSE_FIXTURES

    const restore = stubMathRandomSequence([0.07, 0.29, 0.63])
    racesStore.generateProgram()
    restore()

    sessionStore.sessionStatus = SessionStatus.Initialized
    racesStore.currentRoundIndex = racesStore.rounds.length - 1

    racesStore.toggleRound()
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Running)

    racesStore.finishRound()
    await nextTick()
    await nextTick()

    expect(racesStore.currentRoundIndex).toBe(racesStore.rounds.length - 1)
    expect(racesStore.currentRound?.status).toBe(RoundStatus.Finished)
    expect(sessionStore.sessionStatus).toBe(SessionStatus.Completed)
  })
})
