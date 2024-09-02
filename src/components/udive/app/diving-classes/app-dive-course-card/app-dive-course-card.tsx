import { Component, h, Prop, Event, EventEmitter } from "@stencil/core";
import { DivingCourse } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { SystemService } from "../../../../../services/common/system";
import {
  Agency,
  Certification,
} from "../../../../../interfaces/udive/diving-class/divingClass";

@Component({
  tag: "app-dive-course-card",
  styleUrl: "app-dive-course-card.scss",
})
export class AppDiveCourseCard {
  @Prop() divingCourse: DivingCourse;
  @Prop() edit = false;
  @Event() removeEmit: EventEmitter<any>;
  divingAgencies: any;
  agency: Agency;
  certification: Certification;

  async componentWillLoad() {
    this.divingAgencies = await SystemService.getDivingAgencies();
    this.agency = this.divingAgencies[this.divingCourse.agencyId];
    this.certification = this.agency.certifications[
      this.divingCourse.certificationId
    ];
  }
  removeDiveCourse(ev) {
    ev.stopPropagation();
    this.removeEmit.emit(this.divingCourse);
  }

  render() {
    return (
      <ion-card>
        {this.certification.photoURL ? (
          <app-item-cover item={this.certification} />
        ) : undefined}
        <ion-card-header>
          <ion-item class='ion-no-padding' lines='none'>
            {this.edit ? (
              <ion-button
                icon-only
                slot='end'
                color='danger'
                fill='clear'
                onClick={(ev) => this.removeDiveCourse(ev)}
              >
                <ion-icon name='trash-bin-outline'></ion-icon>
              </ion-button>
            ) : undefined}

            <ion-card-title>{this.certification.name}</ion-card-title>
          </ion-item>
          <ion-card-subtitle>{this.agency.name}</ion-card-subtitle>
          <ion-card-content>
            depth: {this.certification.maxDepth} m
          </ion-card-content>
        </ion-card-header>
      </ion-card>
    );
  }
}
