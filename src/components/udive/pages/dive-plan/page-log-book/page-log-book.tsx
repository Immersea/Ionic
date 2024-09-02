import { Component, h } from "@stencil/core";
import { Environment } from "../../../../../global/env";
import { DivePlansService } from "../../../../../services/udive/divePlans";

@Component({
  tag: "page-log-book",
  styleUrl: "page-log-book.scss",
})
export class PageLogBook {
  render() {
    return [
      <app-navbar
        color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
        tag='logbook'
        text='Logbook'
      ></app-navbar>,
      <ion-content>
        <ion-fab horizontal='end' vertical='top' slot='fixed' edge>
          <ion-fab-button
            color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
            onClick={() =>
              DivePlansService.createNewDivePlanWithConfiguration()
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <app-user-dive-plans></app-user-dive-plans>
      </ion-content>,
    ];
  }
}
