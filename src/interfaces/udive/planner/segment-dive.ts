import { Gas } from "./gas";
import { BuhlPref } from "./buhl-preferences";

/*
 * SegmentDive.java
 *
 *   Describes a dive segment, a specialisation of AbstractSegment
 *
 */

export class SegmentDive {
  private depth: number;
  gas: Gas;
  private setpoint: number;
  private time: number;
  type: number;
  private pref: BuhlPref;

  constructor(depth, time, gas, setpoint, pref) {
    this.pref = pref;

    /** Constructor for objects of class SegmentDive
     * @param depth Depth of segment
     * @param time Time of segment
     * @param gas Gas object for segment
     * @param setpoint Setpoint for segment, or 0.0 for open circuit
     */
    this.depth = depth;
    this.gas = gas ? gas : new Gas(0.21, 0.0);
    this.setpoint = setpoint;
    this.type = this.pref.CONST;
    this.time = time;
  }

  /** Override gasUsed() to determine the gas used in this segment
   *  @return gasUsed in litres (cuft)
   */
  gasUsed() {
    if (this.setpoint > 0.0) return 0.0;
    var p; // pressure
    p = (this.depth + this.pref.getPAmb()) / this.pref.getPConversion(); // Convert to pressure (atm);
    return p * this.time * this.pref.getDiveRMV();
  }

  /** Override toString to return text value
   * @return String representation of Dive Segment
   */
  toString() {
    //var timeMins,timeSeconds;
    //timeMins=this.time;
    //timeSeconds = ((this.time - timeMins)*60.0);
    //return String.format("DIVE:%1$3.0f"+Mvplan.prefs.getDepthShortString()+" for %2$02d:%3$02d [%4$3.0f] on %5$s, SP: %6$3.1f, END:%7$3.0f"+Mvplan.prefs.getDepthShortString(), depth,  timeMins,  timeSeconds,  runTime,  gas.toString(), setpoint, getEnd());
  }
}
