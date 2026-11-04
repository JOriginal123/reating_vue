<script setup>
/* PuntajePropio.vue — reemplaza a construirPuntajePropio() de detalle.js.
   Tu puntuación: 5 estrellas que se guardan en este navegador (localStorage). */
import { ref } from 'vue'
import Icono from './Icono.vue'

const props = defineProps({
  tipo: { type: String, required: true },
  id: { type: Number, required: true }
})

const CLAVE_PUNTAJES = 'reating-puntajes' // dónde se guardan tus puntuaciones (localStorage)
const clave = props.tipo + '-' + props.id

// Lee y guarda las puntuaciones propias del usuario (solo en su navegador)
function leerPuntajes() {
  try { return JSON.parse(localStorage.getItem(CLAVE_PUNTAJES)) || {} } catch (e) { return {} }
}
function guardarPuntajes(objeto) {
  try { localStorage.setItem(CLAVE_PUNTAJES, JSON.stringify(objeto)) } catch (e) { /* sin almacenamiento: no se guarda */ }
}

// "valor" es reactivo: al cambiarlo, Vue repinta las estrellas y el texto solo
const valor = ref(leerPuntajes()[clave] || 0)

function puntuar(n) {
  const guardados = leerPuntajes()
  const nuevo = guardados[clave] === n ? 0 : n // tocar la misma estrella quita la puntuación
  if (nuevo) { guardados[clave] = nuevo } else { delete guardados[clave] }
  guardarPuntajes(guardados)
  valor.value = nuevo
}
</script>

<template>
  <div class="puntaje puntaje--propio">
    <p class="puntaje__etiqueta">Tu puntuación</p>
    <div class="estrellas" role="group" aria-label="Tu puntuación">
      <button v-for="n in 5" :key="n" class="estrella" :class="{ 'estrella--activa': n <= valor }" type="button"
              :aria-label="n + (n === 1 ? ' estrella' : ' estrellas')" :aria-pressed="String(n === valor)"
              @click="puntuar(n)">
        <Icono nombre="star" />
      </button>
    </div>
    <p class="puntaje__texto">{{ valor ? 'Tu puntuación: ' + valor + ' de 5' : 'Tocá una estrella para puntuar' }}</p>
  </div>
</template>
