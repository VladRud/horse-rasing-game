<script setup lang="ts">
import GameLayout from '@/layout/game-layout/GameLayout.vue'
import HorseList from '@/modules/horses/ui/horse-list/HorseList.vue'
import RaceTrack from '@/modules/race/ui/race-track/RaceTrack.vue'
import RaceProgram from '@/modules/race/ui/race-program/RaceProgram.vue'
</script>

<template>
  <GameLayout>
    <template #left>
      <HorseList />
    </template>
    <template #center>
      <RaceTrack />
    </template>
    <template #right>
      <RaceProgram />
    </template>
  </GameLayout>
</template>
