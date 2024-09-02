import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep, isNumber, isString} from "lodash";
import {TranslationService} from "../../../../services/common/translations";
import {ShapeType} from "../../../../interfaces/trasteel/refractories/shapes";
import {
  SHAPESCOLLECTION,
  ShapesService,
} from "../../../../services/trasteel/refractories/shapes";
import {RouterService} from "../../../../services/common/router";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";

@Component({
  tag: "modal-shape-type",
  styleUrl: "modal-shape-type.scss",
})
export class ModalShapeType {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() shapeTypes: ShapeType[];
  @State() shapeType: ShapeType;
  @State() updateView = true;
  @State() validShapeType = false;

  async componentWillLoad() {
    await this.loadShapeTypes();
  }

  async loadShapeTypes() {
    await ShapesService.downloadShapeSettings();
    this.shapeTypes = cloneDeep(await ShapesService.getShapeTypes());
    if (this.shapeTypes && this.shapeTypes.length > 0) {
      this.shapeType = this.shapeTypes[0];
    } else {
      //create new and add to list
      this.shapeTypes = [];
      this.addShapeType();
    }
    this.validateShape();
  }

  selectType(ev) {
    this.shapeType = this.shapeTypes.find((x) => x.typeId == ev.detail.value);
    this.validateShape();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "typeId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.shapeType[n] = v;
    this.validateShape();
  }

  validateShape() {
    this.validShapeType =
      isString(this.shapeType.typeId) &&
      isString(this.shapeType.typeName.en) &&
      isNumber(this.shapeType.decimals) &&
      this.shapeType.position > 0 &&
      isString(this.shapeType.dwg.url);
    this.updateView = !this.updateView;
  }

  async editDrawing() {
    this.shapeType.dwg.id = this.shapeType.typeId;
    this.shapeType.dwg.name = this.shapeType.typeName.en;
    this.shapeType.dwg.description = "";
    const popover = await RouterService.openPopover("popover-media-loading", {
      media: this.shapeType.dwg,
    });
    popover.onDidDismiss().then(async (ev) => {
      if (ev && ev.data) {
        const mediaToUpload = {
          [ev.data.media.id]: ev.data,
        };
        const mediaToStore = ev.data.media;
        const popover = await RouterService.openPopover(
          "popover-media-uploader",
          {
            files: mediaToUpload,
            itemId: this.shapeType.typeId,
            collectionId: SHAPESCOLLECTION,
          }
        );
        popover.onDidDismiss().then((ev) => {
          if (ev && ev.data) {
            const urls = ev.data;
            //update urls into media
            this.shapeType.dwg = mediaToStore;
            Object.keys(urls).forEach((id) => {
              this.shapeType.dwg.url = urls[id];
            });
            this.save(false);
            this.validateShape();
          }
        });
      }
    });
  }

  addShapeType() {
    this.shapeType = new ShapeType();
    this.shapeTypes.push(this.shapeType);
    this.index = this.shapeTypes.length - 1;
  }

  duplicateShapeType() {
    this.shapeType = cloneDeep(this.shapeType);
    this.shapeType.typeId = this.shapeType.typeId + "_rev.";
    this.shapeTypes.push(this.shapeType);
    this.index = this.shapeTypes.length - 1;
  }

  async deleteShapeType() {
    try {
      this.shapeTypes.splice(this.index, 1);
      this.index = 0;
      this.shapeType = this.shapeTypes[0];
      this.validateShape();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await ShapesService.uploadShapeTypes(this.shapeTypes);
    return dismiss ? modalController.dismiss() : true;
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-content>
          <app-banner
            heightPx={500}
            backgroundCoverFill={false}
            link={this.shapeType.dwg ? this.shapeType.dwg.url : null}
          ></app-banner>
          <ion-button
            expand="block"
            fill="outline"
            color="trasteel"
            disabled={!this.shapeType.typeId}
            onClick={() => this.editDrawing()}
          >
            <ion-icon slot="start" name="create"></ion-icon>
            <ion-label>
              {!this.shapeType.typeId
                ? TranslationService.getTransl(
                    "media-loader-error",
                    "Please insert the ID to upload new media."
                  )
                : TranslationService.getTransl("edit-drawing", "Edit Drawing")}
            </ion-label>
          </ion-button>
          <ion-grid>
            <ion-row>
              <ion-col>
                <app-select-search
                  label={{
                    tag: "shape_type",
                    text: "Shape Type",
                  }}
                  value={this.shapeType.typeId}
                  lines="inset"
                  selectFn={(ev) => this.selectType(ev)}
                  selectOptions={this.shapeTypes}
                  selectValueId="typeId"
                  selectValueText={["typeName", "en"]}
                  disabled={!this.validShapeType}
                ></app-select-search>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validShapeType}
                  onClick={() => this.addShapeType()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validShapeType}
                  onClick={() => this.duplicateShapeType()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.shapeTypes.length == 0}
                  onClick={() => this.deleteShapeType()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>

          <app-form-item
            label-text="Position"
            value={this.shapeType.position}
            name="position"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "minvalue",
                options: {min: 1},
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="ID"
            value={this.shapeType.typeId}
            name="typeId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "typeId",
                  list: this.shapeTypes,
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.shapeType.typeName}
            name="typeName"
            input-type="text"
            multiLanguage={true}
            text-rows="1"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-text="Decimals"
            value={this.shapeType.decimals}
            name="decimals"
            inputStep="1"
            input-type="number"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validShapeType}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
