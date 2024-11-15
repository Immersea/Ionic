import {
  Component,
  h,
  Prop,
  Event,
  Element,
  EventEmitter,
  Host,
  Method,
} from "@stencil/core";
import {Environment} from "../../../../../global/env";
import {DatabaseService} from "../../../../../services/common/database";
import {orderBy, uniq} from "lodash";

const TITLE = "app-search-toolbar-";

@Component({
  tag: "app-search-toolbar",
  styleUrl: "app-search-toolbar.scss",
})
export class AppSearchToolbar {
  @Element() el: HTMLElement;
  @Prop({mutable: true}) list: any[] = [];
  @Prop() searchTitle: string;
  @Prop() orderFields: string[] = [];
  @Prop() color: string = Environment.getAppColor();
  @Prop() placeholder: string = "Search";
  @Prop() filterBy: string[];
  searchString: string = null;

  @Event() filteredList: EventEmitter<any>;

  @Method()
  //used to force reset a value in case of changes of the "value" on the main DOM
  async forceFilter(list) {
    this.list = list;
    this.filterList();
  }

  async setFocus() {
    const searchbar = this.el.querySelector("ion-searchbar");
    if (searchbar) {
      searchbar.componentOnReady().then(() => {
        setTimeout(() => {
          searchbar.setFocus();
        }, 500);
      });
    }
  }

  async componentWillLoad() {
    if (this.searchTitle) {
      const search = await DatabaseService.getLocalDocument(
        TITLE + this.searchTitle
      );
      if (search) {
        this.searchString = search;
        this.filterList();
      }
    } else {
      this.filterList();
    }
  }

  componentDidLoad() {
    this.setFocus();
  }

  filterList() {
    let filterList = [];
    if (this.searchString) {
      const searchString = this.searchString.toLowerCase();
      let regex;
  
      // Handle different wildcard search patterns
      if (searchString.startsWith('*') && searchString.endsWith('*')) {
        // Match anywhere in the text
        const pattern = searchString.slice(1, -1);
        regex = new RegExp(`${pattern}`, 'i');
      } else if (searchString.startsWith('*')) {
        // Match text ending with search term
        const pattern = searchString.slice(1);
        regex = new RegExp(`${pattern}$`, 'i');
      } else if (searchString.endsWith('*')) {
        // Match text starting with search term
        const pattern = searchString.slice(0, -1);
        regex = new RegExp(`^${pattern}`, 'i');
      } else if (searchString.includes('*')) {
        // Match text that starts and ends with specific terms, with anything in between
        const [start, end] = searchString.split('*');
        regex = new RegExp(`^${start}.*${end}$`, 'i');
      } else {
        // Exact match or match beginning
        regex = new RegExp(`^${searchString}`, 'i');
      }
  
      let filters = [];
      this.filterBy.forEach((key) => {
        filters = [
          ...filters,
          ...this.list.filter((x) => regex.test(x[key].toLowerCase())),
        ];
      });
  
      // Remove duplicates
      filterList = uniq(filters);
    } else {
      filterList = this.list;
    }
    this.filteredList.emit(orderBy(filterList, this.orderFields));
  }

  handleSearch(ev) {
    this.searchString = "";
    const target = ev.target as HTMLIonSearchbarElement;
    if (target) {
      this.searchString = target.value!.toLowerCase();
      if (this.searchTitle) {
        DatabaseService.saveLocalDocument(
          TITLE + this.searchTitle,
          this.searchString
        );
      }
    }
    this.filterList();
  }

  render() {
    return (
      <Host>
        <ion-toolbar color={this.color}>
          <ion-searchbar
            animated={true}
            show-cancel-button="focus"
            debounce={250}
            value={this.searchString}
            placeholder={this.placeholder}
            onIonInput={(ev) => this.handleSearch(ev)}
          ></ion-searchbar>
        </ion-toolbar>
      </Host>
    );
  }
}
