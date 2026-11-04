<script setup>
/* MensajeEstado.vue — reemplaza a crearMensaje() de script.js.
   Caja de mensaje (vacío o error) con icono, texto y botón de acción opcional.
   "accion" es un objeto { texto, alHacerClic }, igual que antes. */
import Icono from './Icono.vue'

defineProps({
  icono: { type: String, required: true },
  texto: { type: String, required: true },
  esError: { type: Boolean, default: false },
  accion: { type: Object, default: null }
})
</script>

<template>
  <div class="mensaje" :class="{ 'mensaje--error': esError }">
    <Icono :nombre="icono" class="mensaje__icono" />
    <p>{{ texto }}</p>
    <button v-if="accion" class="boton boton--primario" type="button" @click="accion.alHacerClic">{{ accion.texto }}</button>
  </div>
</template>
