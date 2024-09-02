import { Organiser } from "../../udive/dive-trip/diveTrip";

export interface ChatParticipant {
  collectionId: string;
  id: string;
  displayName: string;
}

export interface Chat {
  name: string;
  date: string;
  additionalData: {
    collectionId: string;
    id: string;
  }; //used to present link to item
  thread: Message[];
  participants: {
    [id: string]: ChatParticipant;
  };
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };
}

export interface Message {
  content: string;
  created: string;
  senderId: string;
  senderName: string;
}

export interface ChatsSummary {
  [chatId: string]: {
    date: Date;
    name: string;
    organiser: Organiser;
  };
}
