import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// El plugin de Vue permite que Vite entienda los archivos .vue
export default defineConfig({
  plugins: [vue()]
})
