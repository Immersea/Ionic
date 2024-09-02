import {Component, h, Prop, Host, State, Watch} from "@stencil/core";
import {TranslationService} from "../../../../services/common/translations";
import {ProjectsService} from "../../../../services/trasteel/refractories/projects";
import {Project} from "../../../../interfaces/trasteel/refractories/projects";
import {AreaShape} from "../../../../interfaces/trasteel/refractories/shapes";
import {XLSXExportService} from "../../../../services/trasteel/refractories/xlsExport";
import {TrasteelService} from "../../../../services/trasteel/common/services";
import {DOCExportService} from "../../../../services/trasteel/refractories/docExport";

@Component({
  tag: "app-page-project-summary",
  styleUrl: "app-page-project-summary.scss",
})
export class AppPageProjectSummary {
  @State() includeBasicSet = true;
  @State() includeRepairSet = true;
  @State() includeMasses = true;
  @State() updateView = false;
  @Prop({mutable: true}) project: Project;
  @Prop({mutable: true}) areaShapes: AreaShape[] = [];
  @Prop({mutable: true}) updateSummary;
  @State() projectSummary;

  componentWillLoad() {}

  componentDidLoad() {
    this.createProjectSummary();
  }

  handleSetsChange(ev) {
    this[ev.detail.name] = ev.detail.value;
    this.createProjectSummary();
  }

  @Watch("updateSummary")
  createProjectSummary() {
    this.projectSummary = ProjectsService.createProjectSummary(
      this.project,
      this.areaShapes,
      this.project.setsAmount && this.project.setsAmount > 0
        ? this.project.setsAmount
        : 1,
      this.includeBasicSet,
      this.includeRepairSet,
      this.includeMasses
    );
  }

