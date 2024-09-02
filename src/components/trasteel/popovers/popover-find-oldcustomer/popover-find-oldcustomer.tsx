import {Component, h, Host, State, Element, Prop} from "@stencil/core";
import {popoverController} from "@ionic/core";

@Component({
  tag: "popover-find-oldcustomer",
  styleUrl: "popover-find-oldcustomer.scss",
})
export class PopoverFindOldCustomer {
  @Prop() customersList;
  @Element() el: HTMLElement;
  @Prop() newCustomer;
  @Prop() oldCustomer;
  @State() selectedCustomer;
  popover: HTMLIonPopoverElement;

  componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
    this.selectedCustomer = this.newCustomer;
  }

  handleSelect(ev) {
    this.selectedCustomer = ev.detail.value;
  }

  close() {
    popoverController.dismiss();
  }

  savenew() {
    popoverController.dismiss("new");
  }

  save() {
    popoverController.dismiss(this.selectedCustomer);
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>Check customer</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-item>OLD</ion-item>
          <ion-item>{this.oldCustomer.Full_Customer_Name}</ion-item>
          <ion-item>NEW</ion-item>
          <ion-item>
            {this.newCustomer ? this.newCustomer.fullName : null}
          </ion-item>
          <ion-item lines="none">
            <ion-select
              color="trasteel"
              id="selectOwner"
              interface="action-sheet"
              label="customers"
              label-placement="floating"
              onIonChange={(ev) => this.handleSelect(ev)}
              value={this.newCustomer ? this.newCustomer : null}
            >
              {this.customersList.map((customer) => (
                <ion-select-option value={customer}>
                  {customer.fullName}
                </ion-select-option>
              ))}
            </ion-select>
          </ion-item>
        </ion-content>
        <ion-footer>
          <app-modal-footer
            saveTag={{tag: "ok", text: "ok"}}
            onCancelEmit={() => this.close()}
            onSaveEmit={() => this.save()}
          />
          <ion-button onClick={() => this.savenew()}>New Customer</ion-button>
        </ion-footer>
      </Host>
    );
  }
}
