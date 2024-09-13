import { BehaviorSubject } from "rxjs";
import { TranslationService } from "./translations";
import { alertController } from "@ionic/core";
import { Geolocation, Position } from "@capacitor/geolocation";

import { RouterService } from "./router";
import { ChatsSummary } from "../../interfaces/common/chat/chat";
import { ChatService } from "./chat";
import { TripSummary } from "../../interfaces/udive/dive-trip/diveTrip";
import { ClassSummary } from "../../interfaces/udive/diving-class/divingClass";
import { UserProfile } from "../../interfaces/common/user/user-profile";
import { UserSettings } from "../../interfaces/udive/user/user-settings";
import { UserRoles } from "../../interfaces/common/user/user-roles";
import { UserDivePlans } from "../../interfaces/udive/user/user-dive-plans";
import { UserCards } from "../../interfaces/udive/user/user-cards";
import {
  MapDataUserPubicProfile,
  UserPubicProfile,
} from "../../interfaces/common/user/user-public-profile";
import { StorageService } from "./storage";
import { DivePlanModel } from "../../interfaces/udive/planner/dive-plan";
import { DiveConfiguration } from "../../interfaces/udive/planner/dive-configuration";
import { DatabaseService, SETTINGSCOLLECTIONNAME } from "./database";
import {
  DIVECENTERSSCOLLECTION,
  DivingCentersService,
} from "../udive/divingCenters";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../udive/divingSchools";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "../udive/serviceCenters";
import { Environment } from "../../global/env";
import { UDiveFilterService } from "../udive/ud-db-filter";
import { UserPreferred } from "../../interfaces/common/user/user-preferred";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../udive/diveCommunities";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, firestore } from "../../helpers/firebase";
import { User } from "firebase/auth";
import { AuthService } from "./auth";
import { SystemService } from "./system";
import { TrasteelFilterService } from "../trasteel/common/trs-db-filter";
import { TankModel } from "../../interfaces/udive/planner/tank-model";

export const USERPROFILECOLLECTION = "userProfiles";
export const USERPUBLICPROFILECOLLECTION = "userPublicProfiles";
export const USERROLESCOLLECTION = "userRoles";
export const USERSETTINGSCOLLECTION = "userSettings";
export const USERCARDSCOLLECTION = "userCards";
export const USERDIVEPLANSCOLLECTION = "userDivePlans";
export const USERDIVETRIPSCOLLECTION = "diveTrips";
export const USERDIVINGCLASSESCOLLECTION = "divingClasses";
export const USERCHATSCOLLECTION = "chats";
export const USERPREFERREDCOLLECTION = "preferred";

export class UserController {
  user: User;
  userProfile: UserProfile;
  userSettings: UserSettings;
  userRoles: UserRoles;
  userDivePlans: UserDivePlans;
  userDiveTrips: TripSummary;
  userDivingClasses: ClassSummary;
  userCards: UserCards;
  userChats: ChatsSummary;
  userPreferred: UserPreferred;
  userProfile$: BehaviorSubject<UserProfile> = new BehaviorSubject(
    <UserProfile>{}
  );
  userSettings$: BehaviorSubject<UserSettings> = new BehaviorSubject(
    <UserSettings>{}
  );
  userRoles$: BehaviorSubject<UserRoles> = new BehaviorSubject(<UserRoles>{});
  userDivePlans$: BehaviorSubject<UserDivePlans> = new BehaviorSubject(
    <UserDivePlans>{}
  );
  userDiveTrips$: BehaviorSubject<TripSummary> = new BehaviorSubject(
    <TripSummary>{}
  );
  userDivingClasses$: BehaviorSubject<ClassSummary> = new BehaviorSubject(
    <ClassSummary>{}
  );
  userCards$: BehaviorSubject<UserCards> = new BehaviorSubject(<UserCards>{});
  userChats$: BehaviorSubject<ChatsSummary> = new BehaviorSubject(
    <ChatsSummary>{}
  );
  userPreferred$: BehaviorSubject<UserPreferred> = new BehaviorSubject(
    <UserPreferred>{}
  );
  userProfileSub: any;
  userRolesSub: any;
  userDivePlansSub: any;
  userDiveTripsSub: any;
  userDivingClassesSub: any;
  userChatsSub: any;
  userSettingsSub: any;
  userCardsSub: any;
  userPreferredSub: any;

