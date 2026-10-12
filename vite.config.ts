import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
export default defineConfig({base:'./', plugins:[react(),tailwindcss()], resolve:{alias:{'@catalog':fileURLToPath(new URL('./catalog',import.meta.url))}}})
