import {Component, h, Listen, Element, State} from "@stencil/core";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {CollectionGroup, SearchTag} from "../../../../../interfaces/interfaces";
import {Marker} from "../../../../../interfaces/interfaces";
import {
  UserService,
  USERPUBLICPROFILECOLLECTION,
} from "../../../../../services/common/user";
import {Subscription} from "rxjs";
import {
  DiveSitesService,
  DIVESITESCOLLECTION,
} from "../../../../../services/udive/diveSites";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import {UserProfile} from "../../../../../interfaces/common/user/user-profile";
import {alertController} from "@ionic/core";
import {TranslationService} from "../../../../../services/common/translations";
import {
  DIVESCHOOLSSCOLLECTION,
  DivingSchoolsService,
} from "../../../../../services/udive/divingSchools";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../../../../../services/udive/diveCommunities";

@Component({
  tag: "page-map",
  styleUrl: "page-map.scss",
})
export class PageMap {
  @Element() el: HTMLElement;

  filterElement: HTMLAppSearchFilterElement;
  searchFilters = [];
  @State() searchTags: SearchTag[];
  markerCollections: CollectionGroup;
  @State() markers: Marker[] = [];
  filterButtonTypes: any;
  mapElement: HTMLAppMapElement;
  @State() userProfile: UserProfile;
  userSub$: Subscription;

  @Listen("mapLoadingCompleted")
  mapLoadingCompletedHandler() {
    //necessary to recenter map in the correct position
    this.mapElement ? this.mapElement["triggerMapResize"]() : undefined;
  }

  componentWillLoad() {
    this.filterButtonTypes = UDiveFilterService.getMapDocs();
    this.searchFilters = Object.keys(this.filterButtonTypes);
    this.userSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
  }

  async componentDidLoad() {
    this.filterElement = this.el.getElementsByTagName("app-search-filter")[0];
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("app-map") as any;
    this.filter();
  }

  disconnectedCallback() {
    this.userSub$.unsubscribe();
  }

  async addItem(button) {
    let alertMessage = null;
    switch (button) {
      case DIVESITESCOLLECTION:
        alertMessage = {
          tag: "dive-site",
          text: "Dive Site",
        };
        break;
      case DIVECENTERSSCOLLECTION:
        alertMessage = {
          tag: "diving-center",
          text: "Diving Center",
        };
        break;

      case DIVECOMMUNITIESCOLLECTION:
        alertMessage = {
          tag: "dive-community",
          text: "Dive Community",
        };
        break;
      case DIVESCHOOLSSCOLLECTION:
        alertMessage = {
          tag: "diving-school",
          text: "Diving School",
        };
        break;
      case SERVICECENTERSCOLLECTION:
        alertMessage = {
          tag: "service-center",
          text: "Service Center",
        };
        break;
    }
    const alert = await alertController.create({
      header: TranslationService.getTransl(alertMessage.tag, alertMessage.text),
      message:
        TranslationService.getTransl(
          "add-item-message",
          "This will add a new item of type:"
        ) +
        " " +
        TranslationService.getTransl(alertMessage.tag, alertMessage.text) +
        ". " +
        TranslationService.getTransl("are-you-sure", "Are you sure?"),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            switch (button) {
              case DIVESITESCOLLECTION:
                DiveSitesService.presentDiveSiteUpdate();
                break;
              case DIVECENTERSSCOLLECTION:
                DivingCentersService.presentDivingCenterUpdate();
                break;

              case DIVECOMMUNITIESCOLLECTION:
                DiveCommunitiesService.presentDiveCommunityUpdate();
                break;
              case DIVESCHOOLSSCOLLECTION:
                DivingSchoolsService.presentDivingSchoolUpdate();
                break;
              case SERVICECENTERSCOLLECTION:
                ServiceCentersService.presentServiceCenterUpdate();
                break;
            }
          },
        },
      ],
    });
    alert.present();
  }

  filter(ev?) {
    this.searchTags = ev ? ev.detail : [];
    this.mapElement.updateSearchTags(this.searchTags);
    this.mapElement.fitToBounds();
  }

  render() {
    return [
      <ion-header>
        <app-search-filter onSearchFilterEmit={(ev) => this.filter(ev)} />
      </ion-header>,
      <ion-content fullscreen>
        <app-map pageId="map" searchTags={this.searchTags} />
        {this.userProfile && this.userProfile.uid ? (
          <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button class="fab-icon">
              <ion-icon name="add-circle"></ion-icon>
            </ion-fab-button>
            <ion-fab-list side="start">
              {this.searchFilters.map((button) =>
                button != USERPUBLICPROFILECOLLECTION ? (
                  <ion-fab-button
                    style={{
                      "--background": this.filterButtonTypes[button].icon.color,
                    }}
                    onClick={() => this.addItem(button)}
                  >
                    {this.filterButtonTypes[button].icon.type == "ionicon" ? (
                      <ion-icon
                        name={this.filterButtonTypes[button].icon.name}
                      ></ion-icon>
                    ) : (
                      <ion-icon
                        class={
                          "map-icon " + this.filterButtonTypes[button].icon.name
                        }
                      ></ion-icon>
                    )}
                  </ion-fab-button>
                ) : undefined
              )}
            </ion-fab-list>
          </ion-fab>
        ) : undefined}
      </ion-content>,
    ];
  }
}
