import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            // Suppress verbose error logging for connection refused
            // The frontend API client handles retries
            if (err.code === 'ECONNREFUSED') {
              console.log('⚠️  Backend not ready yet (this is normal during startup)')
            } else {
              console.log('❌ Proxy error:', err.message)
            }
          })

          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Optional: Log successful proxy requests (commented out to reduce noise)
            // console.log('→ Proxying:', req.method, req.url)
          })
        },
      },
    },
  },
})
