import { r as registerInstance, h } from './index-d515af00.js';
import { E as Environment } from './env-9be68260.js';
import { R as RouterService } from './utils-cbf49763.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const page404Css = "page-404 .logo{margin-top:30px;padding-left:40%;height:100px}";

const Page404 = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return [
            h("app-navbar", { key: 'cd4b7671b21c0636a5f4cd1e1b39e41fbde9b28c', color: Environment.getAppColor(), tag: '404', text: '404' }),
            h("ion-content", { key: '512d895a5269f226755e7f52fc3374faff6a178d' }, h("img", { key: '8f8278759e7ec1088c2c1fc0d3f516df0392f3a2', class: 'logo', src: "assets/images/" + Environment.getAppLogo() }), h("ion-item", { key: '9676ba010a43259a0fa06baec46183020b09c2c3', lines: 'none' }, h("ion-label", { key: '63aa91e28727220d788dc905e1cb3473689eee06' }, h("h1", { key: 'a22e26fec81ede57a2d8160794e33afeb7f6277a' }, "Page Not Found"))), h("ion-item", { key: '6113d2283e794ac3991cb4c83fce6811a3764375', lines: 'none' }, h("ion-label", { key: '55d1458ddcda70aae87f8d6a2aaa113228b3f38d' }, h("p", { key: '29368fac873a249aef4115480c34b5fb2aa6117e' }, "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."))), h("ion-item", { key: '4d8d8330efcc8db2b4614cb89924d27daac3fec1', lines: 'none', button: true, onClick: () => RouterService.push("/", "root") }, h("ion-label", { key: '63a10bd7f0d549bd2a28ed7245b8a230e84e0918' }, h("a", { key: '87897f0f691b5ade42f07113b7b6a9385d0826d5' }, "Go to Home Page")))),
        ];
    }
};
Page404.style = page404Css;

export { Page404 as page_404 };

//# sourceMappingURL=page-404.entry.js.map