import { W as WebPlugin } from './env-c3ad5e77.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './index-d515af00.js';
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

class GeolocationWeb extends WebPlugin {
    async getCurrentPosition(options) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(pos => {
                resolve(pos);
            }, err => {
                reject(err);
            }, Object.assign({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }, options));
        });
    }
    async watchPosition(options, callback) {
        const id = navigator.geolocation.watchPosition(pos => {
            callback(pos);
        }, err => {
            callback(null, err);
        }, Object.assign({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }, options));
        return `${id}`;
    }
    async clearWatch(options) {
        window.navigator.geolocation.clearWatch(parseInt(options.id, 10));
    }
    async checkPermissions() {
        if (typeof navigator === 'undefined' || !navigator.permissions) {
            throw this.unavailable('Permissions API not available in this browser');
        }
        const permission = await window.navigator.permissions.query({
            name: 'geolocation',
        });
        return { location: permission.state, coarseLocation: permission.state };
    }
    async requestPermissions() {
        throw this.unimplemented('Not implemented on web.');
    }
}
const Geolocation = new GeolocationWeb();

export { Geolocation, GeolocationWeb };

//# sourceMappingURL=web-10125ef9.js.map