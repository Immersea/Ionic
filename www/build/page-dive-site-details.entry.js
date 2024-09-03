import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { d as DiveSitesService, a9 as DiveTripsService, e as DIVESITESCOLLECTION, E as UDiveFilterService, c as DIVECENTERSSCOLLECTION, U as UserService, a2 as mapHeight, R as RouterService, ax as fabButtonTopMarginString } from './utils-ced1e260.js';
import { S as Swiper } from './swiper-a30cd476.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-c3ad5e77.js';
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
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const pageDiveSiteDetailsCss = "page-dive-site-details{}";

const PageDiveSiteDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.markers = [];
        this.siteid = undefined;
        this.diveSite = undefined;
        this.diveTrips = undefined;
        this.divingCenters = undefined;
        this.titles = [
            { tag: "map" },
            { tag: "information" },
            { tag: "dive-profiles" },
            { tag: "diving-centers" },
            { tag: "next-trips", text: "Next Dive Trips" },
        ];
        this.segment = 0;
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.diveSite = await DiveSitesService.getDiveSite(this.siteid);
        this.diveTrips = await DiveTripsService.getTripsSummary(DIVESITESCOLLECTION, this.siteid);
        this.divingCenters = DiveSitesService.loadSiteDivingCenters(this.diveSite);
        let siteIcon = UDiveFilterService.getMapDocs()[DIVESITESCOLLECTION]
            .icon;
        siteIcon.size = "large";
        let dcIcon = UDiveFilterService.getMapDocs()[DIVECENTERSSCOLLECTION]
            .icon;
        dcIcon.size = "small";
        this.markers.push({
            icon: siteIcon,
            latitude: this.diveSite.position.geopoint.latitude,
            longitude: this.diveSite.position.geopoint.longitude,
        });
        this.divingCenters.siteDivingCenters.forEach((center) => {
            this.markers.push({
                name: center.displayName,
                icon: dcIcon,
                latitude: center.position.geopoint.latitude,
                longitude: center.position.geopoint.longitude,
            });
        });
        this.userRoles = UserService.userRoles;
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-site", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.diveSite) + "px"); //-cover photo -slider  - title
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
            //add dive sites lines
            this.setLinesForDiveSite();
        });
        //add dive sites lines
        this.setLinesForDiveSite();
        this.mapElement.triggerMapResize();
        if (DiveSitesService.showNewDivePlans) {
            this.segment = 2;
        }
        else {
            this.segment = 0;
        }
    }
    setLinesForDiveSite() {
        this.mapElement.triggerMapResize();
        const pointsArray = [this.diveSite];
        this.divingCenters.siteDivingCenters.forEach(async (center) => {
            pointsArray.push(center);
            this.mapElement["createLine"](center.id, this.diveSite, center);
        });
        this.mapElement["fitToBounds"](pointsArray);
    }
    render() {
        return [
            h("ion-header", { key: 'ffe968420fea836a65769535c30aa57a2204dc5f' }, h("app-item-cover", { key: '5a7ac4199640bf2809f59b07688a61ad1f7e8df7', item: this.diveSite })),
            h("ion-header", { key: '5a8504f256407fd5b4c7763088d9a0b19b04319a' }, h("ion-toolbar", { key: '0b6835741e7fa895068050f6c49623f9cc83fc28', color: "divesite", class: "no-safe-padding" }, this.diveSite && !this.diveSite.coverURL ? (h("ion-buttons", { slot: "start" }, h("ion-button", { onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { name: "arrow-back" })))) : undefined, h("ion-title", { key: '761819bb2f07fdca5b4cff6f0a09779277713ebc' }, this.diveSite.displayName))),
            h("app-header-segment-toolbar", { key: '08a9fb788f40e93a03aee15dc5c81bd39e3f4163', color: "divesite", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: '6928c5dce3d1ba25f6446ddd617fe7f6e5920290', class: "slides" }, h("ion-fab", { key: 'ac804f879389765d2f4310bf5e30064417741f56', vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { key: 'bedfa77373a5fc3b554f57918735b85b112f6113', onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { key: 'c1b8f3984d944f2ed750ca446140dc344b216cbb', name: "arrow-back-circle-outline" }))), h("swiper-container", { key: '0f656a2b7dfd2bd9ad718e934eda7ed4e476abb9', class: "slider-dive-site swiper" }, h("swiper-wrapper", { key: 'edbd3dc97e03d0b171c00719b543232e6a96361d', class: "swiper-wrapper" }, h("swiper-slide", { key: '2221b2d35225134231696ef6565331cc127a094d', class: "swiper-slide" }, h("ion-list", { key: '416af18960e2108edc1f47462ab76118c5a6f261', class: "ion-no-padding" }, h("ion-list-header", { key: '4c69e8056d164944114086fbea2c4f3437e53375' }, h("ion-label", { key: 'a9ed0d779b33a6510235a57ab85af39d525cc51e', color: "divesite" }, h("my-transl", { key: '071098e7869bbdb98632c4938fd76bf0faa40a37', tag: "general-information", text: "General Information" }))), h("ion-item", { key: '9da2dc72682f0e1e07fc98135126d80fdc6c614d' }, h("ion-label", { key: '33ea322b2233e028798118979fa7d572956f83e1', class: "ion-text-wrap" }, h("ion-text", { key: '37ecbd453074b7f7e7e4eb9f5f7e51a695908a6a', color: "divesite" }, h("h3", { key: 'b207d01eb825d90092ed215b5024b1197f730734' }, h("my-transl", { key: 'c84dc8f00b687eab3126f30e9f859c4aba30192c', tag: "site-type", text: "Site Type" }))), h("ion-text", { key: 'ed85cca4fa59d171d651a732f47b6f2bd88f5af0', color: "dark" }, h("p", { key: 'c57ee1382f2a645e335a38bd8862b359ab81d8ce' }, DiveSitesService.getSiteTypeName(this.diveSite.type))))), h("ion-item", { key: '144adfd983a1a36d78eb2b01693805716e9915da' }, h("ion-label", { key: '87779a7fa3d70dcab78634a9baa5758e0da29a8f', class: "ion-text-wrap" }, h("ion-text", { key: '387e15cef0a27337baa78da61345ab500b1e9884', color: "dark" }, h("p", { key: '22767f832e58d4b3d870cac8b8f7165193911c21' }, this.diveSite.description)))), h("ion-list-header", { key: '62fdc3c1a8be7dbfc090d97a71167aaee06b6a58' }, h("ion-label", { key: 'd28b78872e6bc64335aad9dd32078fb66123389a', color: "divesite" }, h("my-transl", { key: '88d82938002744a121c328508fbd45a4adbf05fa', tag: "site-details", text: "Site Details" }))), h("ion-item", { key: '2f0fd00a95214fd44a627fc21d8938aa23ae51c0' }, h("ion-label", { key: '29506d06629c5da227e5c99a55aa515b151049e4', class: "ion-text-wrap" }, h("ion-text", { key: '62939bc3b80967c788d85f0a58b195554efab201', color: "divesite" }, h("h3", { key: '6e8a3d34b9857725739b985a0295a1b903b5cff2' }, h("my-transl", { key: 'bb1c9d28447775e3729b112737711d9e1463a512', tag: "entry-type", text: "Entry Type" }))), h("ion-text", { key: '2b223d2d194ede9ac30cf9d72b432f83bbedaf90', color: "dark" }, h("p", { key: 'e9d9c477959915770676962a4f900e8116691f29' }, DiveSitesService.getEntryTypeName(this.diveSite.information.entryType))))), h("ion-grid", { key: '561b311820e86761e2802157e6f4d67b3207d3ff', class: "ion-no-padding" }, h("ion-row", { key: '3739de91ac0a8a8f6f1c0cb95d285c513c7479db' }, h("ion-col", { key: '0bc317fc49da04601b00755f6105fe8f07b2d048' }, h("ion-item", { key: '2e32144ab0a3e2e87ea20026715e7e658a71cf3a' }, h("ion-label", { key: 'd3324eda49f1d20b7293e46f0883e02c4a0cba9a', class: "ion-text-wrap" }, h("ion-text", { key: '413622c7c99a2f1a718af2db26d2606b2e212035', color: "divesite" }, h("h3", { key: '96577dde5e60618953f60a3db29563223fdffb41' }, h("my-transl", { key: 'e5f8106716c2d2fbd5501552944cffb05836ae89', tag: "min-depth", text: "Min. Depth" }))), h("ion-text", { key: '7a061a4b86c23687e8325320393ca1895182b9f4', color: "dark" }, h("p", { key: 'bcb5f02c9aa59214a9b715f9a2a48c9aaf7de636' }, this.diveSite.information.minDepth, " m"))))), h("ion-col", { key: '528d8b36a0202b3fd4e03a2688faa8f33828b6fc' }, h("ion-item", { key: 'd40225ca543efcad344fc26399df996a6c5673e8' }, h("ion-label", { key: '51f21d7a45c87ba42ccf3e9a8b85880151fbadb9', class: "ion-text-wrap" }, h("ion-text", { key: 'e23f9099f3b886a1d6fe555e989ed8cefc375732', color: "dark" }, h("ion-text", { key: '2aa08041b73b02c852f4a2f1eb5b70916faecb03', color: "divesite" }, h("h3", { key: '20d1aaaada20323b3afe8ee6312264806b2a4dae' }, h("my-transl", { key: '50409b7afc8d10e5e199b8b91e5e3c5bc2a38f9c', tag: "max-depth", text: "Max. Depth" }))), h("p", { key: 'c3104a4fe16ea758ec49173dc381d61fa44d86e1' }, this.diveSite.information.maxDepth, " m"))))))), h("ion-item", { key: '65f85f2695325b4a092a988122deaa67aa50eae5' }, h("ion-label", { key: 'e66d265c447ad76835d8fd274ab532d1566878ec', class: "ion-text-wrap" }, h("ion-text", { key: '861e0ffc20051644b47b21c1a61da467a9f5b802', color: "divesite" }, h("h3", { key: 'cde607a8e711178898a0881de06fb2c7272f0ce1' }, h("my-transl", { key: '6ccf64787a41b49a4b72bbec61fa75a8a4847add', tag: "avg-vis", text: "Average Visibility" }))), h("ion-text", { key: '7929acdb2fe1e3a6f43a66829e2ea40f25a69ae9', color: "dark" }, h("p", { key: 'a24bf1ead2204a4ec9e070dc8e540e3795bbc9f6' }, this.diveSite.information.avgViz, " m")))), h("ion-list-header", { key: '9b2e3129e2f15e451c4c5f9da5771d8051811780' }, h("ion-label", { key: '12d96dba4fddee4b1108109341ae2f4834c411ba', color: "divesite" }, h("my-transl", { key: '36e932e5f86e980379c2abf69331e2d8e185c895', tag: "water-temp", text: "Water Temperature" }))), h("ion-grid", { key: 'ecea95c998025ef7fb25626deea3f0956c576e0e', class: "ion-no-padding" }, h("ion-row", { key: '6df7764edac376b1aa0d806c86c8664e88ffc3c0' }, h("ion-col", { key: 'd5d3954ec1c9e8e7148d0a71bc12b6563584af0e' }, h("ion-item", { key: '5b71839665b9eb097fa5c33804b2142b8c620719' }, h("ion-label", { key: '83f90e449b277fad3f32ca6f4ee5623ff976e27e', class: "ion-text-wrap" }, h("ion-text", { key: 'b3aec0ae8be651db3c29d991726e9a452cdea46c', color: "divesite" }, h("h3", { key: 'ba5250b99f14ca79250334f69e4aff9d0ee70ad6' }, h("my-transl", { key: '619e7d80895eb612afc1da9020c06792ab5d5d24', tag: "spring", text: "Spring" }))), h("ion-text", { key: 'aa525ae542193d004f7cb36a61d7e0217ca48758', color: "dark" }, h("p", { key: '45af146611772d7954e43dc17c4d47b6788d814c' }, this.diveSite.information.waterTemp.spring, " \u00B0C"))))), h("ion-col", { key: '47bb74c79891e38009c5f583b169cd920b5edc50' }, h("ion-item", { key: '2a05505d53e7f45b9beae7ccc32078d9febdaf9b' }, h("ion-label", { key: '8aacf8ddc2ae482facd2c360f4e24c2f1f92f515', class: "ion-text-wrap" }, h("ion-text", { key: 'e4f19660903db7e62e0d326286a87cf73e60baa2', color: "divesite" }, h("h3", { key: 'd70d055f1f6229c822697f91dc10be50bcbe61ed' }, h("my-transl", { key: 'b0d25143a325be9b400a58f5ec34c23036082498', tag: "summer", text: "Summer" }))), h("ion-text", { key: '78551221b22661a68811033ab1fc31cf67840b95', color: "dark" }, h("p", { key: '30ecde865c63fcc5a30318d052e93b3c0bca8ac6' }, this.diveSite.information.waterTemp.summer, " \u00B0C")))))), h("ion-row", { key: '6a6284f2a6f1068ae3f89e8305c9830f413819f9' }, h("ion-col", { key: 'ac1bd2bbeba2c68039e8369633a4778fbb1680b4' }, h("ion-item", { key: '5cbe3b6edda374aeb08e3f3b9aa3992a43964098' }, h("ion-label", { key: '4b5719eecb1293c79bdba8633231a6505d7df7c7', class: "ion-text-wrap" }, h("ion-text", { key: 'c9bbd4f044a882a21329c17b83a59ca906e791d5', color: "divesite" }, h("h3", { key: '536db3dd196c5a87262e5c76f8f5c1038adbb28d' }, h("my-transl", { key: '3993e32edd8e63624f388e9838923e7901e2550d', tag: "autumn", text: "Autumn" }))), h("ion-text", { key: '918b3a5a7c6aa40daf41560c9ca07f8b0d21001b', color: "dark" }, h("p", { key: '764c5924f241d7ac2ce10f674c92ed909d32c144' }, this.diveSite.information.waterTemp.autumn, " \u00B0C"))))), h("ion-col", { key: 'd6794c3ceee8825cdcc4f6b816f743b5f8c61c49' }, h("ion-item", { key: '04f32af2f5c328acb0b2f7f785446a1fc7022a8f' }, h("ion-label", { key: '3250449562723b58083477344ba874bec3089a24', class: "ion-text-wrap" }, h("ion-text", { key: '6d78ee262164785b03317cc93a2c6ae53e00cfbf', color: "divesite" }, h("h3", { key: 'b65b7d7410df639aa7c2cf35efeeca28ea8228a7' }, h("my-transl", { key: '7d6dfd9b4a48565500c569a6b078d910cf34cb7b', tag: "winter", text: "Winter" }))), h("ion-text", { key: 'b161cc804371f2cc1e7f2550941e530d8a80c113', color: "dark" }, h("p", { key: '9b2eddb367c52ecddb2e3471ae5113876618b607' }, this.diveSite.information.waterTemp.winter, " \u00B0C"))))))), this.diveSite.information.seabedComposition ? (h("ion-item", null, h("ion-label", { class: "ion-text-wrap" }, h("ion-text", { color: "divesite" }, h("h3", null, h("my-transl", { tag: "seabed-comp", text: "Seabed Composition" }))), h("ion-text", { color: "dark" }, this.diveSite.information.seabedComposition.map((comp) => (h("p", null, DiveSitesService.getSeabedCompositionName(comp)))))))) : undefined, this.diveSite.information.seabedCover ? (h("ion-item", null, h("ion-label", { class: "ion-text-wrap" }, h("ion-text", { color: "divesite" }, h("h3", null, h("my-transl", { tag: "seabed-cover", text: "Seabed Cover" }))), h("ion-text", { color: "dark" }, this.diveSite.information.seabedCover.map((comp) => (h("p", null, DiveSitesService.getSeabedCoverName(comp)))))))) : undefined)), h("swiper-slide", { key: '164d08e2d69868cc3d5244aec7a9b22e535a977b', class: "swiper-slide" }, h("div", { key: '87db3e94650a10ee14d02fd289aae56999d772aa', id: "map-container" }, h("app-map", { key: '72d77cf4cf530ac6f9768e3a362713e3e3d092a9', id: "map", pageId: "dive-site-details", center: this.diveSite, markers: this.markers }))), h("swiper-slide", { key: '011bacf2591f96b48da9744f22c69885f7001a29', class: "swiper-slide" }, h("ion-grid", { key: '5dcfc60ddebc4ef71fabc29d8ea55a098d34a46e' }, h("ion-row", { key: '85280b044536cf3e754cb8a0c27a961f4a076f81', class: "ion-text-start" }, this.diveSite.divePlans.map((plan) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-plan-card", { divePlan: plan, edit: false }))))))), h("swiper-slide", { key: 'e0b28ba91bbca47796e76550556d959630983e3f', class: "swiper-slide" }, h("ion-grid", { key: '986eff7dda685dc237eb6f05e636306133bd588a' }, h("ion-row", { key: 'e2a188412141ed63691df9ee980f661038d14605', class: "ion-text-start" }, this.diveSite.divingCenters.map((dcId) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-diving-center-card", { divingCenterId: dcId, startlocation: this.diveSite }))))))), h("swiper-slide", { key: '9cda53fd461ad2eabfeca21e6f7c0826016079dd', class: "swiper-slide" }, h("app-calendar", { key: '913e92fe0e15c4487b9100361b58065ef44ac4d8', calendarId: "dive-site-calendar", addEvents: { trips: this.diveTrips } }))))),
        ];
    }
    get el() { return getElement(this); }
};
PageDiveSiteDetails.style = pageDiveSiteDetailsCss;

export { PageDiveSiteDetails as page_dive_site_details };

//# sourceMappingURL=page-dive-site-details.entry.js.map