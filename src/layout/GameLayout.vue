<script setup lang="ts">
import HeaderBar from '@/layout/header-bar/HeaderBar.vue'
</script>

<template>
  <div class="h-screen bg-background text-foreground">
    <div class="container mx-auto flex h-full flex-col border-x border-border">
      <HeaderBar />
      <main
        class="grid flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,3fr)_minmax(0,1.2fr)]"
      >
        <section class="h-full min-h-0">
          <slot name="left" />
        </section>
        <section class="h-full min-h-0">
          <slot name="center" />
        </section>
        <section class="h-full min-h-0">
          <slot name="right" />
        </section>
      </main>
    </div>
  </div>
</template>
