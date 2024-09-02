import { Gas } from "./gas";
import { BuhlPref } from "./buhl-preferences";

/*
 * SegmentAbstract
 *
 * Abstract Segment Class. Defines basic attributes and functions of all dive segments
 *
 */
export class SegmentAbstract {
  private depth: number; // Depth of segment (typically end)
  private setpoint: number; // For CCR (=0 for Open Circuit)
  private gas: Gas; // Gas used
  private time: number; // Segment time
  private runTime: number; // Runtime in profile
  private enable: boolean; // Is this segment enabled (i.e. used)
  private type: number; // type of segment, as per below
  private pref: BuhlPref;

  constructor(s, pref) {
    this.pref = pref;
    //depth set in msw
    this.depth =
      s && s.depth
        ? this.pref.units == 0
          ? s.depth
          : s.depth / this.pref.METERS_TO_FEET
        : 0.0; // Depth of segment (typically end)
    this.setpoint = s && s.setpoint ? s.setpoint : 0.0; // For CCR (=0 for Open Circuit)
    this.gas =
      s && s.gas ? new Gas(s.gas.fO2, s.gas.fHe, s.gas.mod) : new Gas(0.21, 0); // Gas used
    this.time = s && s.time ? s.time : 0.0; // Segment time
    this.runTime = s && s.runTime ? s.runTime : 0.0; // Runtime in profile
    this.enable = s && s.enable ? s.enable : true; // Is this segment enabled (i.e. used)
    this.type = s && s.type ? s.type : this.pref.CONST; // type of segment, as per below
  }

  /** Gets Equivalent Narcosis Depth (END) in msw (fsw)
   *  @return Equivalent Narcosis Depth (END) in msw (fsw)
   */
  getEnd() {
    var pAbsolute = this.depth + this.pref.getPAmb(); // msw (fsw)
    var fN2 = this.gas.getFN2();
    var fHe = this.gas.getFHe();
    var pInert;
    var ppN2Inspired;
    // Set inspired gas fractions.
    if (this.setpoint > 0.0) {
      // Rebreather mode
      // Determine pInert by subtracting absolute oxygen pressure (msw), or force to zero if no inert fraction
      pInert =
        fHe + fN2 > 0.0
          ? pAbsolute - this.setpoint * this.pref.getPConversion()
          : 0.0;
      ppN2Inspired = pInert > 0.0 ? (pInert * fN2) / (fHe + fN2) : 0.0;
    } else {
      // Open circuit mode
      ppN2Inspired = pAbsolute * fN2;
    }
    var end = ppN2Inspired / 0.79 - this.pref.getPAmb();
    return end > 0.0 ? end : 0.0; // Only return positive numbers.
  }

  /************* ACCESSORS AND MUTATORS *****************/

  /**
   * Gets segment type (CONST, ASCENT, DESCENT, DECO, WAYPOINT, SURFACE)
   * @return segment type
   */
  getType() {
    return this.type;
  }
  /**
   * Sets segment type
   * @param i Segment type (CONST, ASCENT, DESCENT, DECO, WAYPOINT, SURFACE)
   */
  setType(i) {
    this.type = i;
  }
  /**
   * Gets depth of segment
   * @return Depth of segment - return the depth in the original unit
   */
  getDepth() {
    return this.pref.units == 0
      ? this.depth
      : this.depth * this.pref.METERS_TO_FEET;
  }
  /**
   * Gets time of segment
   * @return Time of segment
   */
  getTime() {
    return this.time;
  }
  /**
   * Gets Gas object used on this segment
   * @return Gas object
   */
  getGas() {
    return this.gas;
  }
  /**
   * Gets setpoint used on this segment (or 0.0 for open circuit)
   * @return Setpoint
   */
  getSetpoint() {
    return this.setpoint;
  }
  /**
   * Gets runTime of this segment
   * @return RunTime of segment.
   */
  getRunTime() {
    return this.runTime;
  }
  /**
   * Returns whether this segment is enabled. Typically used for input segments to dive profile.
   * @return Enabled
   */
  getEnable() {
    return this.enable;
  }
  /**
   * Enables or disables this segment
   * @param state Enabled (<CODE>true</CODE> or <CODE>false</CODE>)
   */
  setEnable(state) {
    this.enable = state;
  }
  /**
   * Sets depth of segment
   * @param d Depth of segment
   */
  setDepth(d) {
    this.depth = this.pref.units == 0 ? d : d / this.pref.METERS_TO_FEET;
  }
  /**
   * Sets time of segment
   * @param t Time of segment
   */
  setTime(t) {
    this.time = t;
  }
  /**
   * Sets runTime of segment
   * @param t RunTime of segment
   */
  setRunTime(t) {
    this.runTime = t;
  }
  /**
   * Sets setPoint of segment
   * @param sp SetPoint of segment
   */
  setSetpoint(sp) {
    this.setpoint = sp;
  }
  /**
   * Sets gas of segment
   * @param g Gas of segment
   */
  setGas(g) {
    this.gas = g;
  }
}
