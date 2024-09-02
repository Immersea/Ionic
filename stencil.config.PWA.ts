import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

// https://stenciljs.com/docs/config
const native = false; // CHANGE FOR NATIVE APPS to TRUE

export const config: Config = {
  outputTargets: [
    {
      type: "www",
      serviceWorker: native
        ? null
        : {
            swSrc: "src/sw.js",
          },
    },
  ],
  globalScript: "src/global/app.ts",
  globalStyle: "src/global/app.scss",
  taskQueue: "async",
  plugins: [sass()],
  devServer: {
    openBrowser: false,
  },
};
