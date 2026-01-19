import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { SessionStatus } from '@/modules/session'
import { useHorsesStore } from '@/modules/horses'
import { useRacesStore } from '@/modules/race'

export const useSessionStore = defineStore('session', () => {
  const sessionStatus = ref<SessionStatus>(SessionStatus.Idle)

  const isPlayableSession = computed(() => {
    return sessionStatus.value === SessionStatus.Initialized
  })

  const startSession = () => {
    useHorsesStore().generateHorses()

    useRacesStore().generateProgram()

    sessionStatus.value = SessionStatus.Initialized
  }

  const restartSession = async () => {
    sessionStatus.value = SessionStatus.Idle

    await nextTick()

    startSession()
  }

  const completeSession = () => {
    sessionStatus.value = SessionStatus.Completed
  }

  return {
    sessionStatus,
    isPlayableSession,
    startSession,
    completeSession,
    restartSession,
  }
})
