import { DeviceInfo } from "@capacitor/device";

export interface TopicsList {
  [topicId: string]: boolean; //each topic name is true if this token is subscribed and flase if not subscribed
}
export interface NotificationDoc {
  [token: string]: {
    info: DeviceInfo;
    topics: TopicsList;
  };
}
