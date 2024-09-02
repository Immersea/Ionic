import {Component, h, Host, State, Element, Prop} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep} from "lodash";
import {Environment} from "../../../../global/env";
import {DatasheetsService} from "../../../../services/trasteel/refractories/datasheets";
import {ShapesService} from "../../../../services/trasteel/refractories/shapes";

@Component({
  tag: "modal-search-list",
  styleUrl: "modal-search-list.scss",
})
export class ModalSearchList {
  @Prop() list: any[];
  @Prop() searchTitle: {tag: string; text: string};
  nonFilteredList: any[];
  @Prop() item: any;
  @Prop() showField: string;
  @Prop() orderBy: string[] = [];
  @Prop() filterBy: string[];
  @Prop() placeholder: string;
  @Prop() filterObject: any;
  clearFilterObject: any;
  @Prop() filterPopup: any;
  @Prop() filterFunction: any;
  @Element() el: HTMLElement;
  searchString: string;
  @State() filteredList: any[];
  start: number;
  listLength: number;

  componentWillLoad() {
    this.nonFilteredList = cloneDeep(this.list);
    this.clearFilterObject = cloneDeep(this.filterObject);
  }

  async openFilter() {
    this.filterObject = await this.filterPopup(this.filterObject);
    this.list = await this.filterFunction(this.filterObject);
  }

  clearFilter() {
    this.filterObject = cloneDeep(this.clearFilterObject);
    this.list = cloneDeep(this.nonFilteredList);
  }

  handleSelect(item) {
    modalController.dismiss(item);
  }

  renderKey(key) {
    let res = null;
    switch (key) {
      case "familyId":
        res = DatasheetsService.getDatasheetFamilies(this.filterObject[key])[0]
          .familyName;
        break;
      case "majorFamilyId":
        res = DatasheetsService.getDatasheetMajorFamilies(
          this.filterObject[key]
        )[0].majorFamilyName;
        break;
      case "shapeTypeId":
        res = ShapesService.getShapeTypeName(this.filterObject[key]).en;
        break;
      default:
        res = key + " = " + this.filterObject[key];
        break;
    }
    return res;
  }

  close() {
    modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <app-navbar
            tag={this.searchTitle.tag ? this.searchTitle.tag : "find"}
            text={this.searchTitle.text ? this.searchTitle.text : "Find"}
            color={Environment.getAppColor()}
            rightButtonText={{
              icon: "close",
              tag: null,
              text: null,
              fill: "clear",
            }}
            rightButtonFc={this.close}
          ></app-navbar>
          <ion-grid class="ion-no-padding">
            <ion-row class="ion-no-padding">
              {this.filterObject ? (
                <ion-col size="1" class="ion-no-padding">
                  <ion-toolbar color={Environment.getAppColor()}>
                    <ion-button
                      fill="clear"
                      expand="full"
                      icon-only
                      onClick={() => this.openFilter()}
                    >
                      <ion-icon name="filter" color="light"></ion-icon>
                    </ion-button>
                  </ion-toolbar>
                </ion-col>
              ) : undefined}

              <ion-col
                size={this.filterObject ? "11" : "12"}
                class="ion-no-padding"
              >
                <app-search-toolbar
                  list={this.list}
                  orderFields={[this.showField]}
                  color="trasteel"
                  placeholder={this.placeholder ? this.placeholder : "search"}
                  filterBy={this.filterBy}
                  onFilteredList={(ev) => (this.filteredList = ev.detail)}
                ></app-search-toolbar>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-header>
        <ion-content>
          {this.filterObject && this.filterObject.isActive()
            ? [
                <ion-breadcrumbs>
                  <ion-button
                    icon-only
                    fill="clear"
                    onClick={() => this.clearFilter()}
                  >
                    <ion-icon color="danger" name="trash"></ion-icon>
                  </ion-button>
                  <ion-breadcrumb></ion-breadcrumb>
                  {Object.keys(this.filterObject).map((key) =>
                    key != "oldProduct" &&
                    (this.filterObject[key] > 0 ||
                      this.filterObject[key] !== null) ? (
                      <ion-breadcrumb>{this.renderKey(key)}</ion-breadcrumb>
                    ) : undefined
                  )}
                  <ion-breadcrumb></ion-breadcrumb>
                </ion-breadcrumbs>,
              ]
            : undefined}
          <app-infinite-scroll
            list={this.filteredList}
            showFields={[this.showField]}
            orderBy={this.orderBy}
            onItemClicked={(ev) => this.handleSelect(ev.detail)}
          ></app-infinite-scroll>
        </ion-content>
      </Host>
    );
  }
}
