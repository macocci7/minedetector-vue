<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <main>
    <header class="px-4 py-2">
      <Link href="/" class="mx-2 my-2 text-blue-800 hover:text-orange-400 active:text-red-500">Home</Link>
      <Link href="/about" class="mx-2 my-2 text-blue-800 hover:text-orange-400 active:text-red-500">About</Link>
      <Link href="/contact" class="mx-2 my-2 text-blue-800 hover:text-orange-400 active:text-red-500">Contact</Link>
    </header>
    <article>
      <slot />
    </article>
  </main>
</template>
