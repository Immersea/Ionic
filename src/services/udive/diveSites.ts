import { StorageService } from "../common/storage";
import { alertController } from "@ionic/core";
import { DatabaseService } from "../common/database";
import {
  DiveSite,
  MapDataDiveSite,
} from "../../interfaces/udive/dive-site/diveSite";
import { TranslationService } from "../common/translations";
import { UDiveFilterService } from "./ud-db-filter";
import { orderBy } from "lodash";
import { RouterService } from "../common/router";
import { BehaviorSubject } from "rxjs";
import { DivingCentersService } from "./divingCenters";

export const DIVESITESCOLLECTION = "diveSites";

export class DiveSitesController {
  showNewDivePlans = false;
  diveSitesList: MapDataDiveSite[] = [];
  diveSitesList$: BehaviorSubject<MapDataDiveSite[]> = new BehaviorSubject([]);

  init() {
    //test
    UDiveFilterService.mapDataSub$.subscribe(() => {
      const collection =
        UDiveFilterService.getCollectionArray(DIVESITESCOLLECTION);
      if (collection && collection.length > 0) {
        this.diveSitesList = collection;
        this.diveSitesList$.next(this.diveSitesList);
      }
    });
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataDiveSite(collection[item]);
      });
    return result;
  }

  async presentDiveSiteUpdate(id?) {
    await RouterService.openModal("modal-dive-site-update", { diveSiteId: id });
  }

  async presentDiveSiteDetails(id, newdive = false) {
    this.showNewDivePlans = newdive;
    RouterService.push("/divesite/" + id, "forward");
  }

  async getDiveSite(id) {
    const diveSite = await DatabaseService.getDocument(DIVESITESCOLLECTION, id);
    return new DiveSite(diveSite);
  }

  async updateDiveSite(id, diveSite, userId) {
    if (!id) {
      //set owner of new site
      diveSite.users[userId] = ["owner"];
      await DatabaseService.addDocument(DIVESITESCOLLECTION, diveSite);
    } else {
      await DatabaseService.updateDocument(DIVESITESCOLLECTION, id, diveSite);
    }
    return true;
  }

  async deleteDiveSite(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-site-header",
        "Delete Dive Site?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-site-message",
        "This dive site will be deleted! Are you sure?"
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
            DatabaseService.deleteDocument(DIVESITESCOLLECTION, id);
            RouterService.push("/", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(DIVESITESCOLLECTION, type, uid, file);
  }

  getDiveSitesDetails(siteId): MapDataDiveSite {
    if (this.diveSitesList.length > 0) {
      return this.diveSitesList.find((site) => site.id == siteId);
    } else {
      return null;
    }
  }

  getSiteTypes() {
    return [
      {
        type: "reef",
        name: TranslationService.getTransl("reef", "Reef"),
      },
      {
        type: "wreck",
        name: TranslationService.getTransl("wreck", "Wreck"),
      },
      {
        type: "cave",
        name: TranslationService.getTransl("cave", "Cave"),
      },
    ];
  }

  getSiteTypeName(type) {
    return this.getSiteTypes().find((item) => item.type === type).name;
  }

  getEntryTypes() {
    return [
      {
        type: "shore",
        name: TranslationService.getTransl("shore", "Shore"),
      },
      {
        type: "boat",
        name: TranslationService.getTransl("boat", "Boat"),
      },
    ];
  }

  getEntryTypeName(type) {
    return this.getEntryTypes().find((item) => item.type === type).name;
  }

  getSeabedCompositions() {
    return [
      {
        type: "coral-reef",
        name: TranslationService.getTransl("coral-reef", "Coral Reef"),
      },
      {
        type: "rocky-reef",
        name: TranslationService.getTransl("rocky-reef", "Rocky Reed"),
      },
      {
        type: "boulders",
        name: TranslationService.getTransl("boulders", "Boulders"),
      },
      {
        type: "cobbles",
        name: TranslationService.getTransl("cobbles", "Cobbles"),
      },
      {
        type: "gravel",
        name: TranslationService.getTransl("gravel", "Gravel"),
      },
      {
        type: "sand",
        name: TranslationService.getTransl("sand", "Sand"),
      },
      {
        type: "seagrass",
        name: TranslationService.getTransl("seagrass", "Seagrass"),
      },
      {
        type: "mud",
        name: TranslationService.getTransl("mud", "Mud"),
      },
    ];
  }

  getSeabedCompositionName(type) {
    return this.getSeabedCompositions().find((item) => item.type === type).name;
  }

  getSeabedCovers() {
    return [
      {
        type: "seagrass",
        name: TranslationService.getTransl("seagrass", "Seagrass"),
      },
      {
        type: "turf-algae",
        name: TranslationService.getTransl("turf-algae", "Turf Algae"),
      },
      {
        type: "frondose-algae",
        name: TranslationService.getTransl("frondose-algae", "Frondose Algae"),
      },
      {
        type: "coralline-algae",
        name: TranslationService.getTransl(
          "coralline-algae",
          "Coralline Algae"
        ),
      },
      {
        type: "hard-coral",
        name: TranslationService.getTransl("hard-coral", "Hard Coral"),
      },
      {
        type: "soft-coral",
        name: TranslationService.getTransl("soft-coral", "Soft Coral"),
      },
      {
        type: "sponge",
        name: TranslationService.getTransl("sponge", "Sponge"),
      },
      {
        type: "benthic-animals",
        name: TranslationService.getTransl(
          "benthic-animals",
          "Benthic Animals"
        ),
      },
      {
        type: "bare",
        name: TranslationService.getTransl("bare", "Bare"),
      },
    ];
  }

  getSeabedCoverName(type) {
    return this.getSeabedCovers().find((item) => item.type === type).name;
  }

  loadSiteDivingCenters(diveSite) {
    const divingCenters = DivingCentersService.divingCentersList;
    let siteDivingCenters = [];
    let siteDivingCenterSelect = [];
    divingCenters.forEach((center) => {
      if (diveSite.divingCenters.includes(center.id)) {
        siteDivingCenters.push(center);
      } else {
        siteDivingCenterSelect.push(center);
      }
    });
    siteDivingCenters = orderBy(siteDivingCenters, "displayName");
    siteDivingCenterSelect = orderBy(siteDivingCenterSelect, "displayName");
    return {
      siteDivingCenters: siteDivingCenters,
      divingCenterSelect: siteDivingCenterSelect,
    };
  }
}
export const DiveSitesService = new DiveSitesController();
