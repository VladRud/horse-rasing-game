import { computed, ref, type ComputedRef } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { type Horse } from '@/modules/horses'
import { type RaceResult } from '@/modules/race'

type HorseTiming = {
  elapsedMs: number
  durationMs: number
}

type UseRaceAnimationProps = {
  roundDistance: ComputedRef<number | undefined>
  horsesInCurrentRound: ComputedRef<Horse[]>
  finishRoundCallback: () => void
  updateResultsCallback: (results: RaceResult[]) => void
}

const ANIMATION_FPS = 60
const MS_PER_FRAME = 1000 / ANIMATION_FPS
const BASE_DURATION_MS = 8000
const BASE_DISTANCE = 1200

const getRaceDurationMs = (distance: number | undefined, condition: number): number => {
  if (!distance) return 0

  const safeCondition = Math.max(1, condition)
  const distanceFactor = BASE_DISTANCE > 0 ? distance / BASE_DISTANCE : 1
  return BASE_DURATION_MS * distanceFactor * (100 / safeCondition)
}

export const useRaceAnimation = (props: UseRaceAnimationProps) => {
  const progressByHorse = ref<Record<number, number>>({})
  let timingByHorse: Record<number, HorseTiming> = {}

  const participantsIds = computed<number[]>(() => {
    return props.horsesInCurrentRound.value.map((horse) => horse.id)
  })

  const { pause, resume, isActive } = useIntervalFn(tickRound, MS_PER_FRAME, { immediate: false })

  const resetRuntime = () => {
    pause()
    timingByHorse = {}
    progressByHorse.value = {}
  }

  const buildLiveResults = (
    progress: Record<number, number>,
    timings: Record<number, HorseTiming>,
  ): RaceResult[] => {
    const sorted = [...participantsIds.value].sort((horseA, horseB) => {
      const progressA = progress[horseA] ?? 0
      const progressB = progress[horseB] ?? 0

      // If both horses have finished, compare by duration (shorter = faster = better)
      if (progressA >= 100 && progressB >= 100) {
        const durationA = timings[horseA]?.durationMs ?? Infinity
        const durationB = timings[horseB]?.durationMs ?? Infinity
        return durationA - durationB
      }

      // Compare by current progress (higher = better)
      if (progressA !== progressB) {
        return progressB - progressA
      }

      // Fallback tiebreaker for equal progress while racing
      return horseA - horseB
    })

    return sorted.map((horseId, index) => ({
      horseId,
      position: index + 1,
    }))
  }

  const initializeRoundRuntime = () => {
    if (!props.horsesInCurrentRound.value.length || !props.roundDistance.value) return

    timingByHorse = {}
    const nextProgress: Record<number, number> = {}

    props.horsesInCurrentRound.value.forEach((horse) => {
      const durationMs = getRaceDurationMs(props.roundDistance.value, horse.condition)
      timingByHorse[horse.id] = { elapsedMs: 0, durationMs }
      nextProgress[horse.id] = 0
    })

    progressByHorse.value = nextProgress
    props.updateResultsCallback([])
  }

  function tickRound() {
    const horses = props.horsesInCurrentRound.value
    if (!horses.length) {
      pause()
      return
    }

    let allFinished = true

    horses.forEach((horse) => {
      const timing = timingByHorse[horse.id]
      if (!timing) return

      timing.elapsedMs += MS_PER_FRAME
      const progress = Math.min(100, (timing.elapsedMs / timing.durationMs) * 100)
      progressByHorse.value[horse.id] = progress

      if (progress < 100) {
        allFinished = false
      }
    })

    const results = buildLiveResults(progressByHorse.value, timingByHorse)
    props.updateResultsCallback(results)

    if (allFinished) {
      pause()
      props.finishRoundCallback()
    }
  }

  return {
    progressByHorse,
    isAnimating: isActive,
    initializeRoundRuntime,
    resetRuntime,
    startAnimationLoop: resume,
    stopAnimationLoop: pause,
  }
}
