<script setup>
/* HeroDetalle.vue — reemplaza a construirHero() y construirPuntajePublico() de detalle.js.
   Imagen de fondo, póster, título, etiquetas, puntuaciones y sinopsis.
   Props: "d" (datos de la película o serie), "tipo" y "id". */
import { computed } from 'vue'
import Icono from './Icono.vue'
import Etiqueta from './Etiqueta.vue'
import PuntajePropio from './PuntajePropio.vue'
import { urlImagen } from '../services/tmdb'
import { GENEROS, formatearFecha, formatearDuracion } from '../utils/formato'

const props = defineProps({
  d: { type: Object, required: true },
  tipo: { type: String, required: true },
  id: { type: Number, required: true }
})

const titulo = computed(() => props.d.title || props.d.name || 'Sin título')
const fecha = computed(() => props.d.release_date || props.d.first_air_date)

// Texto de temporadas y episodios (solo series)
const textoTemporadas = computed(() => {
  const d = props.d
  if (!(props.tipo === 'tv' && d.number_of_seasons)) return ''
  const temporadas = d.number_of_seasons + (d.number_of_seasons === 1 ? ' temporada' : ' temporadas')
  const episodios = d.number_of_episodes ? ' · ' + d.number_of_episodes + ' episodios' : ''
  return temporadas + episodios
})

// v1.1.0: series traen "genres" con nombre; películas traen "genre_ids" que se traducen con GENEROS
const generos = computed(() =>
  props.d.genres || (props.d.genre_ids || []).map((codigo) => ({ name: GENEROS[codigo] })).filter((g) => g.name)
)

// Nota del público (TMDB) en un anillo de progreso
const hayVotos = computed(() => props.d.vote_count > 0)
const porcentaje = computed(() => (hayVotos.value ? Math.round(props.d.vote_average * 10) : 0) + '%')
</script>

<template>
  <section class="hero">
    <!-- Imagen de fondo (si existe) que se difumina hacia el fondo de la página -->
    <div v-if="d.backdrop_path" class="hero__fondo">
      <img :src="urlImagen(d.backdrop_path, 'w1280')" alt="">
    </div>

    <div class="contenedor hero__contenido">
      <!-- Póster -->
      <div class="hero__poster">
        <img v-if="d.poster_path" :src="urlImagen(d.poster_path, 'w500')" :alt="'Póster de ' + titulo">
        <Icono v-else nombre="image_not_supported" class="tarjeta__sinposter" />
      </div>

      <div class="hero__info">
        <!-- Título y eslogan -->
        <div>
          <h1 class="hero__titulo">{{ titulo }}</h1>
          <p v-if="d.tagline" class="hero__eslogan">{{ d.tagline }}</p>
        </div>

        <!-- Etiquetas: tipo, fecha, duración (o temporadas) y géneros -->
        <div class="etiquetas">
          <Etiqueta :texto="tipo === 'movie' ? 'Película' : 'Serie'" :icono="tipo === 'movie' ? 'movie' : 'tv'" />
          <Etiqueta v-if="fecha" :texto="formatearFecha(fecha)" icono="calendar_month" />
          <Etiqueta v-if="tipo === 'movie' && d.runtime" :texto="formatearDuracion(d.runtime)" icono="schedule" />
          <Etiqueta v-if="textoTemporadas" :texto="textoTemporadas" icono="schedule" />
          <Etiqueta v-for="(g, i) in generos" :key="i" :texto="g.name" class="etiqueta--genero" />
        </div>

        <!-- Puntuaciones: promedio del público y la tuya -->
        <div class="puntajes">
          <div class="puntaje">
            <!-- el CSS pinta el anillo con --porcentaje -->
            <div class="anillo" :style="{ '--porcentaje': porcentaje }">
              <span class="anillo__valor">{{ hayVotos ? d.vote_average.toFixed(1) : '—' }}</span>
            </div>
            <div>
              <p class="puntaje__etiqueta">Puntuación del público</p>
              <p class="puntaje__texto">{{ hayVotos ? d.vote_count.toLocaleString('es-AR') + ' votos en TMDB' : 'Aún sin votos' }}</p>
            </div>
          </div>
          <PuntajePropio :tipo="tipo" :id="id" />
        </div>

        <!-- Sinopsis -->
        <div class="sinopsis">
          <h2 class="sinopsis__titulo">Sinopsis</h2>
          <p>{{ d.overview || 'Todavía no hay sinopsis disponible en español para este título.' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
