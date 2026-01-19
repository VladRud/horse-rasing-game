import { type Horse } from '@/modules/horses'
import { RoundStatus, type RaceRound } from '@/modules/race'

export const HORSE_FIXTURES: Horse[] = [
  { id: 1, name: 'Horse 1', color: '#d32f2f', condition: 95 },
  { id: 2, name: 'Horse 2', color: '#c2185b', condition: 88 },
  { id: 3, name: 'Horse 3', color: '#7b1fa2', condition: 72 },
  { id: 4, name: 'Horse 4', color: '#512da8', condition: 65 },
  { id: 5, name: 'Horse 5', color: '#303f9f', condition: 90 },
  { id: 6, name: 'Horse 6', color: '#1976d2', condition: 55 },
  { id: 7, name: 'Horse 7', color: '#0288d1', condition: 78 },
  { id: 8, name: 'Horse 8', color: '#0097a7', condition: 62 },
  { id: 9, name: 'Horse 9', color: '#00796b', condition: 84 },
  { id: 10, name: 'Horse 10', color: '#388e3c', condition: 99 },
  { id: 11, name: 'Horse 11', color: '#689f38', condition: 47 },
  { id: 12, name: 'Horse 12', color: '#afb42b', condition: 52 },
  { id: 13, name: 'Horse 13', color: '#fbc02d', condition: 73 },
  { id: 14, name: 'Horse 14', color: '#ffa000', condition: 68 },
  { id: 15, name: 'Horse 15', color: '#f57c00', condition: 81 },
  { id: 16, name: 'Horse 16', color: '#e64a19', condition: 60 },
  { id: 17, name: 'Horse 17', color: '#5d4037', condition: 77 },
  { id: 18, name: 'Horse 18', color: '#616161', condition: 58 },
  { id: 19, name: 'Horse 19', color: '#455a64', condition: 71 },
  { id: 20, name: 'Horse 20', color: '#546e7a', condition: 66 },
]

export const ROUND_FIXTURES: RaceRound[] = [
  {
    roundNumber: 1,
    distance: 1200,
    participants: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    status: RoundStatus.Pending,
    results: [],
  },
  {
    roundNumber: 2,
    distance: 1400,
    participants: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    status: RoundStatus.Pending,
    results: [],
  },
  {
    roundNumber: 3,
    distance: 1600,
    participants: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    status: RoundStatus.Pending,
    results: [],
  },
  {
    roundNumber: 4,
    distance: 1800,
    participants: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    status: RoundStatus.Pending,
    results: [],
  },
  {
    roundNumber: 5,
    distance: 2000,
    participants: [1, 2, 5, 6, 9, 10, 13, 14, 17, 18],
    status: RoundStatus.Pending,
    results: [],
  },
  {
    roundNumber: 6,
    distance: 2200,
    participants: [3, 4, 7, 8, 11, 12, 15, 16, 19, 20],
    status: RoundStatus.Pending,
    results: [],
  },
]

export const getRoundFixture = (index: number = 0): RaceRound => {
  return ROUND_FIXTURES[index] ?? ROUND_FIXTURES[0]!
}
