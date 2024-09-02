import { r as registerInstance, l as createEvent, h, j as Host } from './index-d515af00.js';
import { aY as reverseGeocode } from './utils-5cd4c7bb.js';
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

const appCoordinatesCss = "app-coordinates{width:100%;height:100%}";

const AppCoordinates = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.coordinatesEmit = createEvent(this, "coordinatesEmit", 7);
        this.addressEmit = createEvent(this, "addressEmit", 7);
        this.coordinates = undefined;
        this.DMSCoordinates = undefined;
        this.location = undefined;
    }
    updateCoords() {
        this.convertFromDecimals();
    }
    componentWillLoad() {
        this.convertFromDecimals();
    }
    decimalCoordinatesHandler(event) {
        this.coordinates[event.detail.name] = lodash.exports.toNumber(event.detail.value);
    }
    DMSCoordinatesHandler(event) {
        switch (event.detail.name) {
            case "latitude-degrees":
                this.DMSCoordinates.lat.degrees = lodash.exports.toNumber(event.detail.value);
                break;
            case "latitude-minutes":
                this.DMSCoordinates.lat.minutes = lodash.exports.toNumber(event.detail.value);
                break;
            case "latitude-seconds":
                this.DMSCoordinates.lat.seconds = lodash.exports.toNumber(event.detail.value);
                break;
            case "longitude-degrees":
                this.DMSCoordinates.lon.degrees = lodash.exports.toNumber(event.detail.value);
                break;
            case "longitude-minutes":
                this.DMSCoordinates.lon.minutes = lodash.exports.toNumber(event.detail.value);
                break;
            case "longitude-seconds":
                this.DMSCoordinates.lon.seconds = lodash.exports.toNumber(event.detail.value);
                break;
        }
        this.convertToDecimals();
    }
    convertFromDecimals() {
        if (this.coordinates && this.coordinates.lat) {
            const lat = this.coordinates.lat;
            const lat_degree = Math.trunc(lat);
            const lat_minutesdecimal = (lat - lat_degree) * 60;
            const lat_minutes = Math.trunc(lat_minutesdecimal);
            const lat_seconds = Math.round((lat_minutesdecimal - lat_minutes) * 60);
            const lon = this.coordinates.lon;
            const lon_degree = Math.trunc(lon);
            const lon_minutesdecimal = (lon - lon_degree) * 60;
            const lon_minutes = Math.trunc(lon_minutesdecimal);
            const lon_seconds = Math.round((lon_minutesdecimal - lon_minutes) * 60);
            this.DMSCoordinates = {
                lat: {
                    degrees: lat_degree,
                    minutes: lat_minutes,
                    seconds: lat_seconds,
                },
                lon: {
                    degrees: lon_degree,
                    minutes: lon_minutes,
                    seconds: lon_seconds,
                },
            };
            this.reverseGeocode();
        }
    }
    convertToDecimals() {
        if (this.DMSCoordinates && this.DMSCoordinates.lat) {
            const lat = this.DMSCoordinates.lat.degrees +
                this.DMSCoordinates.lat.minutes / 60 +
                this.DMSCoordinates.lat.seconds / 3600;
            const lon = this.DMSCoordinates.lon.degrees +
                this.DMSCoordinates.lon.minutes / 60 +
                this.DMSCoordinates.lon.seconds / 3600;
            this.coordinates.lat = lat;
            this.coordinates.lon = lon;
            this.reverseGeocode();
        }
    }
    async reverseGeocode() {
        //set timer for geocode - wait until draggable marker is fixed or coordinates are written
        this.timer = 2000;
        this.countdown();
    }
    async executeReverseGeocode() {
        this.location = await reverseGeocode(this.coordinates.lat, this.coordinates.lon);
        this.addressEmit.emit(this.location);
    }
    countdown() {
        const timer = setTimeout(() => {
            this.timer -= 1;
            if (this.timer == 0) {
                this.executeReverseGeocode();
            }
            else {
                clearTimeout(timer);
                this.countdown();
            }
        }, 1);
    }
    coordinatesUpdated() {
        this.coordinatesEmit.emit(this.coordinates);
    }
    render() {
        return (h(Host, { key: '5f9e7a665fe6cfccd9235fad88a3e1477b2c5672' }, this.coordinates &&
            this.coordinates.lat &&
            this.DMSCoordinates &&
            this.DMSCoordinates.lat ? (h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("app-form-item", { "label-tag": "latitude", "label-text": "Latitude", value: lodash.exports.toString(this.coordinates.lat), name: "lat", "input-type": "number", onFormItemChanged: (ev) => this.decimalCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: -90, max: 90 },
                },
            ] })), h("ion-col", null, h("ion-row", null, h("ion-col", null, h("app-form-item", { "label-tag": "degrees", "label-text": "Degrees", value: lodash.exports.toString(this.DMSCoordinates.lat.degrees), name: "latitude-degrees", "input-type": "number", onFormItemChanged: (ev) => this.DMSCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: -90, max: 90 },
                },
            ] })), h("ion-col", null, h("app-form-item", { "label-tag": "minutes", "label-text": "Minutes", value: lodash.exports.toString(Math.abs(this.DMSCoordinates.lat.minutes)), name: "latitude-minutes", "input-type": "number", onFormItemChanged: (ev) => this.DMSCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 60 },
                },
            ] })), h("ion-col", null, h("app-form-item", { "label-tag": "seconds", "label-text": "Seconds", value: lodash.exports.toString(Math.abs(this.DMSCoordinates.lat.seconds)), name: "latitude-seconds", "input-type": "number", onFormItemChanged: (ev) => this.DMSCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 60 },
                },
            ] }))))), h("ion-row", null, h("ion-col", null, h("app-form-item", { "label-tag": "longitude", "label-text": "Longitude", value: lodash.exports.toString(this.coordinates.lon), name: "lon", "input-type": "number", onFormItemChanged: (ev) => this.decimalCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: -180, max: 180 },
                },
            ] })), h("ion-col", null, h("ion-row", null, h("ion-col", null, h("app-form-item", { "label-tag": "degrees", "label-text": "Degrees", value: lodash.exports.toString(this.DMSCoordinates.lon.degrees), name: "longitude-degrees", "input-type": "number", onFormItemChanged: (ev) => this.DMSCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: -180, max: 180 },
                },
            ] })), h("ion-col", null, h("app-form-item", { "label-tag": "minutes", "label-text": "Minutes", value: lodash.exports.toString(Math.abs(this.DMSCoordinates.lon.minutes)), name: "longitude-minutes", "input-type": "number", onFormItemChanged: (ev) => this.DMSCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 60 },
                },
            ] })), h("ion-col", null, h("app-form-item", { "label-tag": "seconds", "label-text": "Seconds", value: lodash.exports.toString(Math.abs(this.DMSCoordinates.lon.seconds)), name: "longitude-seconds", "input-type": "number", onFormItemChanged: (ev) => this.DMSCoordinatesHandler(ev), onFormItemBlur: () => this.coordinatesUpdated(), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 60 },
                },
            ] }))))), this.location ? (h("ion-row", null, h("ion-col", null, h("ion-item", { color: "dark", lines: "none" }, h("ion-icon", { name: "navigate-circle-outline", slot: "start" }), h("ion-label", null, this.location.display_name))))) : undefined)) : undefined));
    }
    static get watchers() { return {
        "coordinates": ["updateCoords"]
    }; }
};
AppCoordinates.style = appCoordinatesCss;

export { AppCoordinates as app_coordinates };

//# sourceMappingURL=app-coordinates.entry.js.map