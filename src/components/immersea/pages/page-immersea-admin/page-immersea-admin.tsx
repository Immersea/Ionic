import {Component, h, State} from "@stencil/core";
import {MapDataImmerseaLocation} from "../../../../interfaces/immersea/immerseaLocation";
import {RouterService} from "../../../../services/common/router";
import {TranslationService} from "../../../../services/common/translations";
import {ImmerseaLocationsService} from "../../../../services/immersea/immerseaLocations";
import {Subscription} from "rxjs";
import {cloneDeep, find, orderBy} from "lodash";

@Component({
  tag: "page-immersea-admin",
  styleUrl: "page-immersea-admin.scss",
})
export class PageImmerseaAdmin {
  @State() segmentSelected;
  sectionSelected: any;
  sections: any;
  immerseaLocationsList: {[section: string]: MapDataImmerseaLocation[]};
  immerseaLocationsListSub: Subscription;
  @State() updateView = false;

  componentWillLoad() {
    this.sections = ImmerseaLocationsService.getSections();
    this.segmentChanged({detail: {value: "nature"}});
    this.immerseaLocationsListSub =
      ImmerseaLocationsService.immerseaLocationsList$.subscribe((list) => {
        this.immerseaLocationsList = list;
        this.updateView = !this.updateView;
      });
  }

  disconnectedCallback() {
    this.immerseaLocationsListSub.unsubscribe();
  }

  segmentChanged(ev) {
    this.segmentSelected = ev.detail.value;
    this.sectionSelected = find(this.sections, {
      tag: this.segmentSelected,
    });
  }

  async reorderListItems(reorder) {
    const section = this.immerseaLocationsList[this.sectionSelected.tag];
    const itemsBackup = cloneDeep(section);
    const itemMove = itemsBackup.splice(reorder.detail.from, 1)[0];
    itemsBackup.splice(reorder.detail.to, 0, itemMove);
    console.log("itemsBackup", itemsBackup);
    itemsBackup.forEach((x, order) => {
      !x.order ? (x.order = {}) : undefined;
      x.order[this.sectionSelected.tag] = order;
    });
    reorder.detail.complete();
    this.immerseaLocationsList[this.sectionSelected.tag] = orderBy(
      itemsBackup,
      [this.sectionSelected.tag] + ".order"
    );
    console.log(
      "reorderListItems",
      this.immerseaLocationsList[this.sectionSelected.tag]
    );
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="immersea">
          <ion-title>Admin</ion-title>
          <ion-buttons slot="start">
            <ion-button onClick={() => RouterService.push("news", "root")}>
              <ion-icon name="arrow-back"></ion-icon>
              <ion-label>BACK</ion-label>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-toolbar color="immersea">
          <ion-segment
            mode="md"
            onIonChange={(ev) => this.segmentChanged(ev)}
            value="nature"
          >
            {this.sections.map((section) => (
              <ion-segment-button value={section.tag}>
                <ion-icon
                  class={
                    section.icon.type == "mapicon"
                      ? "marker map-icon " + section.icon.name
                      : undefined
                  }
                  name={
                    section.icon.type == "ionicon"
                      ? section.icon.name
                      : undefined
                  }
                ></ion-icon>
                <ion-label>
                  {TranslationService.getTransl(section.tag, section.text)}
                </ion-label>
              </ion-segment-button>
            ))}
          </ion-segment>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list>
          {!this.immerseaLocationsList[this.sectionSelected.tag] ||
          (this.immerseaLocationsList[this.sectionSelected.tag] &&
            this.immerseaLocationsList[this.sectionSelected.tag].length ==
              0) ? (
            <ion-item>
              <ion-label>Nessuna location disponibile</ion-label>
            </ion-item>
          ) : (
            <ion-reorder-group
              disabled={false}
              onIonItemReorder={(ev) => this.reorderListItems(ev)}
            >
              {this.immerseaLocationsList[this.sectionSelected.tag].map(
                (location) => (
                  <ion-item
                    button
                    detail
                    onClick={() =>
                      ImmerseaLocationsService.presentLocationDetails(
                        location.id
                      )
                    }
                  >
                    {location.coverURL ? (
                      <ion-avatar slot="start">
                        <img src={location.coverURL} />
                      </ion-avatar>
                    ) : (
                      <ion-icon slot="start" name="globe-outline"></ion-icon>
                    )}
                    <ion-label>{location.displayName}</ion-label>
                    <ion-reorder slot="end"></ion-reorder>
                  </ion-item>
                )
              )}
            </ion-reorder-group>
          )}
        </ion-list>
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button
            color="immersea"
            onClick={() => ImmerseaLocationsService.presentLocationUpdate()}
          >
            <ion-icon name="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>,
    ];
  }
}
