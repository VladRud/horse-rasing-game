import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeaderBar from '@/layout/header-bar/HeaderBar.vue'
import { HORSE_FIXTURES, ROUND_FIXTURES } from '@/__tests__/fixtures/raceFixtures'
import { seedFaker, stubMathRandomSequence } from '@/__tests__/helpers/determinism'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { useSessionStore, SessionStatus } from '@/modules/session'
import { useRacesStore, RoundStatus } from '@/modules/race'
import { useHorsesStore } from '@/modules/horses'

const ButtonStub = {
  template: '<button v-bind="$attrs"><slot /></button>',
}

const StartStopStub = {
  template: '<div data-test="start-stop-stub" />',
}

describe('HeaderBar', () => {
  it('regenerates the program when Generate Program is clicked mid-session', async () => {
    const pinia = createTestPinia()
    const sessionStore = useSessionStore()
    const racesStore = useRacesStore()
    const horsesStore = useHorsesStore()

    horsesStore.horses = HORSE_FIXTURES
    racesStore.rounds = ROUND_FIXTURES.map((round) => ({
      ...round,
      status: RoundStatus.Running,
      results: [{ horseId: round.participants[0] as number, position: 1 }],
    }))
    racesStore.currentRoundIndex = 3
    sessionStore.sessionStatus = SessionStatus.Initialized

    const restoreFaker = seedFaker(420)
    const restoreRandom = stubMathRandomSequence([0.21, 0.41, 0.61])

    const restartSpy = vi.spyOn(sessionStore, 'restartSession')

    const wrapper = mount(HeaderBar, {
      global: {
        plugins: [pinia],
        stubs: {
          Button: ButtonStub,
          StartStopButton: StartStopStub,
        },
      },
    })

    await wrapper.get('[data-aqa="generate-program"]').trigger('click')

    const restartPromise = restartSpy.mock.results[0]?.value
    if (restartPromise) {
      await restartPromise
    }

    restoreRandom()
    restoreFaker()

    expect(restartSpy).toHaveBeenCalledTimes(1)
    expect(sessionStore.sessionStatus).toBe(SessionStatus.Initialized)
    expect(racesStore.currentRoundIndex).toBe(0)
    racesStore.rounds.forEach((round) => {
      expect(round.status).toBe(RoundStatus.Pending)
      expect(round.results).toEqual([])
    })
  })
})
