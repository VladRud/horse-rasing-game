import { faker } from '@faker-js/faker'
import { vi } from 'vitest'

type RestoreFn = () => void

export const stubMathRandomSequence = (values: number[]): RestoreFn => {
  const sequence = values.length > 0 ? values : [0]
  let index = 0

  const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
    const value = sequence[Math.min(index, sequence.length - 1)]
    index += 1
    return value ?? 0
  })

  return () => {
    spy.mockRestore()
  }
}

export const seedFaker = (seed: number | number[]): RestoreFn => {
  faker.seed(seed)

  return () => {
    faker.seed()
  }
}
