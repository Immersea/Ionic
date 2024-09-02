import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { d as DiveSitesService } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const popoverSearchDiveSiteCss = "popover-search-dive-site{}popover-search-dive-site ion-list{min-height:300px}";

const PopoverSearchDiveSite = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.sitesList = [];
        this.showList = [];
    }
    componentWillLoad() {
        this.sitesList = DiveSitesService.diveSitesList;
        this.popover = this.el.closest("ion-popover");
    }
    componentDidLoad() {
        this.searchBarElement = this.el.querySelector("#search-bar");
        this.searchBarElement.setFocus();
    }
    searchSites(ev) {
        const query = ev.target.value.toLowerCase();
        this.showList = this.sitesList.filter((site) => site.displayName.toLowerCase().indexOf(query) > -1);
    }
    addSite(site) {
        this.popover.dismiss(site.id);
    }
    render() {
        return (h(Host, { key: 'b9d498aee56fb7282a5882060ea950b7cd5bdf41' }, h("ion-header", { key: '2cc4bb73b572ddfa78c28ade1aa33386af154155', translucent: true }, h("ion-toolbar", { key: '34031e76ef880a97c89a3d3e561a43a1b8128673' }, h("ion-title", { key: '5715eabb01db308ee4a1b5b1a6595342cb017233' }, h("my-transl", { key: '76c82805a9f7860864839b1a765e8ab492e2920c', tag: "search", text: "Search" }))), h("ion-toolbar", { key: '5ae33636a0ebbe27776d5c96da1840b09ffa130c' }, h("ion-searchbar", { key: '1e47e500400e5a88388b8f374830d0f742232838', id: "search-bar", onIonInput: (ev) => this.searchSites(ev) }))), h("ion-content", { key: 'ace457dbc5b5e6d1a52925c53e07f5ab0d08291a' }, h("ion-list", { key: '9a34638aa37a9e59938e2953493dba0b2d7c18d7' }, this.showList.map((site) => (h("ion-item", { button: true, onClick: () => this.addSite(site) }, site.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: site.photoURL }))) : undefined, h("ion-label", null, site.displayName))))))));
    }
    get el() { return getElement(this); }
};
PopoverSearchDiveSite.style = popoverSearchDiveSiteCss;

export { PopoverSearchDiveSite as popover_search_dive_site };

//# sourceMappingURL=popover-search-dive-site.entry.js.map