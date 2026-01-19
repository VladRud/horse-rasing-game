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
  <section :class="cn('flex h-full flex-col rounded-lg border border-border bg-card', props.class)">
    <div class="border-b border-border px-4 py-3">
      <slot name="header" />
    </div>
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </section>
</template>
