import { orderBy } from "lodash";

export const ProductLines = {
  refractories: "Refractories",
  electrodes: "Electrodes",
  rawmaterials: "Raw Materials",
  engineering: "Engineering",
  //longterm: "Long Term",
};

export class UserPlans {
  userPlans: UserPlan[];
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };
  constructor(data?) {
    this.userPlans = [];
    if (data && data.userPlans && data.userPlans.length > 0) {
      data.userPlans.forEach((plan) => {
        this.userPlans.push(new UserPlan(plan));
      });
    }
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}
export class UserPlan {
  customerId: string;
  otherName: string;
  planOfActions: PlanOfAction[];
  constructor(data?) {
    this.customerId = data && data.customerId ? data.customerId : null;
    this.otherName = data && data.otherName ? data.otherName : null;
    this.planOfActions = [];
    if (data && data.planOfActions && data.planOfActions.length > 0) {
      data.planOfActions.forEach((plan) => {
        this.planOfActions.push(new PlanOfAction(plan));
      });
      this.planOfActions = orderBy(this.planOfActions, "dueDate");
    }
  }
}

export class PlanOfAction {
  updated: string;
  product: string;
  situation: string;
  plan: string;
  dueDate: string;
  constructor(data?) {
    this.updated =
      data && data.updated ? data.updated : new Date().toISOString();
    this.product = data && data.product ? data.product : null;
    this.situation = data && data.situation ? data.situation : null;
    this.plan = data && data.plan ? data.plan : null;
    this.dueDate =
      data && data.dueDate ? data.dueDate : new Date().toISOString();
  }
}
