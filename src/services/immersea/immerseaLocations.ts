import {StorageService} from "../common/storage";
import {alertController} from "@ionic/core";
import {DatabaseService} from "../common/database";

import {TranslationService} from "../common/translations";
import {RouterService} from "../common/router";
import {BehaviorSubject} from "rxjs";
import {
  ImmerseaLocation,
  MapDataImmerseaLocation,
} from "../../interfaces/immersea/immerseaLocation";
import {ImmerseaFilterService} from "./db-filter";

export const IMMERSEALOCATIONSCOLLECTION = "immerseaLocations";

export class ImmerseaLocationsController {
  immerseaLocationsList: {[section: string]: MapDataImmerseaLocation[]} = {};
  immerseaLocationsList$: BehaviorSubject<{
    [section: string]: MapDataImmerseaLocation[];
  }> = new BehaviorSubject({});

  init() {
    ImmerseaFilterService.mapDataSub$.subscribe(() => {
      const collection = ImmerseaFilterService.getCollectionArray(
        IMMERSEALOCATIONSCOLLECTION
      );
      if (collection && Object.keys(collection).length > 0) {
        this.immerseaLocationsList = collection;
        this.immerseaLocationsList$.next(this.immerseaLocationsList);
      }
    });
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataImmerseaLocation(collection[item]);
      });
    return result;
  }

  async presentLocationUpdate(id?) {
    await RouterService.openModal("modal-immersea-location-update", {
      locationId: id,
    });
  }

  async presentLocationDetails(id) {
    RouterService.push("/location/" + id, "forward");
  }

  async getLocation(id) {
    const location = await DatabaseService.getDocument(
      IMMERSEALOCATIONSCOLLECTION,
      id
    );
    return new ImmerseaLocation(location);
  }

  async updateLocation(id, location, userId) {
    if (!id) {
      //set owner of new site
      location.users[userId] = ["owner"];
      await DatabaseService.addDocument(IMMERSEALOCATIONSCOLLECTION, location);
    } else {
      await DatabaseService.updateDocument(
        IMMERSEALOCATIONSCOLLECTION,
        id,
        location
      );
    }
    return true;
  }

  async deleteLocation(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-immersea-location-header",
        "Delete Location?"
      ),
      message: TranslationService.getTransl(
        "delete-immersea-location-message",
        "This location will be deleted! Are you sure?"
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
            DatabaseService.deleteDocument(IMMERSEALOCATIONSCOLLECTION, id);
            RouterService.push("/", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(
      IMMERSEALOCATIONSCOLLECTION,
      type,
      uid,
      file
    );
  }

  getSections() {
    return [
      {
        tag: "nature",
        text: "Nature",
        icon: {
          type: "ionicon",
          name: "fish",
          color: "immersea-culture",
        },
      },
      {
        tag: "culture",
        text: "Culture",
        icon: {
          type: "mapicon",
          name: "map-icon-museum",
          color: "immersea-community",
        },
      },
      {
        tag: "sustainability",
        text: "Sustainability",
        icon: {
          type: "ionicon",
          name: "earth",
          color: "immersea",
        },
      },
      {
        tag: "insights",
        text: "Insights",
        icon: {
          type: "ionicon",
          name: "book",
          color: "immersea",
        },
      },
    ];
  }

  getTopics() {
    return [
      {tag: "elements_history", text: "Elements of history"},
      {tag: "uai", text: "Underwater Archaeological Itineraries"},
      {tag: "museums", text: "Museums"},
      {
        tag: "archeo_parks",
        text: "Archaeological parks and cultural curiosities",
      },
    ];
  }
}
export const ImmerseaLocationsService = new ImmerseaLocationsController();
