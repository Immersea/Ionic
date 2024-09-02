//each shape information
export class Offer {
  offerNumber: string;
  projectId: string;
  customerId: string;
  applicationUnit: string; //same as Project application unit
  title: string;
  sendDate: Date;
  setsAmount: number;
  lockOffer: boolean;
  comment: string;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.projectId = data && data.projectId ? data.projectId : null;
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}

//Used to fill essential data of the offer into the lists
export class MapDataOffer {
  id: string;
  projectDescription: string;
  customerId: string;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }
}
