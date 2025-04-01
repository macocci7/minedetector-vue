<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Head } from '@inertiajs/vue3';

defineProps({ user: Object });
</script>

<template>
  <AppLayout>
    <Head title="Welcome" />
    <h1 class="px-4 py-2 text-4xl text-gray-600 hover:text-indigo-600">Welcome</h1>
    <p class="px-4 py-2">Hello {{ user.name }}, welcome to your first Inertia app!</p>
  </AppLayout>
</template>
