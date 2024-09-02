import { r as registerInstance, h } from './index-d515af00.js';
import { E as Environment } from './env-0a7fccce.js';
import { R as RouterService } from './utils-5cd4c7bb.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const page404Css = "page-404 .logo{margin-top:30px;padding-left:40%;height:100px}";

const Page404 = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return [
            h("app-navbar", { key: '20a0e28e41b66f44fbeb92e358242f2da91d9e89', color: Environment.getAppColor(), tag: "404", text: "404" }),
            h("ion-content", { key: '234330e742e725ba4b479cb531143606940831b5' }, h("img", { key: '5b6a776dde7087264c8f95f888991f00be5546d1', class: "logo", src: "./assets/images/" + Environment.getAppLogo() }), h("ion-item", { key: 'c60197de554eaa3761f9726aa31a52b6bf3d43ae', lines: "none" }, h("ion-label", { key: '10b0dc190307cfbbdd481dd17589557d7581c415' }, h("h1", { key: '93d67414e1a68f15ce099d37037ee8b0e542a805' }, "Page Not Found"))), h("ion-item", { key: '1faaa7de04f7832657de869d1ffaf3bf43eb4292', lines: "none" }, h("ion-label", { key: '98cf8a070682dc09c44296378ad029a86f310a27' }, h("p", { key: '59eacde0890ec730dbc9b256e747b9cd84962354' }, "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."))), h("ion-item", { key: '009a2f44d869d7d5f2f33b9db797696616591754', lines: "none", button: true, onClick: () => RouterService.push("/", "root") }, h("ion-label", { key: '5fa4d8105b22831b0e8cf466f2810f91ab7e7956' }, h("a", { key: 'a9748de766b3e9b1f27d73d125293e4f27c69f67' }, "Go to Home Page")))),
        ];
    }
};
Page404.style = page404Css;

export { Page404 as page_404 };

//# sourceMappingURL=page-404.entry.js.map