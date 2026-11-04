<script setup>
/* Cabecera.vue — el <header> de index.html y detalle.html (era el mismo en ambas,
   salvo que la ficha no tiene buscador). Incluye el botón de tema (antes iniciarTema()).
   - prop conBuscador: muestra el buscador (solo en el inicio)
   - evento "escribir": avisa a la página cada vez que se escribe en el buscador */
import Icono from './Icono.vue'
import { computed } from 'vue'
import { useTema } from '../composables/useTema'

defineProps({
  conBuscador: { type: Boolean, default: false }
})
const emit = defineEmits(['escribir'])

const { oscuro, alternar } = useTema()
const textoTema = computed(() => (oscuro.value ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'))
</script>

<template>
  <header class="cabecera">
    <div class="contenedor cabecera__interior">
      <RouterLink class="logo" to="/" aria-label="Reating, ir al inicio">
        <Icono nombre="star_rate" class="icono-lleno" />
        Reating
      </RouterLink>

      <!-- Buscador de títulos (busca en películas o series según el selector activo) -->
      <form v-if="conBuscador" class="buscador" id="formBusqueda" role="search" @submit.prevent>
        <Icono nombre="search" />
        <input class="buscador__campo" id="campoBusqueda" type="search"
               placeholder="Buscar películas o series…" aria-label="Buscar películas o series" autocomplete="off"
               @input="emit('escribir', $event.target.value)">
      </form>

      <!-- Botón de tema: alterna entre claro y oscuro y cambia su icono -->
      <button class="boton-icono" id="btnTema" type="button" :aria-label="textoTema" :title="textoTema" @click="alternar">
        <Icono :nombre="oscuro ? 'light_mode' : 'dark_mode'" />
      </button>
    </div>
  </header>
</template>
