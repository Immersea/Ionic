import { r as registerPlugin } from './env-0a7fccce.js';

const Browser = registerPlugin('Browser', {
    web: () => import('./web-c4cf6611.js').then(m => new m.BrowserWeb()),
});

export { Browser as B };

//# sourceMappingURL=index-698d18ee.js.map