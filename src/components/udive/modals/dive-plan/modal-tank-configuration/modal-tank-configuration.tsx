import {Component, h, Prop, Element, State} from "@stencil/core";
import {isString} from "lodash";
import {Environment} from "../../../../../global/env";
import {DiveToolsService} from "../../../../../services/udive/planner/dive-tools";
import {TranslationService} from "../../../../../services/common/translations";
import {TankModel} from "../../../../../interfaces/udive/planner/tank-model";

@Component({
  tag: "modal-tank-configuration",
  styleUrl: "modal-tank-configuration.scss",
})
export class ModalTankConfiguration {
  @Element() el: HTMLElement;
  @Prop() tank: TankModel;
  @State() updateView = true;
  validForm = {
    name: false,
    depth: false,
    time: false,
    bottom: false,
  };
  @State() showSave = false;

  componentWillLoad() {}
  componentDidLoad() {
    this.validateAll();
  }

  save() {
    this.el.closest("ion-modal").dismiss(this.tank);
  }

  close() {
    this.el.closest("ion-modal").dismiss();
  }

  inputHandler(event: any) {
    this.tank[event.detail.name] = event.detail.value;
    this.validateAll();
  }

  validateAll() {
    this.showSave =
      isString(this.tank.name) &&
      this.tank.volume > 0.1 &&
      this.tank.no_of_tanks > 0 &&
      this.tank.pressure > 1;
    this.updateView = !this.updateView;
  }

  render() {
    return [
      <app-navbar
        tag="tank-configuration"
        text="Tank Configuration"
        color={Environment.getAppColor()}
        modal={true}
      ></app-navbar>,
      <ion-content>
        <ion-list>
          <app-form-item
            label-tag="name"
            label-text="Name"
            value={this.tank.name}
            name="name"
            input-type="text"
            lines="inset"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-tag="volume"
            label-text="Volume"
            appendText={" (lt)"}
            value={this.tank.volume}
            name="volume"
            input-type="number"
            lines="inset"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[
              "required",
              {
                name: "minvalue",
                options: {min: 0.1},
              },
            ]}
          ></app-form-item>
          <app-item-detail
            labelTag="volume"
            labelText="Volume"
            appendText={" (cuft)"}
            lines="inset"
            alignRight
            detailText={DiveToolsService.ltToCuFt(this.tank.volume)}
          ></app-item-detail>
          <ion-item>
            <ion-select
              label={TranslationService.getTransl(
                "no_of_tanks",
                "Number Of Tanks"
              )}
              interface="action-sheet"
              onIonChange={(ev) =>
                this.inputHandler({
                  detail: {name: "no_of_tanks", value: ev.detail.value},
                })
              }
              value={this.tank.no_of_tanks}
            >
              <ion-select-option value={1}>1</ion-select-option>
              <ion-select-option value={2}>2</ion-select-option>
            </ion-select>
          </ion-item>
          <app-form-item
            label-tag="pressure"
            label-text="Pressure"
            appendText={" (bar)"}
            value={this.tank.pressure}
            name="pressure"
            input-type="number"
            lines="inset"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[
              "required",
              {
                name: "minvalue",
                options: {min: 1},
              },
            ]}
          ></app-form-item>
          <app-item-detail
            label-tag="pressure"
            label-text="Pressure"
            appendText={" (psi)"}
            lines="inset"
            alignRight
            detailText={DiveToolsService.barToPsi(this.tank.pressure)}
          ></app-item-detail>
          <app-form-item
            label-tag="for-deco"
            label-text="For Decompression"
            value={this.tank.forDeco}
            name="forDeco"
            input-type="boolean"
            lines="inset"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
          ></app-form-item>
        </ion-list>
      </ion-content>,
      <app-modal-footer
        disableSave={!this.showSave}
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
      />,
    ];
  }
}
