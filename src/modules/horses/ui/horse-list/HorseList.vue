<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useHorsesStore } from '@/modules/horses'
import { Card, CardHeader } from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

const horsesStore = useHorsesStore()
const { allHorses } = storeToRefs(horsesStore)
</script>

<template>
  <Card>
    <template #header>
      <CardHeader>Horse List</CardHeader>
    </template>
    <Table data-aqa="horse-list">
      <TableHeader class="sticky top-0 bg-card">
        <TableRow>
          <TableHead class="px-4">Name</TableHead>
          <TableHead class="px-4">Condition</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="horse in allHorses"
          :key="horse.id"
          data-aqa="horse-row"
          :style="{
            background: `linear-gradient(135deg, transparent 0%, transparent 30%, ${horse.color}20 70%, ${horse.color}40 100%)`,
          }"
        >
          <TableCell class="px-4 font-medium">{{ horse.name }}</TableCell>
          <TableCell class="px-4">{{ horse.condition }}</TableCell>
        </TableRow>
        <TableEmpty v-if="allHorses.length === 0" :colspan="2">
          Generate a program to see the horses.
        </TableEmpty>
      </TableBody>
    </Table>
  </Card>
</template>
