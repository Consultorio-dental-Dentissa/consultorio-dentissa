import { defineConfig, type Plugin } from 'vite'
import fs from "fs"
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * PWA sin dependencias: al terminar el build escribe en dist/sw.js el identificador de la versión y la lista de
 * archivos generados (JS, CSS, fuentes...) que el service worker guarda para funcionar sin conexión.
 */
function serviceWorkerManifest(): Plugin {
  let outDir = "dist"

  const listFiles = (dir: string, base = dir): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join("/")]
    })

  return {
    name: "service-worker-manifest",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const swPath = path.join(outDir, "sw.js")
      if (!fs.existsSync(swPath)) return

      const precache = listFiles(outDir)
        .filter((file) => file.startsWith("assets/") && !file.endsWith(".map"))
        .map((file) => `/${file}`)

      const source = fs
        .readFileSync(swPath, "utf8")
        .replace('"__BUILD_ID__"', JSON.stringify(Date.now().toString(36)))
        .replace('"__PRECACHE__"', JSON.stringify(precache))
      fs.writeFileSync(swPath, source)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    serviceWorkerManifest(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
