import {BehaviorSubject, Subscription} from "rxjs";
import {DatabaseService} from "../../common/database";
import {UserService} from "../../common/user";
import {UserPlans} from "../../../interfaces/trasteel/users/user-plans";
import {RouterService} from "../../common/router";
import {alertController} from "@ionic/core";
import {TranslationService} from "../../common/translations";

export const USERPLANSCOLLECTION = "userPlans";

export class UserPlansController {
  userPlans: UserPlans = new UserPlans();
  userPlansSub: Subscription;
  userPlans$: BehaviorSubject<UserPlans> = new BehaviorSubject(<UserPlans>{});
  serviceInit = true;

  //initialise this service inside app-root at the start of the app
  async init() {
    //init only once
    if (this.serviceInit) {
      this.serviceInit = false;
      const observable = await DatabaseService.getDocumentObservable(
        USERPLANSCOLLECTION,
        UserService.userProfile.uid
      );
      this.userPlansSub = observable.subscribe((doc) => {
        this.userPlans = new UserPlans(doc);
        this.userPlans$.next(this.userPlans);
      });
    }
  }

  async presentUserPlansUpdate(uid, plans, index?) {
    return await RouterService.openModal("modal-user-plans-update", {
      uid: uid,
      userPlans: plans,
      planIndex: index,
    });
  }

  async presentUserPlanDetails(id, planIndex) {
    RouterService.push(
      "/" + USERPLANSCOLLECTION + "/details/" + id + "/" + planIndex,
      "forward"
    );
  }

  openUsersPlans(uid) {
    RouterService.push("/" + USERPLANSCOLLECTION + "/user/" + uid, "forward");
  }

  async updateUserPlan(uid, plan) {
    return DatabaseService.saveItem(uid, plan, uid, USERPLANSCOLLECTION);
  }

  async deletePlan(uid): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-user-plan-header",
          "Delete User Plan?"
        ),
        message: TranslationService.getTransl(
          "delete-user-plan-message",
          "This plan will be deleted! Are you sure?"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
            handler: () => {
              reject();
            },
          },
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              DatabaseService.deleteItem(USERPLANSCOLLECTION, uid);
              RouterService.goBack();
              resolve(null);
            },
          },
        ],
      });
      confirm.present();
    });
  }

  async getPlansOfUser(uid) {
    const ret = await DatabaseService.getDocument(USERPLANSCOLLECTION, uid);
    return ret ? ret : false;
  }
}
export const UserPlansService = new UserPlansController();
