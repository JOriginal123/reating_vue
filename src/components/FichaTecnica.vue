<script setup>
/* FichaTecnica.vue — reemplaza a crearFicha() de detalle.js.
   Recibe pares [etiqueta, valor] (series y películas). */
import Seccion from './Seccion.vue'

defineProps({
  datos: { type: Array, required: true }
})
</script>

<template>
  <Seccion titulo="Ficha técnica">
    <dl class="ficha">
      <div v-for="par in datos" :key="par[0]">
        <dt>{{ par[0] }}</dt>
        <dd>{{ par[1] }}</dd>
      </div>
    </dl>
  </Seccion>
</template>
