import {alertController, popoverController} from "@ionic/core";
import {DatabaseService, SETTINGSCOLLECTIONNAME} from "../common/database";
import {
  DiveTrip,
  TripDive,
  TeamMember,
} from "../../interfaces/udive/dive-trip/diveTrip";
import {TranslationService} from "../common/translations";
import {RouterService} from "../common/router";
import {DiveSitesService} from "./diveSites";
import {BehaviorSubject} from "rxjs";
import {SystemService} from "../common/system";
import {DivingSchoolsService} from "./divingSchools";
import {DivingCentersService, DIVECENTERSSCOLLECTION} from "./divingCenters";
import {ChatService} from "../common/chat";
import {UserService, USERPROFILECOLLECTION} from "../common/user";
import {addHours} from "date-fns";
import {CallableFunctionsUdiveService} from "./callableFunctions";

export const DIVETRIPSCOLLECTION = "diveTrips";

export class DiveTripsController {
  creatingNewDiveTrip$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  creatingNewDiveTrip = false; //used to show skeleton on pages during the creation of a dive trip
  editingDiveTripId$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  editingDiveTripId: string;

  resetSkeletons() {
    this.setCreatingNewDiveTrip(false);
    this.setEditingDiveTrip("");
  }
  setCreatingNewDiveTrip(val) {
    this.creatingNewDiveTrip = val;
    this.creatingNewDiveTrip$.next(this.creatingNewDiveTrip);
  }
  setEditingDiveTrip(val) {
    this.editingDiveTripId = val;
    this.editingDiveTripId$.next(this.editingDiveTripId);
  }

  async presentDiveTripUpdate(collectionId, organiserId, id?) {
    //if id then not necessary to have collectionId and userId
    if (id) {
      //this.setEditingDiveTrip(id);
      this.setCreatingNewDiveTrip(false);
    } else {
      this.setEditingDiveTrip("");
      this.setCreatingNewDiveTrip(true);
    }
    const editModal = await RouterService.openModal("modal-dive-trip-update", {
      collectionId: collectionId,
      organiserId: organiserId,
      diveTripId: id,
    });
    editModal.onDidDismiss().then((cancelled) => {
      if (cancelled.data) {
        this.resetSkeletons();
      }
    });
  }

  async presentDiveTripDetails(id) {
    if (window.location.pathname.includes("admin")) {
      if (window.location.pathname.includes("divingschools")) {
        RouterService.push(
          "/admin/divingschools/" +
            DivingSchoolsService.selectedDivingSchoolId +
            "/divetrips/" +
            id,
          "forward"
        );
      } else if (window.location.pathname.includes("divingcenters")) {
        RouterService.push(
          "/admin/divingcenters/" +
            DivingCentersService.selectedDivingCenterId +
            "/divetrips/" +
            id,
          "forward"
        );
      }
    } else {
      RouterService.push("/divetrips/" + id, "forward");
    }
  }

  async pushDiveTrip(id) {
    RouterService.pushToActualUrl(id, "forward");
  }

  async getDiveTrip(id) {
    const diveTrip = await DatabaseService.getDocument(DIVETRIPSCOLLECTION, id);
    return new DiveTrip(diveTrip);
  }

  async getTripsSummary(collection, id) {
    const diveTrips = await DatabaseService.getDocumentCollection(
      collection,
      id,
      SETTINGSCOLLECTIONNAME,
      DIVETRIPSCOLLECTION
    );
    return diveTrips;
  }
  async getArchiveTripsSummary(collection, id) {
    const diveTrips = await DatabaseService.getDocumentCollection(
      collection,
      id,
      SETTINGSCOLLECTIONNAME,
      DIVETRIPSCOLLECTION
    );
    return diveTrips;
  }

  async updateDiveTrip(id: string, diveTrip: DiveTrip) {
    if (!id) {
      //create chat
      const chat = await ChatService.createNewChat(
        diveTrip.organiser.collectionId,
        diveTrip.organiser.id,
        await UserService.getOrganiser("name", diveTrip.organiser),
        {collectionId: DIVETRIPSCOLLECTION, id: id}
      );
      diveTrip.chatId = chat.id;
      //create trip
      await DatabaseService.addDocument(DIVETRIPSCOLLECTION, diveTrip);
      this.updateChatInfo(chat.id, diveTrip);
    } else {
      //update chat
      await DatabaseService.updateDocument(DIVETRIPSCOLLECTION, id, diveTrip);
      this.updateChatInfo(diveTrip.chatId, diveTrip);
    }
    return true;
  }

  async updateChatInfo(chatId, diveTrip: DiveTrip) {
    const chat = await ChatService.getChat(chatId);
    chat.name = diveTrip.displayName;
    //create all participants list
    const tripParticipants = {};
    diveTrip.tripDives.map(async (tripDive) => {
      tripDive.bookings.map(async (booking) => {
        //save only confirmed users
        if (booking.confirmedOrganiser) {
          tripParticipants[booking.uid] = {
            collectionId: USERPROFILECOLLECTION,
            id: booking.uid,
            displayName: await UserService.getOrganiser("name", {
              collectionId: USERPROFILECOLLECTION,
              id: booking.uid,
            }),
          };
        }
      });
      tripDive.divePlan.dives.map(async (dive) => {
        //save diving center
        if (dive.divingCenterId) {
          tripParticipants[dive.divingCenterId] = {
            collectionId: DIVECENTERSSCOLLECTION,
            id: dive.divingCenterId,
            displayName: await UserService.getOrganiser("name", {
              collectionId: DIVECENTERSSCOLLECTION,
              id: dive.divingCenterId,
            }),
          };
        }
      });
    });
    //add team to chat
    Object.keys(diveTrip.users).map(async (id) => {
      tripParticipants[id] = {
        collectionId: USERPROFILECOLLECTION,
        id: id,
        displayName: await UserService.getOrganiser("name", {
          collectionId: USERPROFILECOLLECTION,
          id: id,
        }),
      };
    });

    //compare tripParticipants with previous chat participants
    const added = Object.keys(tripParticipants).filter(
      (x) => !Object.keys(chat.participants).includes(x)
    );
    const removed = Object.keys(chat.participants).filter(
      (x) => !Object.keys(tripParticipants).includes(x)
    );
    const addedArray = [];
    const removedArray = [];
    added.map((id) => {
      addedArray.push(tripParticipants[id]);
    });
    removed.map((id) => {
      removedArray.push(chat.participants[id]);
    });
    ChatService.updateParticipants(chatId, chat, {
      added: addedArray,
      removed: removedArray,
    });
  }

