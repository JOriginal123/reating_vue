/* ==========================================================================
   main.js — Reating
   Punto de entrada de la app: aplica el tema guardado, crea la aplicación Vue,
   le conecta el router y la monta dentro de <div id="app"> (index.html).
   Reemplaza al "ARRANQUE" que estaba al final de script.js.
   ========================================================================== */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { aplicarTemaInicial } from './composables/useTema'

// Se ejecuta antes de montar la app, para evitar el parpadeo de tema
aplicarTemaInicial()

createApp(App).use(router).mount('#app')
