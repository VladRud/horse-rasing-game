import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { useRacesStore, RoundStatus, RaceProgram, ROUND_DISTANCES } from '@/modules/race'
import { ROUND_FIXTURES } from '@/__tests__/fixtures/raceFixtures'

const AccordionStub = {
  template: '<div><slot /></div>',
}

const AccordionItemStub = {
  template: '<div data-test="accordion-item"><slot /></div>',
}

const AccordionTriggerStub = {
  template: '<div><slot /></div>',
}

const AccordionContentStub = {
  template: '<div><slot /></div>',
}

const RoundParticipantsStub = {
  template: '<div data-test="round-participants" />',
}

describe('RaceProgram', () => {
  it('renders six rounds with fixed distances', () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()

    racesStore.rounds = ROUND_FIXTURES.map((round) => ({
      ...round,
      status: RoundStatus.Pending,
      results: [],
    }))
    racesStore.currentRoundIndex = 0

    const wrapper = mount(RaceProgram, {
      global: {
        plugins: [pinia],
        stubs: {
          Accordion: AccordionStub,
          AccordionItem: AccordionItemStub,
          AccordionTrigger: AccordionTriggerStub,
          AccordionContent: AccordionContentStub,
          RoundParticipants: RoundParticipantsStub,
        },
      },
    })

    expect(wrapper.findAll('[data-test="accordion-item"]').length).toBe(6)

    ROUND_DISTANCES.forEach((distance) => {
      expect(wrapper.text()).toContain(`${distance}m`)
    })

    expect(wrapper.findAll('.bg-red-500').length).toBe(1)
  })

  it('shows the empty state when no rounds exist', () => {
    const pinia = createTestPinia()

    const wrapper = mount(RaceProgram, {
      global: {
        plugins: [pinia],
        stubs: {
          Accordion: AccordionStub,
          AccordionItem: AccordionItemStub,
          AccordionTrigger: AccordionTriggerStub,
          AccordionContent: AccordionContentStub,
          RoundParticipants: RoundParticipantsStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Generate a program to see the schedule.')
  })
})
