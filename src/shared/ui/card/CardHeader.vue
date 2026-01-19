<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/utils/utils'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
  }>(),
  {},
)
</script>

<template>
  <h2
    :class="cn('text-sm font-semibold uppercase tracking-wide text-muted-foreground', props.class)"
  >
    <slot />
  </h2>
</template>
