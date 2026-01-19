import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { generateRaceSchedule } from '@/modules/race/utils/race-generator/raceGenerator'
import {
  useStateMachine,
  type UseStateMachineReturn,
} from '@/shared/composables/use-state-machine/useStateMachine'
import { useHorsesStore } from '@/modules/horses/store/horses.store'
import { type RaceRound, RoundStatus } from '@/modules/race'
import { useSessionStore } from '@/modules/session'

export const useRacesStore = defineStore('races', () => {
  const rounds = ref<RaceRound[]>([])
  const currentRoundIndex = ref(0)

  // Computed properties
  const currentRound = computed<RaceRound | undefined>(() => {
    if (rounds.value.length === 0) return
    return rounds.value[currentRoundIndex.value]
  })

  const indexByRoundNumber = computed<Record<number, number>>(() => {
    return rounds.value.reduce<Record<number, number>>(
      (acc: Record<number, number>, round: RaceRound, index: number) => {
        acc[round.roundNumber] = index
        return acc
      },
      {},
    )
  })

  const isLastRound = computed(() => {
    return currentRoundIndex.value >= rounds.value.length - 1
  })

  // Initialize store
  const setInitialStoreState = (generatedRounds: RaceRound[] = []) => {
    rounds.value = generatedRounds
    currentRoundIndex.value = 0
  }

  // Helper: Update current round status in rounds array
  const updateCurrentRoundStatus = (status: RoundStatus) => {
    if (currentRoundIndex.value >= rounds.value.length || rounds.value.length === 0) return

    rounds.value[currentRoundIndex.value]!.status = status
  }

  // The state machine block
  let stateMachine: UseStateMachineReturn<RoundStatus> | null = null

  // TODO: make more clear transitions (without callbacks and with callbacks)
  const transitions = {
    [RoundStatus.Pending]: {
      [RoundStatus.Running]: () => {},
    },
    [RoundStatus.Running]: {
      [RoundStatus.Paused]: () => {},
      [RoundStatus.Finished]: () => {},
    },
    [RoundStatus.Paused]: {
      [RoundStatus.Running]: () => {},
    },
    // Transition to Running next round
    [RoundStatus.Finished]: {
      [RoundStatus.Running]: () => {},
    },
  }

  const initStateMachine = () => {
    if (!currentRound.value || rounds.value.length === 0) return

    if (stateMachine) {
      stateMachine.clearCallbacks()
      stateMachine.reset()
    }

    stateMachine = useStateMachine<RoundStatus>({
      state: computed(() => currentRound.value!.status),
      transitions,
      onStateChange: async (_previousState, newState) => {
        // Update the rounds array first
        updateCurrentRoundStatus(newState)

        await nextTick()

        if (newState === RoundStatus.Finished) {
          stateMachine?.transitionTo(RoundStatus.Running)
        }
      },
    })

    stateMachine.onTransition(RoundStatus.Finished, RoundStatus.Running, (): void | false => {
      if (isLastRound.value) {
        useSessionStore().completeSession()
        return false
      }

      currentRoundIndex.value++
    })
  }

  // Public methods
  const generateProgram = () => {
    const horsesStore = useHorsesStore()
    if (!horsesStore.allHorses.length) return

    const horsesIds = Array.from(horsesStore.allHorsesMap.keys())
    setInitialStoreState(generateRaceSchedule(horsesIds))

    initStateMachine()
  }

  const finishRound = () => {
    stateMachine?.transitionTo(RoundStatus.Finished)
  }

  const toggleRound = () => {
    if (!useSessionStore().isPlayableSession) return
    if (!currentRound.value) return

    const toggleRoundTransitions: Record<RoundStatus, RoundStatus | undefined> = {
      [RoundStatus.Pending]: RoundStatus.Running,
      [RoundStatus.Running]: RoundStatus.Paused,
      [RoundStatus.Paused]: RoundStatus.Running,
      [RoundStatus.Finished]: undefined,
    }

    const nextStatus = toggleRoundTransitions[currentRound.value.status]
    if (!nextStatus) return

    stateMachine?.transitionTo(nextStatus)
  }

  const updateRoundResults = (
    roundNumber: number,
    results: { horseId: number; position: number }[],
  ) => {
    if (rounds.value.length === 0) return

    const roundIndex = indexByRoundNumber.value[roundNumber]
    if (roundIndex === undefined || !rounds.value[roundIndex]) return

    rounds.value[roundIndex].results = results
  }

  return {
    rounds,
    currentRoundIndex,
    currentRound,
    indexByRoundNumber,
    generateProgram,
    toggleRound,
    finishRound,
    updateRoundResults,
  }
})
