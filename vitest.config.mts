import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    // jsdom em toda a suíte: os testes de hook e componente precisam de DOM.
    // Os testes de domínio e repositório continuam passando em jsdom.
    environment: "jsdom",
    pool: "vmThreads",
  },
});