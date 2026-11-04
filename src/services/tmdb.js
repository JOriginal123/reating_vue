/* ==========================================================================
   services/tmdb.js — Reating
   Viene de script.js (secciones 1 y 3): configuración de la API, cliente tmdb(),
   urlImagen() y la caché local de películas. Lógica idéntica; solo se agregó
   "export" para poder importarlas desde los componentes.
   ========================================================================== */

/* ==========================================================================
   1) CONFIGURACIÓN
   Qué hace: guarda la clave y las URLs base de la API.
   Para qué sirve: cambiar la clave o el idioma en un solo lugar.
   ========================================================================== */
export const CONFIG = {
  API_KEY: 'b062d3327c98e263b7c32a7a4276a2f3',
  API_URL: 'https://api.themoviedb.org/3',
  IMG_URL: 'https://image.tmdb.org/t/p',
  // Idioma es-ES: se aplica a todas las consultas (películas y series)
  // para que el sitio quede en un solo idioma.
  IDIOMA: 'es-ES'
}

// Pide datos a TMDB. Qué hace: arma la URL con la clave, el idioma y los parámetros.
// Para qué sirve: todas las páginas piden datos con esta única función.
export async function tmdb(ruta, parametros = {}, conIdioma = true) {
  const url = new URL(CONFIG.API_URL + ruta)
  url.searchParams.set('api_key', CONFIG.API_KEY)
  if (conIdioma) url.searchParams.set('language', CONFIG.IDIOMA)
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, valor)
  })

  let respuesta
  try {
    respuesta = await fetch(url)
  } catch (e) {
    throw new Error('No pudimos conectar con el servidor de películas. Revisá tu conexión a internet.')
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) throw new Error('La API Key no es válida o fue revocada.')
    if (respuesta.status === 404) throw new Error('No encontramos ese título.')
    throw new Error('El servidor respondió con un error (' + respuesta.status + '). Probá de nuevo en un rato.')
  }
  return respuesta.json()
}

// Arma la URL completa de una imagen (tamaño: w185, w342, w500, w1280, etc.)
export function urlImagen(ruta, tamano) {
  return CONFIG.IMG_URL + '/' + tamano + ruta
}

/* --------------------------------------------------------------------------
   Caché local de películas
   Qué hace: guarda en localStorage los datos básicos de cada película que llega
   en las listas de la cartelera (título, sinopsis, fecha, nota, pósters, géneros).
   Para qué sirve: las películas usan solo el endpoint /movie/popular, así que
   la ficha arma sus datos con esto sin pedir ningún otro endpoint.
   -------------------------------------------------------------------------- */
const CLAVE_PELICULAS = 'reating-peliculas'
const MAX_PELICULAS_GUARDADAS = 300 // al superarse se descartan las más antiguas

// Lee la lista guardada; si no existe o el navegador bloquea el almacenamiento devuelve []
function leerPeliculasGuardadas() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_PELICULAS))
    return Array.isArray(lista) ? lista : []
  } catch (e) {
    return []
  }
}

// Guarda solo los campos que usa la ficha (ocupa poco) y evita duplicados por id
export function guardarPeliculas(items) {
  if (!items || !items.length) return
  const nuevas = items.map((p) => ({
    id: p.id,
    title: p.title,
    original_title: p.original_title,
    original_language: p.original_language,
    overview: p.overview,
    release_date: p.release_date,
    vote_average: p.vote_average,
    vote_count: p.vote_count,
    popularity: p.popularity,
    poster_path: p.poster_path,
    backdrop_path: p.backdrop_path,
    genre_ids: p.genre_ids
  }))
  const ids = new Set(nuevas.map((p) => p.id))
  const lista = leerPeliculasGuardadas().filter((p) => !ids.has(p.id)).concat(nuevas).slice(-MAX_PELICULAS_GUARDADAS)
  try { localStorage.setItem(CLAVE_PELICULAS, JSON.stringify(lista)) } catch (e) { /* sin almacenamiento: la ficha buscará en /movie/popular */ }
}

// Devuelve la película guardada con ese id, o null si no está
export function leerPelicula(id) {
  return leerPeliculasGuardadas().find((p) => p.id === id) || null
}
