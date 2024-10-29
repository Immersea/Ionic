import { Component, Prop, State, h } from "@stencil/core";
import { Project } from "../../../../../interfaces/trasteel/refractories/projects";
import { TranslationService } from "../../../../../services/common/translations";
import Swiper from "swiper";
import { ProjectsService } from "../../../../../services/trasteel/refractories/projects";
import { CustomersService } from "../../../../../services/trasteel/crm/customers";
import { ShapesService } from "../../../../../services/trasteel/refractories/shapes";
import { DatasheetsService } from "../../../../../services/trasteel/refractories/datasheets";
import { SystemService } from "../../../../../services/common/system";
import { AreaShape } from "../../../../../interfaces/trasteel/refractories/shapes";
import { RouterService } from "../../../../../services/common/router";
import { TrasteelService } from "../../../../../services/trasteel/common/services";
import { toString } from "lodash";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "page-project-details",
  styleUrl: "page-project-details.scss",
})
export class PageProjectDetails {
  @Prop() itemId: string;
  @State() project: Project;
  @State() updateView = true;
  @State() updateSummary = true;

  @State() allocationAreaSegment: any = 0;
  @State() areaShapes: AreaShape[] = [];

  titles = [
    { tag: "summary", text: "Summary" },
    { tag: "information", text: "Information" },
    { tag: "shaped", text: "Shaped", disabled: false },
    { tag: "unshaped", text: "Unshaped", disabled: false },
    { tag: "files", text: "Files", disabled: true },
  ];
  @State() slider: Swiper;

  async componentWillLoad() {
    if (this.itemId) {
      SystemService.replaceLoadingMessage("Loading project...");
      await this.loadProject();
    } else {
      SystemService.dismissLoading();
      SystemService.presentAlertError("No Item Id");
      RouterService.goBack();
    }
  }

  async loadProject(project?) {
    try {
      project
        ? (this.project = project)
        : (this.project = await ProjectsService.getProject(this.itemId));
      SystemService.replaceLoadingMessage("Loading Shapes...");
      this.areaShapes = await ProjectsService.loadShapesForApplication(
        this.project,
        true
      );
      //check allocation areas
      SystemService.replaceLoadingMessage("Checking Project...");
      await ProjectsService.checkBricksAllocationAreasForProject(this.project);
      this.updateSummary = !this.updateSummary;
      this.titles[2].disabled = this.project.projectAreaQuality.length == 0;
      this.titles[3].disabled = this.project.projectMass.length == 0;
      this.updateSlider();
    } catch (error) {
      SystemService.dismissLoading();
      RouterService.goBack();
      SystemService.presentAlertError(error);
    }
  }

