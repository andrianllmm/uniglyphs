import { defineConfig, globalIgnores } from "eslint/config";
import { config } from "@workspace/eslint-config/react-internal";

export default defineConfig([globalIgnores([".wxt", ".output"]), config]);
