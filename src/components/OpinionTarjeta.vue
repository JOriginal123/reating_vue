<script setup>
/* OpinionTarjeta.vue — reemplaza a construirOpinion() de detalle.js.
   Una opinión: autor, fecha, nota (si la dio) y texto con "Leer más". */
import { computed, ref } from 'vue'
import Icono from './Icono.vue'
import { formatearFecha } from '../utils/formato'

const props = defineProps({
  o: { type: Object, required: true }
})

const LIMITE_TEXTO = 420 // caracteres antes de "Leer más"

const autor = computed(() => props.o.author || 'Anónimo')
const nota = computed(() => props.o.author_details && props.o.author_details.rating)

// Textos largos se recortan y se expanden con un botón
const completo = computed(() => (props.o.content || '').replace(/\r\n/g, '\n').trim())
const esLargo = computed(() => completo.value.length > LIMITE_TEXTO)
const corto = computed(() => completo.value.slice(0, LIMITE_TEXTO).trimEnd() + '…')
const abierto = ref(false)

const texto = computed(() => {
  if (!esLargo.value) return completo.value || 'Sin texto.'
  return abierto.value ? completo.value : corto.value
})
</script>

<template>
  <article class="opinion">
    <header class="opinion__cabecera">
      <span class="opinion__avatar">{{ autor.charAt(0).toUpperCase() }}</span>
      <div class="opinion__quien">
        <strong>{{ autor }}</strong>
        <span class="opinion__fecha">{{ formatearFecha(o.created_at) }}</span>
      </div>
      <span v-if="nota" class="nota"><Icono nombre="star" class="icono-lleno" />{{ nota }}/10</span>
    </header>

    <p class="opinion__texto">{{ texto }}</p>
    <button v-if="esLargo" class="enlace-boton" type="button" :aria-expanded="String(abierto)" @click="abierto = !abierto">
      {{ abierto ? 'Leer menos' : 'Leer más' }}
    </button>
  </article>
</template>
