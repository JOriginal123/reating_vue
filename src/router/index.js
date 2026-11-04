/* ==========================================================================
   router/index.js — Reating
   Reemplaza a los dos archivos HTML:
     index.html   -> "/"        (InicioView)
     detalle.html -> "/detalle" (DetalleView), con ?tipo=movie|tv&id=123 igual que antes
   ========================================================================== */
import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import DetalleView from '../views/DetalleView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InicioView },
    { path: '/detalle', component: DetalleView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  // Al cambiar de "página" se vuelve arriba (lo que hacía el navegador al cargar otro HTML)
  scrollBehavior() {
    return { top: 0 }
  }
})
