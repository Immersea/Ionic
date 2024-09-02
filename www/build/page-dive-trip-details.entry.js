import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { a9 as DiveTripsService, U as UserService, aF as calculateColumns, a2 as mapHeight, R as RouterService } from './utils-5cd4c7bb.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { l as lodash } from './lodash-68d560b6.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const pageDiveTripDetailsCss = "page-dive-trip-details ion-segment-button{--color-checked:var(--ion-color-divetrip-contrast)}page-dive-trip-details #chat-slide{width:100%;height:100%}";

const PageDiveTripDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.markers = [];
        this.tripid = undefined;
        this.diveTrip = undefined;
        this.titles = [
            { tag: "dives" },
            { tag: "bookings" },
            { tag: "chat", disabled: true },
        ];
        this.slider = undefined;
        this.userId = undefined;
        this.columns = {
            sm: 12,
            md: 6,
            lg: 4,
        };
        this.showChat = false;
        this.updateView = false;
    }
    async componentWillLoad() {
        this.diveTrip = await DiveTripsService.getDiveTrip(this.tripid);
        this.userSub = UserService.userProfile$.subscribe((user) => {
            this.userId = user && user.uid ? user.uid : null;
            this.showChatSlide();
        });
        this.userId =
            UserService.userProfile && UserService.userProfile.uid
                ? UserService.userProfile.uid
                : null;
        this.columns = calculateColumns(this.diveTrip.tripDives.length);
    }
    showChatSlide() {
        this.showChat = false;
        if (this.diveTrip && this.diveTrip.chatId) {
            this.showChat = this.diveTrip.organiser.id === this.userId; //user is organiser
            this.showChat =
                this.showChat || lodash.exports.isArray(this.diveTrip.users[this.userId]); //user is in the team
            this.diveTrip.tripDives.map((tripDive) => {
                tripDive.bookings.map((booking) => {
                    this.showChat =
                        this.showChat ||
                            (booking.uid === this.userId && booking.confirmedOrganiser); //user is confirmed in the bookings
                });
            });
            this.titles[2].disabled = !this.showChat;
        }
    }
    setChatHeigth() {
        const slideContainer = this.el.querySelector("#chat-slide");
        slideContainer.setAttribute("style", "height: " + mapHeight(null) + "px");
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-trip", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: true,
            autoHeight: true,
        });
    }
    disconnectedCallback() {
        this.userSub.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '8fe8b3b22a193af73fd07d2bb2b587f919cf58d2' }, h("ion-toolbar", { key: 'dcec1b773d229544ecf6283bd1717b2333e193e3', color: "divetrip" }, h("ion-buttons", { key: 'ccc81a85368dd5e072f399218738a6daf5871a3f', slot: "start" }, h("ion-button", { key: '51baa92b330133fb24f86c5d6e8813c92b12a57a', onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { key: 'e3e57409e1fa2ff98e9ea54876371eabf4fe4fc9', name: "arrow-back" }))), h("ion-title", { key: 'abf3d89f9361226285ae5f50e900116262c7e029' }, this.diveTrip.displayName))),
            h("app-header-segment-toolbar", { key: '64e2a377ee1175ec392b2fb71b183b49538e0f23', color: "divetrip", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: '20de4c371f55d00807b6e179c42c706ca49e5123', class: "slides" }, h("swiper-container", { key: '4d533b390c164e5f2a69b95930067ae19f871c13', class: "slider-dive-trip swiper" }, h("swiper-wrapper", { key: '1d1d43ccbc4fc83574f10cebbc6d2f2c85378964', class: "swiper-wrapper" }, h("swiper-slide", { key: '34c04edfaabdb1add0019ee1d282357c426ff214', class: "swiper-slide" }, h("ion-grid", { key: '3e947a90f6e2c25ab33948bc6be8df46d06f860e' }, h("ion-row", { key: 'af4203fd776f96cd0d473c10f4a0c281627f57d8', class: "ion-text-start" }, this.diveTrip.tripDives.map((trip) => (h("ion-col", { "size-sm": this.columns.sm, "size-md": this.columns.md, "size-lg": this.columns.lg }, h("app-dive-trip-card", { tripDive: trip }))))))), h("swiper-slide", { key: '62084517bf1c3722432aadac5b4d1d56a1931af5', class: "swiper-slide" }, h("ion-grid", { key: 'c624e2e9eb604dfcbac71e3372e45255930f137b' }, h("ion-row", { key: '0285611eb36d931f6bb0397f27668aec7e901506', class: "ion-text-start" }, !this.userId ? (h("div", { style: {
                    marginTop: "10%",
                    marginLeft: "auto",
                    marginRight: "auto",
                } }, h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, h("my-transl", { tag: "please-login", text: "Please login to view this page" })))))) : (Object.keys(this.diveTrip.tripDives).map((i) => (h("ion-col", { "size-sm": this.columns.sm, "size-md": this.columns.md, "size-lg": this.columns.lg }, h("app-dive-trip-bookings", { diveTrip: this.diveTrip, diveTripId: this.tripid, tripDiveIndex: lodash.exports.toNumber(i) })))))))), this.showChat ? (h("swiper-slide", { class: "swiper-slide" }, h("app-chat", { id: "chat-slide", chatId: this.diveTrip.chatId }))) : undefined))),
        ];
    }
    get el() { return getElement(this); }
};
PageDiveTripDetails.style = pageDiveTripDetailsCss;

export { PageDiveTripDetails as page_dive_trip_details };

//# sourceMappingURL=page-dive-trip-details.entry.js.map