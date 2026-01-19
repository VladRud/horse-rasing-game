import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { getRoundFixture, HORSE_FIXTURES } from '@/__tests__/fixtures/raceFixtures'
import { createTestPinia } from '@/__tests__/helpers/pinia'
import { useHorsesStore } from '@/modules/horses'
import { useRacesStore, RoundStatus, RaceTrack } from '@/modules/race'
import { useSessionStore, SessionStatus } from '@/modules/session'

const progressByHorse = ref<Record<number, number>>({})
const resetRuntime = vi.fn()
const initializeRoundRuntime = vi.fn()
const startAnimationLoop = vi.fn()
const stopAnimationLoop = vi.fn()

vi.mock('@/modules/race/composables/use-race-animation/useRaceAnimation', () => ({
  useRaceAnimation: () => ({
    progressByHorse,
    resetRuntime,
    initializeRoundRuntime,
    startAnimationLoop,
    stopAnimationLoop,
    isAnimating: ref(false),
  }),
}))

const RaceLaneStub = {
  props: ['horseId', 'laneNumber', 'progress'],
  template: '<div data-test="race-lane" :data-horse="horseId" :data-progress="progress" />',
}

describe('RaceTrack', () => {
  beforeEach(() => {
    progressByHorse.value = {}
    vi.clearAllMocks()
  })

  it('renders 10 lanes and passes progress values', () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()
    const horsesStore = useHorsesStore()
    const sessionStore = useSessionStore()

    horsesStore.horses = HORSE_FIXTURES
    racesStore.rounds = [
      {
        ...getRoundFixture(0),
        status: RoundStatus.Pending,
      },
    ]
    racesStore.currentRoundIndex = 0
    sessionStore.sessionStatus = SessionStatus.Initialized

    progressByHorse.value = {
      1: 15,
      2: 35,
    }

    const wrapper = mount(RaceTrack, {
      global: {
        plugins: [pinia],
        stubs: { RaceLane: RaceLaneStub },
      },
    })

    const lanes = wrapper.findAll('[data-test="race-lane"]')
    expect(lanes).toHaveLength(10)
    expect(lanes[0]?.attributes('data-horse')).toBe('1')
    expect(lanes[0]?.attributes('data-progress')).toBe('15')
  })

  it('starts animation only when the round is running', async () => {
    const pinia = createTestPinia()
    const racesStore = useRacesStore()
    const horsesStore = useHorsesStore()
    const sessionStore = useSessionStore()

    horsesStore.horses = HORSE_FIXTURES
    racesStore.rounds = [
      {
        ...getRoundFixture(0),
        status: RoundStatus.Pending,
      },
    ]
    racesStore.currentRoundIndex = 0
    sessionStore.sessionStatus = SessionStatus.Initialized

    mount(RaceTrack, {
      global: {
        plugins: [pinia],
        stubs: { RaceLane: RaceLaneStub },
      },
    })

    await nextTick()
    expect(startAnimationLoop).not.toHaveBeenCalled()

    if (racesStore.rounds[0]) {
      racesStore.rounds[0].status = RoundStatus.Running
    }
    await nextTick()
    expect(startAnimationLoop).toHaveBeenCalledTimes(1)

    if (racesStore.rounds[0]) {
      racesStore.rounds[0].status = RoundStatus.Paused
    }
    await nextTick()
    expect(stopAnimationLoop).toHaveBeenCalled()
  })
})
