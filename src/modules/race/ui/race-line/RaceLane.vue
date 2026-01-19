<script setup lang="ts">
import { computed } from 'vue'
import { useHorsesStore, HorseSvg } from '@/modules/horses'

interface Props {
  horseId: number
  laneNumber: number
  progress: number
}

const props = defineProps<Props>()

const horsesStore = useHorsesStore()
const horse = computed(() => horsesStore.allHorsesMap.get(props.horseId) ?? null)
</script>

<template>
  <div
    class="flex items-center gap-3 border-b border-border p-4 relative"
    data-aqa="race-lane"
    :data-horse-id="horseId"
    :data-lane-number="laneNumber"
  >
    <span class="w-8 text-xs text-muted-foreground">#{{ laneNumber }}</span>
    <span v-if="horse" class="w-28 truncate text-sm font-medium">{{ horse.name }}</span>

    <div
      class="absolute right-0 top-0 h-full w-[5px] bg-[repeating-linear-gradient(180deg,#7f7c7c_0,#7f7c7c_5px,#3f3f3f_5px,#3f3f3f_10px)]"
    />
    <div v-if="horse" class="relative flex-1">
      <!-- Finish line -->

      <!-- Horse -->
      <div
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        :style="{ left: `${progress}%` }"
      >
        <HorseSvg class="h-8 w-8" :color="horse.color" />
      </div>
    </div>
  </div>
</template>
