<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRacesStore, RoundParticipants } from '@/modules/race'
import { Card, CardHeader } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Button } from '@/shared/ui/button'
import { useProgram } from '@/modules/race'
import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-vue-next'

const racesStore = useRacesStore()
const { collapsedState, isAllCollapsed, toggleAllCollapsed } = useProgram()

const { rounds, currentRound } = storeToRefs(racesStore)
</script>

<template>
  <Card>
    <template #header>
      <CardHeader>
        <div class="flex items-center justify-between gap-2">
          <span>Program</span>
          <Button variant="ghost" size="icon" @click="toggleAllCollapsed">
            <ListChevronsDownUp v-if="isAllCollapsed" />
            <ListChevronsUpDown v-else />
          </Button>
        </div>
      </CardHeader>
    </template>

    <div v-if="rounds.length === 0" class="px-4 py-6 text-sm text-muted-foreground">
      Generate a program to see the schedule.
    </div>

    <Accordion
      v-else
      v-model="collapsedState"
      type="multiple"
      class="w-full"
      data-aqa="race-program"
    >
      <AccordionItem
        v-for="round in rounds"
        :key="round.roundNumber"
        :value="round.roundNumber.toString()"
        data-aqa="race-round"
      >
        <AccordionTrigger class="px-4 py-2 hover:no-underline">
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              Round {{ round.roundNumber }}

              <span
                v-if="round.roundNumber === currentRound?.roundNumber"
                class="inline-block h-2 w-2 rounded-full bg-red-500"
                :class="{ 'animate-pulse': round.status === 'running' }"
              />
            </span>

            <span class="text-xs text-muted-foreground">{{ round.distance }}m</span>
          </div>
        </AccordionTrigger>

        <AccordionContent class="pb-0">
          <RoundParticipants :round-number="round.roundNumber" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </Card>
</template>
