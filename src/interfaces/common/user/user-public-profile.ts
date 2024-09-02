import {Course} from "../../udive/diving-class/divingClass";
import {LocationIQ} from "../../../components";
import {MapService, Position} from "../../../services/common/map";

export class MapDataUserPubicProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  coverURL: string;
  position: Position;
  cards: Course[];

  constructor(data) {
    Object.keys(data).forEach((key) => {
      if (key == "position") {
        this.position = null;
        if (data.position)
          this.position = MapService.setPosition(data.position);
      } else {
        this[key] = data[key];
      }
    });
  }
}

export class UserPubicProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  coverURL: string;
  address: LocationIQ;
  position: Position;
  bio: string;
  cards: Course[] = [];
  phoneNumber: string;
  facebook: string;
  instagram: string;
  twitter: string;
  website: string;

  constructor(doc?) {
    if (doc) {
      this.uid = doc.uid;
      this.email = doc.email;
      this.displayName = doc.displayName;
      this.photoURL = doc.photoURL;
      this.coverURL = doc.coverURL;
      this.address = doc.address;
      this.position = null;
      if (doc && doc.position) {
        if (doc.position) this.position = MapService.setPosition(doc.position);
      } else if (this.address && this.address.lat && this.address.lon) {
        //get position from address
        this.position = MapService.getPosition(
          this.address.lat,
          this.address.lon
        );
      }
      this.phoneNumber = doc.phoneNumber;
      this.facebook = doc.facebook;
      this.instagram = doc.instagram;
      this.twitter = doc.twitter;
      this.website = doc.website;

      this.bio = doc.bio;
      if (doc.cards && doc.cards.length > 0 && doc.cards[0].agencyId) {
        this.cards = doc.cards;
      }
    }
  }
}
