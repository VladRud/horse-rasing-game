import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { useHorsesStore, HorseList } from '@/modules/horses'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { HORSE_FIXTURES } from '@/__tests__/fixtures/raceFixtures'

describe('HorseList', () => {
  it('renders 20 horse rows when horses exist', () => {
    const pinia = createTestPinia()
    const horsesStore = useHorsesStore()
    horsesStore.horses = HORSE_FIXTURES

    const wrapper = mount(HorseList, {
      global: {
        plugins: [pinia],
      },
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(20)
    expect(wrapper.text()).toContain('Horse 1')
  })

  it('shows the empty state when there are no horses', () => {
    const pinia = createTestPinia()

    const wrapper = mount(HorseList, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('Generate a program to see the horses.')
  })
})
