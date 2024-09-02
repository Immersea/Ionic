import { Gas } from "./gas";
import { BuhlPref } from "./buhl-preferences";

/*
 * SegmentDeco.java
 *
 *  Describes a Deco Segment, a specialisation of AbstractSegment
 *
 */

export class SegmentDeco {
  private depth: number;
  gas: Gas;
  private setpoint: number;
  private time: number;
  type: number;
  private pref: BuhlPref;
  mvMax: number;
  gfUsed: number;
  controlCompartment: number;

  constructor(depth, time, gas, setpoint, pref) {
    this.pref = pref;
    /** Maximum M-Value Gradient encountered in this segment */
    this.mvMax = 0;
    /** Gradient Factor used in this segment */
    this.gfUsed = 0;
    /** Controlling compartment of this segment */
    this.controlCompartment = -1;

    /** Constructor for objects of class SegmentDeco
     * @param depth Depth of segment
     * @param time Time of segment
     * @param gas Gas object for segment
     * @param setpoint Setpoint for segment, or 0.0 for open circuit
     */
    this.depth = depth;
    this.gas = gas;
    this.setpoint = setpoint;
    this.type = this.pref.DECO;
    this.time = time;
  }

  /** Override gasUsed() to determine the gas used in this segment
   *  @return Gas Used in litres (cuft)
   */
  gasUsed() {
    if (this.setpoint > 0.0) return 0.0; // No gas used for closed circuit
    var p; // pressure
    p = (this.depth + this.pref.getPAmb()) / this.pref.getPConversion(); // Convert to pressure (atm);
    return p * this.time * this.pref.getDecoRMV();
  }

  /** Override toString to return String representation of DecoSegment
   * @return String representation of DecoSegment
   */
  toStringLong() {
    //var timeMins, timeSeconds;
    //timeMins = this.time;
    //timeSeconds = (this.time - timeMins) * 60.0;
    //return String.format("DECO:%1$3.0f"+Mvplan.prefs.getDepthShortString()+" for %2$02d:%3$02d [%4$3.0f] on %5$s, SP: %6$3.1f, END:%7$3.0f"+Mvplan.prefs.getDepthShortString()+" M-Value: %8$02.0f%% [%9$02d], GF: %10$02.0f%%",  depth,  timeMins,  timeSeconds,  runTime,  gas.toString(), setpoint, getEnd(), mvMax*100, controlCompartment, gfUsed*100);
  }

  /**************** Accessor and mutator methods ****************/
  /** Sets controlling compartment - required for Bean interface
   *  @param c Compartment number
   */
  setControlCompartment(c) {
    this.controlCompartment = c;
  }
  /** Sets Gradient factor used - required for Bean Interface
   *  @param gf GradientFactor used
   */
  setGfUsed(gf) {
    this.gfUsed = gf;
  }
  /** Sets Maximum M-Value Gradient for compartment - required for Bean interface
   *  @param mv M-Value Gradient
   */
  setMvMax(mv) {
    this.mvMax = mv;
  }
}
