import {Component, h, Host, Prop, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {Environment} from "../../../../global/env";
import {
  CustomerConditionCCM,
  CustomerConditionEAF,
  CustomerConditionLF,
} from "../../../../interfaces/trasteel/customer/customerLocation";

@Component({
  tag: "modal-operating-conditions-questionnaire",
  styleUrl: "modal-operating-conditions-questionnaire.scss",
})
export class ModalOperatingConditionsQuestionnaire {
  @Element() el: HTMLElement;
  @Prop() condition: "EAF" | "LF" | "CCM";
  @Prop() conditionData:
    | CustomerConditionEAF
    | CustomerConditionLF
    | CustomerConditionCCM;
  @Prop() editable = false;

  async save() {
    modalController.dismiss(this.conditionData);
  }

  async cancel() {
    modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color={Environment.getAppColor()}>
            <ion-title>{this.condition + " operating conditions"}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          {this.condition == "EAF" ? (
            <app-eaf-questionnaire
              conditions={this.conditionData as CustomerConditionEAF}
              editable={this.editable}
              onUpdateEmit={(data) => (this.conditionData = data.detail)}
            ></app-eaf-questionnaire>
          ) : this.condition == "LF" ? (
            <app-lf-questionnaire
              conditions={this.conditionData as CustomerConditionLF}
              editable={this.editable}
              onUpdateEmit={(data) => (this.conditionData = data.detail)}
            ></app-lf-questionnaire>
          ) : this.condition == "CCM" ? (
            <app-ccm-questionnaire
              conditions={this.conditionData as CustomerConditionCCM}
              editable={this.editable}
              onUpdateEmit={(data) => (this.conditionData = data.detail)}
            ></app-ccm-questionnaire>
          ) : undefined}
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          showSave={this.editable}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
