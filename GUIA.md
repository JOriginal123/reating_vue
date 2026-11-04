# Reating en Vue — guía para entender la migración

## 1. Cómo correrlo

```bash
npm install      # instala Vue, Vue Router y Vite (una sola vez)
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # genera la carpeta dist/ (lo que se publica)
```

## 2. Qué cambió de lugar

| Antes (JS puro) | Ahora (Vue) |
|---|---|
| `index.html` (cartelera) | `src/views/InicioView.vue` |
| `detalle.html` + `detalle.js` | `src/views/DetalleView.vue` + componentes |
| `script.js` sección 1 y 3 (CONFIG, `tmdb`, `urlImagen`, caché) | `src/services/tmdb.js` |
| `script.js` sección 2 (tema) | `src/composables/useTema.js` |
| `script.js` sección 5 (`iniciarInicio`) | `<script setup>` de `InicioView.vue` |
| `script.js` `crearTarjeta` | `components/TarjetaTitulo.vue` |
| `script.js` `crearMensaje` | `components/MensajeEstado.vue` |
| `script.js` `icono()` | `components/Icono.vue` |
| `detalle.js` `construirHero` | `components/HeroDetalle.vue` |
| `detalle.js` `construirPuntajePropio` | `components/PuntajePropio.vue` |
| `detalle.js` `crearFicha` | `components/FichaTecnica.vue` |
| `detalle.js` `construirOpinion` | `components/OpinionTarjeta.vue` |
| `detalle.js` `crearSeccion`, `crearEtiqueta` | `components/Seccion.vue`, `components/Etiqueta.vue` |
| `ESTADOS`, `GENEROS`, `formatearFecha`, etc. | `src/utils/formato.js` |
| `<header>` y `<footer>` repetidos en cada HTML | `components/Cabecera.vue` y `components/Pie.vue` |
| `style.css` | `src/style.css` (idéntico, sin tocar) |
| Dos archivos HTML | Un solo `index.html` + rutas (`src/router/index.js`) |

## 3. La idea central de Vue

**Antes:** tu código le decía al navegador *cómo* cambiar la pantalla, paso a paso.

```js
const nota = el('span', 'nota');       // creo el elemento
nota.append(icono('star'), ...);       // le agrego hijos
poster.append(nota);                   // lo pego en la página
grilla.replaceChildren();              // borro todo para repintar
```

**Ahora:** describís *cómo se ve* según los datos, y Vue actualiza la pantalla cuando los datos cambian.

```vue
<span v-if="conNota" class="nota">{{ item.vote_average.toFixed(1) }}</span>
```

### Equivalencias que vas a usar siempre

| Querés hacer… | JS puro | Vue |
|---|---|---|
| Mostrar un dato | `el.textContent = x` | `{{ x }}` |
| Poner un atributo con un dato | `img.src = url` | `:src="url"` |
| Mostrar/ocultar según condición | `if (...) padre.append(...)` | `v-if="..."` / `v-else` |
| Repetir elementos de una lista | `lista.forEach(i => padre.append(...))` | `v-for="i in lista" :key="i.id"` |
| Reaccionar a un clic | `boton.addEventListener('click', f)` | `@click="f"` |
| Una clase según condición | `el.classList.toggle('x', cond)` | `:class="{ x: cond }"` |
| Una variable que, al cambiar, repinta | (había que repintar a mano) | `const x = ref(0)` y se usa `x.value` en el script |
| Un valor calculado de otros | función que se llama a mano | `computed(() => ...)` |
| Reutilizar un trozo de pantalla | función `crearTarjeta()` que devuelve nodos | componente `<TarjetaTitulo />` |
| Enlaces entre páginas | `<a href="detalle.html?...">` | `<RouterLink :to="...">` |

### Anatomía de un archivo `.vue`

```vue
<script setup>
// 1) La lógica (JavaScript): datos, funciones, props
</script>

<template>
  <!-- 2) El HTML, con {{ }}, v-if, v-for, @click, :atributo -->
</template>

<style scoped>
/* 3) CSS opcional (en este proyecto todo el CSS está en src/style.css) */
</style>
```

### Props, eventos y slots (cómo se hablan los componentes)

