import { getRandomId } from "../../../helpers/utils";

export interface AdvertisingDoc {
  [id: string]: Advertising;
}

export class Advertising {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  coverURL: string;
  link: string;
  active: boolean;

  constructor(data?) {
    this.id = data && data.id ? data.id : getRandomId();
    this.order = data && data.order ? data.order : 0;
    this.title = data && data.title ? data.title : "";
    this.subtitle = data && data.subtitle ? data.subtitle : "";
    this.description = data && data.description ? data.description : "";
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    this.link = data && data.link ? data.link : "";
    this.active = data && data.active ? true : false;
  }
}
