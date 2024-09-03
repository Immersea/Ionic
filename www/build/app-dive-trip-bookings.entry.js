import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { U as UserService, T as TranslationService, a9 as DiveTripsService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import { d as dateFns } from './index-9b61a50b.js';
import { E as Environment } from './env-9be68260.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const appDiveTripBookingsCss = "app-dive-trip-bookings{width:100%;height:100%}";

const AppDiveTripBookings = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.availableSpots = [];
        this.diveTrip = undefined;
        this.diveTripId = undefined;
        this.tripDiveIndex = undefined;
        this.editable = false;
        this.isEditing = false;
        this.segment = 0;
        this.tripDive = undefined;
        this.bookingsList = undefined;
        this.waitingRequest = false;
        this.updateView = false;
        this.userBooking = undefined;
    }
    componentWillLoad() {
        this.tripDive = this.diveTrip.tripDives[this.tripDiveIndex];
        this.userSub = UserService.userProfile$.subscribe((user) => {
            this.userId = user && user.uid ? user.uid : null;
            this.updateBookingsList();
        });
        this.userId =
            UserService.userProfile && UserService.userProfile.uid
                ? UserService.userProfile.uid
                : null;
        this.updateBookingsList();
        this.segmentTitles = {
            notinterested: TranslationService.getTransl("not-interested", "Not Interested"),
            interested: TranslationService.getTransl("interested", "Interested"),
            attend: TranslationService.getTransl("attend", "Attend"),
        };
    }
    disconnectedCallback() {
        this.userSub.unsubscribe();
    }
    async updateBookingsList() {
        this.bookingsList = [];
        this.availableSpots = [];
        this.usersList = [];
        let bookings = lodash.exports.orderBy(this.tripDive.bookings, ["team"]);
        //reset team numbers starting from 0
        let teamCount = 0;
        let currentTeam = bookings[0] && bookings[0].team ? bookings[0].team : 0; //normally 0 - if >0 then bring it back to 0
        bookings.map((booking) => {
            if (booking.team > currentTeam) {
                teamCount++;
                currentTeam = booking.team;
            }
            booking.team = teamCount;
        });
        //reset bookings
        this.tripDive.bookings = bookings;
        currentTeam = -1;
        console.log("this.tripDive", this.tripDive);
        for (let booking of bookings) {
            if (booking.team > currentTeam) {
                this.bookingsList.push(booking.team);
                currentTeam = booking.team;
            }
            let listItem = Object.assign(Object.assign({}, booking), { user: await UserService.getMapDataUserDetails(booking.uid) });
            this.bookingsList.push(listItem);
            if (this.userId && booking.uid === this.userId) {
                this.userBooking = booking;
            }
        }
        let confirmedBookings = 0;
        this.tripDive.bookings.map((booking) => {
            if (booking.confirmedOrganiser) {
                confirmedBookings++;
            }
        });
        for (let index = 0; index < this.tripDive.numberOfParticipants - confirmedBookings; index++) {
            this.availableSpots.push(0);
        }
        this.updateView = !this.updateView;
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.segment = lodash.exports.toNumber(ev.detail.value);
        }
    }
    async addBooking(ev) {
        const confirmedUser = ev.detail.value == "true"
            ? true
            : ev.detail.value == "false"
                ? false
                : null;
        let booking = this.userBooking
            ? this.userBooking
            : {
                role: "diver",
                team: 0,
                uid: this.userId,
                confirmedUser: confirmedUser,
                confirmedOrganiser: false,
            };
        try {
            this.waitingRequest = true;
            const bookings = await DiveTripsService.sendBookingRequest(this.diveTripId, this.tripDiveIndex, booking.role, booking.team, booking.uid, confirmedUser, booking.confirmedOrganiser);
            this.waitingRequest = false;
            this.tripDive.bookings = bookings;
            this.updateBookingsList();
        }
        catch (error) {
            this.waitingRequest = false;
        }
    }
    updateBooking(i, ev) {
        const search = this.bookingsList[i];
        const item = this.tripDive.bookings.find((booking) => booking.uid === search.uid);
        item.confirmedOrganiser =
            ev.detail.value == "true"
                ? true
                : ev.detail.value == "false"
                    ? false
                    : null;
    }
    editBookings() {
        this.isEditing = true;
    }
    saveBookings() {
        this.isEditing = false;
        this.updateBookingsList();
    }
    addTeam() {
        //count number of teams
        let teams = 0;
        this.bookingsList.map((booking) => {
            if (lodash.exports.isNumber(booking))
                teams = booking;
        });
        this.bookingsList.push(teams + 1);
        this.updateView = !this.updateView;
    }
    reorderTeams(ev) {
        const from = ev.detail.from; //starting position
        const to = ev.detail.to; //end position
        //find original item
        const search = this.bookingsList[from];
        const item = this.tripDive.bookings.find((booking) => booking.uid === search.uid);
        //find new position on bookingsList
        let found = false;
        let team = 0;
        this.bookingsList.map((booking, i) => {
            //set current team number
            if (lodash.exports.isNumber(booking))
                team = booking;
            if (to <= i && !found) {
                item.team = team;
                found = true;
            }
        });
        this.bookingsList = ev.detail.complete(this.bookingsList);
    }
    render() {
        return (h("ion-card", { key: '76263d805c0a31519dc74bcf0d0edb800d0301df' }, h("ion-card-header", { key: '460128bb1071b2d2c540ac07f974fecc1c9950d7' }, h("ion-card-title", { key: '41d09eba2bd8796114516c7847ba8c6360188357' }, h("ion-item", { key: '64d7a5565f297e570e62079823903ab30bdd3642', class: "ion-no-padding", lines: "none" }, h("ion-label", { key: 'f4cad6f5f24a0268426b727f85dcccd47688e754' }, dateFns.format(this.tripDive.divePlan.dives[0].date, "PP")))), h("ion-card-subtitle", { key: '2f9234c5e4f30985d3c7b0412f28ce02a77b69b4' }, h("ion-item", { key: 'f8bdbe7dcbf57e29edee9ec05a8d579782380e88', class: "ion-no-padding", lines: "none" }, h("ion-label", { key: '29993b11f7bfc3ab25429057cc7ced921ad44d4a' }, this.tripDive.divePlan.title +
            " -> " +
            TranslationService.getTransl("max-participants", "Max xxx participants", { xxx: this.tripDive.numberOfParticipants })), this.editable &&
            this.tripDive.bookings &&
            this.tripDive.bookings.length > 0 ? (!this.isEditing ? (h("ion-button", { slot: "end", onClick: () => this.editBookings() }, h("my-transl", { tag: "edit", text: "Edit" }))) : ([
            h("ion-button", { slot: "end", onClick: () => this.addTeam() }, h("my-transl", { tag: "add-team", text: "Add Team" })),
            h("ion-button", { slot: "end", onClick: () => this.saveBookings() }, h("my-transl", { tag: "save", text: "Save" })),
        ])) : undefined))), h("ion-card-content", { key: '9bfa24936166728f467749b2e5b6ff266c6226c1' }, !this.editable ? (h("ion-segment", { mode: "ios", color: Environment.getAppColor(), disabled: this.waitingRequest, onIonChange: (ev) => this.addBooking(ev), value: this.userBooking
                ? this.userBooking.confirmedUser.toString()
                : "" }, h("ion-segment-button", { value: "", layout: "icon-start" }, h("ion-icon", { name: "close-outline" }), h("ion-label", null, this.segmentTitles.notinterested)), h("ion-segment-button", { value: "false", layout: "icon-start" }, h("ion-icon", { name: "help-outline" }), h("ion-label", null, this.segmentTitles.interested)), h("ion-segment-button", { value: "true", layout: "icon-start" }, h("ion-icon", { name: "checkmark-outline" }), h("ion-label", null, this.segmentTitles.attend)))) : undefined, h("ion-list", { key: '1dafd0f6d08f139d468a15914bcc155568ba80a7' }, h("ion-reorder-group", { key: '1f87f2962be0c80ba9ab8283ca2d6de3592e75b9', disabled: !this.isEditing, onIonItemReorder: (ev) => this.reorderTeams(ev) }, this.waitingRequest && !this.userBooking ? (h("app-skeletons", { skeleton: "diveTripBooking" })) : undefined, this.bookingsList.map((booking, k) => lodash.exports.isNumber(booking) ? (h("ion-item-divider", null, h("ion-label", null, "Team ", booking + 1))) : booking.uid == this.userId && this.waitingRequest ? (h("app-skeletons", { skeleton: "diveTripBooking" })) : (h("ion-item", null, !this.isEditing && booking.user.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: booking.user.photoURL }))) : (h("ion-reorder", { slot: "start" })), h("ion-label", null, booking.user.displayName), booking.confirmedUser ? (h("ion-icon", { slot: "end", color: "success", name: "checkmark-outline" })) : (h("ion-icon", { slot: "end", color: "warning", name: "help-outline" })), !this.isEditing ? (booking.confirmedOrganiser ? (h("ion-icon", { slot: "end", color: "success", name: "checkmark-outline" })) : (h("ion-icon", { slot: "end", color: "warning", name: "help-outline" }))) : (h("ion-segment", { style: {
                maxWidth: "40%",
                marginLeft: "15%",
            }, slot: "end", mode: "ios", color: Environment.getAppColor(), onIonChange: (ev) => this.updateBooking(k, ev), value: booking.confirmedOrganiser.toString() }, h("ion-segment-button", { value: "" }, h("ion-icon", { color: "danger", name: "close-outline" })), h("ion-segment-button", { value: "false" }, h("ion-icon", { color: "warning", name: "help-outline" })), h("ion-segment-button", { value: "true" }, h("ion-icon", { color: "success", name: "checkmark-outline" })))))))), this.availableSpots.map(() => (h("ion-item", null, h("ion-icon", { slot: "start", name: "person-add-outline" }), h("ion-label", null, h("my-transl", { tag: "available", text: "Available" })))))))));
    }
    get el() { return getElement(this); }
};
AppDiveTripBookings.style = appDiveTripBookingsCss;

export { AppDiveTripBookings as app_dive_trip_bookings };

//# sourceMappingURL=app-dive-trip-bookings.entry.js.map