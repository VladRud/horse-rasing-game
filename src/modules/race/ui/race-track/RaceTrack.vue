<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import RaceLane from '@/modules/race/ui/race-line/RaceLane.vue'
import { useRacesStore, useRaceAnimation, RoundStatus } from '@/modules/race'
import { useSessionStore, SessionStatus } from '@/modules/session'
import { useHorsesStore, type Horse } from '@/modules/horses'

const racesStore = useRacesStore()
const horsesStore = useHorsesStore()
const sessionStore = useSessionStore()

const currentRound = computed(() => racesStore.currentRound)
const roundDistance = computed(() => currentRound.value?.distance)
const participants = computed(() => currentRound.value?.participants ?? [])

const horsesInCurrentRound = computed<Horse[]>(() => {
  return horsesStore.getHorsesByIds(currentRound.value?.participants ?? [])
})

const {
  progressByHorse,
  resetRuntime,
  initializeRoundRuntime,
  startAnimationLoop,
  stopAnimationLoop,
} = useRaceAnimation({
  roundDistance,
  horsesInCurrentRound,
  finishRoundCallback: () => {
    racesStore.finishRound()
  },
  updateResultsCallback: (results: { horseId: number; position: number }[]) => {
    if (!currentRound.value) return
    racesStore.updateRoundResults(currentRound.value.roundNumber, results)
  },
})

watch(
  currentRound,
  (round, previousRound) => {
    if (!round) return

    if (previousRound?.roundNumber !== round.roundNumber) {
      resetRuntime()
      initializeRoundRuntime()
    }
  },
  { immediate: true },
)

watch(
  () => currentRound.value?.status,
  (status) => {
    if (status === RoundStatus.Running) {
      startAnimationLoop()
      return
    }

    stopAnimationLoop()
  },
)

watch(
  () => sessionStore.sessionStatus,
  (status) => {
    if (status === SessionStatus.Idle) {
      resetRuntime()
    }
  },
  { immediate: true },
)
onUnmounted(() => {
  stopAnimationLoop()
  resetRuntime()
})
</script>

<template>
  <section
    class="flex h-full flex-col rounded-lg border border-border bg-card"
    data-aqa="race-track"
  >
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Race Track
      </h2>
      <span v-if="currentRound" class="text-xs text-muted-foreground">
        Round {{ currentRound?.roundNumber }} - {{ currentRound?.distance }}m
      </span>
    </div>
    <div class="flex-1 overflow-auto">
      <div class="divide-y divide-border">
        <RaceLane
          v-for="(horseId, index) in participants"
          :key="horseId"
          :horse-id="horseId"
          :lane-number="index + 1"
          :progress="progressByHorse[horseId] ?? 0"
        />
      </div>
    </div>
  </section>
</template>
