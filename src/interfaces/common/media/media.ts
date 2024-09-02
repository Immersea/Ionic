import {getRandomId} from "../../../helpers/utils";

export interface MediaDoc {
  [id: string]: Media;
}

export class Media {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  public: boolean = false;
  /** File info */
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url: string;

  constructor(data?) {
    this.id = data && data.id ? data.id : getRandomId();
    this.order = data && data.order ? data.order : 0;
    this.title = data && data.title ? data.title : null;
    this.subtitle = data && data.subtitle ? data.subtitle : null;
    this.description = data && data.description ? data.description : null;
    this.type =
      data && data.type && this.checkType(data.type) ? data.type : null;
    this.name = data && data.name ? data.name : null;
    this.size = data && data.size ? data.size : null;
    this.url = data && data.url ? data.url : null;
    this.lastModified = data && data.lastModified ? data.lastModified : null;
    this.public = data && data.public ? true : false;
  }

  setType(type) {
    if (this.checkType(type)) {
      this.type = type;
    }
  }

  getTypes() {
    return [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/mov",
      "application/pdf",
    ];
  }

  checkType(type) {
    return this.getTypes().includes(type);
  }
}
