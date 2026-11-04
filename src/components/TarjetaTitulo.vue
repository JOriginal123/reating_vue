<script setup>
/* TarjetaTitulo.vue — reemplaza a crearTarjeta() de script.js.
   Póster, nota, título y año; enlaza a la ficha. La usan la cartelera y las recomendaciones. */
import { computed } from 'vue'
import Icono from './Icono.vue'
import { urlImagen } from '../services/tmdb'

const props = defineProps({
  item: { type: Object, required: true },
  tipo: { type: String, required: true }
})

const titulo = computed(() => props.item.title || props.item.name || 'Sin título')
const fecha = computed(() => props.item.release_date || props.item.first_air_date || '')
const anio = computed(() => (fecha.value ? fecha.value.slice(0, 4) : 's/f'))
const conNota = computed(() => props.item.vote_average > 0 && props.item.vote_count > 0)
</script>

<template>
  <RouterLink class="tarjeta" :to="{ path: '/detalle', query: { tipo, id: item.id } }" :aria-label="titulo + ', ' + anio">
    <!-- Póster (o un icono si el título no tiene imagen) -->
    <div class="tarjeta__poster">
      <img v-if="item.poster_path" :src="urlImagen(item.poster_path, 'w342')" :alt="'Póster de ' + titulo" loading="lazy">
      <Icono v-else nombre="image_not_supported" class="tarjeta__sinposter" />

      <!-- Nota promedio del público sobre el póster -->
      <span v-if="conNota" class="nota tarjeta__nota">
        <Icono nombre="star" class="icono-lleno" />{{ item.vote_average.toFixed(1) }}
      </span>
    </div>
    <h3 class="tarjeta__titulo">{{ titulo }}</h3>
    <p class="tarjeta__meta">{{ anio + ' · ' + (tipo === 'movie' ? 'Película' : 'Serie') }}</p>
  </RouterLink>
</template>
