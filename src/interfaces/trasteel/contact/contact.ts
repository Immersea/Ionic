//each contact information
export class Contact {
  firstName: string;
  lastName: string;
  customerId: string;
  photoURL: string;
  coverURL: string;
  workPosition: string;
  officePhone: string;
  mobilePhone: string;
  email: string;
  customerLocationId: string;
  refractories: boolean;
  electrodes: boolean;
  rawmaterials: boolean;
  engineering: boolean;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.firstName = data && data.firstName ? data.firstName : null;
    this.lastName = data && data.lastName ? data.lastName : null;
    this.customerId = data && data.customerId ? data.customerId : null;
    this.photoURL = data && data.photoURL ? data.photoURL : null;
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    this.workPosition = data && data.workPosition ? data.workPosition : null;
    this.customerLocationId =
      data && data.customerLocationId ? data.customerLocationId : null;
    this.officePhone = data && data.officePhone ? data.officePhone : null;
    this.mobilePhone = data && data.mobilePhone ? data.mobilePhone : null;
    this.email = data && data.email ? data.email : null;
    this.refractories = data && data.refractories ? true : false;
    this.electrodes = data && data.electrodes ? true : false;
    this.rawmaterials = data && data.rawmaterials ? true : false;
    this.engineering = data && data.engineering ? true : false;

    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}

//Used to fill essential data of the customers into the map
export class MapDataContact {
  id: string;
  firstName: string;
  lastName: string;
  customerId: string;
  photoURL: string;
  coverURL: string;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }
}
