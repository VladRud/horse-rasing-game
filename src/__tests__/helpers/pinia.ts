import { createPinia, setActivePinia, type Pinia } from 'pinia'

export const createTestPinia = (): Pinia => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export const resetTestPinia = (): Pinia => {
  return createTestPinia()
}
