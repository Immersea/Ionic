import {ArticleMultilanguage, TextMultilanguage} from "../interfaces";
import {Media} from "../common/media/media";
import {LocationIQ, MapService, Position} from "../../services/common/map";
import {sortBy} from "lodash";

export class MapDataImmerseaLocation {
  id: string;
  order: {[sectionId: string]: number};
  public: boolean = false;
  displayName: string;
  photoURL: string;
  coverURL: string;
  position: Position;
  sections: string[];
  region: string;
  area: string;
  topics: string[];
  shortDescription: TextMultilanguage;

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

export class ImmerseaLocation {
  id: string;
  order: {[sectionId: string]: number};
  public: boolean = false;
  displayName: string;
  photoURL: string;
  coverURL: string;
  position: Position;
  address: LocationIQ;
  sections: string[]; //getSections()
  region: string; //Sicilia Tirrenica, Sicilia ...
  area: string; //Capo san vito, etc.
  topics: string[]; //getTopics()
  shortDescription: TextMultilanguage; //text multilanguage
  article: ArticleMultilanguage; //editorjs multilanguage
  media: {[id: string]: Media};
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.id = data && data.id ? data.id : null;
    this.order = data && data.order ? data.order : {};
    this.public = data && data.public ? data.public : false;
    this.displayName = data && data.displayName ? data.displayName : null;
    this.photoURL = data && data.photoURL ? data.photoURL : null;
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    this.position = null;
    if (data && data.position) {
      if (data.position) this.position = MapService.setPosition(data.position);
    } else if (this.address && this.address.lat && this.address.lon) {
      //get position from address
      this.position = MapService.getPosition(
        this.address.lat,
        this.address.lon
      );
    }
    this.sections = data && data.sections ? data.sections : [];
    this.region = data && data.region ? data.region : null;
    this.area = data && data.area ? data.area : null;
    this.shortDescription =
      data && data.shortDescription ? data.shortDescription : {en: ""};
    this.topics = data && data.topics ? data.topics : [];
    this.address = data && data.address ? data.address : null;
    this.article = data && data.article ? data.article : {};
    this.media = data && data.media ? data.media : {};
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }

  setAddress(address: LocationIQ) {
    this.address = address;
  }

  getMediaArray() {
    let array = [];
    Object.keys(this.media).map((id) => {
      array.push(this.media[id]);
    });
    return sortBy(array, ["type", "order", "title"]);
  }
}
