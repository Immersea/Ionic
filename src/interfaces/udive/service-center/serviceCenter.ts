import {LocationIQ} from "../../../components";
import {MapService, Position} from "../../../services/common/map";

export class MapDataServiceCenter {
  id: string;
  displayName: string;
  photoURL: string;
  coverURL: string;
  position: Position;

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

export class ServiceCenter {
  displayName: string;
  photoURL: string;
  coverURL: string;
  position: Position;
  address: LocationIQ;
  description: string;
  phoneNumber: string;
  email: string;
  website: string;
  twitter: string;
  facebook: string;
  instagram: string;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.displayName = data && data.displayName ? data.displayName : null;
    this.photoURL = data && data.photoURL ? data.photoURL : null;
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    if (data && data.position) {
      if (data.position) this.position = MapService.setPosition(data.position);
    } else if (this.address && this.address.lat && this.address.lon) {
      //get position from address
      this.position = MapService.getPosition(
        this.address.lat,
        this.address.lon
      );
    }
    this.address = data && data.address ? data.address : null;
    this.description = data && data.description ? data.description : null;

    this.phoneNumber = data && data.phoneNumber ? data.phoneNumber : null;
    this.email = data && data.email ? data.email : null;
    this.website = data && data.website ? data.website : null;
    this.twitter = data && data.twitter ? data.twitter : null;
    this.facebook = data && data.facebook ? data.facebook : null;
    this.instagram = data && data.instagram ? data.instagram : null;

    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }

  setPosition(lat, lon) {
    this.position = MapService.getPosition(lat, lon);
  }

  setAddress(address: LocationIQ) {
    this.address = address;
  }
}
