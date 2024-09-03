import { W as WebPlugin } from './env-9be68260.js';
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

function translatedConnection() {
    const connection = window.navigator.connection ||
        window.navigator.mozConnection ||
        window.navigator.webkitConnection;
    let result = 'unknown';
    const type = connection ? connection.type || connection.effectiveType : null;
    if (type && typeof type === 'string') {
        switch (type) {
            // possible type values
            case 'bluetooth':
            case 'cellular':
                result = 'cellular';
                break;
            case 'none':
                result = 'none';
                break;
            case 'ethernet':
            case 'wifi':
            case 'wimax':
                result = 'wifi';
                break;
            case 'other':
            case 'unknown':
                result = 'unknown';
                break;
            // possible effectiveType values
            case 'slow-2g':
            case '2g':
            case '3g':
                result = 'cellular';
                break;
            case '4g':
                result = 'wifi';
                break;
            default:
                break;
        }
    }
    return result;
}
class NetworkWeb extends WebPlugin {
    constructor() {
        super();
        this.handleOnline = () => {
            const connectionType = translatedConnection();
            const status = {
                connected: true,
                connectionType: connectionType,
            };
            this.notifyListeners('networkStatusChange', status);
        };
        this.handleOffline = () => {
            const status = {
                connected: false,
                connectionType: 'none',
            };
            this.notifyListeners('networkStatusChange', status);
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }
    }
    async getStatus() {
        if (!window.navigator) {
            throw this.unavailable('Browser does not support the Network Information API');
        }
        const connected = window.navigator.onLine;
        const connectionType = translatedConnection();
        const status = {
            connected,
            connectionType: connected ? connectionType : 'none',
        };
        return status;
    }
}
const Network = new NetworkWeb();

export { Network, NetworkWeb };

//# sourceMappingURL=web-c3e1c39e.js.map