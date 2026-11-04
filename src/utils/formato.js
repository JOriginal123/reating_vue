/* ==========================================================================
   utils/formato.js — Reating
   Funciones y diccionarios de formato que antes estaban en script.js
   (formatearFecha) y en detalle.js (ESTADOS, GENEROS, unicos, formatearDuracion,
   nombreIdioma). Sin cambios de lógica.
   ========================================================================== */

// TMDB devuelve el estado en inglés: se traduce para mostrarlo
export const ESTADOS = {
  'Released': 'Estrenada',
  'Post Production': 'En posproducción',
  'In Production': 'En producción',
  'Planned': 'Planeada',
  'Rumored': 'Rumoreada',
  'Canceled': 'Cancelada',
  'Returning Series': 'En emisión',
  'Ended': 'Finalizada',
  'Pilot': 'Piloto'
}

// v1.1.0: /movie/popular devuelve los géneros como números (genre_ids). Este diccionario
// fijo de TMDB los convierte en nombres sin pedir otro endpoint
export const GENEROS = {
  28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen', 99: 'Documental',
  18: 'Drama', 10751: 'Familia', 14: 'Fantasía', 36: 'Historia', 27: 'Terror', 10402: 'Música',
  9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia ficción', 10770: 'Película de TV',
  53: 'Suspense', 10752: 'Bélica', 37: 'Western'
}

// Formatea fechas ISO ("2024-05-31" o "2024-05-31T10:00:00Z") como "31 de mayo de 2024"
export function formatearFecha(iso) {
  if (!iso) return 'Sin fecha'
  const fecha = new Date(iso)
  if (isNaN(fecha)) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(fecha)
}

// Quita nombres repetidos manteniendo el orden
export function unicos(lista) {
  return lista.filter((valor, i) => valor && lista.indexOf(valor) === i)
}

// 135 -> "2 h 15 min"
export function formatearDuracion(minutos) {
  if (!minutos) return ''
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return h ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min'
}

// "en" -> "Inglés"
export function nombreIdioma(codigo) {
  if (!codigo) return ''
  try {
    const texto = new Intl.DisplayNames(['es'], { type: 'language' }).of(codigo) || codigo
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  } catch (e) {
    return codigo
  }
}
