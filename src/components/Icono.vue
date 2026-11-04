<script setup>
/* Icono.vue — reemplaza a icono() de script.js.
   Uso: <Icono nombre="star" class="icono-lleno" />
   La "class" que se le pone desde afuera se suma sola a la del span. */
defineProps({
  nombre: { type: String, required: true }
})
</script>

<template>
  <span class="material-symbols-outlined" aria-hidden="true">{{ nombre }}</span>
</template>
