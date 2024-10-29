import { Component, h, Prop, Host, Element } from "@stencil/core";
import {
  UserService,
  USERPUBLICPROFILECOLLECTION,
} from "../../../../../services/common/user";
import {
  DiveSitesService,
  DIVESITESCOLLECTION,
} from "../../../../../services/udive/diveSites";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import { MapDataDivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { MapDataDiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../../../../../services/udive/diveCommunities";
import {
  CUSTOMERSCOLLECTION,
  CustomersService,
} from "../../../../../services/trasteel/crm/customers";
import { Environment } from "../../../../../global/env";
@Component({
  tag: "app-map-popup",
  styleUrl: "app-map-popup.scss",
})
export class AppMapPopup {
  @Element() el: HTMLElement;
  @Prop() properties: string; //comes from a JSON object
  userRoles: UserRoles;
  mapElement: HTMLAppMapElement;
  propObject: any;

  componentWillLoad() {
    this.propObject = JSON.parse(this.properties);
    this.propObject.item = JSON.parse(this.propObject.item);
    this.mapElement = this.el.closest("app-map");
    this.userRoles = UserService.userRoles;
    this.setLinesForItem();
  }

  disconnectedCallback() {
    this.removeLinesForItem();
  }

  setLinesForItem() {
    if (
      this.propObject.collection == DIVECENTERSSCOLLECTION &&
      this.propObject.item.diveSites &&
      this.propObject.item.diveSites.length > 0
    ) {
      const diveSites = this.propObject.item.diveSites;
      this.propObject.item = new MapDataDivingCenter(this.propObject.item);
      const pointsArray = [this.propObject.item];
      diveSites.forEach(async (siteId) => {
        const diveSite = DiveSitesService.getDiveSitesDetails(siteId);
        pointsArray.push(diveSite);
        this.mapElement["createLine"](siteId, this.propObject.item, diveSite);
      });
      this.mapElement["fitToBounds"](pointsArray);
    } else if (
      this.propObject.collection == DIVESITESCOLLECTION &&
      this.propObject.item.divingCenters &&
      this.propObject.item.divingCenters.length > 0
    ) {
      const divingCenters = this.propObject.item.divingCenters;
      this.propObject.item = new MapDataDiveSite(this.propObject.item);
      const pointsArray = [this.propObject.item];
      divingCenters.forEach(async (centerId) => {
        const divingCenter =
          DivingCentersService.getDivingCenterDetails(centerId);
        pointsArray.push(divingCenter);
        this.mapElement["createLine"](
          centerId,
          this.propObject.item,
          divingCenter
        );
      });
      this.mapElement["fitToBounds"](pointsArray);
    }
  }

  removeLinesForItem() {
    if (
      this.propObject.collection == DIVECENTERSSCOLLECTION &&
      this.propObject.item.diveSites &&
      this.propObject.item.diveSites.length > 0
    ) {
      const diveSites = this.propObject.item.diveSites;
      diveSites.forEach(async (siteId) => {
        this.mapElement["removeLine"](siteId);
      });
    } else if (
      this.propObject.collection == DIVESITESCOLLECTION &&
      this.propObject.item.divingCenters &&
      this.propObject.item.divingCenters.length > 0
    ) {
      const divingCenters = this.propObject.item.divingCenters;
      divingCenters.forEach(async (centerId) => {
        this.mapElement["removeLine"](centerId);
      });
    }
  }

  async openModal() {
    switch (this.propObject.collection) {
      case USERPUBLICPROFILECOLLECTION:
        UserService.presentUserDetails(this.propObject.id);
        break;
      case DIVESITESCOLLECTION:
        DiveSitesService.presentDiveSiteDetails(this.propObject.id);
        break;
      case DIVECENTERSSCOLLECTION:
        DivingCentersService.presentDivingCenterDetails(this.propObject.id);
        break;
      case DIVECOMMUNITIESCOLLECTION:
        DiveCommunitiesService.presentDiveCommunityDetails(this.propObject.id);
        break;
      case DIVESCHOOLSSCOLLECTION:
        DivingSchoolsService.presentDivingSchoolDetails(this.propObject.id);
        break;
      case SERVICECENTERSCOLLECTION:
        ServiceCentersService.presentServiceCenterDetails(this.propObject.id);
        break;
      //when markers are added as feature
      case "markers-feature":
        if (this.propObject.item.collection == CUSTOMERSCOLLECTION)
          CustomersService.presentCustomerDetails(this.propObject.item.id);
        break;
    }
    this.mapElement["closePopup"]();
  }

  async planDive() {
    DiveSitesService.presentDiveSiteDetails(this.propObject.id, true);
    this.mapElement["closePopup"]();
  }

  async editModal() {
    switch (this.propObject.collection) {
      case USERPUBLICPROFILECOLLECTION:
        UserService.presentUserDetails(this.propObject.id);
        break;
      case DIVESITESCOLLECTION:
        DiveSitesService.presentDiveSiteUpdate(this.propObject.id);
        break;
      case DIVECENTERSSCOLLECTION:
        DivingCentersService.presentDivingCenterUpdate(this.propObject.id);
        break;
      case DIVECOMMUNITIESCOLLECTION:
        DiveCommunitiesService.presentDiveCommunityUpdate(this.propObject.id);
        break;
      case DIVESCHOOLSSCOLLECTION:
        DivingSchoolsService.presentDivingSchoolUpdate(this.propObject.id);
        break;
      case SERVICECENTERSCOLLECTION:
        ServiceCentersService.presentServiceCenterUpdate(this.propObject.id);
        break;
    }
    this.mapElement["closePopup"]();
  }

  async delete() {
    switch (this.propObject.collection) {
      case "userPublicProfiles":
        //UserService.presentUserDetails(this.propObject.id);
        break;
      case DIVESITESCOLLECTION:
        DiveSitesService.deleteDiveSite(this.propObject.id);
        break;
      case DIVECENTERSSCOLLECTION:
        DivingCentersService.deleteDivingCenter(this.propObject.id);
        break;
      case DIVECOMMUNITIESCOLLECTION:
        DiveCommunitiesService.deleteDiveCommunity(this.propObject.id);
        break;
      case DIVESCHOOLSSCOLLECTION:
        DivingSchoolsService.deleteDivingSchool(this.propObject.id);
        break;
      case SERVICECENTERSCOLLECTION:
        ServiceCentersService.deleteServiceCenter(this.propObject.id);
        break;
    }
    this.mapElement["closePopup"]();
  }

  render() {
    return (
      <Host>
        {this.propObject.item.coverURL ? (
          <div
            class='cover'
            style={
              this.propObject.item.coverURL
                ? {
                    backgroundImage:
                      "url(" + this.propObject.item.coverURL + ")",
                  }
                : undefined
            }
          ></div>
        ) : undefined}
        {this.propObject.item.photoURL ? (
          <ion-thumbnail>
            <img
              src={
                this.propObject.item.photoURL
                  ? this.propObject.item.photoURL
                  : "/assets/images/avatar.png"
              }
            />
          </ion-thumbnail>
        ) : undefined}
        <h2 class='center'>{this.propObject.item.displayName}</h2>
        <div class='center'>
          <ion-button
            expand='full'
            fill='outline'
            color='dark'
            onClick={() => this.openModal()}
          >
            <my-transl tag='details' text='Details' />
          </ion-button>
        </div>
        {this.propObject.collection == DIVESITESCOLLECTION ? (
          <div class='center'>
            <ion-button
              expand='full'
              fill='outline'
              color='secondary'
              onClick={() => this.planDive()}
            >
              <my-transl tag='plan-dive' text='Plan a Dive' />
            </ion-button>
          </div>
        ) : undefined}

        {!Environment.isTrasteel() &&
        this.userRoles &&
        this.userRoles.isSuperAdmin()
          ? [
              <div class='center'>
                <ion-button
                  expand='full'
                  fill='outline'
                  color='primary'
                  onClick={() => this.editModal()}
                >
                  <my-transl tag='edit' text='Edit' />
                </ion-button>
              </div>,
              <div class='center'>
                <ion-button
                  expand='full'
                  fill='outline'
                  color='danger'
                  onClick={() => this.delete()}
                >
                  <my-transl tag='delete' text='Delete' />
                </ion-button>
              </div>,
            ]
          : undefined}

        <div class='margin'></div>
      </Host>
    );
  }
}
