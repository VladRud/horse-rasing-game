<script setup lang="ts">
import { computed } from 'vue'
import { useHorsesStore, type Horse } from '@/modules/horses'
import { useRacesStore, type RaceRound } from '@/modules/race'

const props = defineProps<{
  roundNumber: number
}>()

const horsesStore = useHorsesStore()
const racesStore = useRacesStore()

type ParticipantWithPosition = {
  horse: Horse
  position: number | null
}

const round = computed<RaceRound | undefined>(() => {
  const roundIndex = racesStore.indexByRoundNumber[props.roundNumber]
  if (roundIndex === undefined) return

  return racesStore.rounds[roundIndex]
})

const sortedParticipants = computed<ParticipantWithPosition[]>(() => {
  if (!round.value) return []

  const results = round.value.results
  const participants = round.value.participants

  // If results exist, use results order (already sorted by position)
  if (results.length > 0) {
    return results.reduce<ParticipantWithPosition[]>((acc, result) => {
      const horse = horsesStore.allHorsesMap.get(result.horseId)
      if (horse) {
        acc.push({ horse, position: result.position })
      }
      return acc
    }, [])
  }

  // Otherwise use participants order (initial state)
  return participants.reduce<ParticipantWithPosition[]>((acc, id, index) => {
    const horse = horsesStore.allHorsesMap.get(id)
    if (horse) {
      acc.push({ horse, position: index + 1 })
    }
    return acc
  }, [])
})
</script>

<template>
  <div class="w-full text-sm" data-aqa="round-participants">
    <!-- Header -->
    <div class="flex border-b border-border text-muted-foreground">
      <div class="w-12 px-4 py-2 font-medium">#</div>
      <div class="flex-1 px-4 py-2 font-medium">Name</div>
    </div>

    <!-- Body with animated rows -->
    <TransitionGroup name="list" tag="div" class="relative">
      <div
        v-for="item in sortedParticipants"
        :key="item.horse.id"
        class="flex border-b border-border/50 transition-all duration-300 ease-in-out"
        data-aqa="participant-row"
        :data-horse-id="item.horse.id"
        :data-position="item.position"
      >
        <div class="w-12 px-4 py-2">{{ item.position ?? '-' }}</div>
        <div class="flex-1 px-4 py-2 font-medium">{{ item.horse.name }}</div>
      </div>
    </TransitionGroup>

    <!-- Empty state -->
    <div
      v-if="sortedParticipants.length === 0"
      class="px-4 py-6 text-center text-muted-foreground"
      data-aqa="participants-empty"
    >
      No participants
    </div>
  </div>
</template>

<style scoped>
.list-move {
  transition: transform 0.3s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
