import { Component, h, Host, Element, Prop, State } from "@stencil/core";
import { popoverController } from "@ionic/core";
import { CustomerGroup } from "../../../../interfaces/trasteel/customer/customer";
import { CustomersService } from "../../../../services/trasteel/crm/customers";
import { TranslationService } from "../../../../services/common/translations";
import { slugify } from "../../../../helpers/utils";

@Component({
  tag: "popover-edit-customer-owner",
  styleUrl: "popover-edit-customer-owner.scss",
})
export class PopoverEditCustomerEwner {
  @Prop() owner: CustomerGroup;
  @Prop() group: boolean = false;
  @Element() el: HTMLElement;
  selectedOwner: CustomerGroup;
  newOwnerName: string;
  sharePerc: number;
  custGroups: CustomerGroup[];
  popover: HTMLIonPopoverElement;
  @State() updateView = false;

  componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
    this.selectedOwner = new CustomerGroup();
    this.sharePerc = this.owner.groupOwnershipPerc;
    this.custGroups = CustomersService.getCustomerGroups();
    if (this.owner && this.owner.groupId) {
      this.selectedOwner = this.custGroups.find(
        (x) => x.groupId == this.owner.groupId
      );
      if (!this.selectedOwner) {
        //in case not found in the list
        this.newOwnerName = this.owner.groupName;
      }
    }
  }

  componentDidLoad() {
    this.setOwnersSelect();
    this.updateView = !this.updateView;
  }

  setOwnersSelect() {
    const selectOwnerElement: HTMLIonSelectElement =
      this.el.querySelector("#selectOwner");
    const customOwnerPopoverOptions = {
      header: TranslationService.getTransl(
        this.group ? "customer_group" : "customer_owner",
        this.group ? "Customer Group" : "Customer Owner"
      ),
    };
    selectOwnerElement.interfaceOptions = customOwnerPopoverOptions;
    //remove previously defined options
    const selectOwnerOptions = Array.from(
      selectOwnerElement.getElementsByTagName("ion-select-option")
    );
    selectOwnerOptions.map((option) => {
      selectOwnerElement.removeChild(option);
    });
    selectOwnerElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    this.custGroups.map((group) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = group;
      selectOption.textContent = group.groupName;
      selectOwnerElement.appendChild(selectOption);
    });
  }

  handleSelect(ev) {
    this.selectedOwner = ev.detail.value;
  }

  handleChange(ev) {
    this[ev.detail.name] = ev.detail.value;
    this.updateView = !this.updateView;
  }

  close() {
    popoverController.dismiss();
  }

  save() {
    if (this.newOwnerName) {
      this.owner.groupId = slugify(this.newOwnerName);
      this.owner.groupName = this.newOwnerName;
    } else {
      this.owner.groupId = this.selectedOwner.groupId;
      this.owner.groupName = this.selectedOwner.groupName;
    }
    this.owner.groupOwnershipPerc = this.sharePerc;
    popoverController.dismiss({
      owner: this.owner,
      new: this.newOwnerName && this.newOwnerName.length > 0,
    });
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>Select Owner/Group</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-item lines='none'>
            <ion-select
              color='trasteel'
              id='selectOwner'
              interface='action-sheet'
              label='Customer'
              label-placement='floating'
              disabled={this.newOwnerName && this.newOwnerName.length > 0}
              onIonChange={(ev) => this.handleSelect(ev)}
              value={this.selectedOwner}
            ></ion-select>
          </ion-item>
          <ion-item-divider> - or insert new - </ion-item-divider>
          <app-form-item
            lines='none'
            label-tag='name'
            label-text='Name'
            value={this.newOwnerName}
            name='newOwnerName'
            input-type='string'
            onFormItemChanged={(ev) => this.handleChange(ev)}
          ></app-form-item>
          {this.group ? (
            <app-form-item
              lines='full'
              label-tag='share_perc'
              label-text='Share Percentage'
              value={this.sharePerc}
              name='sharePerc'
              input-type='number'
              onFormItemChanged={(ev) => this.handleChange(ev)}
              validator={[
                {
                  name: "minmaxvalue",
                  options: { min: 0, max: 100 },
                },
              ]}
            ></app-form-item>
          ) : undefined}
        </ion-content>
        <ion-footer>
          <app-modal-footer
            saveTag={{ tag: "ok", text: "ok", color: "success" }}
            onCancelEmit={() => this.close()}
            onSaveEmit={() => this.save()}
          />
        </ion-footer>
      </Host>
    );
  }
}
