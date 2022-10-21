import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  tsconfig: 'tsconfig.json',
  minifyJs: true,
  minifyCss: true,
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: 'https://randy-r.github.io/stedux',
      prerenderConfig: './prerender.config.ts',
    },
  ],
};
