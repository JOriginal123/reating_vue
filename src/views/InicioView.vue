<script setup>
/* ==========================================================================
   InicioView.vue — Reating
   Reemplaza a index.html + la sección 5 de script.js (iniciarInicio).
   Qué hace: controla tipo (películas/series), categoría, búsqueda y paginación.
   Para qué sirve: explorar el catálogo de TMDB.
   La lógica es la misma de antes; la diferencia es que ya no se tocan elementos del DOM
   a mano (getElementById, append, replaceChildren): se cambian variables reactivas y
   el <template> se redibuja solo.
   ========================================================================== */
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Cabecera from '../components/Cabecera.vue'
import Pie from '../components/Pie.vue'
import Icono from '../components/Icono.vue'
import TarjetaTitulo from '../components/TarjetaTitulo.vue'
import MensajeEstado from '../components/MensajeEstado.vue'
import { tmdb, guardarPeliculas } from '../services/tmdb'

// Textos del encabezado según tipo y categoría
const TEXTOS = {
  movie: {
    cartelera: { titulo: 'En cartelera', sub: 'Las películas que se están proyectando ahora.' },
    populares: { titulo: 'Populares', sub: 'Lo más visto del momento.' },
    mejores:   { titulo: 'Mejor valoradas', sub: 'Las favoritas del público de todos los tiempos.' }
  },
  tv: {
    cartelera: { titulo: 'En emisión', sub: 'Series con episodios nuevos en estos días.' },
    populares: { titulo: 'Populares', sub: 'Las series más vistas del momento.' },
    mejores:   { titulo: 'Mejor valoradas', sub: 'Las series favoritas del público de todos los tiempos.' }
  }
}

// Endpoint de TMDB para cada combinación de tipo y categoría
const RUTAS = {
  movie: { cartelera: '/movie/now_playing', populares: '/movie/popular', mejores: '/movie/top_rated' },
  tv:    { cartelera: '/tv/on_the_air',     populares: '/tv/popular',     mejores: '/tv/top_rated' }
}

const route = useRoute()

// Estado de la pantalla. "peticion" numera las consultas para ignorar respuestas viejas.
// La categoría inicial es "populares": las películas se cargan de /movie/popular
// Si se vuelve desde una ficha de serie (/?tipo=tv) se abre directamente en Series
const estado = reactive({
  tipo: route.query.tipo === 'tv' ? 'tv' : 'movie',
  categoria: 'populares',
  busqueda: '',
  pagina: 1,
  totalPaginas: 1,
  peticion: 0
})

// Lo que antes eran elementos del DOM ahora son datos reactivos
const tarjetas = ref([])            // títulos que se muestran en la grilla
const esqueletos = ref(false)       // true mientras se muestran las 12 tarjetas "esqueleto"
const mensaje = ref(null)           // { icono, texto, esError, accion } o null (zona #estado)
const btnOculto = ref(true)         // botón "Cargar más"
const btnDeshabilitado = ref(false)
const btnTexto = ref('Cargar más')

// Refresca títulos, botones activos y visibilidad de las categorías (antes actualizarEncabezado)
const textos = computed(() => {
  if (estado.busqueda) {
    return {
      titulo: 'Resultados',
      sub: 'Para “' + estado.busqueda + '” en ' + (estado.tipo === 'movie' ? 'películas' : 'series') + '.'
    }
  }
  return TEXTOS[estado.tipo][estado.categoria]
})

const tipos = [
  { valor: 'movie', texto: 'Películas', icono: 'movie' },
  { valor: 'tv', texto: 'Series', icono: 'tv' }
]

const chips = computed(() => [
  { cat: 'populares', texto: 'Populares' },
  { cat: 'cartelera', texto: estado.tipo === 'movie' ? 'En cartelera' : 'En emisión' },
  { cat: 'mejores', texto: 'Mejor valoradas' }
])

