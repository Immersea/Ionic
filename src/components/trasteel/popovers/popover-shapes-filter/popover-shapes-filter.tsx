import {Component, h, Host, Element, Prop, State} from "@stencil/core";
import {popoverController} from "@ionic/core";
import {ShapesService} from "../../../../services/trasteel/refractories/shapes";
import {
  Shape,
  ShapeFilter,
  ShapeType,
} from "../../../../interfaces/trasteel/refractories/shapes";

@Component({
  tag: "popover-shapes-filter",
  styleUrl: "popover-shapes-filter.scss",
})
export class PopoverShapesFilter {
  @Element() el: HTMLElement;
  @Prop() filter: ShapeFilter;
  @State() shapeTypes: ShapeType[];
  @State() dwg;
  popover: HTMLIonPopoverElement;

  async componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
    this.shapeTypes = await ShapesService.getShapeTypes();
    this.adjustPopoverWidth("900px");
  }

  handleFilter(ev) {
    this.filter[ev.detail.name] = ev.detail.value;
  }

  async handleSelect(ev) {
    this.filter.shapeTypeId = ev.detail.value;
    const shape = new Shape(this.filter);
    await ShapesService.setDwgForShape(shape);
    this.dwg = shape.dwg;
  }

  adjustPopoverWidth(width: string) {
    this.popover.style.setProperty("--popover-width", width);
  }

  close() {
    popoverController.dismiss();
  }

  save() {
    popoverController.dismiss(this.filter);
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>Filter Shapes</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-list>
                  <ion-grid>
                    <ion-row>
                      <ion-col>
                        <app-select-search
                          label={{
                            tag: "shape_type",
                            text: "Shape Type",
                          }}
                          value={this.filter.shapeTypeId}
                          lines="inset"
                          selectFn={(ev) => this.handleSelect(ev)}
                          selectOptions={this.shapeTypes}
                          selectValueId="typeId"
                          selectValueText={["typeName", "en"]}
                        ></app-select-search>
                      </ion-col>
                    </ion-row>
                  </ion-grid>

                  {Object.keys(this.filter).map((key) =>
                    !key.includes("operator") && key !== "shapeTypeId" ? (
                      <ion-row>
                        <ion-col>
                          <app-form-item
                            label-text={key}
                            value={this.filter[key]}
                            name={key}
                            input-type="number"
                            onFormItemChanged={(ev) => this.handleFilter(ev)}
                          ></app-form-item>
                        </ion-col>
                        <ion-col size="1">
                          <ion-select
                            color="trasteel"
                            interface="action-sheet"
                            onIonChange={(ev) =>
                              (this.filter[key + "_operator"] = ev.detail.value)
                            }
                            value={this.filter[key + "_operator"]}
                          >
                            <ion-select-option value={">="}>
                              <ion-label>{">="}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={">"}>
                              <ion-label>{">"}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={"="}>
                              <ion-label>{"="}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={"<"}>
                              <ion-label>{"<"}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={"<="}>
                              <ion-label>{"<="}</ion-label>
                            </ion-select-option>
                          </ion-select>
                        </ion-col>
                      </ion-row>
                    ) : undefined
                  )}
                </ion-list>
              </ion-col>
              <ion-col>
                <app-banner
                  scrollTopValue={0}
                  heightPx={300}
                  backgroundCover={false}
                  link={this.dwg ? this.dwg.url : null}
                ></app-banner>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
        <ion-footer>
          <app-modal-footer
            saveTag={{tag: "filter", text: "Filter"}}
            onCancelEmit={() => this.close()}
            onSaveEmit={() => this.save()}
          />
        </ion-footer>
      </Host>
    );
  }
}
