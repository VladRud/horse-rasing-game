<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Button } from '@/shared/ui/button'
import type { ButtonVariants } from '@/shared/ui/button'
import { useRacesStore, RoundStatus } from '@/modules/race'
import { useSessionStore } from '@/modules/session'

const racesStore = useRacesStore()
const sessionStore = useSessionStore()

const { isPlayableSession } = storeToRefs(sessionStore)
const currentRound = computed(() => racesStore.currentRound)

const startPauseMap: Record<RoundStatus, { label: string; variant: ButtonVariants['variant'] }> = {
  [RoundStatus.Pending]: { label: 'Start', variant: 'success' },
  [RoundStatus.Running]: { label: 'Pause', variant: 'destructive' },
  [RoundStatus.Paused]: { label: 'Resume', variant: 'secondary' },
  [RoundStatus.Finished]: { label: 'Finished', variant: 'success' },
}

const startPauseLabel = computed<{ label: string; variant: ButtonVariants['variant'] }>(() => {
  const status = currentRound.value?.status
  if (!status) return startPauseMap[RoundStatus.Pending]

  return startPauseMap[status]
})
</script>

<template>
  <Button
    :variant="startPauseLabel.variant"
    :disabled="!isPlayableSession"
    data-aqa="start-stop"
    @click="racesStore.toggleRound"
  >
    {{ startPauseLabel.label }}
  </Button>
</template>
