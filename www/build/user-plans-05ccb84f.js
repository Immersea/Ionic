import { B as BehaviorSubject } from './map-dae4acde.js';
import { D as DatabaseService, U as UserService, R as RouterService, T as TranslationService } from './utils-cbf49763.js';
import { U as UserPlans } from './user-plans-3e6cb6aa.js';
import './index-be90eba5.js';
import { a as alertController } from './overlays-b3ceb97d.js';

const USERPLANSCOLLECTION = "userPlans";
class UserPlansController {
    constructor() {
        this.userPlans = new UserPlans();
        this.userPlans$ = new BehaviorSubject({});
        this.serviceInit = true;
    }
    //initialise this service inside app-root at the start of the app
    async init() {
        //init only once
        if (this.serviceInit) {
            this.serviceInit = false;
            const observable = await DatabaseService.getDocumentObservable(USERPLANSCOLLECTION, UserService.userProfile.uid);
            this.userPlansSub = observable.subscribe((doc) => {
                this.userPlans = new UserPlans(doc);
                this.userPlans$.next(this.userPlans);
            });
        }
    }
    async presentUserPlansUpdate(uid, plans, index) {
        return await RouterService.openModal("modal-user-plans-update", {
            uid: uid,
            userPlans: plans,
            planIndex: index,
        });
    }
    async presentUserPlanDetails(id, planIndex) {
        RouterService.push("/" + USERPLANSCOLLECTION + "/details/" + id + "/" + planIndex, "forward");
    }
    openUsersPlans(uid) {
        RouterService.push("/" + USERPLANSCOLLECTION + "/user/" + uid, "forward");
    }
    async updateUserPlan(uid, plan) {
        return DatabaseService.saveItem(uid, plan, uid, USERPLANSCOLLECTION);
    }
    async deletePlan(uid) {
        return new Promise(async (resolve, reject) => {
            const confirm = await alertController.create({
                header: TranslationService.getTransl("delete-user-plan-header", "Delete User Plan?"),
                message: TranslationService.getTransl("delete-user-plan-message", "This plan will be deleted! Are you sure?"),
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
const UserPlansService = new UserPlansController();

export { UserPlansService as U };

//# sourceMappingURL=user-plans-05ccb84f.js.map