<script setup lang="ts">
import HeaderBar from '@/layout/header-bar/HeaderBar.vue'
import { SessionStatus, useSessionStore } from '@/modules/session'
import StartSession from '@/layout/start-session/StartSession.vue'

const sessionStore = useSessionStore()
</script>

<template>
  <div class="h-screen bg-background text-foreground">
    <div class="container mx-auto flex h-full flex-col border-x border-border">
      <HeaderBar />

      <StartSession v-if="sessionStore.sessionStatus === SessionStatus.Idle" />

      <main
        v-else
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
