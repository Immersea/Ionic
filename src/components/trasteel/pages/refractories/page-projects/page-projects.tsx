import { Component, State, h } from "@stencil/core";
import { MapDataProject } from "../../../../../interfaces/trasteel/refractories/projects";
import {
  PROJECTSCOLLECTION,
  ProjectsService,
} from "../../../../../services/trasteel/refractories/projects";
import { TrasteelFilterService } from "../../../../../services/trasteel/common/trs-db-filter";
import { cloneDeep } from "lodash";
import { CustomersService } from "../../../../../services/trasteel/crm/customers";
import { TrasteelService } from "../../../../../services/trasteel/common/services";
import { Element } from "@stencil/core";

@Component({
  tag: "page-projects",
  styleUrl: "page-projects.scss",
})
export class PageProjects {
  @Element() el: HTMLElement;
  projectsList: MapDataProject[] = [];
  @State() filteredProjectsList: MapDataProject[] = [];
  @State() loading = true;
  @State() updateView = true;
  searchToolbar: any;

  componentWillLoad() {
    ProjectsService.projectsList$.subscribe(async (list: MapDataProject[]) => {
      //replace name of customers
      const customersList = [];
      list.map((item) => {
        const newItem = cloneDeep(item);
        const customer = CustomersService.getCustomersDetails(item.customerId);
        if (customer) {
          newItem.customerId = customer.fullName;
          customersList.push(newItem);
        }
      });
      this.updateList(customersList);
      this.loading = false;
    });
  }

  componentDidLoad() {
    this.searchToolbar = this.el.querySelector(
      "#searchToolbar"
    ) as HTMLAppSearchToolbarElement;
    this.updateList(this.projectsList);
  }

  updateList(list) {
    this.projectsList = list;
    this.searchToolbar
      ? this.searchToolbar.forceFilter(this.projectsList)
      : undefined;
    this.updateView = !this.updateView;
  }

  addProject() {
    ProjectsService.presentProjectUpdate();
  }

  getOptions() {
    if (TrasteelService.isRefraDBAdmin()) {
      return [
        {
          tag: "delete",
          text: "Delete",
          icon: "trash",
          color: "danger",
          func: (returnField) =>
            ProjectsService.deleteProject(returnField, false),
        },
        {
          tag: "duplicate",
          text: "Duplicate",
          icon: "duplicate",
          color: "secondary",
          func: (returnField) => ProjectsService.duplicateProject(returnField),
        },
        {
          tag: "edit",
          text: "Edit",
          icon: "create",
          color: "primary",
          func: (returnField) =>
            ProjectsService.presentProjectUpdate(returnField),
        },
      ];
    } else return null;
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag='projects'
          text='Projects'
          color='trasteel'
        ></app-navbar>
        <app-search-toolbar
          id='searchToolbar'
          searchTitle='projects'
          list={this.projectsList}
          orderFields={["customerId", "projectLocalId"]}
          color='trasteel'
          placeholder='Search by customer or project'
          filterBy={["customerId", "projectLocalId", "projectDescription"]}
          onFilteredList={(ev) => (this.filteredProjectsList = ev.detail)}
        ></app-search-toolbar>
      </ion-header>,
      <ion-content>
        {TrasteelService.isRefraDBAdmin() ? (
          <ion-fab vertical='top' horizontal='end' slot='fixed' edge>
            <ion-fab-button
              size='small'
              onClick={() => this.addProject()}
              color='trasteel'
            >
              <ion-icon name='add'></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
        <app-infinite-scroll
          list={this.filteredProjectsList}
          loading={this.loading}
          showFields={["projectLocalId"]}
          showNotes={["projectDescription"]}
          groupBy={["customerId"]}
          options={this.getOptions()}
          returnField='id'
          icon={TrasteelFilterService.getMapDocs(PROJECTSCOLLECTION).icon.name}
          onItemClicked={(ev) =>
            ProjectsService.presentProjectDetails(ev.detail)
          }
        ></app-infinite-scroll>
      </ion-content>,
    ];
  }
}
