import { describe, expect, it } from 'vitest'
import { stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { HORSE_FIXTURES } from '@/__tests__/fixtures/raceFixtures'
import {
  generateRaceSchedule,
  RoundStatus,
  ROUND_COUNT,
  HORSES_PER_ROUND,
  ROUND_DISTANCES,
} from '@/modules/race'

describe('generateRaceSchedule', () => {
  it('builds six rounds with fixed distances and participants', () => {
    const restore = stubMathRandomSequence([0.12, 0.87, 0.33])
    const horseIds = HORSE_FIXTURES.map((horse) => horse.id)

    const rounds = generateRaceSchedule(horseIds)

    restore()

    expect(rounds).toHaveLength(ROUND_COUNT)

    rounds.forEach((round, index) => {
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
    const horseIds = HORSE_FIXTURES.map((horse) => horse.id)

    const firstRestore = stubMathRandomSequence([0.42, 0.15, 0.73])
    const firstRun = generateRaceSchedule(horseIds)
    firstRestore()

    const secondRestore = stubMathRandomSequence([0.42, 0.15, 0.73])
    const secondRun = generateRaceSchedule(horseIds)
    secondRestore()

    expect(secondRun).toEqual(firstRun)
  })
})
