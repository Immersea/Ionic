import { Component, h, Host, State, Element, Prop } from "@stencil/core";
import { popoverController } from "@ionic/core";
import {
  ProjectAreaQualityShape,
  AutoFillCourses,
} from "../../../../interfaces/trasteel/refractories/projects";

@Component({
  tag: "popover-project-autofill",
  styleUrl: "popover-project-autofill.scss",
})
export class PopoverProjectAutofill {
  @Element() el: HTMLElement;
  @Prop() shapes: ProjectAreaQualityShape[];
  @Prop() bottom = false;
  @Prop() autoFillCourses = new AutoFillCourses();
  @State() width;
  @State() disableSave = true;
  popover: HTMLIonPopoverElement;

  componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
    this.calculateWidth();
  }

  handleAutofill(ev) {
    this.autoFillCourses[ev.detail.name] = ev.detail.value;
    this.calculateWidth();
  }
  calculateWidth() {
    this.width =
      this.autoFillCourses.endAngle - this.autoFillCourses.startAngle;
    this.checkDisableSave();
  }

  handleAutofillShapes(index, ev) {
    this.autoFillCourses.quantityShape[index] = ev.detail.value;
    this.checkDisableSave();
  }

  checkDisableSave() {
    let checkQuantities = 0;
    this.autoFillCourses.quantityShape.forEach((qty) => {
      checkQuantities += qty;
    });
    if (
      this.autoFillCourses.fromCourse >= 0 &&
      this.autoFillCourses.toCourse >= this.autoFillCourses.fromCourse &&
      (this.autoFillCourses.startRadius > 0 || checkQuantities > 0)
    ) {
      this.disableSave = false;
    } else {
      this.disableSave = true;
    }
  }

  close() {
    popoverController.dismiss();
  }

  save() {
    popoverController.dismiss(this.autoFillCourses);
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>
              <my-transl tag='auto-fill' text='Auto Fill' />
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            {this.bottom
              ? [
                  <app-form-item
                    label-tag='bottom-radius'
                    label-text='Bottom Radius'
                    value={this.autoFillCourses.startRadius}
                    name='startRadius'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='repair-sets'
                    label-text='Repair Sets'
                    value={this.autoFillCourses.repairSets}
                    name='repairSets'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                ]
              : [
                  <app-form-item
                    label-tag='from-course'
                    label-text='From Course'
                    value={this.autoFillCourses.fromCourse}
                    name='fromCourse'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='to-course'
                    label-text='To Course'
                    value={this.autoFillCourses.toCourse}
                    name='toCourse'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='step'
                    label-text='Step'
                    value={this.autoFillCourses.step}
                    name='step'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='layer'
                    label-text='Layer'
                    value={this.autoFillCourses.layer}
                    name='layer'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='start-angle'
                    label-text='Start Angle'
                    appendText=' °'
                    value={this.autoFillCourses.startAngle}
                    name='startAngle'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='end-angle'
                    label-text='End Angle'
                    appendText=' °'
                    value={this.autoFillCourses.endAngle}
                    name='endAngle'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <ion-item detail={false} lines='none'>
                    <ion-label>
                      <ion-note>
                        <my-transl tag='width' text='Width'></my-transl>
                        {" °"}
                      </ion-note>
                    </ion-label>
                    <div slot='end'>
                      <ion-note>{this.width}</ion-note>
                    </div>
                  </ion-item>,
                  <app-form-item
                    label-tag='start-height'
                    label-text='Start Height'
                    appendText=' (mm)'
                    value={this.autoFillCourses.startHeight}
                    name='startHeight'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='start-radius'
                    label-text='Start Radius'
                    appendText=' (mm)'
                    value={this.autoFillCourses.startRadius}
                    name='startRadius'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='radius-step'
                    label-text='Radius Step'
                    appendText=' (mm)'
                    value={this.autoFillCourses.radiusStep}
                    name='radiusStep'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  <app-form-item
                    label-tag='repair-sets'
                    label-text='Repair Sets'
                    value={this.autoFillCourses.repairSets}
                    name='repairSets'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleAutofill(ev)}
                  ></app-form-item>,
                  this.shapes.map((shape, index) => (
                    <app-form-item
                      label-text={"Q.ty Pos. " + shape.position}
                      value={this.autoFillCourses.quantityShape[index]}
                      name={shape.shapeId}
                      input-type='number'
                      onFormItemChanged={(ev) =>
                        this.handleAutofillShapes(index, ev)
                      }
                    ></app-form-item>
                  )),
                ]}
          </ion-list>
        </ion-content>
        <ion-footer>
          <app-modal-footer
            saveTag={{ tag: "auto-fill", text: "Auto Fill", color: "success" }}
            disableSave={this.disableSave}
            onCancelEmit={() => this.close()}
            onSaveEmit={() => this.save()}
          />
        </ion-footer>
      </Host>
    );
  }
}