- **Props** (de padre a hijo): `<TarjetaTitulo :item="item" :tipo="tipo" />`. El hijo las declara con `defineProps`.
- **Eventos** (de hijo a padre): `Cabecera` hace `emit('escribir', valor)` y `InicioView` escucha con `@escribir="alEscribir"`.
- **Slots**: lo que se escribe entre `<Seccion titulo="Reparto"> ... </Seccion>` entra en el `<slot />` de `Seccion.vue`.

## 4. Cómo migrar otro proyecto tú mismo (receta)

1. `npm create vue@latest` (elegí Router) o copiá la estructura de este proyecto.
2. **Cada página HTML → una vista** en `src/views/`. El contenido del `<body>` va al `<template>`; el JS de esa página, al `<script setup>`.
3. **Lo que se repite → un componente** (cabecera, pie, tarjeta, mensaje).
4. **Funciones que arman HTML con `document.createElement` → plantilla.** Cada `el('div', 'clase', texto)` pasa a ser `<div class="clase">{{ texto }}</div>`.
5. **Variables que cambian y deben repintar → `ref()` o `reactive()`.** Después de cambiarlas no hay que "redibujar": Vue lo hace.
6. **Datos que se piden a una API:** mové las funciones de red a `src/services/` y llamalas desde el `<script setup>`.
7. **Funciones puras de formato → `src/utils/`.**
8. **`<a href="otra.html">` → `RouterLink`**, y definí la ruta en `src/router/index.js`.
9. **El CSS se copia igual** (`import './style.css'` en `main.js`).

## 5. Qué decisiones se tomaron (y por qué)

- **URLs:** `index.html` → `/`; `detalle.html?tipo=movie&id=1` → `/detalle?tipo=movie&id=1`. Mismos parámetros que antes.
- **`display: contents` en `#app`** (en `App.vue`): Vue mete todo dentro de `<div id="app">`. Con esa regla el contenedor "desaparece" para el layout y el pie sigue pegado abajo sin tocar `style.css`.
- **Tema sin parpadeo:** `aplicarTemaInicial()` se llama en `main.js` antes de montar la app.
- **Cosas que Vue necesita y antes no hacían falta:**
  - `DetalleView` vuelve a cargar cuando cambia la URL (al tocar una recomendación el componente se reutiliza, antes era una página nueva).
  - `InicioView` observa `?tipo=` por la misma razón (botón "Volver" desde una serie).
  - `document.title` se fija en cada vista.
  - Al cambiar de ruta se vuelve arriba (`scrollBehavior`).

## 6. Subir a Vercel

**Opción A — con GitHub (recomendada, se actualiza sola)**
1. Creá un repositorio en GitHub y subí esta carpeta (el `.gitignore` ya excluye `node_modules` y `dist`):
   ```bash
   git init && git add . && git commit -m "Reating en Vue"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/reating.git
   git push -u origin main
   ```
2. Entrá a https://vercel.com → **Add New… → Project** → importá el repo.
3. Vercel detecta Vite solo: *Build Command* `npm run build`, *Output Directory* `dist`. No cambies nada → **Deploy**.
4. Cada `git push` vuelve a publicar.

**Opción B — con la terminal**
```bash
npm i -g vercel
vercel          # primera vez: responde las preguntas
vercel --prod   # publicar en producción
```

`vercel.json` ya está incluido: hace que al abrir o recargar `/detalle?...` directo no dé error 404 (todas las rutas vuelven a `index.html` y Vue Router decide qué mostrar).

## 7. Cosas que conviene revisar (no se cambiaron a propósito)

1. **La API key de TMDB está dentro del código** (`src/services/tmdb.js`) y cualquiera puede verla en el navegador. Con TMDB es lo habitual en apps sin servidor y la key es gratuita, pero lo ideal es guardarla como variable de entorno: en Vercel → *Settings → Environment Variables* → `VITE_TMDB_KEY`, y en el código `API_KEY: import.meta.env.VITE_TMDB_KEY`. Si querés protegerla de verdad, hace falta una función serverless intermedia.
2. **El botón "Cargar más" nunca aparece.** Pasa igual en tu código original: en `iniciarInicio` se hace `estado.totalPaginas = 1`, así que `btnMas.hidden` siempre es `true`. Probablemente falte `estado.totalPaginas = Math.min(datos.total_pages || 1, 500)`. Está en `InicioView.vue`, función `cargar`.
