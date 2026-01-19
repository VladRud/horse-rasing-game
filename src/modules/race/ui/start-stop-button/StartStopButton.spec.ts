import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { getRoundFixture } from '@/__tests__/fixtures/raceFixtures'
import { useSessionStore, SessionStatus } from '@/modules/session'
import { useRacesStore, RoundStatus, StartStopButton } from '@/modules/race'

const ButtonStub = {
  template: '<button v-bind="$attrs"><slot /></button>',
}

describe('StartStopButton', () => {
  it('renders the label for pending, running, and paused states', async () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    racesStore.rounds = [
      {
        ...getRoundFixture(0),
        status: RoundStatus.Pending,
      },
    ]
    racesStore.currentRoundIndex = 0
    sessionStore.sessionStatus = SessionStatus.Initialized
    const wrapper = mount(StartStopButton, {
      global: {
        plugins: [pinia],
        stubs: { Button: ButtonStub },
      },
    })

    await nextTick()
    expect(wrapper.text()).toContain('Start')

    // Ensure the round exists before mutating its status
    if (racesStore.rounds[0]) {
      racesStore.rounds[0].status = RoundStatus.Running
    }
    await nextTick()
    expect(wrapper.text()).toContain('Pause')

    if (racesStore.rounds[0]) {
      racesStore.rounds[0].status = RoundStatus.Paused
    }
    await nextTick()
    expect(wrapper.text()).toContain('Resume')
  })

  it('disables the button when the session is not initialized', () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    racesStore.rounds = [
      {
        ...getRoundFixture(0),
        status: RoundStatus.Pending,
      },
    ]
    racesStore.currentRoundIndex = 0
    sessionStore.sessionStatus = SessionStatus.Idle

    const wrapper = mount(StartStopButton, {
      global: {
        plugins: [pinia],
        stubs: { Button: ButtonStub },
      },
    })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('calls toggleRound when clicked', async () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    racesStore.rounds = [
      {
        ...getRoundFixture(0),
        status: RoundStatus.Pending,
      },
    ]
    racesStore.currentRoundIndex = 0
    sessionStore.sessionStatus = SessionStatus.Initialized

    const toggleSpy = vi.spyOn(racesStore, 'toggleRound').mockImplementation(() => {})

    const wrapper = mount(StartStopButton, {
      global: {
        plugins: [pinia],
        stubs: { Button: ButtonStub },
      },
    })

    await wrapper.get('button').trigger('click')

    expect(toggleSpy).toHaveBeenCalledTimes(1)
  })

  it('does not call toggleRound when the session is completed', async () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()
    const sessionStore = useSessionStore()

    racesStore.rounds = [
      {
        ...getRoundFixture(0),
        status: RoundStatus.Finished,
      },
    ]
    racesStore.currentRoundIndex = 0
    sessionStore.sessionStatus = SessionStatus.Completed

    const toggleSpy = vi.spyOn(racesStore, 'toggleRound').mockImplementation(() => {})

    const wrapper = mount(StartStopButton, {
      global: {
        plugins: [pinia],
        stubs: { Button: ButtonStub },
      },
    })

    await nextTick()

    wrapper.get('button').element.click()

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(toggleSpy).not.toHaveBeenCalled()
  })
})
