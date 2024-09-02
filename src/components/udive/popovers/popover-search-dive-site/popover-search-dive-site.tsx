import {Component, h, Host, State, Element} from "@stencil/core";
import {DiveSitesService} from "../../../../services/udive/diveSites";
import {MapDataDiveSite} from "../../../../interfaces/udive/dive-site/diveSite";

@Component({
  tag: "popover-search-dive-site",
  styleUrl: "popover-search-dive-site.scss",
})
export class PopoverSearchDiveSite {
  @Element() el: HTMLElement;
  sitesList: MapDataDiveSite[] = [];
  @State() showList: MapDataDiveSite[] = [];
  popover: HTMLIonPopoverElement;
  searchBarElement: HTMLIonSearchbarElement;

  componentWillLoad() {
    this.sitesList = DiveSitesService.diveSitesList;
    this.popover = this.el.closest("ion-popover");
  }

  componentDidLoad() {
    this.searchBarElement = this.el.querySelector("#search-bar");
    this.searchBarElement.setFocus();
  }

  searchSites(ev) {
    const query = ev.target.value.toLowerCase();
    this.showList = this.sitesList.filter(
      (site) => site.displayName.toLowerCase().indexOf(query) > -1
    );
  }

  addSite(site) {
    this.popover.dismiss(site.id);
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>
              <my-transl tag="search" text="Search" />
            </ion-title>
          </ion-toolbar>
          <ion-toolbar>
            <ion-searchbar
              id="search-bar"
              onIonInput={(ev) => this.searchSites(ev)}
            ></ion-searchbar>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            {this.showList.map((site) => (
              <ion-item button onClick={() => this.addSite(site)}>
                {site.photoURL ? (
                  <ion-avatar slot="start">
                    <ion-img src={site.photoURL} />
                  </ion-avatar>
                ) : undefined}
                <ion-label>{site.displayName}</ion-label>
              </ion-item>
            ))}
          </ion-list>
        </ion-content>
      </Host>
    );
  }
}
