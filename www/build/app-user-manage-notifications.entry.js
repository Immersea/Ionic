import { r as registerInstance, h } from './index-d515af00.js';
import { N as NotificationsService, T as TranslationService, B as SystemService } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { b as actionSheetController } from './overlays-b3ceb97d.js';
import './env-0a7fccce.js';
import './ionic-global-c07767bf.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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
import './framework-delegate-779ab78c.js';

const appUserManageNotificationsCss = "app-user-manage-notifications{width:100%;}";

const AppUserManageNotifications = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.notificationsArray = [];
        this.topicsArray = [];
        this.updateView = false;
    }
    async componentWillLoad() {
        this.deviceToken = await NotificationsService.getLocalNotificationToken();
        this.updateNotifications();
    }
    async updateNotifications() {
        this.notificationDoc = await NotificationsService.getUserTokensDoc();
        this.loadNotifications();
    }
    async loadNotifications() {
        if (this.notificationDoc && this.notificationDoc[this.deviceToken]) {
            this.topics = this.notificationDoc[this.deviceToken].topics;
        }
        else {
            this.topics = null;
        }
        this.notificationsArray = [];
        Object.keys(this.notificationDoc).forEach((devicetoken) => {
            const notificationDoc = this.notificationDoc[devicetoken];
            let topicsArray = [];
            if (notificationDoc.topics) {
                Object.keys(notificationDoc.topics).map((topicId) => {
                    //search same topic on all other devices and check if active on all
                    let activeOnAllDevices = true;
                    Object.keys(this.notificationDoc).map((token) => {
                        const activeTopic = this.notificationDoc[token].topics[topicId];
                        if (lodash.exports.isBoolean(activeTopic)) {
                            activeOnAllDevices = activeOnAllDevices && activeTopic;
                        }
                    });
                    topicsArray.push({
                        id: topicId,
                        devicetoken: devicetoken,
                        activeOnDevice: this.topics ? this.topics[topicId] : false,
                        activeOnAllDevices: activeOnAllDevices,
                        name: this.getTopicName(topicId),
                    });
                });
                topicsArray = lodash.exports.orderBy(topicsArray, "name");
            }
            this.notificationsArray.push({
                devicetoken: devicetoken,
                info: notificationDoc.info,
                topics: topicsArray,
            });
        });
        this.notificationsArray = lodash.exports.orderBy(this.notificationsArray, "devicetoken");
        this.updateView = !this.updateView;
    }
    getTopicName(topicId) {
        console.log("getTopicName", topicId);
        /*const array = topicId.split("_");
        let name = null;
        let beachKioskName = null;
        const collection = array[0];
        const area = array[array.length - 1];
        if (area === "bookings" || area === "orders") {
          //get kiosk or beach name
          const nameArray = [];
          for (let i = 1; i < array.length - 1; i++) {
            nameArray.push(array[i]);
          }
          beachKioskName = nameArray.join("-");
        }
    
        return name;*/
    }
    async changeTopicSubscription(topic) {
        const removeFromDevice = {
            text: TranslationService.getTransl("remove-notification-from-device", "Remove from this device only"),
            handler: async () => {
                SystemService.presentLoading("updating");
                NotificationsService.unsubscribeUserDeviceFromTopic(topic.id, topic.deviceToken)
                    .then((data) => {
                    this.notificationDoc = data;
                    this.loadNotifications();
                    SystemService.dismissLoading();
                })
                    .catch((err) => {
                    this.showErrors(err);
                    this.updateNotifications();
                    SystemService.dismissLoading();
                });
                return true;
            },
        };
        const addToDevice = {
            text: TranslationService.getTransl("add-notification-to-device", "Add to this device only"),
            handler: async () => {
                SystemService.presentLoading("updating");
                NotificationsService.subscribeUserDeviceToTopic(topic.id, topic.deviceToken)
                    .then((data) => {
                    this.notificationDoc = data;
                    this.loadNotifications();
                    SystemService.dismissLoading();
                })
                    .catch((err) => {
                    this.showErrors(err);
                    this.updateNotifications();
                    SystemService.dismissLoading();
                });
                return true;
            },
        };
        const removeFromAllDevices = {
            text: TranslationService.getTransl("remove-notification-from-all-devices", "Remove from all my devices"),
            handler: async () => {
                SystemService.presentLoading("updating");
                NotificationsService.unsubscribeUserFromTopic(topic.id)
                    .then((data) => {
                    this.notificationDoc = data;
                    this.loadNotifications();
                    SystemService.dismissLoading();
                })
                    .catch((err) => {
                    this.showErrors(err);
                    this.updateNotifications();
                    SystemService.dismissLoading();
                });
                return true;
            },
        };
        const addToAllDevices = {
            text: TranslationService.getTransl("add-notification-to-all-devices", "Add to all my devices"),
            handler: async () => {
                SystemService.presentLoading("updating");
                NotificationsService.subscribeUserToTopic(topic.id)
                    .then((data) => {
                    this.notificationDoc = data;
                    this.loadNotifications();
                    SystemService.dismissLoading();
                })
                    .catch((err) => {
                    this.showErrors(err);
                    this.updateNotifications();
                    SystemService.dismissLoading();
                });
                return true;
            },
        };
        const actionSheet = await actionSheetController.create({
            header: topic.name,
            buttons: [
                topic.activeOnDevice ? removeFromDevice : addToDevice,
                topic.activeOnAllDevices ? removeFromAllDevices : addToAllDevices,
                {
                    text: TranslationService.getTransl("delete", "Delete"),
                    role: "destructive",
                    handler: async () => {
                        NotificationsService.deleteUserFromTopic(topic.id)
                            .then((data) => {
                            this.notificationDoc = data;
                            this.loadNotifications();
                        })
                            .catch((err) => {
                            this.showErrors(err);
                            this.updateNotifications();
                        });
                        return true;
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                },
            ],
        });
        await actionSheet.present();
    }
    async showErrors(errors) {
        SystemService.presentAlertError(JSON.stringify(errors));
    }
    render() {
        return (h("div", { key: '49e63ae3cf697c5a7e2823579d5dc6814e299cfd' }, this.notificationsArray.length == 0 ? (h("ion-item", null, "No notifications set")) : undefined, this.notificationsArray.map((device) => (h("ion-item-group", null, h("ion-item-divider", null, h("ion-label", null, device.info.model +
            ": " +
            device.info.operatingSystem +
            "-" +
            device.info.osVersion +
            (device.devicetoken == this.deviceToken
                ? " (this device)"
                : ""))), device.topics.length == 0 ? (h("ion-item", null, "No notifications for this device")) : undefined, device.topics.map((topic) => (h("ion-item", { button: true, detail: false, onClick: () => this.changeTopicSubscription(topic) }, h("ion-label", null, topic.name), h("ion-button", { slot: "end", "icon-only": true, fill: "clear", color: topic.activeOnDevice ? "success" : "danger" }, h("ion-icon", { name: topic.activeOnDevice ? "checkmark" : "close" })), h("ion-button", { slot: "end", "icon-only": true, fill: "clear", color: topic.activeOnAllDevices ? "success" : "danger" }, h("ion-icon", { name: topic.activeOnAllDevices ? "checkmark-done" : "close" }))))))))));
    }
};
AppUserManageNotifications.style = appUserManageNotificationsCss;

export { AppUserManageNotifications as app_user_manage_notifications };

//# sourceMappingURL=app-user-manage-notifications.entry.js.map