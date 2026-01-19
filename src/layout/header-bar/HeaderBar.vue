<script setup lang="ts">
import { StartStopButton } from '@/modules/race'
import { GenerateProgramButton } from '@/modules/session'
</script>

<template>
  <header class="flex items-center justify-between border-b border-border px-4 py-3">
    <h1 class="text-xl font-semibold tracking-tight">Horse Racing</h1>
    <div class="flex items-center gap-2" data-aqa="session-controls">
      <GenerateProgramButton />
      <StartStopButton />
    </div>
  </header>
</template>
