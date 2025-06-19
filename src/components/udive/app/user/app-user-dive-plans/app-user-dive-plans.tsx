import { Component, h, State, Host } from "@stencil/core";
import { UserDivePlans } from "../../../../../interfaces/udive/user/user-dive-plans";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import { orderBy } from "lodash";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { GasBlenderService } from "../../../../../services/udive/planner/gas-blender";
import { DivePlansService } from "../../../../../services/udive/divePlans";
import { TranslationService } from "../../../../../services/common/translations";
import { Environment } from "../../../../../global/env";
import { DiveToolsService } from "../../../../../services/udive/planner/dive-tools";
import { format } from "date-fns/format";

@Component({
  tag: "app-user-dive-plans",
  styleUrl: "app-user-dive-plans.scss",
})
export class AppUserDivePlans {
  @State() userDivePlansArray: any[] = [];
  @State() updateView = false;
  userDivePlans$: Subscription;
  diveSitesList$: Subscription;
  sitesCollection: any[] = [];

  @State() loadingDivePlans = true;
  //@State() creatingNewDivePlan = false;
  //creatingNewDivePlan$: Subscription;
  //@State() editingDivePlan = "";
  //editingDivePlan$: Subscription;

  async componentWillLoad() {
    /*this.creatingNewDivePlan$ = DivePlansService.creatingNewDivePlan$.subscribe(
      (value) => {
        this.creatingNewDivePlan = value;
      }
    );
    this.editingDivePlan$ = DivePlansService.editingDivePlanId$.subscribe(
      (value) => {
        this.editingDivePlan = value;
      }
    );*/
    this.userDivePlans$ = UserService.userDivePlans$.subscribe(
      async (userDivePlans: UserDivePlans) => {
        this.loadingDivePlans = false;
        DivePlansService.resetSkeletons();
        if (userDivePlans) {
          this.userDivePlansArray = [];
          Object.keys(userDivePlans).forEach((key) => {
            let plan = userDivePlans[key] as any;
            plan.id = key;
            plan.date = plan.dives[0].date;
            this.userDivePlansArray.push(plan);
          });
          this.userDivePlansArray = orderBy(
            this.userDivePlansArray,
            "date",
            "desc"
          );
          this.filterMySites();
        }
      }
    );

    //load all dive sites
    this.diveSitesList$ = DiveSitesService.diveSitesList$.subscribe(
      (collection) => {
        //update dive sites
        this.sitesCollection = collection;
        this.filterMySites();
      }
    );
  }

  disconnectedCallback() {
    //this.creatingNewDivePlan$.unsubscribe();
    //this.editingDivePlan$.unsubscribe();
    this.userDivePlans$.unsubscribe();
    this.diveSitesList$.unsubscribe();
  }

  filterMySites() {
    if (this.sitesCollection.length > 0 && this.userDivePlansArray.length > 0) {
      this.userDivePlansArray.map((divePlan) => {
        divePlan.dives.map((dive) => {
          dive.diveSite = this.sitesCollection.find(
            (site) => site.id == dive.diveSiteId
          );
          this.updateView = !this.updateView;
        });
      });
    }
  }

  update(event, divePlanId, diveId) {
    event.stopPropagation();
    DivePlansService.presentDivePlanUpdate(divePlanId, diveId);
  }

  delete(event, divePlanId, diveId) {
    event.stopPropagation();
    DivePlansService.deleteDiveFromPlan(divePlanId, diveId);
  }

  addDive(event, divePlanId, diveId) {
    event.stopPropagation();
    DivePlansService.addDiveToPlan(divePlanId, diveId);
  }

  deleteDivePlan(event, divePlanId) {
    event.stopPropagation();
    DivePlansService.deleteDivePlan(divePlanId);
  }

  render() {
    return (
      <Host>
        {this.loadingDivePlans
          ? [
              <app-skeletons skeleton='userDivePlan' />,
              <app-skeletons skeleton='userDivePlan' />,
              <app-skeletons skeleton='userDivePlan' />,
              <app-skeletons skeleton='userDivePlan' />,
              <app-skeletons skeleton='userDivePlan' />,
            ]
          : undefined}
        {/*this.creatingNewDivePlan ? (
          <app-skeletons skeleton="userDivePlan" />
        ) : undefined*/}
        {this.userDivePlansArray.map((divePlan) => (
          <ion-card>
            <ion-item>
              <ion-label>
                <h2>{format(divePlan.date, "PP")}</h2>
                <p>{divePlan.configuration}</p>
              </ion-label>
              <ion-button
                fill='clear'
                icon-only
                slot='end'
                color='danger'
                onClick={(ev) => this.deleteDivePlan(ev, divePlan.id)}
              >
                <ion-icon name='trash-bin' slot='end'></ion-icon>
              </ion-button>
              <ion-button
                fill='clear'
                icon-only
                color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
                slot='end'
                onClick={(ev) =>
                  this.addDive(ev, divePlan.id, divePlan.dives.length - 1)
                }
              >
                <ion-icon name='add-circle' slot='end'></ion-icon>
              </ion-button>
            </ion-item>
            {divePlan.dives.map((dive, key) => (
              <ion-item
                detail
                button
                onClick={() =>
                  DivePlansService.presentDivePlanDetails(divePlan.id, key)
                }
              >
                {dive.diveSite && dive.diveSite.coverURL ? (
                  <ion-thumbnail slot='start'>
                    <img src={dive.diveSite.coverURL} />
                  </ion-thumbnail>
                ) : undefined}
                <ion-label>
                  <h3>{format(dive.date, "p")}</h3>
                  {dive.diveSite ? (
                    <h4>{dive.diveSite.displayName}</h4>
                  ) : undefined}
                  {dive.profilePoints.map((point) => (
                    <p>
                      {point.time}min @{point.depth}
                      {DiveToolsService.depthUnit} (
                      {GasBlenderService.getGasName(point.gas)})
                    </p>
                  ))}
                </ion-label>
                {key > 0 ? (
                  <ion-button
                    fill='clear'
                    icon-only
                    slot='end'
                    color='danger'
                    onClick={(ev) => this.delete(ev, divePlan.id, key)}
                  >
                    <ion-icon name='trash' slot='end'></ion-icon>
                  </ion-button>
                ) : undefined}

                <ion-button
                  fill='clear'
                  icon-only
                  slot='end'
                  color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
                  onClick={(ev) => this.update(ev, divePlan.id, key)}
                >
                  <ion-icon name='create' slot='end'></ion-icon>
                </ion-button>
              </ion-item>
            ))}
          </ion-card>
        ))}
        {this.userDivePlansArray.length == 0 ? (
          <ion-item>
            <ion-label>
              <h2>
                {TranslationService.getTransl(
                  "no-logbooks",
                  "No dives yet. Click on the '+' button to create your first one."
                )}
              </h2>
            </ion-label>
          </ion-item>
        ) : undefined}
      </Host>
    );
  }
}
