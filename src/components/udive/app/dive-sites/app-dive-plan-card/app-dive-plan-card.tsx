import { Component, h, Prop, Event, EventEmitter } from "@stencil/core";
import { DivePlanModel } from "../../../../../interfaces/udive/planner/dive-plan";
import { DivePlansService } from "../../../../../services/udive/divePlans";
import { TranslationService } from "../../../../../services/common/translations";
import { alertController } from "@ionic/core";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { MapDataDiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "app-dive-plan-card",
  styleUrl: "app-dive-plan-card.scss",
})
export class AppDiveSiteCard {
  @Prop() divePlan: DivePlanModel;
  @Prop() edit = false;
  @Event() viewEmit: EventEmitter<DivePlanModel>;
  @Event() removeEmit: EventEmitter<number>;
  diveSite: MapDataDiveSite;

  componentWillLoad() {
    this.diveSite = DiveSitesService.diveSitesList.find(
      (site) => site.id === this.divePlan.dives[0].diveSiteId
    );
  }

  async viewDivePlan(ev) {
    ev.stopPropagation();
    const modal = await DivePlansService.presentDiveTemplateUpdate(
      this.divePlan
    );
    if (modal) {
      this.viewEmit.emit(modal);
    }
  }

  async removeDivePlan(ev) {
    ev.stopPropagation();
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-header",
        "Delete dive?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-message",
        "This dive plan will be deleted! Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            this.removeEmit.emit();
          },
        },
      ],
    });
    confirm.present();
  }

  render() {
    return (
      <ion-card
        onClick={(ev) => (this.edit ? this.viewDivePlan(ev) : undefined)}
      >
        {this.diveSite ? <app-item-cover item={this.diveSite} /> : undefined}

        <ion-card-header>
          <ion-item class='ion-no-padding' lines='none'>
            {this.edit ? (
              <ion-button
                icon-only
                slot='end'
                color='danger'
                fill='clear'
                onClick={(ev) => this.removeDivePlan(ev)}
              >
                <ion-icon name='trash-bin-outline'></ion-icon>
              </ion-button>
            ) : undefined}

            <ion-card-title>
              {this.divePlan.configuration.stdName}
            </ion-card-title>
          </ion-item>

          <ion-card-subtitle>
            {this.divePlan.dives[0].getProfilePointsDetails().map((detail) => (
              <p class='ion-text-start'>{detail}</p>
            ))}
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          {this.divePlan.configuration.configuration.bottom.length > 0 ? (
            <p>
              <my-transl tag='bottom-tanks' text='Bottom Tanks' />:
            </p>
          ) : undefined}
          {this.divePlan.configuration.configuration.bottom.map((tank) => (
            <p>{tank.name + "->" + tank.gas.toString()}</p>
          ))}
          {this.divePlan.configuration.configuration.deco.length > 0 ? (
            <p>
              <my-transl tag='deco-tanks' text='Deco Tanks' />:
            </p>
          ) : undefined}
          {this.divePlan.configuration.configuration.deco.map((tank) => (
            <p>{tank.name + "->" + tank.gas.toString()}</p>
          ))}
        </ion-card-content>
        {!this.edit ? (
          <ion-button
            expand='full'
            color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
            onClick={() => DivePlansService.createNewDivePlan(this.divePlan)}
          >
            <my-transl tag='plan-dive' text='Plan a Dive'></my-transl>
          </ion-button>
        ) : undefined}
      </ion-card>
    );
  }
}