// Pide una página a la API y la agrega a la grilla.
// reiniciar = true: vacía la grilla y vuelve a la página 1 (cambio de tipo, categoría o búsqueda)
async function cargar(reiniciar) {
  const miPeticion = ++estado.peticion
  mensaje.value = null

  if (reiniciar) {
    estado.pagina = 1
    tarjetas.value = []
    btnOculto.value = true
    esqueletos.value = true
  } else {
    btnDeshabilitado.value = true
    btnTexto.value = 'Cargando…'
  }

  try {
    const ruta = estado.busqueda ? '/search/' + estado.tipo : RUTAS[estado.tipo][estado.categoria]
    const datos = await tmdb(ruta, {
      page: estado.pagina,
      query: estado.busqueda,
      include_adult: 'false',
      // La región AR se aplica solo a "en cartelera" (muestra lo que se proyecta en Argentina).
      // /movie/popular se pide igual que la URL indicada: language=es-ES y page
      region: (!estado.busqueda && ruta === RUTAS.movie.cartelera) ? 'AR' : undefined
    })
    if (miPeticion !== estado.peticion) return // llegó tarde: el usuario ya cambió de filtro

    esqueletos.value = false
    tarjetas.value.push(...(datos.results || []))
    // Guarda las películas listadas para que la ficha las muestre sin otro endpoint
    if (estado.tipo === 'movie') guardarPeliculas(datos.results)
    estado.totalPaginas = 1 // TMDB admite hasta 500 páginas

    if (!tarjetas.value.length) {
      mensaje.value = { icono: 'search_off', texto: 'No encontramos resultados. Probá con otra búsqueda.', esError: false }
    }
    btnOculto.value = estado.pagina >= estado.totalPaginas
    btnDeshabilitado.value = false
    btnTexto.value = 'Cargar más'
  } catch (error) {
    if (miPeticion !== estado.peticion) return
    esqueletos.value = false
    btnDeshabilitado.value = false
    btnTexto.value = 'Cargar más'
    if (!reiniciar) estado.pagina-- // vuelve a la página anterior para poder reintentar la misma

    mensaje.value = {
      icono: 'cloud_off',
      texto: error.message,
      esError: true,
      accion: {
        texto: 'Reintentar',
        alHacerClic: () => {
          if (reiniciar) { cargar(true) } else { estado.pagina++; cargar(false) }
        }
      }
    }
  }
}

// Selector Películas / Series
function cambiarTipo(valor) {
  if (estado.tipo === valor) return
  estado.tipo = valor
  cargar(true)
}

// Chips de categoría
function cambiarCategoria(cat) {
  if (estado.categoria === cat) return
  estado.categoria = cat
  cargar(true)
}

// Botón "Cargar más": pide la página siguiente
function cargarMas() {
  estado.pagina++
  cargar(false)
}

// Búsqueda con retardo (debounce) para no consultar la API en cada tecla.
// Cabecera avisa con el evento "escribir" cada vez que cambia el texto del buscador
let temporizador = null
function alEscribir(valor) {
  clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    const texto = valor.trim()
    if (texto === estado.busqueda) return
    estado.busqueda = texto
    cargar(true)
  }, 450)
}

// Antes cada "página" era un HTML distinto y se recargaba entera. Ahora, si ya estamos en
// el inicio y la URL cambia (por ejemplo al tocar el logo), hay que reaccionar a mano
watch(() => route.query.tipo, (valor) => {
  const nuevo = valor === 'tv' ? 'tv' : 'movie'
  if (nuevo === estado.tipo) return
  estado.tipo = nuevo
  cargar(true)
})

onMounted(() => {
  document.title = 'Reating · Cartelera de películas y series'
  cargar(true)
})
onBeforeUnmount(() => clearTimeout(temporizador))
</script>

<template>
  <Cabecera con-buscador @escribir="alEscribir" />

  <main class="contenedor principal">
    <!-- Título dinámico y controles de tipo / categoría -->
    <section class="encabezado">
      <div>
        <h1 class="encabezado__titulo">{{ textos.titulo }}</h1>
        <p class="encabezado__subtitulo">{{ textos.sub }}</p>
      </div>

      <div class="controles">
        <!-- Selector Películas / Series -->
        <div class="segmentado" role="group" aria-label="Tipo de contenido">
          <button v-for="op in tipos" :key="op.valor" class="segmentado__op" type="button"
                  :aria-pressed="String(op.valor === estado.tipo)" @click="cambiarTipo(op.valor)">
            <Icono :nombre="op.icono" />{{ op.texto }}
          </button>
        </div>

        <!-- Categorías (se ocultan mientras se está buscando) -->
        <div class="chips" role="group" aria-label="Categoría" :hidden="Boolean(estado.busqueda)">
          <button v-for="c in chips" :key="c.cat" class="chip" type="button"
                  :aria-pressed="String(c.cat === estado.categoria)" @click="cambiarCategoria(c.cat)">{{ c.texto }}</button>
        </div>
      </div>
    </section>

    <!-- Zona de mensajes: errores o "sin resultados" -->
    <div id="estado" aria-live="polite">
      <MensajeEstado v-if="mensaje" v-bind="mensaje" />
    </div>

    <!-- Grilla de pósters -->
    <section class="grilla" id="grilla" aria-label="Listado de títulos">
      <TarjetaTitulo v-for="(item, i) in tarjetas" :key="item.id + '-' + i" :item="item" :tipo="estado.tipo" />

      <!-- Tarjetas "esqueleto" mientras llegan los datos -->
      <template v-if="esqueletos">
        <div v-for="n in 12" :key="'esqueleto-' + n" class="tarjeta tarjeta--esqueleto" aria-hidden="true">
          <div class="tarjeta__poster esqueleto"></div>
          <div class="esqueleto esqueleto--linea"></div>
          <div class="esqueleto esqueleto--linea-corta"></div>
        </div>
      </template>
    </section>

    <div class="cargar-mas">
      <button class="boton boton--primario" id="btnMas" type="button" :hidden="btnOculto" :disabled="btnDeshabilitado" @click="cargarMas">{{ btnTexto }}</button>
    </div>
  </main>

  <Pie />
</template>
