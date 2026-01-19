import {
  type RaceRound,
  RoundStatus,
  HORSES_PER_ROUND,
  ROUND_COUNT,
  ROUND_DISTANCES,
} from '@/modules/race'

const shuffle = <T>(items: T[]): T[] => {
  const result: T[] = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = result[index]!
    result[index] = result[swapIndex]!
    result[swapIndex] = temp
  }

  return result
}

export const generateRaceSchedule = (horsesIds: number[]): RaceRound[] => {
  if (ROUND_DISTANCES.length !== ROUND_COUNT) return []

  return ROUND_DISTANCES.map<RaceRound>((distance, index) => {
    const participants = shuffle<number>(horsesIds).slice(0, HORSES_PER_ROUND)

    return {
      roundNumber: index + 1,
      distance,
      participants,
      status: RoundStatus.Pending,
      results: [],
    }
  })
}
