import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 개발 시 /api, /uploads 요청을 Spring Boot(8080)로 프록시
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080', '/uploads': 'http://localhost:8080' } },
})