  render() {
    return (
      <Host>
        {this.projectSummary
          ? [
              <div id="courses-grid">
                <ion-grid>
                  <ion-row>
                    <ion-col class="centered">
                      <app-form-item
                        label-tag="include-basic"
                        label-text="Include Basic Set"
                        value={this.includeBasicSet}
                        name="includeBasicSet"
                        input-type="boolean"
                        onFormItemChanged={(ev) => this.handleSetsChange(ev)}
                      ></app-form-item>
                    </ion-col>
                    <ion-col class="centered">
                      <app-form-item
                        label-tag="include-repair"
                        label-text="Include Repair Set"
                        value={this.includeRepairSet}
                        name="includeRepairSet"
                        input-type="boolean"
                        onFormItemChanged={(ev) => this.handleSetsChange(ev)}
                      ></app-form-item>
                    </ion-col>
                    <ion-col class="centered">
                      <app-form-item
                        label-tag="include-masses"
                        label-text="Include Masses"
                        value={this.includeMasses}
                        name="includeMasses"
                        input-type="boolean"
                        onFormItemChanged={(ev) => this.handleSetsChange(ev)}
                      ></app-form-item>
                    </ion-col>
                    <ion-col class="centered">
                      <app-item-detail
                        showItem={false}
                        label-tag="sets-no"
                        label-text="No. of sets"
                        detailText={this.project.setsAmount}
                      ></app-item-detail>
                    </ion-col>
                  </ion-row>
                  <ion-row class="header">
                    <ion-col class="centered" size="1">
                      <small>
                        {TranslationService.getTransl("pos", "Pos")}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("area", "Area")}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("quality", "Quality")}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("shape", "Shape")}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("weight", "Weight") +
                          " kg/pc"}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("pcs", "pcs") +
                          " per set (*)"}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("mt", "MT") + " per set"}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("pcs", "pcs") + " TOT"}
                      </small>
                    </ion-col>
                    <ion-col class="centered">
                      <small>
                        {TranslationService.getTransl("mt", "MT") + " TOT"}
                      </small>
                    </ion-col>
                  </ion-row>
                  {this.projectSummary.projectSummary.map((item) => [
                    <ion-row>
                      <ion-col class="centered" size="1">
                        {item.position}
                      </ion-col>
                      <ion-col class="centered">{item.area}</ion-col>
                      <ion-col class="centered">{item.quality}</ion-col>
                      <ion-col class="centered">{item.shape}</ion-col>
                      <ion-col class="centered">{item.weightPerPiece}</ion-col>
                      <ion-col class="centered">{item.qtyPerSetPcs}</ion-col>
                      <ion-col class="centered">{item.qtyPerSetMT}</ion-col>
                      <ion-col class="centered">{item.qtyTotPcs}</ion-col>
                      <ion-col class="centered">{item.qtyTotMT}</ion-col>
                    </ion-row>,
                  ])}
                  <ion-row class="separator">
                    <ion-col></ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col class="centered" size="1"></ion-col>
                    <ion-col class="centered"></ion-col>
                    <ion-col class="centered"></ion-col>
                    <ion-col class="centered"></ion-col>
                    <ion-col class="centered">
                      <strong>
                        <my-transl tag="total" text="Total"></my-transl>
                      </strong>
                    </ion-col>
                    <ion-col class="centered">
                      <strong>{this.projectSummary.totals.qtyPerSetPcs}</strong>
                    </ion-col>
                    <ion-col class="centered">
                      <strong>{this.projectSummary.totals.qtyPerSetMT}</strong>
                    </ion-col>
                    <ion-col class="centered">
                      <strong>{this.projectSummary.totals.qtyPcs}</strong>
                    </ion-col>
                    <ion-col class="centered">
                      <strong>{this.projectSummary.totals.qtyMT}</strong>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                <ion-item-divider>
                  <ion-label>
                    <small>{"(*) including safety"}</small>
                  </ion-label>
                </ion-item-divider>
              </div>,
              TrasteelService.isRefraDBAdmin() ? (
                <ion-list>
                  <ion-item-divider>
                    <my-transl tag="export" text="Export"></my-transl>
                  </ion-item-divider>
                  <ion-grid>
                    <ion-row>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            XLSXExportService.exportSummary(
                              this.project,
                              this.areaShapes,
                              this.includeBasicSet,
                              this.includeRepairSet,
                              this.includeMasses
                            )
                          }
                        >
                          <my-transl
                            tag="summary-report"
                            text="Summary Report"
                          ></my-transl>
                        </ion-button>
                      </ion-col>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            XLSXExportService.exportQuantityAssembly(
                              this.project,
                              this.areaShapes
                            )
                          }
                        >
                          <my-transl
                            tag="quantity-assembly"
                            text="Quantities and Assembly"
                          ></my-transl>
                        </ion-button>
                      </ion-col>
                    </ion-row>
                    <ion-row>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            XLSXExportService.exportDatasheets(this.project)
                          }
                        >
                          <my-transl
                            tag="datasheets"
                            text="Datasheets"
                          ></my-transl>
                        </ion-button>
                      </ion-col>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            XLSXExportService.exportShapes(
                              this.project,
                              this.areaShapes,
                              "en"
                            )
                          }
                        >
                          <my-transl tag="shapes" text="Shapes"></my-transl>
                        </ion-button>
                      </ion-col>
                    </ion-row>
                    <ion-row>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            XLSXExportService.exportBudget(
                              this.project,
                              this.areaShapes
                            )
                          }
                        >
                          <my-transl tag="budget" text="Budget"></my-transl>
                        </ion-button>
                      </ion-col>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            XLSXExportService.exportPO(
                              this.project,
                              this.areaShapes
                            )
                          }
                        >
                          <my-transl
                            tag="purchase-order"
                            text="Purchase Order"
                          ></my-transl>
                        </ion-button>
                      </ion-col>
                    </ion-row>
                    <ion-row>
                      <ion-col>
                        <ion-button
                          expand="block"
                          color="trasteel"
                          onClick={() =>
                            DOCExportService.generateDocument(this.project)
                          }
                        >
                          <my-transl
                            tag="project-template"
                            text="Project Template"
                          ></my-transl>
                        </ion-button>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-list>
              ) : undefined,
            ]
          : undefined}
      </Host>
    );
  }
}
