import { i as initialize } from './ionic-global-c07767bf.js';

// import { setupConfig } from '@ionic/core';
const appGlobalScript = () => {
    // setupConfig({
    //   mode: 'ios'
    // });
};

const globalScripts = () => {
  return Promise.all([
    appGlobalScript(),
    initialize(),
  ]);
};

export { globalScripts as g };

//# sourceMappingURL=app-globals-775df27c.js.map