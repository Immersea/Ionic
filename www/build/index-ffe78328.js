import { r as registerPlugin } from './env-9be68260.js';

const Browser = registerPlugin('Browser', {
    web: () => import('./web-4c318643.js').then(m => new m.BrowserWeb()),
});

export { Browser as B };

//# sourceMappingURL=index-ffe78328.js.map