import {
  Component,
  h,
  Host,
  Prop,
  State,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";
import { TranslationService } from "../../../../services/common/translations";
import { DivingCourse } from "../../../../interfaces/udive/diving-school/divingSchool";
import { SystemService } from "../../../../services/common/system";
import { each, findIndex } from "lodash";
import { DiveStandardsService } from "../../../../services/udive/planner/dive-standards";

@Component({
  tag: "popover-search-diving-course",
  styleUrl: "popover-search-diving-course.scss",
})
export class PopoverSearchDivingCourse {
  @Element() el: HTMLElement;
  @Prop() item: DivingCourse;
  @State() popover: HTMLIonPopoverElement;
  agencies: any;
  localAgencies: any;
  @Event() certSelected: EventEmitter<DivingCourse>;
  @State() updateView = false;

  async componentWillLoad() {
    this.agencies = await SystemService.getDivingAgencies();
    this.localAgencies = DiveStandardsService.agencies;
    !this.item
      ? (this.item = {
          agencyId: null,
          agencyName: null,
          certificationId: null,
        })
      : undefined;
  }

  componentDidLoad() {
    this.popover = this.el.closest("ion-popover");
    this.setSelectAgency();
    //if (this.item.agencyId) this.setSelectCertification();
  }

  setSelectAgency() {
    const selectElement: HTMLIonSelectElement =
      this.el.querySelector("#selectAgency");
    const customPopoverOptions = {
      header: TranslationService.getTransl("diving-agency", "Diving Agency"),
    };
    selectElement.interfaceOptions = customPopoverOptions;
    selectElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(this.localAgencies, (val) => {
      let selectOption = document.createElement("ion-select-option");
      selectOption.value = val.ag_name;
      selectOption.textContent = val.ag_name;
      selectElement.appendChild(selectOption);
    });
    this.updateView = !this.updateView;
  }

  /*setSelectCertification() {
    if (this.agencies[this.item.agencyId]) {
      const selectElement: HTMLIonSelectElement = this.el.querySelector(
        "#selectCertification"
      );
      const customPopoverOptions = {
        header: TranslationService.getTransl(
          "diving-certification",
          "Diving Certification"
        ),
      };

      selectElement.interfaceOptions = customPopoverOptions;
      selectElement.placeholder = TranslationService.getTransl(
        "select",
        "Select"
      );
      each(this.agencies[this.item.agencyId].certifications, (val, i) => {
        let selectOption = document.createElement("ion-select-option");
        selectOption.value = i;
        selectOption.textContent = val.name;
        selectElement.appendChild(selectOption);
      });
      selectElement.disabled = false;
      this.enableCertificationsField = false;
    } else {
      this.enableCertificationsField = true;
    }
    this.updateView = !this.updateView;
  }*/

  updateAgency(ev) {
    this.item.agencyName = ev.detail.value;
    const agencyId = findIndex(
      this.agencies,
      (x) => x["id"] == this.item.agencyName
    );
    this.item.agencyId = agencyId > 0 ? ev.detail.value : "";
    //this.setSelectCertification();
  }

  updateCertification(ev) {
    this.item.certificationId = ev.detail.value;
    if (this.popover) {
      this.popover.dismiss(this.item);
    }
    this.certSelected.emit(this.item);
  }

  render() {
    return (
      <Host>
        {this.popover ? (
          <ion-toolbar>
            <ion-title>
              <my-transl tag='diving-course' text='Diving Course' />
            </ion-title>
          </ion-toolbar>
        ) : undefined}
        <ion-item>
          <ion-select
            label={TranslationService.getTransl(
              "diving-agency",
              "Diving Agency"
            )}
            id='selectAgency'
            onIonChange={(ev) => this.updateAgency(ev)}
            value={this.item.agencyName}
          ></ion-select>
        </ion-item>
        <app-form-item
          label-tag='certification'
          label-text='Certification'
          lines='inset'
          value={this.item.certificationId}
          name='certification'
          input-type='text'
          onFormItemChanged={(ev) => this.updateCertification(ev)}
          validator={["required"]}
        ></app-form-item>
        {/***
           * <ion-item>
          <ion-select
            label={TranslationService.getTransl(
              "diving-certification",
              "Diving Certification"
            )}
            id="selectCertification"
            onIonChange={(ev) => this.updateCertification(ev)}
            disabled={true}
            value={this.item.certificationId}
          ></ion-select>
        </ion-item>
           */}
      </Host>
    );
  }
}
