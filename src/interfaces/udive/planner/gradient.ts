/**
 *  Gradient
 *
 *  Defines a Gradient Factor object.
 *  A GF Object maintains a low and high setting and is able to determine
 *  a GF for any depth between its initialisation depth (see setGfAtDepth())
 *  and the surface.
 *
 *   @author Guy Wittig
 *   @version 18-Jun-2006
 */
export class Gradient {
  private gfHigh: number; // GF high and low settings
  private gfLow: number;
  private gfSlope: number; // Slope of the linear equation
  private gf: number; // Current GF
  private gfSet: boolean;

  constructor(gfLow, gfHigh) {
    /**
     * Constructor for objects of class Gradient
     * @param gfLow Low GF. 0.0 to 1.0
     * @param gfHigh High GF. 0.0 to 1.0
     */
    this.gfHigh = gfHigh; // GF high and low settings
    this.gfLow = gfLow;
    this.gfSlope = 1.0; // Slope of the linear equation
    this.gf = gfLow; // Current GF
    this.gfSet = false; // Indicates that gf Slope has been initialised
  }

  /**
   * Returns current GF with bounds checking. If GF < GLLow, returns GFLow.
   * @return Current GF
   */
  getGradientFactor() {
    if (this.gf >= this.gfLow) return this.gf;
    else return this.gfLow;
  }

  /**
   * Sets the this.gf for a given depth. Must be called after setGfSlope()
   * has initialised slope
   * @param depth Current Depth msw (fsw)
   */
  setGfAtDepth(depth) {
    if (this.gfSlope < 1.0 && depth >= 0.0)
      this.gf = depth * this.gfSlope + this.gfHigh;
  }

  /**
   * Set this.gf Slope at specified depth. Typically called once to initialise the GF slope.
   * @param depth Depth msw (fsw)
   */
  setGfSlopeAtDepth(depth) {
    if (depth > 0) {
      this.gfSlope = (this.gfHigh - this.gfLow) / (0.0 - depth);
      this.gfSet = true;
    }
  }

  /************** Accessor and mutator methods for Bean compliance **************/

  /**
   * Gets GF High setting. Typical (0.0-1.0)
   * @return GF High
   */
  getGfHigh() {
    return this.gfHigh;
  }
  /**
   * Sets GF High
   * @param d GF High. Tyically 0.0 to 1.0
   */
  setGfHigh(d) {
    this.gfHigh = d;
  }
  /**
   * Gets GF High setting. Typical (0.0-1.0)
   * @return GF Low
   */
  getGfLow() {
    return this.gfLow;
  }
  /**
   * Sets GF Low setting. Typical (0.0-1.0)
   * @param d GF Low
   */
  setGfLow(d) {
    this.gfLow = d;
  }
  /**
   * Gets current GF. Typical GFLow < GF < GFHigh
   * @return Current GF
   */
  getGf() {
    return this.gf;
  }
  /**
   * Sets Current GF. Required for Bean compliance.
   * @param d Current GF
   */
  setGf(d) {
    this.gf = d;
  }
  /**
   * Gets GF Slope (i.e. slope of the linear equation)
   * @return GF Slope
   */
  getGfSope() {
    return this.gfSlope;
  }
  /**
   * Sets GF Slope (Required for Bean Compliance)
   * @param d GF Slope
   */
  setGfSlope(d) {
    this.gfSlope = d;
  }
  /**
   * Returns <CODE>true</CODE> if GF is set
   * @return If GF is set
   */
  isGfSet() {
    return this.gfSet;
  }
  /**
   * Sets GFIsSet flag
   * @param b GF is Set
   */
  setGfSet(b) {
    this.gfSet = b;
  }
}
