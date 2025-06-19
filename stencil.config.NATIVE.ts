import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import { nodeResolve } from "@rollup/plugin-node-resolve";

// https://stenciljs.com/docs/config

export const config: Config = {
  outputTargets: [
    {
      type: "www",
      serviceWorker: null,
    },
  ],
  globalScript: "src/global/app.ts",
  globalStyle: "src/global/app.scss",
  taskQueue: "async",
  plugins: [sass()],
  rollupPlugins: {
    before: [nodeResolve({ browser: true, preferBuiltins: true })],
  },
  devServer: {
    openBrowser: false,
  },
};
