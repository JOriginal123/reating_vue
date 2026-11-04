<script setup>
/* Etiqueta.vue — reemplaza a crearEtiqueta() de detalle.js.
   Etiqueta redondeada con icono opcional (fecha, duración, género). */
import Icono from './Icono.vue'

defineProps({
  texto: { type: String, required: true },
  icono: { type: String, default: null }
})
</script>

<template>
  <span class="etiqueta"><Icono v-if="icono" :nombre="icono" />{{ texto }}</span>
</template>
