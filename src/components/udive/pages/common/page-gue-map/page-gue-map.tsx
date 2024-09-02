import {Component, h, Listen, Element, State} from "@stencil/core";
import {SearchTag} from "../../../../../interfaces/interfaces";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../../../../../services/udive/diveCommunities";
import {alertController} from "@ionic/core";
import {TranslationService} from "../../../../../services/common/translations";
import {UserProfile} from "../../../../../interfaces/common/user/user-profile";
import {Subscription} from "rxjs";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {UserService} from "../../../../../services/common/user";

@Component({
  tag: "page-gue-map",
  styleUrl: "page-gue-map.scss",
})
export class PageGueMap {
  @Element() el: HTMLElement;

  searchFilters = [];
  @State() searchTags: SearchTag[];
  mapElement: HTMLAppMapElement;
  @State() userProfile: UserProfile;
  userSub$: Subscription;
  filterButtonTypes: any;

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
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("app-map") as any;
    this.filter();
  }

  async addItem(button) {
    let alertMessage = null;
    switch (button) {
      case DIVECOMMUNITIESCOLLECTION:
        alertMessage = {
          tag: "dive-community",
          text: "Dive Community",
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
              case DIVECOMMUNITIESCOLLECTION:
                DiveCommunitiesService.presentDiveCommunityUpdate();
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
  }

  render() {
    return [
      <ion-content fullscreen>
        <app-map pageId="map" searchTags={this.searchTags} />
        {this.userProfile &&
        this.userProfile.uid &&
        UserService.userRoles.isAgencyAdmin() ? (
          <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button
              class="fab-icon"
              onClick={() => this.addItem(DIVECOMMUNITIESCOLLECTION)}
            >
              <ion-icon name="add-circle"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
      </ion-content>,
    ];
  }
}