  async componentDidLoad() {
    SystemService.dismissLoading();

    this.slider = new Swiper(".slider-detail-project", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
        },
      },
    });
  }

  allocationAreaSegmentChanged(ev) {
    this.allocationAreaSegment = ev.detail.value;
    this.updateSlider();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async editProject(item?) {
    const modal = await ProjectsService.presentProjectUpdate(
      item ? item : this.itemId
    );
    //update customer data after modal dismiss
    modal.onDidDismiss().then((project) => this.loadProject(project.data));
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          text={this.project.projectLocalId}
          color='trasteel'
          backButton={true}
          rightButtonText={
            TrasteelService.isRefraDBAdmin()
              ? {
                  icon: "create",
                  fill: "outline",
                  tag: "edit",
                  text: "Edit",
                }
              : null
          }
          rightButtonFc={() => this.editProject()}
        ></app-navbar>
      </ion-header>,
      <app-header-segment-toolbar
        color={Environment.getAppColor()}
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class='slides'>
        <swiper-container class='slider-detail-project swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              {/* SUMMARY */}
              <app-page-project-summary
                project={this.project}
                areaShapes={this.areaShapes}
                updateSummary={this.updateSummary}
              ></app-page-project-summary>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <ion-list class='ion-no-padding' id='project-grid'>
                <app-item-detail
                  lines='none'
                  label-tag='customer'
                  label-text='Customer'
                  detailText={
                    this.project.customerId
                      ? CustomersService.getCustomersDetails(
                          this.project.customerId
                        )
                        ? CustomersService.getCustomersDetails(
                            this.project.customerId
                          ).fullName
                        : null
                      : null
                  }
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='project-name'
                  label-text='Project Name'
                  detailText={this.project.projectLocalId}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='technical-docs-caption'
                  label-text='Technical Docs Caption'
                  detailText={this.project.docsCaption}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='project-description'
                  label-text='Project Description'
                  detailText={this.project.projectDescription}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='drawing-no'
                  label-text='Drawing No.'
                  detailText={this.project.drawing}
                ></app-item-detail>
                <ion-grid>
                  <ion-row>
                    <ion-col>
                      <app-item-detail
                        lines='none'
                        label-tag='drawing-date'
                        label-text='Drawing Date'
                        detailText={this.project.drawingDate}
                        isDate={true}
                      ></app-item-detail>
                    </ion-col>
                    <ion-col>
                      <app-item-detail
                        lines='none'
                        label-tag='project-finished-date'
                        label-text='Project Finished Date'
                        detailText={this.project.finishedDate}
                        isDate={true}
                      ></app-item-detail>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                <ion-grid>
                  <ion-row>
                    <ion-col>
                      <app-item-detail
                        lines='none'
                        label-tag='capacity'
                        label-text='Capacity'
                        detailText={toString(this.project.steelAmount)}
                      ></app-item-detail>
                    </ion-col>
                    <ion-col>
                      <app-item-detail
                        lines='none'
                        label-tag='application-unit'
                        label-text='Application Unit'
                        detailText={
                          ProjectsService.getApplicationUnits(
                            this.project.applicationId
                          )[0].applicationName.en
                        }
                      ></app-item-detail>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                <app-item-detail
                  lines='none'
                  label-tag='steel-amount'
                  label-text='Steel Amount'
                  detailText={toString(this.project.steelAmount)}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='steel-density'
                  label-text='Steel Density'
                  appendText=' (g/sm3)'
                  detailText={toString(this.project.liquidMetalDensity)}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='guaranteed-lifetime'
                  label-text='Guaranteed Lifetime'
                  appendText=' (heats)'
                  detailText={this.project.guaranteedLife}
                ></app-item-detail>
              </ion-list>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <div>
                <ion-toolbar>
                  <ion-segment
                    mode='ios'
                    scrollable
                    onIonChange={(ev) => this.allocationAreaSegmentChanged(ev)}
                    value={this.allocationAreaSegment}
                  >
                    {this.project.projectAreaQuality.map((area, index) => (
                      <ion-segment-button value={index} layout='icon-start'>
                        <ion-label>
                          {(area.bricksAllocationAreaId
                            ? ProjectsService.getBricksAllocationAreas(
                                area.bricksAllocationAreaId
                              )[0].bricksAllocationAreaName.en
                            : "") +
                            (area.onlyForRepair
                              ? " (" +
                                TranslationService.getTransl(
                                  "repair",
                                  "Repair"
                                ) +
                                ")"
                              : "")}
                        </ion-label>
                      </ion-segment-button>
                    ))}
                  </ion-segment>
                </ion-toolbar>
                {this.project.projectAreaQuality.map((area, index) => (
                  <div>
                    {this.allocationAreaSegment == index ? (
                      <div>
                        <ion-grid>
                          <ion-row>
                            <ion-col>
                              <app-item-detail
                                showItem={false}
                                label-tag='bricks-allocation-area'
                                label-text='Bricks Allocation Area'
                                detailText={
                                  ProjectsService.getBricksAllocationAreas(
                                    area.bricksAllocationAreaId
                                  )[0].bricksAllocationAreaName.en
                                }
                              ></app-item-detail>
                            </ion-col>
                          </ion-row>
                          <ion-row>
                            <ion-col>
                              <app-item-detail
                                showItem={false}
                                label-tag='quality'
                                label-text='Quality'
                                detailText={DatasheetsService.getDatasheetName(
                                  area.datasheetId
                                )}
                              ></app-item-detail>
                            </ion-col>
                            <ion-col size='4'>
                              <app-item-detail
                                showItem={false}
                                label-tag='density'
                                label-text='Density'
                                appendText=' (g/cm3)'
                                detailText={toString(area.density)}
                              ></app-item-detail>
                            </ion-col>
                          </ion-row>
                          <ion-row>
                            <ion-col>
                              <app-item-detail
                                showItem={false}
                                label-tag='include-safety'
                                label-text='Include Safety'
                                appendText={" %"}
                                detailText={toString(area.includeSafety)}
                              ></app-item-detail>
                            </ion-col>
                            <ion-col size='4'>
                              <app-item-detail
                                showItem={false}
                                label-tag='only-for-repair'
                                label-text='Only for repair'
                                detailText={area.onlyForRepair}
                              ></app-item-detail>
                            </ion-col>
                          </ion-row>
                          <ion-row>
                            <ion-col>
                              <app-item-detail
                                showItem={false}
                                label-tag='comments'
                                label-text='Comments'
                                detailText={toString(area.comments)}
                              ></app-item-detail>
                            </ion-col>
                          </ion-row>
                          <div class='positions-box'>
                            {area.shapes
                              ? area.shapes.map((shape, positionIndex) => (
                                  <ion-row>
                                    <ion-col size='3'>
                                      <app-item-detail
                                        showItem={false}
                                        label-tag={
                                          positionIndex == 0 ? "position" : null
                                        }
                                        label-text={
                                          positionIndex == 0 ? "Position" : null
                                        }
                                        detailText={toString(shape.position)}
                                      ></app-item-detail>
                                    </ion-col>
                                    <ion-col>
                                      <app-item-detail
                                        showItem={false}
                                        labelTag={
                                          positionIndex == 0 ? "shape" : null
                                        }
                                        labelText={
                                          positionIndex == 0 ? "Shape" : null
                                        }
                                        detailText={ShapesService.getShapeName(
                                          area.shapes[positionIndex].shapeId
                                        )}
                                      ></app-item-detail>
                                    </ion-col>
                                    <ion-col size='2'>
                                      <app-item-detail
                                        showItem={false}
                                        labelTag={
                                          positionIndex == 0 ? "radius" : null
                                        }
                                        labelText={
                                          positionIndex == 0 ? "Radius" : null
                                        }
                                        appendText={
                                          positionIndex == 0 ? " (mm)" : null
                                        }
                                        detailText={
                                          this.areaShapes &&
                                          this.areaShapes[index] &&
                                          this.areaShapes[index].shapes[
                                            positionIndex
                                          ].radius > 0
                                            ? this.areaShapes[index].shapes[
                                                positionIndex
                                              ].radius
                                            : "-"
                                        }
                                      ></app-item-detail>
                                    </ion-col>
                                    <ion-col size='2'>
                                      <app-item-detail
                                        showItem={false}
                                        labelTag={
                                          positionIndex == 0 ? "weight" : null
                                        }
                                        labelText={
                                          positionIndex == 0 ? "Weight" : null
                                        }
                                        appendText={
                                          positionIndex == 0 ? " (Kg)" : null
                                        }
                                        detailText={
                                          this.areaShapes &&
                                          this.areaShapes[index]
                                            ? this.project.projectAreaQuality[
                                                index
                                              ].shapes[positionIndex]
                                                .specialShapeVolume > 0
                                              ? this.areaShapes[index].shapes[
                                                  positionIndex
                                                ].getWeightForVolume(
                                                  this.project
                                                    .projectAreaQuality[index]
                                                    .shapes[positionIndex]
                                                    .specialShapeVolume,
                                                  area.density
                                                )
                                              : this.areaShapes[index].shapes[
                                                  positionIndex
                                                ].getWeight(area.density)
                                            : "-"
                                        }
                                      ></app-item-detail>
                                    </ion-col>
                                  </ion-row>
                                ))
                              : undefined}
                          </div>
                        </ion-grid>
                        <div id='responsive-grid'>
                          <ion-grid>
                            <ion-row class='header ion-align-items-center ion-justify-content-center ext-row'>
                              <ion-col size='12' size-lg='12'>
                                <ion-row>
                                  <ion-col
                                    size='12'
                                    size-lg='4'
                                    class='ext-col'
                                  >
                                    <ion-row class='inner-row1'>
                                      <ion-col
                                        size='3'
                                        size-lg='3'
                                        class='inner-col'
                                      >
                                        {TranslationService.getTransl(
                                          "course",
                                          "Course"
                                        )}
                                      </ion-col>
                                      <ion-col
                                        size='3'
                                        size-lg='3'
                                        class='inner-col'
                                      >
                                        {TranslationService.getTransl(
                                          "start",
                                          "Start"
                                        ) + " °"}
                                      </ion-col>
                                      <ion-col
                                        size='3'
                                        size-lg='3'
                                        class='inner-col'
                                      >
                                        {TranslationService.getTransl(
                                          "end",
                                          "End"
                                        ) + " °"}
                                      </ion-col>
                                      <ion-col
                                        size='3'
                                        size-lg='3'
                                        class='inner-col'
                                      >
                                        {TranslationService.getTransl(
                                          "radius",
                                          "Radius"
                                        ) + " (mm)"}
                                      </ion-col>
                                    </ion-row>
                                  </ion-col>
                                  <ion-col
                                    size='12'
                                    size-lg='8'
                                    class='ext-col'
                                  >
                                    <ion-row class='inner-row2'>
                                      <ion-col size='2' class='inner-col'>
                                        {"Pos. " +
                                          area.shapes.map(
                                            (shape) => shape.position
                                          )}
                                      </ion-col>
                                      <ion-col size='2' class='inner-col'>
                                        {TranslationService.getTransl(
                                          "quantity",
                                          "Quantity"
                                        )}
                                      </ion-col>
                                      <ion-col size='2' class='inner-col'>
                                        {TranslationService.getTransl(
                                          "sum",
                                          "Sum"
                                        )}
                                      </ion-col>
                                      <ion-col size='2' class='inner-col'>
                                        {TranslationService.getTransl(
                                          "repair-sets",
                                          "Repair Sets"
                                        )}
                                      </ion-col>
                                      <ion-col size='2' class='inner-col'>
                                        {TranslationService.getTransl(
                                          "weight",
                                          "Weight"
                                        ) + " (Kg)"}
                                      </ion-col>
                                      <ion-col size='2' class='inner-col'>
                                        {TranslationService.getTransl(
                                          "row-weight",
                                          "Row Weight"
                                        ) + " (Kg)"}
                                      </ion-col>
                                    </ion-row>
                                  </ion-col>
                                </ion-row>
                              </ion-col>
                            </ion-row>
                            {area.courses.map((course, courseIndex) => [
                              <ion-row class='ion-align-items-center ion-justify-content-center ext-row'>
                                <ion-col size='12' size-lg='12'>
                                  <ion-row>
                                    <ion-col
                                      size='12'
                                      size-lg='4'
                                      class='ext-col'
                                    >
                                      <ion-row class='inner-row1'>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          {course.courseNumber}
                                        </ion-col>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          {course.startAngle}
                                        </ion-col>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          {course.endAngle}
                                        </ion-col>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          {course.innerRadius}
                                        </ion-col>
                                      </ion-row>
                                    </ion-col>
                                    <ion-col
                                      size='12'
                                      size-lg='8'
                                      class='ext-col'
                                    >
                                      {area.shapes.map((shape, shapeIndex) => (
                                        <ion-row class='inner-row2'>
                                          <ion-col size='2' class='inner-col'>
                                            {ShapesService.getShapeName(
                                              shape.shapeId
                                            )}
                                          </ion-col>
                                          <ion-col size='2' class='inner-col'>
                                            {course.quantityShapes.length > 0 &&
                                            course.quantityShapes[shapeIndex]
                                              ? course.quantityShapes[
                                                  shapeIndex
                                                ].quantity
                                              : 0}
                                          </ion-col>
                                          <ion-col
                                            size='2'
                                            class={
                                              "inner-col" +
                                              (shapeIndex > 0
                                                ? " emptyCell"
                                                : "")
                                            }
                                          >
                                            {shapeIndex == 0
                                              ? ProjectsService.countTotalQuantity(
                                                  course
                                                )
                                              : undefined}
                                          </ion-col>
                                          <ion-col
                                            size='2'
                                            class={
                                              "inner-col" +
                                              (shapeIndex > 0
                                                ? " emptyCell"
                                                : "")
                                            }
                                          >
                                            {shapeIndex == 0
                                              ? course.repairSets
                                              : undefined}
                                          </ion-col>
                                          <ion-col size='2' class='inner-col'>
                                            {ProjectsService.getAreaCourseWeightForShape(
                                              this.project,
                                              this.areaShapes,
                                              index,
                                              courseIndex,
                                              shapeIndex
                                            )}
                                          </ion-col>
                                          <ion-col
                                            size='2'
                                            class={
                                              "inner-col" +
                                              (shapeIndex > 0
                                                ? " emptyCell"
                                                : "")
                                            }
                                          >
                                            {shapeIndex == 0
                                              ? ProjectsService.getTotalWeightForCourse(
                                                  this.project,
                                                  this.areaShapes,
                                                  index,
                                                  courseIndex
                                                )
                                              : undefined}
                                          </ion-col>
                                        </ion-row>
                                      ))}
                                    </ion-col>
                                  </ion-row>
                                </ion-col>
                              </ion-row>,
                              <ion-row class='separator'>
                                <ion-col></ion-col>
                              </ion-row>,
                            ])}
                          </ion-grid>
                        </div>
                      </div>
                    ) : undefined}
                  </div>
                ))}
              </div>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <div>
                <ion-grid>
                  {this.project.projectMass.map((mass) => [
                    <ion-row
                      style={{
                        "padding-left": "16px",
                        "padding-right": "16px",
                      }}
                    >
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='position'
                          label-text='Position'
                          detailText={toString(mass.position)}
                        ></app-item-detail>
                      </ion-col>
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='application-area'
                          label-text='Application Area'
                          detailText={
                            ProjectsService.getBricksAllocationAreas(
                              mass.bricksAllocationAreaId
                            )[0].bricksAllocationAreaName.en
                          }
                        ></app-item-detail>
                      </ion-col>
                    </ion-row>,
                    <ion-row
                      style={{
                        "padding-left": "16px",
                        "padding-right": "16px",
                      }}
                    >
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='quality'
                          label-text='Quality'
                          detailText={DatasheetsService.getDatasheetName(
                            mass.datasheetId
                          )}
                        ></app-item-detail>
                      </ion-col>
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='density'
                          label-text='Density'
                          appendText=' (g/cm3)'
                          detailText={mass.density}
                        ></app-item-detail>
                      </ion-col>
                    </ion-row>,
                    <ion-row
                      style={{
                        "padding-left": "16px",
                        "padding-right": "16px",
                      }}
                    >
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='quantity'
                          label-text='Quantity'
                          detailText={toString(mass.quantity)}
                        ></app-item-detail>
                      </ion-col>
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='unit'
                          label-text='Unit'
                          detailText={
                            mass.quantityUnit
                              ? ProjectsService.getQuantityUnits(
                                  mass.quantityUnit
                                )[0].quantityUnitName.en
                              : ""
                          }
                        ></app-item-detail>
                      </ion-col>
                      <ion-col size='1'>
                        <p
                          style={{
                            "text-align": "center",
                            "font-size": "1.3rem",
                          }}
                        >
                          x
                        </p>
                      </ion-col>
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='weight-per-unit'
                          label-text='Weight per Unit'
                          appendText=' (Kg)'
                          detailText={mass.weightPerUnitKg}
                        ></app-item-detail>
                      </ion-col>
                      <ion-col size='1'>
                        <p
                          style={{
                            "text-align": "center",
                            "font-size": "1.3rem",
                          }}
                        >
                          =
                        </p>
                      </ion-col>
                      <ion-col>
                        <app-item-detail
                          showItem={false}
                          label-tag='total-weight'
                          label-text='Total Weight'
                          appendText=' (MT)'
                          detailText={mass.totalWeightMT}
                        ></app-item-detail>
                      </ion-col>
                    </ion-row>,
                    <ion-row class='separator'>
                      <ion-col></ion-col>
                    </ion-row>,
                  ])}
                </ion-grid>
              </div>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>file - to do</swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
