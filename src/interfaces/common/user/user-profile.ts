import {LocationIQ} from "../../../components";
import {MapService, Position} from "../../../services/common/map";

export class UserProfile {
  uid: string;
  name: string = "";
  surname: string = "";
  displayName: string = "Guest";
  email: string | undefined;
  address: LocationIQ;
  photoURL: string;
  coverURL: string;
  phoneNumber: string;
  memberSince: string;
  bio: string;
  website: string;
  twitter: string;
  facebook: string;
  instagram: string;
  position: Position;

  constructor(data) {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (key == "position") {
          this.position = null;
          if (data && data.position) {
            this.position = MapService.setPosition(data.position);
          }
        } else {
          this[key] = data[key];
        }
      });
      this.setDisplayName();
    }
  }

  setDisplayName() {
    if (this.name != "" && this.surname != "") {
      this.displayName = this.name + " " + this.surname;
    } else if (this.displayName != "") {
      //legacy displayName only
      this.name = this.displayName.split(" ")[0];
      this.surname = this.displayName.split(" ")[1]
        ? this.displayName.split(" ")[1]
        : "";
    }
  }
}
