<script setup lang="ts">
import { SessionStatus, useSessionStore } from '@/modules/session'
import { Button, type ButtonVariants } from '@/shared/ui/button'
import { computed } from 'vue'

const sessionStore = useSessionStore()

const handleGenerateProgram = () => {
  if (sessionStore.isPlayableSession) {
    sessionStore.restartSession()
    return
  }

  sessionStore.startSession()
}
const buttonStatesMap = computed(() => ({
  [SessionStatus.Idle]: {
    label: 'Generate Program',
    variant: 'success',
    click: sessionStore.startSession,
  },
  [SessionStatus.Initialized]: {
    label: 'Regenerate Program',
    variant: 'secondary',
    click: sessionStore.restartSession,
  },
  [SessionStatus.Completed]: {
    label: 'Regenerate Program',
    variant: 'success',
    click: sessionStore.restartSession,
  },
}))
</script>

<template>
  <Button
    :variant="buttonStatesMap[sessionStore.sessionStatus].variant as ButtonVariants['variant']"
    data-aqa="generate-program"
    @click="handleGenerateProgram"
  >
    {{ buttonStatesMap[sessionStore.sessionStatus].label }}
  </Button>
</template>
