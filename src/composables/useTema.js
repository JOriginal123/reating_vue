/* ==========================================================================
   composables/useTema.js — Reating
   Viene de script.js (sección 2): tema claro/oscuro seleccionable.
   Qué hace: aplica el tema guardado (o el del sistema) y permite alternarlo.
   Un "composable" es una función que empieza con "use" y reutiliza lógica con
   estado reactivo (ref) entre varios componentes.
   ========================================================================== */
import { ref } from 'vue'

const CLAVE_TEMA = 'reating-tema'

// "oscuro" es un ref: cuando cambia, los componentes que lo usan se actualizan solos.
// Vive fuera de la función para que todos los componentes compartan el mismo valor.
const oscuro = ref(false)

// Lee el tema guardado; si el navegador bloquea el almacenamiento devuelve null
function leerTemaGuardado() {
  try { return localStorage.getItem(CLAVE_TEMA) } catch (e) { return null }
}

// Cambia el atributo data-theme del <html>, que activa las variables oscuras del CSS
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema)
  oscuro.value = tema === 'dark'
}

// Se llama desde main.js antes de montar la app (evita el parpadeo de tema)
export function aplicarTemaInicial() {
  const guardado = leerTemaGuardado()
  const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  aplicarTema(guardado === 'dark' || guardado === 'light' ? guardado : (prefiereOscuro ? 'dark' : 'light'))
}

// Lo usa el botón de tema de la cabecera
export function useTema() {
  function alternar() {
    const nuevo = oscuro.value ? 'light' : 'dark'
    aplicarTema(nuevo)
    try { localStorage.setItem(CLAVE_TEMA, nuevo) } catch (e) { /* sin almacenamiento: el tema vale solo para esta visita */ }
  }
  return { oscuro, alternar }
}
