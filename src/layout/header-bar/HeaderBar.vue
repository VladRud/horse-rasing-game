<script setup lang="ts">
import { StartStopButton } from '@/modules/race'
import { GenerateProgramButton } from '@/modules/session'
import { SessionStatus, useSessionStore } from '@/modules/session'

const sessionStore = useSessionStore()
</script>

<template>
  <header class="flex items-center justify-between border-b border-border px-4 py-3">
    <h1 class="text-xl font-semibold tracking-tight">Horse Racing</h1>
    <div
      v-if="sessionStore.sessionStatus !== SessionStatus.Idle"
      class="flex items-center gap-2"
      data-aqa="session-controls"
    >
      <GenerateProgramButton />
      <StartStopButton />
    </div>
  </header>
</template>
