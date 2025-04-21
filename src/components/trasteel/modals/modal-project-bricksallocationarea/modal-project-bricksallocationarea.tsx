import { Component, h, Host, State, Element } from "@stencil/core";
import { modalController } from "@ionic/core";
import { cloneDeep, isString } from "lodash";
import { TranslationService } from "../../../../services/common/translations";
import { Environment } from "../../../../global/env";
import { SystemService } from "../../../../services/common/system";
import { BricksAllocationArea } from "../../../../interfaces/trasteel/refractories/projects";
import { ProjectsService } from "../../../../services/trasteel/refractories/projects";

@Component({
  tag: "modal-project-bricksallocationarea",
  styleUrl: "modal-project-bricksallocationarea.scss",
})
export class ModalBricksAllocationArea {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() bricksAllocationAreas: BricksAllocationArea[];
  @State() bricksAllocationArea: BricksAllocationArea;
  @State() updateView = true;
  @State() validBricksAllocationArea = false;

  async componentWillLoad() {
    await this.loadBricksAllocationAreas();
  }

  async loadBricksAllocationAreas() {
    await ProjectsService.downloadProjectSettings();
    this.bricksAllocationAreas = cloneDeep(
      ProjectsService.getBricksAllocationAreas()
    );
    if (this.bricksAllocationAreas && this.bricksAllocationAreas.length > 0) {
      this.bricksAllocationArea = this.bricksAllocationAreas[0];
    } else {
      //create new and add to list
      this.addBricksAllocationArea();
    }
    this.validateProject();
  }

  selectType(ev) {
    this.bricksAllocationArea = this.bricksAllocationAreas[ev.detail.value];
    this.validateProject();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "familyId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.bricksAllocationArea[n] = v;
    this.validateProject();
  }

  validateProject() {
    this.validBricksAllocationArea =
      isString(this.bricksAllocationArea.bricksAllocationAreaId) &&
      isString(this.bricksAllocationArea.bricksAllocationAreaId);
    this.updateView = !this.updateView;
  }

  addBricksAllocationArea() {
    this.bricksAllocationArea = new BricksAllocationArea();
    this.bricksAllocationAreas.push(this.bricksAllocationArea);
    this.index = this.bricksAllocationAreas.length - 1;
  }

  duplicateBricksAllocationArea() {
    this.bricksAllocationArea = cloneDeep(this.bricksAllocationArea);
    this.bricksAllocationArea.bricksAllocationAreaId =
      this.bricksAllocationArea.bricksAllocationAreaId + "_rev.";
    this.bricksAllocationAreas.push(this.bricksAllocationArea);
    this.index = this.bricksAllocationAreas.length - 1;
  }

  async deleteBricksAllocationArea() {
    try {
      this.bricksAllocationAreas.splice(this.index, 1);
      this.index = 0;
      this.bricksAllocationArea = this.bricksAllocationAreas[0];
      this.validateProject();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await ProjectsService.uploadProjectSettings(
      "bricksAllocationArea",
      this.bricksAllocationAreas
    );
    return dismiss ? modalController.dismiss() : true;
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-item lines='none'>
                  <ion-select
                    color='trasteel'
                    id='selectType'
                    interface='action-sheet'
                    label={TranslationService.getTransl(
                      "project_bricksallocationarea",
                      "Project Bricks Allocation Area"
                    )}
                    disabled={!this.validBricksAllocationArea}
                    label-placement='floating'
                    onIonChange={(ev) => this.selectType(ev)}
                    value={this.index ? this.index : 0}
                  >
                    {this.bricksAllocationAreas.map(
                      (bricksAllocationArea, index) => (
                        <ion-select-option value={index}>
                          {bricksAllocationArea.bricksAllocationAreaId +
                            " | " +
                            bricksAllocationArea.bricksAllocationAreaName.en}
                        </ion-select-option>
                      )
                    )}
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  disabled={!this.validBricksAllocationArea}
                  onClick={() => this.addBricksAllocationArea()}
                >
                  <ion-icon name='add' slot='start' />
                </ion-button>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  disabled={!this.validBricksAllocationArea}
                  onClick={() => this.duplicateBricksAllocationArea()}
                >
                  <ion-icon slot='start' name='duplicate'></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  color='danger'
                  disabled={this.bricksAllocationAreas.length == 0}
                  onClick={() => this.deleteBricksAllocationArea()}
                >
                  <ion-icon slot='start' name='trash'></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text='ID'
            value={this.bricksAllocationArea.bricksAllocationAreaId}
            name='bricksAllocationAreaId'
            input-type='string'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "bricksAllocationAreaId",
                  list: ProjectsService.getBricksAllocationAreas(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text='Name'
            value={this.bricksAllocationArea.bricksAllocationAreaName}
            name='bricksAllocationAreaName'
            input-type='text'
            multiLanguage={true}
            text-rows='1'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validBricksAllocationArea}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
