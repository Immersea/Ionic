import {Component, h, State} from "@stencil/core";
import {NotificationsService} from "../../../../../services/common/notifications";
import {
  TopicsList,
  NotificationDoc,
} from "../../../../../interfaces/common/notifications/notifications";
import {TranslationService} from "../../../../../services/common/translations";
import {actionSheetController} from "@ionic/core";
import {SystemService} from "../../../../../services/common/system";
import {isBoolean, orderBy} from "lodash";

@Component({
  tag: "app-user-manage-notifications",
  styleUrl: "app-user-manage-notifications.scss",
})
export class AppUserManageNotifications {
  topics: TopicsList;
  notificationDoc: NotificationDoc;
  deviceToken: string;
  notificationsArray = [];
  topicsArray: {
    id: string;
    name: string;
    activeOnDevice: boolean;
    activeOnAllDevices: boolean;
  }[] = [];
  @State() updateView = false;

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
    } else {
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
            if (isBoolean(activeTopic)) {
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
        topicsArray = orderBy(topicsArray, "name");
      }
      this.notificationsArray.push({
        devicetoken: devicetoken,
        info: notificationDoc.info,
        topics: topicsArray,
      });
    });
    this.notificationsArray = orderBy(this.notificationsArray, "devicetoken");
    this.updateView = !this.updateView;
  }

  getTopicName(topicId: string) {
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
      text: TranslationService.getTransl(
        "remove-notification-from-device",
        "Remove from this device only"
      ),
      handler: async () => {
        SystemService.presentLoading("updating");
        NotificationsService.unsubscribeUserDeviceFromTopic(
          topic.id,
          topic.deviceToken
        )
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
      text: TranslationService.getTransl(
        "add-notification-to-device",
        "Add to this device only"
      ),
      handler: async () => {
        SystemService.presentLoading("updating");
        NotificationsService.subscribeUserDeviceToTopic(
          topic.id,
          topic.deviceToken
        )
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
      text: TranslationService.getTransl(
        "remove-notification-from-all-devices",
        "Remove from all my devices"
      ),
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
      text: TranslationService.getTransl(
        "add-notification-to-all-devices",
        "Add to all my devices"
      ),
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
    return (
      <div>
        {this.notificationsArray.length == 0 ? (
          <ion-item>No notifications set</ion-item>
        ) : undefined}

        {this.notificationsArray.map((device) => (
          <ion-item-group>
            <ion-item-divider>
              <ion-label>
                {device.info.model +
                  ": " +
                  device.info.operatingSystem +
                  "-" +
                  device.info.osVersion +
                  (device.devicetoken == this.deviceToken
                    ? " (this device)"
                    : "")}
              </ion-label>
            </ion-item-divider>

            {device.topics.length == 0 ? (
              <ion-item>No notifications for this device</ion-item>
            ) : undefined}
            {device.topics.map((topic) => (
              <ion-item
                button
                detail={false}
                onClick={() => this.changeTopicSubscription(topic)}
              >
                <ion-label>{topic.name}</ion-label>
                <ion-button
                  slot="end"
                  icon-only
                  fill="clear"
                  color={topic.activeOnDevice ? "success" : "danger"}
                >
                  <ion-icon
                    name={topic.activeOnDevice ? "checkmark" : "close"}
                  />
                </ion-button>
                <ion-button
                  slot="end"
                  icon-only
                  fill="clear"
                  color={topic.activeOnAllDevices ? "success" : "danger"}
                >
                  <ion-icon
                    name={topic.activeOnAllDevices ? "checkmark-done" : "close"}
                  />
                </ion-button>
              </ion-item>
            ))}
          </ion-item-group>
        ))}
      </div>
    );
  }
}
