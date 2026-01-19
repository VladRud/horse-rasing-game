export enum RoundStatus {
  Pending = 'pending',
  Running = 'running',
  Paused = 'paused',
  Finished = 'finished',
}

export interface RaceResult {
  horseId: number
  position: number
}

export interface RaceRound {
  roundNumber: number
  distance: number
  participants: number[]
  status: RoundStatus
  results: RaceResult[]
}