  newUser = false;
  isAlertOpen = false;
  userServicesStarted = false;
  numberOfTries = 0;

  userPublicProfilesList: UserPubicProfile[] = [];
  userPublicProfilesList$: BehaviorSubject<any[]> = new BehaviorSubject(
    <any>[]
  );

  userGeoposition: Position;

  async start() {
    //init local necessary to load loggedin user pages before auth is loaded
    this.initLocalUser();
    this.numberOfTries = 0;
    let dbFilter = null;
    if (Environment.isUdive() || Environment.isDecoplanner()) {
      dbFilter = UDiveFilterService;
    } else if (Environment.isTrasteel()) {
      dbFilter = TrasteelFilterService;
    }
    if (dbFilter)
      dbFilter.mapDataSub$.subscribe(() => {
        const collection = dbFilter.getCollectionArray(
          USERPUBLICPROFILECOLLECTION
        );
        if (collection && collection.length > 0) {
          this.userPublicProfilesList = collection;
          this.triggerUsers();
        }
      });
    this.userServicesStarted = true;
  }

  triggerUsers() {
    this.userPublicProfilesList$.next(this.userPublicProfilesList);
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        //remove position to cancel users from the map
        const coll = collection[item];
        coll.position = null;
        result[item] = new MapDataUserPubicProfile(coll);
      });
    return result;
  }

  createUserPublicMapData(id, userPublic: any): MapDataUserPubicProfile {
    return new MapDataUserPubicProfile({
      uid: id,
      email: userPublic.email ? userPublic.email : null,
      displayName: userPublic.displayName ? userPublic.displayName : null,
    });
  }

  checkUsersMapData() {
    DatabaseService.checkMapData(
      USERPUBLICPROFILECOLLECTION,
      this.userPublicProfilesList,
      (id, userProfile) => this.createUserPublicMapData(id, userProfile)
    );
  }

  async initLocalUser() {
    //COMMON
    const localUser = await DatabaseService.getLocalDocument(
      USERPROFILECOLLECTION
    );
    const localUserRoles =
      await DatabaseService.getLocalDocument(USERROLESCOLLECTION);
    const localUserChats =
      await DatabaseService.getLocalDocument(USERCHATSCOLLECTION);
    const localUserSettings = await DatabaseService.getLocalDocument(
      USERSETTINGSCOLLECTION
    );
    if (localUser) {
      this.userProfile = new UserProfile(localUser);
      this.userRoles = new UserRoles(localUserRoles);
      this.userChats = localUserChats;
      this.userSettings = new UserSettings(localUserSettings);
      this.userProfile$.next(this.userProfile);
      this.userRoles$.next(this.userRoles);
      this.userChats$.next(this.userChats);
      this.userSettings$.next(this.userSettings);
      this.setLanguage(localUserSettings);
    } else {
      this.newUser = true;
      //create basic user roles for non loggedin user - to avoid code breakages
      this.userRoles = new UserRoles({
        uid: false,
        email: "",
        licences: {},
      });
      this.userRoles$.next(this.userRoles);
      this.userProfile$.next(null);
    }

    if (Environment.isUdive() || Environment.isDecoplanner()) {
      //UDIVE
      const localUserDivePlans = await DatabaseService.getLocalDocument(
        USERDIVEPLANSCOLLECTION
      );
      const localUserDiveTrips = await DatabaseService.getLocalDocument(
        USERDIVETRIPSCOLLECTION
      );
      const localUserDivingClasses = await DatabaseService.getLocalDocument(
        USERDIVINGCLASSESCOLLECTION
      );
      const localUserCards =
        await DatabaseService.getLocalDocument(USERCARDSCOLLECTION);
      if (localUser) {
        this.userDivePlans = new UserDivePlans(localUserDivePlans);
        this.userDiveTrips = localUserDiveTrips;
        this.userDivingClasses = localUserDivingClasses;
        this.userCards = new UserCards(localUserCards);
        this.userDivePlans$.next(this.userDivePlans);
        this.userDiveTrips$.next(this.userDiveTrips);
        this.userDivingClasses$.next(this.userDivingClasses);
        this.userCards$.next(this.userCards);
      } else {
        this.newUser = true;
      }
    }

    if (localUser) {
      //get user updates from firebase
      this.getUserInfo(localUser);
    }
  }

  /* getUserInfo loads the data from firebase for the user and sends this to app-root for the right page to show 
    In case of new user checks if userProfile has been created in the database, if not wait and re-try
  */
  async getUserInfo(user) {
    if (user && user.uid) {
      AuthService.presentLoader();
      //check if userProfile is created for new users
      try {
        await DatabaseService.getFirebaseDocument(
          USERPROFILECOLLECTION,
          user.uid
        );
      } catch (error) {
        this.numberOfTries = this.numberOfTries + 1;
        if (this.numberOfTries <= 10) {
          setTimeout(() => {
            this.getUserInfo(user);
          }, 500 * this.numberOfTries);
        } else {
          //user not existing
          //show login page
          SystemService.presentAlertError(
            "Something went worng during registration. Please try again later."
          );
          AuthService.dismissLoading();
          this.userProfile$.next(null);
        }
        return;
      }
      this.user = auth.currentUser;
      //send verification email
      if (!this.user.emailVerified) {
        AuthService.sendEmailVerification();
      }
      DatabaseService.getDocumentObservable(
        USERPROFILECOLLECTION,
        user.uid
      ).then(
        (obs) => {
          this.userProfileSub = obs.subscribe((userProfile) => {
            if (userProfile) {
              this.userProfile = new UserProfile(userProfile);
              DatabaseService.saveLocalDocument(
                USERPROFILECOLLECTION,
                this.userProfile
              );
              AuthService.dismissLoading();
              this.userProfile$.next(this.userProfile);
              //set user for chat
              ChatService.resetChatUser();
            } else {
              //user not existing
              //show login page
              AuthService.dismissLoading();
              this.userProfile$.next(null);
            }
          });
        },
        () => {
          //user not existing
          //show login page
          AuthService.dismissLoading();
          this.userProfile$.next(null);
        }
      );

      //load user settings
      this.userSettingsSub = onSnapshot<any, any>(
        doc(
          firestore,
          USERPROFILECOLLECTION,
          user.uid,
          SETTINGSCOLLECTIONNAME,
          SETTINGSCOLLECTIONNAME
        ),
        (userSettings) => {
          this.userSettings = new UserSettings(userSettings.data());
          this.userSettings.uid = user.uid;
          this.setLanguage(this.userSettings);
          if (!this.userSettings.localPlans) {
            //update localplans and configs to database -> created in new UserSettins
            this.updateUserSettings(this.userSettings);
          }
          DatabaseService.saveLocalDocument(
            USERSETTINGSCOLLECTION,
            this.userSettings
          );
          this.userSettings$.next(this.userSettings);
        }
      );

      this.userRolesSub = onSnapshot<any, any>(
        doc(firestore, USERROLESCOLLECTION, user.uid),
        (userRoles) => {
          this.userRoles = new UserRoles(userRoles.data());
          DatabaseService.saveLocalDocument(
            USERROLESCOLLECTION,
            this.userRoles
          );
          this.userRoles$.next(this.userRoles);
        }
      );

      this.userRolesSub = onSnapshot<ChatsSummary, ChatsSummary>(
        doc(
          firestore,
          USERPROFILECOLLECTION,
          user.uid,
          USERCHATSCOLLECTION,
          USERCHATSCOLLECTION
        ),
        (userChats) => {
          this.userChats = userChats.data();
          DatabaseService.saveLocalDocument(
            USERCHATSCOLLECTION,
            this.userChats
          );
          this.userChats$.next(this.userChats);
        }
      );

      this.userPreferredSub = onSnapshot<ChatsSummary, ChatsSummary>(
        doc(
          firestore,
          USERPROFILECOLLECTION,
          user.uid,
          USERPREFERREDCOLLECTION,
          USERPREFERREDCOLLECTION
        ),
        (preferred) => {
          this.userPreferred = preferred.data();
          DatabaseService.saveLocalDocument(
            USERPREFERREDCOLLECTION,
            this.userPreferred
          );
          this.userPreferred$.next(this.userPreferred);
        }
      );

      if (Environment.isUdive() || Environment.isDecoplanner()) {
        //UDIVE
        this.userDivingClassesSub = onSnapshot<ClassSummary, ClassSummary>(
          doc(
            firestore,
            USERPROFILECOLLECTION,
            user.uid,
            SETTINGSCOLLECTIONNAME,
            USERDIVINGCLASSESCOLLECTION
          ),
          (userDivingClasses) => {
            this.userDivingClasses = userDivingClasses;
            DatabaseService.saveLocalDocument(
              USERDIVINGCLASSESCOLLECTION,
              this.userDivingClasses
            );
            this.userDivingClasses$.next(this.userDivingClasses);
          }
        );

        this.userDiveTripsSub = onSnapshot<TripSummary, TripSummary>(
          doc(
            firestore,
            USERPROFILECOLLECTION,
            user.uid,
            SETTINGSCOLLECTIONNAME,
            USERDIVETRIPSCOLLECTION
          ),
          (userDiveTrips) => {
            this.userDiveTrips = userDiveTrips.data();
            DatabaseService.saveLocalDocument(
              USERDIVETRIPSCOLLECTION,
              this.userDiveTrips
            );
            this.userDiveTrips$.next(this.userDiveTrips);
          }
        );

        this.userDivePlansSub = onSnapshot<UserDivePlans, UserDivePlans>(
          doc(firestore, USERDIVEPLANSCOLLECTION, user.uid),
          async (userDivePlans) => {
            //check with offline modified data
            const plans = await DatabaseService.checkCollectionWithOfflineData(
              USERDIVEPLANSCOLLECTION,
              userDivePlans.data(),
              false
            );
            this.userDivePlans = new UserDivePlans(plans);
            DatabaseService.saveLocalDocument(
              USERDIVEPLANSCOLLECTION,
              this.userDivePlans
            );
            this.userDivePlans$.next(this.userDivePlans);
          }
        );

        this.userCardsSub = onSnapshot<any, any>(
          doc(firestore, USERCARDSCOLLECTION, user.uid),
          (userCards) => {
            this.userCards = new UserCards(userCards.data());
            DatabaseService.saveLocalDocument(
              USERCARDSCOLLECTION,
              this.userCards
            );
            this.userCards$.next(this.userCards);
          }
        );
      }
    } else {
      this.logoutUser();
    }
  }

  updateOfflineUserRolesEditorOf(type, docId) {
    this.userRoles.editorOf[docId] = type;
    this.userRoles$.next(this.userRoles);
  }

  async setLanguage(userSettings) {
    if (userSettings && userSettings.settings) {
      //this.user = new User(data);
      const lang = userSettings.settings.language
        ? userSettings.settings.language
        : "en";
      TranslationService.setLanguage(lang);
      //wait for menu to re-render --> required to render correct translations after menu update
      await customElements.whenDefined("app-menu");
      await setTimeout(() => TranslationService.setLanguage(lang), 200);
    } else {
      TranslationService.setLanguage("en");
    }
  }

  logoutUser() {
    this.userProfile = null;
    this.userSettings = null;
    this.userRoles = null;
    this.userDivePlans = null;
    this.userDiveTrips = null;
    this.userDivingClasses = null;
    this.userChats = null;
    this.userCards = null;
    this.userPreferred = null;
    this.userProfile$.next(null);
    this.userSettings$.next(null);
    this.userRoles$.next(null);
    this.userDivePlans$.next(null);
    this.userDiveTrips$.next(null);
    this.userDivingClasses$.next(null);
    this.userChats$.next(null);
    this.userCards$.next(null);
    this.userPreferred$.next(null);
    this.userProfileSub ? this.userProfileSub.unsubscribe() : undefined;
    this.userRolesSub ? this.userRolesSub() : undefined;
    this.userDivePlansSub ? this.userDivePlansSub() : undefined;
    this.userDiveTripsSub ? this.userDiveTripsSub() : undefined;
    this.userDivingClassesSub ? this.userDivingClassesSub() : undefined;
    this.userChatsSub ? this.userChatsSub() : undefined;
    this.userSettingsSub ? this.userSettingsSub() : undefined;
    this.userCardsSub ? this.userCardsSub() : undefined;
    this.userPreferredSub ? this.userPreferredSub() : undefined;
  }

  async notRegisteredUser() {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "not-registered-user-header",
        "Registration required"
      ),
      message: TranslationService.getTransl(
        "not-registered-user-message",
        "This feature requires user registration. Do you want to register?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            RouterService.push("/login", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(
      USERPROFILECOLLECTION,
      type,
      uid,
      file
    );
  }

  updateUserProfile(profile: UserProfile) {
    this.userProfile = new UserProfile(profile);
    DatabaseService.saveLocalDocument(USERPROFILECOLLECTION, this.userProfile);
    DatabaseService.updateDocument(
      USERPROFILECOLLECTION,
      this.userProfile.uid,
      this.userProfile
    );
    this.userProfile$.next(this.userProfile);
  }

  updateUserCards(userCards: UserCards) {
    this.userCards = userCards;
    DatabaseService.saveLocalDocument(USERCARDSCOLLECTION, this.userCards);
    DatabaseService.updateDocument(
      USERCARDSCOLLECTION,
      this.userCards.uid,
      this.userCards
    );
    this.userCards$.next(this.userCards);
  }

  updateUserSettings(settings: UserSettings) {
    this.userSettings = new UserSettings(settings);
    DatabaseService.saveLocalDocument(
      USERSETTINGSCOLLECTION,
      this.userSettings
    );
    DatabaseService.updateUserSettingsDocument(
      this.userSettings.uid,
      SETTINGSCOLLECTIONNAME,
      this.userSettings
    );
    this.userSettings$.next(this.userSettings);
  }

  updateUserLocalPlans(plans: DivePlanModel[]) {
    this.userSettings.localPlans = plans;
    this.updateUserSettings(this.userSettings);
  }

  updateUserConfigurations(configurations: DiveConfiguration[]) {
    this.userSettings.userConfigurations = configurations;
    this.updateUserSettings(this.userSettings);
  }

  updateUserTanks(tanks: TankModel[]) {
    this.userSettings.userTanks = tanks;
    this.updateUserSettings(this.userSettings);
  }

  addPreferredItem(collectionId, id) {
    if (!this.userPreferred || Object.keys(this.userPreferred).length == 0) {
      this.userPreferred = {
        uid: this.userPreferred.uid,
        preferred: {},
      };
    }
    this.userPreferred.preferred[id] = {
      collectionId: collectionId,
      id: id,
    };
    this.updateUserPreferred(this.userPreferred);
  }

  removePreferredItem(id) {
    delete this.userPreferred.preferred[id];
    this.updateUserPreferred(this.userPreferred);
  }

  updateUserPreferred(preferred: UserPreferred) {
    this.userPreferred = preferred;
    DatabaseService.saveLocalDocument(
      USERPREFERREDCOLLECTION,
      this.userPreferred
    );
    DatabaseService.updateDocumentCollection(
      USERPROFILECOLLECTION,
      this.userProfile.uid,
      USERPREFERREDCOLLECTION,
      USERPREFERREDCOLLECTION,
      this.userPreferred
    );
  }

  presentUserUpdate() {
    let modalName = "modal-user-update";
    RouterService.openModal(modalName);
  }

  presentUserDetails(id) {
    let modalName = "modal-user-details";
    RouterService.openModal(modalName, {
      userId: id,
    });
  }

  async checkLicence(licence, showAlert = false) {
    if (this.userRoles) {
      const check = this.userRoles.check(licence);
      if (!check.hasLicence && !this.isAlertOpen && showAlert) {
        this.isAlertOpen = true;
        let confirm = await alertController.create({
          header: TranslationService.getTransl(
            "licence-missing-alert",
            "Missing licence!"
          ),
          message:
            check.message +
            "<br>" +
            TranslationService.getTransl(
              "licence-purchase",
              "Do you want to check purchase options?"
            ),
          buttons: [
            {
              text: TranslationService.getTransl("ok", "OK"),
              handler: () => {
                this.isAlertOpen = false;
              },
            },
            {
              text: TranslationService.getTransl("cancel", "Cancel"),
              handler: () => {
                this.isAlertOpen = false;
              },
            },
          ],
        });
        confirm.present();
      }

      return check.hasLicence;
    } else if (!this.isAlertOpen && showAlert) {
      this.isAlertOpen = true;
      let confirm = await alertController.create({
        header: TranslationService.getTransl("login", "Login"),
        message: TranslationService.getTransl(
          "login-alert",
          "You must login to access this feature."
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: () => {
              this.isAlertOpen = false;
            },
          },
        ],
      });
      confirm.present();
    }
    return false;
  }

  getMapDataUserDetails(userId): Promise<any> {
    /* OLD using mapData
    if (this.userPublicProfilesList.length > 0) {
      let ret = this.userPublicProfilesList.find((user) => user.id == userId);
      if (!ret) {
        ret = await this.getPublicProfileUserDetails(userId);
      }
      return ret;
    } else {
      return null;
    }*/
    //new using query
    return this.getPublicProfileUserDetails(userId);
  }

  editUserRoles(uid) {
    let modalName = "modal-edit-user-roles";
    RouterService.openModal(modalName, {
      uid: uid,
    });
  }

  async getPublicProfileUserDetails(userId): Promise<UserPubicProfile> {
    return new UserPubicProfile(
      await DatabaseService.getDocument(USERPUBLICPROFILECOLLECTION, userId)
    );
  }

  async searchUserByEmail(email: string) {
    const ref = query(
      collection(firestore, USERPUBLICPROFILECOLLECTION),
      where("email", "==", email)
    );
    const res = await getDocs(ref);
    const results = [];
    if (!res.empty) {
      res.forEach((doc) => {
        const query = doc.data();
        results.push(query);
      });
      return results[0];
    }
    return res.empty;
  }

  async getOrganiser(type, organiser) {
    //type: name or item
    var item = null;
    if (organiser) {
      switch (organiser.collectionId) {
        case USERPROFILECOLLECTION:
          item = this.getPublicProfileUserDetails(organiser.id);
          break;
        case DIVECENTERSSCOLLECTION:
          item = DivingCentersService.divingCentersList.find(
            (dc) => dc.id === organiser.id
          );
          break;
        case DIVECOMMUNITIESCOLLECTION:
          item = DiveCommunitiesService.diveCommunitiesList.find(
            (dc) => dc.id === organiser.id
          );
          break;
        case DIVESCHOOLSSCOLLECTION:
          item = DivingSchoolsService.divingSchoolsList.find(
            (school) => school.id === organiser.id
          );
          break;
        case SERVICECENTERSCOLLECTION:
          item = ServiceCentersService.serviceCentersList.find(
            (sc) => sc.id === organiser.id
          );
          break;
      }
      if (type === "name") {
        return item ? item.displayName : null;
      } else {
        return item;
      }
    }
    return null;
  }

  async getUserGeoposition(forceUpdate = false): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (forceUpdate || !this.userGeoposition) {
        Geolocation.getCurrentPosition().then((position) => {
          console.log("getCurrentPosition", position);
          if (position && position.coords) {
            this.userGeoposition = position;
            resolve(position);
          } else {
            reject();
          }
        });
      } else {
        resolve(this.userGeoposition);
      }
    });
  }

  isLoggedin() {
    if (this.userProfile && this.userProfile.uid) {
      return true;
    } else {
      return false;
    }
  }
}
export const UserService = new UserController();
