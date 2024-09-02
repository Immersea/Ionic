import {
  Component,
  h,
  Prop,
  Host,
  Element,
  EventEmitter,
  Event,
} from "@stencil/core";
import {CustomerConditionEAF} from "../../../../interfaces/trasteel/customer/customerLocation";

@Component({
  tag: "app-eaf-questionnaire",
  styleUrl: "app-eaf-questionnaire.scss",
})
export class AppEafQuestionnaire {
  @Element() el: HTMLElement;
  @Prop() conditions: CustomerConditionEAF = new CustomerConditionEAF();
  @Prop() editable = false;
  @Event() updateEmit: EventEmitter<CustomerConditionEAF>;

  handleChange(ev) {
    this.conditions[ev.detail.name] = ev.detail.value;
    this.updateEmit.emit(this.conditions);
  }

  render() {
    return (
      <Host>
        <ion-list>
          <ion-item-divider>
            <my-transl
              tag="working_conditions"
              text="Basic Working Conditions"
            ></my-transl>
          </ion-item-divider>
          <app-form-item
            labelTag="date"
            labelText="Date"
            lines="inset"
            value={this.conditions.date}
            name="date"
            input-type="date"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="capacity"
            labelText="Capacity"
            appendText=" (MT)"
            lines="inset"
            value={this.conditions.capacity}
            name="capacity"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="n_shells"
            labelText="N° of shells"
            appendText=" (No.)"
            value={this.conditions.n_shells}
            lines="inset"
            name="n_shells"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="shell_diam"
            labelText="Shell Diameter"
            appendText=" (mm)"
            lines="inset"
            value={this.conditions.shell_diam}
            name="shell_diam"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="tap_system"
            labelText="Shell Diameter"
            appendText=" (EBT/SPOUT)"
            lines="inset"
            value={this.conditions.tap_system}
            name="tap_system"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="n_heats_day"
            labelText="N° Heats/Day"
            appendText=" (No.)"
            lines="inset"
            value={this.conditions.n_heats_day}
            name="n_heats_day"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="ttt"
            labelText="Tap to Tap Time"
            appendText=" (min)"
            lines="inset"
            value={this.conditions.ttt}
            name="ttt"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="tap_temp"
            labelText="Tapping temperature"
            appendText=" (°C)"
            lines="inset"
            value={this.conditions.tap_temp}
            name="tap_temp"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="carbon_cons"
            labelText="Carbon Consumption"
            appendText=" (Kg/MTon)"
            lines="inset"
            value={this.conditions.carbon_cons}
            name="carbon_cons"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="o2_cons"
            labelText="Oxygen Consumption"
            appendText=" (Nm3/MTon)"
            lines="inset"
            value={this.conditions.o2_cons}
            name="o2_cons"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="n_burners"
            labelText="Number of Burners"
            appendText=" (N°)"
            lines="inset"
            value={this.conditions.n_burners}
            name="n_burners"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="foaming_slag"
            labelText="Foaming Slag"
            appendText=" (YES/NO)"
            lines="inset"
            value={this.conditions.foaming_slag}
            name="foaming_slag"
            input-type="boolean"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="porous_plugs"
            labelText="Number of Porous Plugs"
            appendText=" (N°)"
            lines="inset"
            value={this.conditions.porous_plugs}
            name="porous_plugs"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="stirring_gas"
            labelText="Stirring Gas"
            appendText=""
            lines="inset"
            value={this.conditions.stirring_gas}
            name="stirring_gas"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="alloys_addition"
            labelText="Alloys Addition"
            appendText=" (Type & Quantity)"
            lines="inset"
            value={this.conditions.alloys}
            name="alloys"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="current_lifetime"
            labelText="Refractory Current Lifetime"
            appendText=" (N° Heats)"
            lines="inset"
            value={this.conditions.current_lifetime}
            name="current_lifetime"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="target_lifetime"
            labelText="Refractory Target Lifetime"
            appendText=" (N° Heats)"
            lines="inset"
            value={this.conditions.target_lifetime}
            name="target_lifetime"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="working_lining_weight"
            labelText="Working Lining Weight"
            appendText=" (MTon)"
            lines="inset"
            value={this.conditions.working_lining_weight}
            name="working_lining_weight"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <app-form-item
            labelTag="weak_area"
            labelText="Typical Lining Weak Area"
            appendText=""
            lines="inset"
            value={this.conditions.weak_area}
            name="weak_area"
            input-type="text"
            textRows={2}
            onFormItemChanged={(ev) => this.handleChange(ev)}
            readonly={!this.editable}
          ></app-form-item>
          <ion-item-divider>
            <my-transl
              tag="slag_composition"
              text="Slag Composition"
            ></my-transl>
          </ion-item-divider>
          <ion-item-divider>
            <my-transl
              tag="working_lining_parameters"
              text="Working Lining Parameters"
            ></my-transl>
          </ion-item-divider>
          <ion-item-divider>
            <my-transl
              tag="safety_lining_parameters"
              text="Safety Lining Parameters"
            ></my-transl>
          </ion-item-divider>
        </ion-list>
      </Host>
    );
  }
}
