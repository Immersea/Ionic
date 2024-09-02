import { Gas } from "./gas";
import { BuhlPref } from "./buhl-preferences";

/*
 * SegmentAscDec.java
 *
 * Class of segment for describing ascent/descent dive segments. Specialisation of AbstractSegment
 */

export class SegmentAscDec {
  private rate: number;
  private depth: number;
  gas: Gas;
  private setpoint: number;
  private time: number;
  type: number;
  private pref: BuhlPref;

  constructor(startDepth, endDepth, rate, gas, setpoint, pref) {
    this.pref = pref;
    /**
     * Constructor for objects of class SegmentAscDec
     * @param gas Gas object for this segment
     * @param startDepth Starting depth of segment in m (ft)
     * @param endDepth Ending depth of segment in m (ft)
     * @param rate Rate of change of depth in m/min (ft/min)
     * @param setpoint Setpoint for segment, or 0.0 for open circuit
     */
    /** Ascent (+ve)/ Descent (-ve) rate in msw/sec */
    this.rate = rate; // Ascent (+ve)/ Descent (-ve) rate in msw/sec

    this.depth = endDepth;
    this.gas = gas;
    this.setpoint = setpoint;
    this.time = (endDepth - startDepth) / rate;
    if (startDepth < endDepth) this.type = this.pref.DESCENT;
    else this.type = this.pref.ASCENT;
  }

  /** Override gasUsed() to determine the gas used in this segment
   *  @return Gas Used in litres (cuft)
   */
  gasUsed() {
    if (this.setpoint > 0.0) return 0.0;

    var p; // pressure
    var d; // depth
    var startDepth;

    startDepth = this.depth - this.rate * this.time;
    // Calculate average depth
    d = startDepth + (this.depth - startDepth) / 2.0;
    p = (d + this.pref.getPAmb()) / this.pref.getPConversion(); // Convert to pressure (atm);
    return p * this.time * this.pref.getDiveRMV();
  }

  /** Gets ascent rate for segment
   * @return Ascent Rate in m/min (ft/min)
   */
  getRate() {
    return this.rate;
  }
}