  async addDiveTrip(
    diveTrip: DiveTrip,
    tripIndex?: number,
    diveIndex?: number
  ): Promise<DiveTrip> {
    return new Promise(async (resolve) => {
      let trip = tripIndex >= 0 ? diveTrip.tripDives[tripIndex] : undefined;
      const popover = await popoverController.create({
        component: "popover-new-dive-trip",
        translucent: true,
        componentProps: {tripDive: trip, diveIndex: diveIndex},
      });
      popover.onDidDismiss().then(async (ev) => {
        //load dive site and create dive trip
        const tripData = ev.data;
        const site = await DiveSitesService.getDiveSite(tripData.diveSiteId);
        let divePlan = null;
        if (tripData.divePlanName) {
          divePlan = site.divePlans.find(
            (plan) => plan.configuration.stdName === tripData.divePlanName
          );
        } else {
          //dummy dive plan
          divePlan = {
            dives: [
              {
                date: null,
                diveSiteId: null,
                divingCenterId: null,
              },
            ],
          };
        }

        if (!trip) {
          //set date and site id of plan
          divePlan.dives[0].date = tripData.date;
          divePlan.title = tripData.title;
          divePlan.dives[0].diveSiteId = tripData.diveSiteId;
          divePlan.dives[0].divingCenterId = tripData.divingCenterId;
          diveTrip.tripDives.push({
            divePlan: divePlan,
            numberOfParticipants: tripData.participants,
            bookings: [],
          });
        } else if (diveIndex >= 0) {
          //update tripdive
          trip.divePlan.title = tripData.title;
          trip.divePlan.dives[diveIndex] = divePlan.dives[0];
          trip.divePlan.dives[diveIndex].diveSiteId = tripData.diveSiteId;
          trip.divePlan.dives[diveIndex].divingCenterId =
            tripData.divingCenterId;
          if (diveIndex == 0) {
            trip.numberOfParticipants = tripData.participants;
            trip.divePlan.dives[diveIndex].date = tripData.date;
          } else {
            trip.divePlan.dives[diveIndex].surfaceInterval =
              tripData.surfaceInterval;
          }
          trip = this.updateDiveTimes(trip);
        } else {
          //add a new dive to plan
          trip.divePlan.addDive(divePlan.dives[0]);
          const lastDive = trip.divePlan.dives.length;
          trip.divePlan.dives[lastDive - 1].surfaceInterval =
            tripData.surfaceInterval;
          trip = this.updateDiveTimes(trip);
        }
        resolve(diveTrip);
      });
      popover.present();
    });
  }

  removeDiveTrip(diveTrip: DiveTrip, index: number): DiveTrip {
    diveTrip.tripDives.splice(index, 1);
    return diveTrip;
  }

  removeTripDive(
    diveTrip: DiveTrip,
    tripIndex: number,
    diveIndex: number
  ): DiveTrip {
    diveTrip.tripDives[tripIndex].divePlan.dives.splice(diveIndex, 1);
    diveTrip.tripDives[tripIndex] = this.updateDiveTimes(
      diveTrip.tripDives[tripIndex]
    );
    return diveTrip;
  }

  updateDiveTimes(trip: TripDive): TripDive {
    //update all dates according to surface time
    for (let i = 1; i < trip.divePlan.dives.length; i++) {
      trip.divePlan.dives[i].date = addHours(
        trip.divePlan.dives[i - 1].date,
        trip.divePlan.dives[i].surfaceInterval
      );
      /*moment(trip.divePlan.dives[i - 1].date)
        .add(trip.divePlan.dives[i].surfaceInterval, "hours")
        .toDate();*/
    }
    return trip;
  }

  async deleteDiveTrip(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-trip-header",
        "Delete Dive Trip?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-trip-message",
        "This dive trip will be deleted! Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            DiveTripsService.setEditingDiveTrip(id);
            DatabaseService.deleteDocument(DIVETRIPSCOLLECTION, id);
          },
        },
      ],
    });
    confirm.present();
  }

  async sendBookingRequest(
    diveTripId,
    tripDiveIndex,
    role,
    team,
    uid,
    confirmedUser,
    confirmedOrganiser
  ): Promise<TeamMember[]> {
    return new Promise(async (resolve, reject) => {
      const addBooking: TeamMember = {
        role: role,
        team: team,
        uid: uid,
        confirmedUser: confirmedUser,
        confirmedOrganiser: confirmedOrganiser,
      };
      try {
        const res = await CallableFunctionsUdiveService.addBookingToTrip(
          diveTripId,
          tripDiveIndex,
          addBooking
        );
        resolve(res.data);
      } catch (error) {
        SystemService.presentAlertError(error);
        reject(error);
      }
    });
  }
}
export const DiveTripsService = new DiveTripsController();
