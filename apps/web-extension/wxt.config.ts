import { defineConfig } from "wxt";
import tsconfigPaths from "vite-tsconfig-paths";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tsconfigPaths()],
  }),
});
