<script setup>
/* ==========================================================================
   DetalleView.vue — Reating
   Reemplaza a detalle.html + detalle.js.
   Qué hace: lee ?tipo=movie|tv&id=123 de la URL, pide los datos a TMDB y dibuja la ficha
   (datos, puntuaciones, reparto, opiniones y recomendaciones).
   Para qué sirve: mostrar toda la información de un título.
   v1.1.0: las PELÍCULAS usan solo el endpoint /movie/popular: la ficha se arma con
   los datos guardados de la lista (o, si se entra por enlace directo, buscándola en
   /movie/popular). Las SERIES siguen usando /tv/{id} con reparto y opiniones.
   ========================================================================== */
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Cabecera from '../components/Cabecera.vue'
import Pie from '../components/Pie.vue'
import Icono from '../components/Icono.vue'
import Seccion from '../components/Seccion.vue'
import HeroDetalle from '../components/HeroDetalle.vue'
import FichaTecnica from '../components/FichaTecnica.vue'
import OpinionTarjeta from '../components/OpinionTarjeta.vue'
import TarjetaTitulo from '../components/TarjetaTitulo.vue'
import MensajeEstado from '../components/MensajeEstado.vue'
import { tmdb, urlImagen, guardarPeliculas, leerPelicula } from '../services/tmdb'
import { ESTADOS, formatearFecha, unicos, nombreIdioma } from '../utils/formato'

/* ------------------------------------------------------------------------
   Parámetros y constantes
   Antes: new URLSearchParams(window.location.search). Ahora: la ruta de Vue.
   ------------------------------------------------------------------------ */
const route = useRoute()
const tipo = computed(() => (route.query.tipo === 'tv' ? 'tv' : 'movie'))
const id = computed(() => parseInt(route.query.id, 10))

const MAX_OPINIONES = 6 // cuántas opiniones se muestran
const TRABAJOS_GUION = ['Screenplay', 'Writer', 'Story', 'Teleplay', 'Novel'] // cargos de guion en TMDB

// Estado de la página: 'cargando' | 'error' | 'ok'
const vista = ref('cargando')
const datos = ref(null)
const opiniones = ref([])
const error = ref(null) // { texto, permitirReintento }
let peticion = 0        // numera las cargas para ignorar respuestas viejas (al saltar entre fichas)

/* ------------------------------------------------------------------------
   Carga de datos
   Qué hace: pide la ficha y las opiniones en paralelo y guarda el resultado.
   Las opiniones se piden SIN idioma porque casi todas están en inglés y con
   "es-AR" la lista suele venir vacía.
   ------------------------------------------------------------------------ */
// v1.1.0: decide el origen de los datos según el tipo (película o serie)
async function cargar() {
  const mia = ++peticion
  const tipoActual = tipo.value
  const idActual = id.value
  vista.value = 'cargando'
  datos.value = null
  opiniones.value = []

  if (!idActual) {
    mostrarError('No encontramos el título que buscabas.', false)
    return
  }
  try {
    if (tipoActual === 'movie') {
      await cargarPelicula(idActual, mia)
    } else {
      await cargarSerie(idActual, mia)
    }
  } catch (e) {
    if (mia === peticion) mostrarError(e.message, true)
  }
}

// Series: ficha completa desde /tv/{id} (reparto, creadores, opiniones y recomendaciones)
async function cargarSerie(idSerie, mia) {
  const [respuesta, respuestaOpiniones] = await Promise.all([
    tmdb('/tv/' + idSerie, { append_to_response: 'credits,recommendations' }),
    tmdb('/tv/' + idSerie + '/reviews', {}, false).catch(() => ({ results: [] }))
  ])
  if (mia !== peticion) return
  document.title = (respuesta.name || 'Detalle') + ' · Reating'
  datos.value = respuesta
  opiniones.value = respuestaOpiniones.results || []
  vista.value = 'ok'
}

// Películas: usa solo datos de /movie/popular.
// 1) los guardados al ver la cartelera; 2) si no están (enlace directo o localStorage vacío),
// se busca en las primeras páginas de /movie/popular
async function cargarPelicula(idPelicula, mia) {
  const pelicula = leerPelicula(idPelicula) || await buscarEnPopulares(idPelicula)
  if (mia !== peticion) return
  if (!pelicula) {
    mostrarError('No encontramos esta película entre las populares. Volvé a la cartelera y elegila desde ahí.', false)
    return
  }
  document.title = (pelicula.title || 'Detalle') + ' · Reating'
  datos.value = pelicula
  vista.value = 'ok'
}

// Busca la película por id en las primeras 5 páginas de /movie/popular y la guarda si la encuentra
async function buscarEnPopulares(idBuscado) {
  for (let pagina = 1; pagina <= 5; pagina++) {
    const respuesta = await tmdb('/movie/popular', { page: pagina })
    const encontrada = (respuesta.results || []).find((p) => p.id === idBuscado)
    if (encontrada) {
      guardarPeliculas([encontrada])
      return encontrada
    }
    if (pagina >= (respuesta.total_pages || 1)) break
  }
  return null
}

// Muestra un error con botón de reintento (si corresponde)
function mostrarError(texto, permitirReintento) {
  error.value = {
    icono: 'error',
    texto,
    esError: true,
    accion: permitirReintento ? { texto: 'Reintentar', alHacerClic: cargar } : null
  }
  vista.value = 'error'
}

// Antes cada ficha era una página nueva. Ahora el componente se reutiliza, así que se vuelve
// a cargar cada vez que cambia la URL (por ejemplo al tocar una recomendación)
watch(() => route.fullPath, () => {
  if (route.path === '/detalle') cargar()
}, { immediate: true })


