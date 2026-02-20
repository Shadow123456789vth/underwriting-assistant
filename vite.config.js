import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // OAuth token exchange → ServiceNow directly
      '/api/servicenow-oauth': {
        target: 'https://nextgenbpmnp1.service-now.com',
        changeOrigin: true,
        rewrite: () => '/oauth_token.do',
      },
      // All table/API calls → ServiceNow directly
      '/api/servicenow-api': {
        target: 'https://nextgenbpmnp1.service-now.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL('http://x' + path);
          return url.searchParams.get('path') || '/';
        },
      }
    }
  }
})
