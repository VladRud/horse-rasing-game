<script setup lang="ts">
import { useSessionStore } from '@/modules/session'
import { Button } from '@/shared/ui/button'

const sessionStore = useSessionStore()

const handleGenerateProgram = () => {
  if (sessionStore.isPlayableSession) {
    sessionStore.restartSession()
    return
  }

  sessionStore.startSession()
}
</script>

<template>
  <Button variant="secondary" data-aqa="generate-program" @click="handleGenerateProgram">
    Generate Program
  </Button>
</template>
