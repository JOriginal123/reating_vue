<script setup>
/* App.vue — componente raíz. Solo muestra la página que corresponda a la URL
   (InicioView o DetalleView, definidas en router/index.js). */
</script>

<template>
  <RouterView />
</template>

<!-- Estilo sin "scoped" a propósito. Con display: contents el <div id="app"> "desaparece"
     para el layout: cabecera, main y pie siguen siendo hijos directos del <body> (que es
     flex en style.css), así el pie queda abajo igual que antes. -->
<style>
#app { display: contents; }
</style>
