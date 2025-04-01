<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Head } from '@inertiajs/vue3';
import MineDetector from '@/Components/MineDetector.vue';

defineProps({ user: Object });
</script>

<template>
  <AppLayout>
    <Head title="MINE DETECTOR" />
    <div>
      <h1
        class="m-4 font-bold text-4xl text-blue-900"
      >
        MINE DETECTOR
      </h1>
      <p
        id="app"
        class="m-4 p-2 bg-white rounded-lg"
      >
        <MineDetector />
      </p>
    </div>
  </AppLayout>
</template>