/* ------------------------------------------------------------------------
   CUERPO: ficha técnica, reparto, opiniones y recomendaciones
   (computed: se recalculan solos cuando cambia "datos")
   ------------------------------------------------------------------------ */
// Series — ficha técnica: dirección o creadores, guion, estado, idioma y productoras
const fichaSerie = computed(() => {
  const d = datos.value
  if (!d || tipo.value !== 'tv') return []
  const equipo = (d.credits && d.credits.crew) || []
  const directores = unicos(equipo.filter((p) => p.job === 'Director').map((p) => p.name)).slice(0, 3)
  const guionistas = unicos(equipo.filter((p) => TRABAJOS_GUION.includes(p.job)).map((p) => p.name)).slice(0, 4)
  const creadores = unicos((d.created_by || []).map((p) => p.name))
  const productoras = (d.production_companies || []).map((c) => c.name).slice(0, 3)

  // [etiqueta, valor]: los valores vacíos se descartan
  return [
    [directores.length > 1 ? 'Dirección' : 'Director/a', directores.join(', ')],
    [creadores.length > 1 ? 'Creadores' : 'Creador/a', creadores.join(', ')],
    ['Guion', guionistas.join(', ')],
    ['Estado', ESTADOS[d.status] || d.status || ''],
    ['Idioma original', nombreIdioma(d.original_language)],
    ['Productoras', productoras.join(', ')]
  ].filter((par) => par[1])
})

// v1.1.0: ficha de una película con los datos de /movie/popular.
// Muestra título original, idioma, estreno y popularidad
const fichaPelicula = computed(() => {
  const p = datos.value
  if (!p || tipo.value !== 'movie') return []
  return [
    ['Título original', p.original_title && p.original_title !== p.title ? p.original_title : ''],
    ['Estreno', p.release_date ? formatearFecha(p.release_date) : ''],
    ['Idioma original', nombreIdioma(p.original_language)],
    ['Popularidad en TMDB', p.popularity ? String(Math.round(p.popularity)) : '']
  ].filter((par) => par[1])
})

// Reparto: los primeros 14 actores con foto y personaje
const reparto = computed(() => ((datos.value && datos.value.credits && datos.value.credits.cast) || []).slice(0, 14))

// Recomendaciones: reutiliza la tarjeta de la cartelera
const recomendados = computed(() =>
  ((datos.value && datos.value.recommendations && datos.value.recommendations.results) || [])
    .filter((r) => r.poster_path)
    .slice(0, 6)
)
</script>

<template>
  <Cabecera />

  <main class="principal">
    <!-- Enlace para volver a la cartelera del mismo tipo (películas o series) -->
    <div class="contenedor">
      <RouterLink class="boton boton--fantasma enlace-volver" :to="{ path: '/', query: { tipo } }">
        <Icono nombre="arrow_back" />Volver a la cartelera
      </RouterLink>
    </div>

    <div id="detalle" aria-live="polite">
      <!-- Esqueleto de carga con la misma forma que la ficha -->
      <div v-if="vista === 'cargando'" class="contenedor detalle-esqueleto" aria-hidden="true">
        <div class="esqueleto detalle-esqueleto__poster"></div>
        <div class="detalle-esqueleto__lineas">
          <div class="esqueleto esqueleto--linea"></div>
          <div class="esqueleto esqueleto--linea-corta"></div>
          <div class="esqueleto esqueleto--linea"></div>
          <div class="esqueleto esqueleto--linea"></div>
          <div class="esqueleto esqueleto--linea-corta"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="vista === 'error'" class="contenedor">
        <MensajeEstado v-bind="error" />
      </div>

      <!-- Ficha completa -->
      <template v-else>
        <HeroDetalle :d="datos" :tipo="tipo" :id="id" :key="tipo + '-' + id" />

        <!-- Película: solo los datos de /movie/popular -->
        <div v-if="tipo === 'movie'" class="contenedor cuerpo">
          <FichaTecnica v-if="fichaPelicula.length" :datos="fichaPelicula" />
          <section class="seccion">
            <MensajeEstado icono="info" texto="Para las películas se muestran los datos de la cartelera: reparto, guionistas y opiniones no están disponibles." />
          </section>
        </div>

        <!-- Serie: ficha, reparto, opiniones y recomendaciones -->
        <div v-else class="contenedor cuerpo">
          <FichaTecnica v-if="fichaSerie.length" :datos="fichaSerie" />

          <Seccion v-if="reparto.length" titulo="Reparto">
            <div class="reparto">
              <div v-for="(a, i) in reparto" :key="a.credit_id || a.id || i" class="actor">
                <div class="actor__foto">
                  <img v-if="a.profile_path" :src="urlImagen(a.profile_path, 'w185')" :alt="'Foto de ' + a.name" loading="lazy">
                  <Icono v-else nombre="person" />
                </div>
                <p class="actor__nombre">{{ a.name }}</p>
                <p v-if="a.character" class="actor__personaje">{{ a.character }}</p>
              </div>
            </div>
          </Seccion>

          <Seccion titulo="Opiniones">
            <MensajeEstado v-if="!opiniones.length" icono="rate_review" texto="Todavía no hay opiniones para este título." />
            <template v-else>
              <p class="aviso-opiniones">Opiniones de usuarios de TMDB; la mayoría están en inglés.</p>
              <div class="opiniones">
                <OpinionTarjeta v-for="(o, i) in opiniones.slice(0, MAX_OPINIONES)" :key="o.id || i" :o="o" />
              </div>
            </template>
          </Seccion>

          <Seccion v-if="recomendados.length" titulo="Te puede interesar">
            <div class="grilla grilla--compacta">
              <TarjetaTitulo v-for="item in recomendados" :key="item.id" :item="item" :tipo="tipo" />
            </div>
          </Seccion>
        </div>
      </template>
    </div>
  </main>

  <Pie />
</template>
