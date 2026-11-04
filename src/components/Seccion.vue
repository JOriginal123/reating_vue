<script setup>
/* Seccion.vue — reemplaza a crearSeccion() de detalle.js.
   El contenido que se escribe entre <Seccion> y </Seccion> entra en el <slot />. */
defineProps({
  titulo: { type: String, required: true }
})
</script>

<template>
  <section class="seccion">
    <h2 class="seccion__titulo">{{ titulo }}</h2>
    <slot />
  </section>
</template>
