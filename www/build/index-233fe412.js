import { r as registerPlugin } from './env-c3ad5e77.js';

const Browser = registerPlugin('Browser', {
    web: () => import('./web-f412495d.js').then(m => new m.BrowserWeb()),
});

export { Browser as B };

//# sourceMappingURL=index-233fe412.js.map