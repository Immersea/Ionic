import { Component, State, h } from "@stencil/core";
import { MapDataContact } from "../../../../../interfaces/trasteel/contact/contact";
import {
  CONTACTSCOLLECTION,
  ContactsService,
} from "../../../../../services/trasteel/crm/contacts";
import { TrasteelFilterService } from "../../../../../services/trasteel/common/trs-db-filter";
import { CustomersService } from "../../../../../services/trasteel/crm/customers";
import { cloneDeep } from "lodash";
import { TrasteelService } from "../../../../../services/trasteel/common/services";

@Component({
  tag: "page-contacts",
  styleUrl: "page-contacts.scss",
})
export class PageContacts {
  contactsList: MapDataContact[] = [];
  @State() filteredContactsList: MapDataContact[] = [];
  @State() loading = true;

  componentWillLoad() {
    ContactsService.contactsList$.subscribe(async (list: MapDataContact[]) => {
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
      this.contactsList = customersList;
      this.loading = false;
    });
  }

  componentDidLoad() {}

  addContact() {
    ContactsService.presentContactUpdate();
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag='contacts'
          text='Contacts'
          color='trasteel'
        ></app-navbar>
        <app-search-toolbar
          searchTitle='contacts'
          list={this.contactsList}
          orderFields={["lastName", "firstName"]}
          color='trasteel'
          placeholder='Search by name'
          filterBy={["lastName", "firstName", "customerId"]}
          onFilteredList={(ev) => (this.filteredContactsList = ev.detail)}
        ></app-search-toolbar>
      </ion-header>,
      <ion-content>
        {TrasteelService.isCustomerDBAdmin() ? (
          <ion-fab vertical='top' horizontal='end' slot='fixed' edge>
            <ion-fab-button onClick={() => this.addContact()} color='trasteel'>
              <ion-icon name='add'></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
        <app-infinite-scroll
          list={this.filteredContactsList}
          loading={this.loading}
          showFields={["lastName", "firstName"]}
          returnField='id'
          groupBy={["customerId"]}
          icon={TrasteelFilterService.getMapDocs(CONTACTSCOLLECTION).icon.name}
          onItemClicked={(ev) =>
            ContactsService.presentContactDetails(ev.detail)
          }
        ></app-infinite-scroll>
      </ion-content>,
    ];
  }
}
