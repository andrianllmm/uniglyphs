import { defineConfig } from "wxt";
import tsconfigPaths from "vite-tsconfig-paths";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  vite: () => ({
    plugins: [tsconfigPaths()],
  }),
  dev: {
    server: {
      port: 1234,
    },
  },
  zip: {
    zipSources: true,
  },
  manifest: ({ browser }) => ({
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },
    }),
  }),
});
