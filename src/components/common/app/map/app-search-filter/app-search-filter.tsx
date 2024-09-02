import {
  Component,
  h,
  Host,
  Method,
  State,
  Event,
  EventEmitter,
  Prop,
} from "@stencil/core";
import {SearchTag, CollectionGroup} from "../../../../../interfaces/interfaces";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {UserService} from "../../../../../services/common/user";
import {Subscription} from "rxjs";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "app-search-filter",
  styleUrl: "app-search-filter.scss",
})
export class AppSearchFilter {
  @Event() searchFilterEmit: EventEmitter<SearchTag[]>;
  tags: SearchTag[] = [];
  @State() updateView = true;
  @State() hideSearch = false;
  userSub: Subscription;
  @Prop() hideToolbar = false;
  types = {
    search: {
      color: "light",
      icon: "search-circle",
    },
    filter: {
      color: "primary",
      icon: "filter",
    },
  };
  @State() filterButtonTypes: CollectionGroup;

  componentWillLoad() {
    this.userSub = UserService.userRoles$.subscribe(() => {
      //update after user is loaded
      this.filterButtonTypes = UDiveFilterService.getMapDocs();
    });
    this.filterButtonTypes = UDiveFilterService.getMapDocs();
  }
  disconnectedCallback() {
    this.userSub.unsubscribe();
    this.tags = [];
    this.searchFilterEmit.emit(this.tags);
  }

  @Method()
  async addTag(tag: SearchTag) {
    this.tags.push(tag);
    this.searchFilterEmit.emit(this.tags);
    if (tag.type == "search") this.hideSearch = true;
    this.updateView = !this.updateView;
  }
  @Method()
  async removeTag(i) {
    if (this.tags[i].type == "search") this.hideSearch = false;
    this.tags.splice(i, 1);
    this.searchFilterEmit.emit(this.tags);
    this.updateView = !this.updateView;
  }

  searchInputChange(str) {
    const search = {name: str, type: "search"};
    //pass search value to search filter
    this.addTag(search);
  }

  checkButtonEnabled(button) {
    return this.tags.find((el) => el.name == button) != null;
  }

  async removeFilterTag(button) {
    const index = this.tags.findIndex(
      (el) => el.name == button && el.type == "filter"
    );
    this.tags.splice(index, 1);
    this.searchFilterEmit.emit(this.tags);
    this.updateView = !this.updateView;
  }

  render() {
    return (
      <Host>
        {!this.hideToolbar ? (
          <ion-toolbar color={Environment.getAppColor()}>
            <ion-grid>
              <ion-row class="ion-text-center">
                <ion-col size="1">
                  <ion-menu-button />
                </ion-col>
                <ion-col>
                  <my-transl
                    tag="looking-for"
                    text="What are you looking for?"
                  />
                </ion-col>
                <ion-col size="1"></ion-col>
              </ion-row>
              <ion-row>
                {Object.keys(this.filterButtonTypes).map((button) => (
                  <ion-col class="ion-no-padding">
                    <ion-tab-button
                      color={Environment.getAppColor()}
                      layout="icon-bottom"
                      onClick={() =>
                        !this.checkButtonEnabled(button)
                          ? this.addTag({type: "filter", name: button})
                          : this.removeFilterTag(button)
                      }
                    >
                      {this.filterButtonTypes[button].icon.type == "ionicon" ? (
                        <ion-icon
                          name={this.filterButtonTypes[button].icon.name}
                          color={this.filterButtonTypes[button].icon.color}
                        ></ion-icon>
                      ) : (
                        <ion-icon
                          class={
                            "map-icon " +
                            this.filterButtonTypes[button].icon.name
                          }
                          color={this.filterButtonTypes[button].icon.color}
                        ></ion-icon>
                      )}
                      <ion-label
                        color={this.filterButtonTypes[button].icon.color}
                      >
                        {this.filterButtonTypes[button].name}
                      </ion-label>
                    </ion-tab-button>
                  </ion-col>
                ))}
              </ion-row>
            </ion-grid>
          </ion-toolbar>
        ) : (
          [
            <ion-fab vertical="top" horizontal="end" slot="fixed">
              <ion-fab-button class="fab-icon">
                <ion-icon name="filter"></ion-icon>
              </ion-fab-button>
              <ion-fab-list side="start">
                {Object.keys(this.filterButtonTypes).map((button) => (
                  <ion-fab-button
                    style={{
                      "--background": this.filterButtonTypes[button].icon.color,
                    }}
                    onClick={() => this.addTag({type: "filter", name: button})}
                    disabled={this.tags.find((el) => el.name == button) != null}
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
                ))}
              </ion-fab-list>
            </ion-fab>,
          ]
        )}
        {!this.hideSearch ? (
          <app-searchbar
            floating
            onInputChanged={(ev) => this.searchInputChange(ev.detail)}
          />
        ) : undefined}

        <div class="search-tags">
          <ion-grid class="ion-no-padding ion-no-margin ion-text-end">
            {this.tags.map((tag, i) => (
              <ion-row>
                <ion-col>
                  <ion-chip
                    outline={true}
                    style={{
                      background:
                        tag.type == "filter"
                          ? "rgba(var(--ion-color-" +
                            this.filterButtonTypes[tag.name].icon.color +
                            "-contrast-rgb),0.3)"
                          : "#00000050",
                    }}
                    color={
                      tag.type == "filter"
                        ? this.filterButtonTypes[tag.name].icon.color
                        : "light"
                    }
                  >
                    {tag.type == "search" ? (
                      <ion-icon name={this.types[tag.type].icon}></ion-icon>
                    ) : this.filterButtonTypes[tag.name].icon.type ==
                      "ionicon" ? (
                      <ion-icon
                        color={this.filterButtonTypes[tag.name].icon.color}
                        name={this.filterButtonTypes[tag.name].icon.name}
                      ></ion-icon>
                    ) : (
                      <ion-icon
                        color={this.filterButtonTypes[tag.name].icon.color}
                        class={
                          "map-icon " +
                          this.filterButtonTypes[tag.name].icon.name
                        }
                      ></ion-icon>
                    )}
                    <ion-label>
                      {tag.type == "search"
                        ? tag.name
                        : this.filterButtonTypes[tag.name].name}
                    </ion-label>
                    <ion-icon
                      name="close-circle"
                      color={
                        tag.type == "filter"
                          ? this.filterButtonTypes[tag.name].icon.color
                          : "light"
                      }
                      onClick={() => this.removeTag(i)}
                    ></ion-icon>
                  </ion-chip>
                </ion-col>
              </ion-row>
            ))}
          </ion-grid>
        </div>
      </Host>
    );
  }
}
