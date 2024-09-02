import {Gas} from "../planner/gas";
import {DiveProfilePoint} from "../planner/dive-profile-point";

export class UserDivePlans {
  [divePlanId: string]: {
    configuration: string;
    dives: Array<{
      date: Date;
      diveSiteId: string;
      profilePoints: DiveProfilePoint[];
    }>;
  };

  constructor(doc?) {
    if (doc) {
      Object.keys(doc).forEach((divePlanId) => {
        let divePlan = doc[divePlanId];
        if (divePlan && divePlan.dives) {
          let dives = [];
          divePlan.dives.forEach((dive) => {
            let profilepoints = [];
            dive.profilePoints.forEach((point) => {
              profilepoints.push(
                new DiveProfilePoint(
                  point.index,
                  point.depth,
                  point.time,
                  new Gas(
                    point.gas.fO2,
                    point.gas.fHe,
                    point.gas.fromDepth,
                    point.gas.ppO2,
                    point.gas.units
                  ),
                  point.setpoint
                )
              );
            });
            dives.push({
              date: new Date(dive.date),
              diveSiteId: dive.diveSiteId,
              profilePoints: profilepoints,
            });
          });
          this[divePlanId] = {
            configuration: divePlan.configuration,
            dives: dives,
          };
        }
      });
    }
  }
}
