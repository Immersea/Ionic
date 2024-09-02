/*
 *
 * Models oxygen toxicity
 *
 */

export class OxTox {
  private cns: number;
  private otu: number;
  private maxOx: number;

  constructor() {
    /** Initialise OxTox model */
    this.cns = 0.0;
    this.otu = 0.0;
    this.maxOx = 0.0;
  }

  /**
   * Adds oxygen load into BUHL. Uses NOAA lookup table to add percentage based on time and ppO2.
   * @param pO2 Partial pressure of oxygen in atm (not msw!)
   * @param time Time of segment in minutes
   */
  addO2(time, pO2) {
    //assert(time >0.0 && pO2 >= 0.0 && pO2 <= 5.0);
    var d;
    var exposure; // == mins for this.cns==100%
    //round time
    time = Math.ceil(time);
    // Calculate OTU using formula OTU= T * (0.5/(pO2-0.5))^-(5/6)
    if (pO2 > 0.5) {
      // Only accumulate OTUs for ppO2 >= 0.5 atm
      d = time * Math.pow(0.5 / (pO2 - 0.5), -0.833333);
      this.otu += d;
    }
    // CNS Calculations
    if (pO2 > 1.8) exposure = 1;
    // Need a better figure here
    else if (pO2 > 1.7) exposure = 4;
    else if (pO2 > 1.6) exposure = 12;
    else if (pO2 > 1.5) exposure = 45;
    else if (pO2 > 1.4) exposure = 120;
    else if (pO2 > 1.3) exposure = 150;
    else if (pO2 > 1.2) exposure = 180;
    else if (pO2 > 1.1) exposure = 210;
    else if (pO2 > 1.0) exposure = 240;
    else if (pO2 > 0.9) exposure = 300;
    else if (pO2 > 0.8) exposure = 360;
    else if (pO2 > 0.7) exposure = 450;
    else if (pO2 > 0.6) exposure = 570;
    else if (pO2 > 0.5) exposure = 720;
    else exposure = 0;
    if (exposure > 0) this.cns += time / exposure;
    if (pO2 > this.maxOx) this.maxOx = pO2;
    //log("OxTox: add "+time+" min on "+pO2+". OTU="+this.otu+" CNS="+(this.cns*100.0)+'\n');
  }

  /**
   * Removes oxygen load from model during surface intervals
   * @param time Time of segment in minutes
   */
  removeO2(time) {
    if (time >= 1440.0) {
      // 24 hrs
      this.otu = 0.0;
    }
    // Decay this.cns with a halftime of 90mins
    this.cns = this.cns * Math.exp((-time * 0.693147) / 90.0);
    //System.out.println("CNS decayed for"+time+". Was ="+this.cnsOld+", now="+this.cns);
  }

  /**
   * Gets the maximum ppO2 ecountered
   * @return Maximum ppO2
   */
  getMaxOx() {
    return this.maxOx;
  }

  /**
   * Gets current CNS
   * @return Current CNS
   */
  getCns() {
    return this.cns;
  }

  /**
   * Gets current OTU
   * @return Current OTU
   */
  getOtu() {
    return this.otu;
  }

  /********** ACCESSORS AND MUTATORS FOR BEAN COMPLIANCE ***************/

  /**
   * Sets current CNS (for Bean Compliance)
   * @param d Current CNS
   */
  setCns(d) {
    this.cns = d;
  }

  /**
   * Sets current OTU (for Bean Compliance)
   * @param d Current OTU
   */
  setOtu(d) {
    this.otu = d;
  }

  /**
   * Sets Max ppO2 (for Bean Compliance)
   * @param d Max ppO2
   */
  setMaxOx(d) {
    this.maxOx = d;
  }
}
