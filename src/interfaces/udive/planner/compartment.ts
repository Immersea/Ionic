import { DiveToolsService } from "../../../services/udive/planner/dive-tools";
import { BuhlPref } from "./buhl-preferences";

/**
 * Compartment
 *
 * Defines a single Buhlmann compartment.
 *
 */
export class Compartment {
  private kHe: number;
  private kN2: number; // Time constants - calculated from halftimes
  private aHe: number;
  private bHe: number;
  private aN2: number;
  private bN2: number; // A and b co-efficients
  private LOG2 = 0.69315; // ln(2)
  private index: number;

  /**
   * Constructor for Compartments. Initialises partial pressures to zero.
   */

  // Initialise compartment pressures to zero
  private ppHe: number; // partial pressure
  private ppN2: number;
  private factorComp: number; // Conservatism factors
  private factorDecomp: number;

  public compartmentChart: Array<any> = [];
  public compartmentChartCCR: Array<any> = [];
  private chartRunTime: number = 0;

  constructor(public pref: BuhlPref, public ambientPressure: number) {
    this.kHe = null;
    this.kN2 = null; // Time constants - calculated from halftimes
    this.aHe = null;
    this.bHe = null;
    this.aN2 = null;
    this.bN2 = null; // A and b co-efficients

    /**
     * Constructor for Compartments. Initialises partial pressures to zero.
     */

    // Initialise compartment pressures to zero
    this.ppHe = 0.0; // partial pressure
    this.ppN2 = 0.0;
    this.factorComp = pref.getFactorComp(); // Conservatism factors
    this.factorDecomp = pref.getFactorDecomp();
  }
  /**
   * Sets compartment's time constants
   * @param hHe Halftime, helium
   * @param hN2 Halftime, Nitrogen
   * @param this.aHe a coefficient, Helium
   * @param this.bHe b coefficient, Helium
   * @param this.aN2 a coefficient, Nitrogen
   * @param this.bN2 b coefficient, Nitrogen
   */

  setCompartmentTimeConstants(index, hHe, hN2, aHe, bHe, aN2, bN2) {
    this.index = index;
    this.kHe = this.LOG2 / hHe; // Time constants
    this.kN2 = this.LOG2 / hN2;
    this.aHe =
      aHe *
      (DiveToolsService.isMetric()
        ? 1
        : DiveToolsService.conversions.feetPerMeter); // original in bar
    this.bHe = bHe;
    this.aN2 =
      aN2 *
      (DiveToolsService.isMetric()
        ? 1
        : DiveToolsService.conversions.feetPerMeter); // original in bar
    this.bN2 = bN2;
    return this.index;
  }
  /**
   * Sets partial pressures of He and N2 - in msw (fsw)
   * @param this.ppHe Partial pressure of Helium
   * @param this.ppN2 Partial pressure of Nitrogen
   * @throws mvplan.this.ModelStateException Throws ModelStateException if partial pressures are < 0.0 or time < 0.0
   */
  setpp(ppHe, ppN2) {
    if (ppHe < 0.0 || ppN2 < 0.0) {
      console.log(
        "ERROR: setpp() is throwing exception, .ppHe=" + ppHe + " .ppN2=" + ppN2
      );
    } else {
      this.setPpHe(ppHe);
      this.setPpN2(ppN2);
    }
  }
  /**
   * Constant depth calculations. Uses instananeous equation: P = Po + (Pi - Po)(1-e^-kt)
   * Updated to use conservatism factors on Compression and Decompression
   * @param .ppHeInspired Partiap pressure of inspired helium
   * @param .ppN2Inspired Partial pressure of inspired Nitrogen
   * @param segTime Segment time in minutes
   * @throws mvplan.this.ModelStateException Throws ModelStateException if partial pressures are < 0.0 or time < 0.0
   */
  constDepth(
    ppHeInspired,
    ppN2Inspired,
    segTime,
    depth,
    stage,
    fO2,
    fHe,
    oc,
    pO2,
    diveIndex
  ) {
    if (ppHeInspired < 0.0 || ppN2Inspired < 0.0 || segTime < 0.0) {
      //if((Mvplan.DEBUG > 0)) System.out.println("ERROR: constDepth() is throwing exception, this.ppHe="+this.ppHeInspired+" this.ppN2="+this.ppN2Inspired);
      //throw new ModelStateException("Error in argument: Compartment.constDepth()");
      /*console.log(
        "ERROR: constDepth() is throwing exception, this.ppHe=" +
          ppHeInspired +
          " this.ppN2=" +
          ppN2Inspired +
          " segTime=" +
          segTime
      );*/
      //for Heliox N2 goes below 0
      ppHeInspired = ppHeInspired < 0 ? 0 : ppHeInspired;
      ppN2Inspired = ppN2Inspired < 0 ? 0 : ppN2Inspired;
      segTime = segTime < 0 ? 0 : segTime;
      //return;
    }
    let time = 0;
    let delta = 1 + segTime - Math.floor(segTime); //set first delta to decimals of segTime
    do {
      time = time + delta;
      let deltthis = { aHe: null, aN2: null };

      let kN2 = this.kN2;
      let kHe = this.kHe;
      /**
       * change kN2 and kHe for surface interval according to original Baker gradula offgassing
       */
      if (stage == "surface") {
        if (time <= 45) {
          kN2 = (0.9 - 0.005555 * time) * this.kN2;
          kHe = (0.9 - 0.005555 * time) * this.kHe;
        } else if (time > 45 && time <= 60) {
          kN2 = 0.65 * this.kN2;
          kHe = 0.65 * this.kHe;
        } else if (time > 60 && time <= 180) {
          kN2 = (0.65 + 0.0020833 * (time - 60)) * this.kN2;
          kHe = (0.65 + 0.0020833 * (time - 60)) * this.kHe;
        } else {
          kN2 = 0.9 * this.kN2;
          kHe = 0.9 * this.kHe;
        }
      }
      // Calculate change in pp
      deltthis.aHe = (ppHeInspired - this.ppHe) * (1 - Math.exp(-kHe * delta));
      deltthis.aN2 = (ppN2Inspired - this.ppN2) * (1 - Math.exp(-kN2 * delta));
      // Apply conservatism factors
      deltthis.aHe =
        deltthis.aHe > 0.0
          ? deltthis.aHe * this.factorComp
          : deltthis.aHe * this.factorDecomp;
      deltthis.aN2 =
        deltthis.aN2 > 0.0
          ? deltthis.aN2 * this.factorComp
          : deltthis.aN2 * this.factorDecomp;
      // Apply to compartment
      this.ppHe = this.ppHe + deltthis.aHe;
      this.ppN2 = this.ppN2 + deltthis.aN2;

      //reset delta to 1min after first loop
      delta = 1;
      let pAbsolute = depth + this.ambientPressure;
      let ssHe = this.ppHe - ppHeInspired;
      let maxAmbHe = this.getHeMaxAmb(1);
      let mValueHe = this.getHeMvalueAt(pAbsolute);
      let ssN2 = this.ppN2 - ppN2Inspired;
      let maxAmbN2 = this.getN2MaxAmb(1);
      let mValueN2 = this.getN2MvalueAt(pAbsolute);
      let mValue = this.getMvalueAt(pAbsolute);
      //let ssTissue = (this.ppHe+this.ppN2) - (ppHeInspired+ppN2Inspired)
      this.chartRunTime += delta;
      //set according to type of dive
      let chart = oc ? this.compartmentChart : this.compartmentChartCCR;
      chart.push({
        dive: parseInt(diveIndex),
        depth: depth,
        runTime: this.chartRunTime,
        type: stage,
        fO2: fO2 * 100,
        fHe: fHe * 100,
        pO2: pO2,
        MV: this.getMV(pAbsolute),
        MVHe: this.getHeMV(pAbsolute),
        MVN2: this.getN2MV(pAbsolute),
        mValue: mValue,
        mValueHe: mValueHe,
        mValueN2: mValueN2,
        maxAmb: this.getMaxAmb(1),
        maxAmbHe: maxAmbHe, //for 100% M-Value
        maxAmbN2: maxAmbN2, //for 100% M-Value
        ppHeInspired: ppHeInspired,
        ppN2Inspired: ppN2Inspired,
        ssHe:
          ssHe < 0
            ? -(100 - (this.ppHe / ppHeInspired) * 100)
            : (this.ppHe / mValueHe) * 100,
        ssN2:
          ssN2 < 0 || stage == "surface"
            ? -(100 - (this.ppN2 / ppN2Inspired) * 100)
            : (this.ppN2 / mValueN2) * 100,
        ppHe: this.ppHe,
        ppN2: this.ppN2,
      });
    } while (time < segTime);
  }

  /**
   * Ascend or descend calculation
   * UsesEquation: P=Pio+R(t -1/k)-[Pio-Po-(R/k)]e^-kt
   * @param this.ppHeInspired Partiap pressure of inspired helium
   * @param this.ppN2Inspired Partial pressure of inspired Nitrogen
   * @param rateHe Rate of change of this.ppHe
   * @param rateN2 Rate of change of this.ppHe
   * @param segTime Segment time in minutes
   * @throws mvplan.this.ModelStateException Throws ModelStateException if partial pressures are < 0.0 or time < 0.0
   */
  ascDec(
    ppHeInspired,
    ppN2Inspired,
    rateHe,
    rateN2,
    segTime,
    start,
    finish,
    oc,
    pO2,
    diveIndex
  ) {
    if (ppHeInspired < 0.0 || ppN2Inspired < 0.0 || segTime < 0.0) {
      console.log(
        "ERROR: ascDec() is throwing exception, ppHe=" +
          ppHeInspired +
          " ppN2=" +
          ppN2Inspired +
          " segTime=" +
          segTime,
        finish,
        pO2
      );
    }
    //insert start values
    if (start == 0) {
      let pAbsolute = start + this.ambientPressure;
      let ssHe = this.ppHe - ppHeInspired;
      let maxAmbHe = this.getHeMaxAmb(1);
      let mValueHe = this.getHeMvalueAt(pAbsolute);
      let ssN2 = this.ppN2 - ppN2Inspired;
      let maxAmbN2 = this.getN2MaxAmb(1);
      let mValueN2 = this.getN2MvalueAt(pAbsolute);
      let mValue = this.getMvalueAt(pAbsolute);
      //let ssTissue = (this.ppHe+this.ppN2) - (ppHeInspired+ppN2Inspired)
      //set according to type of dive
      let chart = oc ? this.compartmentChart : this.compartmentChartCCR;
      this.chartRunTime = 0;
      chart.push({
        dive: parseInt(diveIndex),
        depth: start,
        runTime: this.chartRunTime,
        type: "descent",
        fO2: 21,
        fHe: 0,
        pO2: 0.21,
        MV: this.getMV(pAbsolute),
        MVHe: this.getHeMV(pAbsolute),
        MVN2: this.getN2MV(pAbsolute),
        mValue: mValue,
        mValueHe: mValueHe,
        mValueN2: mValueN2,
        maxAmb: this.getMaxAmb(1),
        maxAmbHe: maxAmbHe, //for 100% M-Value
        maxAmbN2: maxAmbN2, //for 100% M-Value
        ppHeInspired: ppHeInspired,
        ppN2Inspired: ppN2Inspired,
        ssHe:
          ssHe < 0
            ? -(100 - (this.ppHe / ppHeInspired) * 100)
            : (this.ppHe / mValueHe) * 100,
        ssN2:
          ssN2 < 0
            ? -(100 - (this.ppN2 / ppN2Inspired) * 100)
            : (this.ppN2 / mValueN2) * 100,
        ppHe: this.ppHe,
        ppN2: this.ppN2,
      });
    }

    //calculate new values
    this.ppHe =
      ppHeInspired +
      rateHe * (segTime - 1.0 / this.kHe) -
      (ppHeInspired - this.ppHe - rateHe / this.kHe) *
        Math.exp(-this.kHe * segTime);
    this.ppN2 =
      ppN2Inspired +
      rateN2 * (segTime - 1.0 / this.kN2) -
      (ppN2Inspired - this.ppN2 - rateN2 / this.kN2) *
        Math.exp(-this.kN2 * segTime);

    this.chartRunTime += segTime;
    /*
        //insert end values
        let depth = Math.abs(start-(start-finish)/2)
        let pAbsolute = depth+this.ambientPressure
        let HeInspired = (ppHeInspired / this.ambientPressure) * (depth / this.ambientPressure)
        let N2Inspired = (ppN2Inspired / this.ambientPressure) * (depth / this.ambientPressure)
        mValueHe = this.getHeMvalueAt(depth)
        mValueN2 = this.getHeMvalueAt(depth)
        mValue = this.getMvalueAt(depth)
        ssHe = (this.ppHe - HeInspired)
        ssN2 = (this.ppN2 - N2Inspired)
        ssTissue = (this.ppHe+this.ppN2) - (ppHeInspired+ppN2Inspired)
        this.compartmentChart.push({
            depth: depth,
            runTime: this.chartRunTime - segTime/2,
            type:"ascDesc",
            MV: this.getMV(pAbsolute),
            MVHe: this.getHeMV(pAbsolute),
            MVN2: this.getN2MV(pAbsolute),
            mValue: mValue,
            mValueHe: mValueHe,
            mValueN2: mValueN2,
            maxAmb: this.getMaxAmb (1),
            maxAmbHe: maxAmbHe, //for 100% M-Value
            maxAmbN2: maxAmbN2, //for 100% M-Value
            ppHeInspired: ppHeInspired,
            ppN2Inspired: ppN2Inspired,
            ssHe: (ssHe < 0 ? -(100-this.ppHe / ppHeInspired * 100) : this.ppHe / mValueHe*100),
            ssN2: (ssN2 < 0 ? -(100-this.ppN2 / ppN2Inspired * 100) : (this.ppN2) / mValueN2*100),
            ppHe: this.ppHe,
            ppN2: this.ppN2
        })*/
  }

  /**
   * Gets M-Value for given ambient pressure using the Buhlmann equation
   * Pm = Pa/b +a         where: Pm = M-Value pressure,
   *                             Pa = ambinet pressure
   *                             a,b co-efficients
   * Not used for decompression but for display of M-value limit line
   * Note that this does not factor gradient factors.
   *
   * @param p = Pressure, ambient, absolute in msw (fws)
   * @return Maximum tolerated pressure in mws (fws)
   */
  getMvalueAt(p) {
    var aHeN2, bHeN2;
    var pHeN2;

    pHeN2 = this.ppHe + this.ppN2; // Sum partial pressures
    // Calculate adjusted a, b coefficients based on those of He and N2
    aHeN2 = (this.aHe * this.ppHe + this.aN2 * this.ppN2) / pHeN2;
    bHeN2 = (this.bHe * this.ppHe + this.bN2 * this.ppN2) / pHeN2;
    return p / bHeN2 + aHeN2;
  }
  getHeMvalueAt(p) {
    return p / this.bHe + this.aHe;
  }
  getN2MvalueAt(p) {
    return p / this.bN2 + this.aN2;
  }

  /**
   * Gets Tolerated Absolute Pressure for the compartment
   * @param gf = gradient factor, 0.1 to 1.0, typical 0.2 - 0.95
   * @return Maximum tolerated pressure in mws (fws)
   */
  getMaxAmb(gf) {
    var aHeN2, bHeN2;
    var pHeN2;

    pHeN2 = this.ppHe + this.ppN2; // Sum partial pressures
    // Calculate adjusted a, b coefficients based on those of He and N2
    aHeN2 = (this.aHe * this.ppHe + this.aN2 * this.ppN2) / pHeN2;
    bHeN2 = (this.bHe * this.ppHe + this.bN2 * this.ppN2) / pHeN2;
    const res = (pHeN2 - aHeN2 * gf) / (gf / bHeN2 - gf + 1.0);
    return res;
  }

  getHeMaxAmb(gf) {
    return (this.ppHe - this.aHe * gf) / (gf / this.bHe - gf + 1.0);
  }

  getN2MaxAmb(gf) {
    return (this.ppN2 - this.aN2 * gf) / (gf / this.bN2 - gf + 1.0);
  }

  /**
   * Gets M-Value for a compartment, given an ambient pressure
   * @param pAmb Ambient pressure
   * @return M-Value
   */
  getMV(pAmb) {
    var aHeN2, bHeN2;
    var pHeN2;
    pHeN2 = this.ppHe + this.ppN2; // Sum partial pressures
    // Calculate adjusted a, b coefficients based on those of He and N2
    aHeN2 = (this.aHe * this.ppHe + this.aN2 * this.ppN2) / pHeN2;
    bHeN2 = (this.bHe * this.ppHe + this.bN2 * this.ppN2) / pHeN2;

    return pHeN2 / (pAmb / bHeN2 + aHeN2);
  }

  /**
   * Gets M-Value for a helium, given an ambient pressure
   * @param pAmb Ambient pressure
   * @return M-Value
   */
  getHeMV(pAmb) {
    return this.ppHe / (pAmb / this.bHe + this.aHe);
  }
  getN2MV(pAmb) {
    return this.ppN2 / (pAmb / this.bN2 + this.aN2);
  }

  /************************* ACCESSORS AND MUTATORS *****************/
  /* This is required for bean compliance so as to allow serialisation
   * of Compartments to XML
   */

  /**
   * Gets partial pressure of Helium of the compartment in msw (fsw)
   * @return Partial Pressure of Helium in msw (fsw)
   */
  getPpHe() {
    return this.ppHe;
  }
  /**
   * Gets Partial pressure of Nitrogen for the compartment in msw (fsw)
   * @return Partial pressure of Nitrogen in msw (fsw)
   */
  getPpN2() {
    return this.ppN2;
  }
  /**
   * Sets partial pressure of Helium of the compartment in msw (fsw)
   * @param p Partial pressure of Helium in msw (fsw)
   */
  setPpHe(p) {
    if (p < 0) {
      console.log("setPpHe", p);
      p = 0;
    }
    this.ppHe = p;
  }
  /**
   * Sets partial pressure of Nitrogen of the compartment in msw (fsw)
   * @param p Partial pressure of Nitrogen in msw (fsw)
   */
  setPpN2(p) {
    if (p < 0) {
      console.log("setPpN2", p);
      p = 0;
    }
    this.ppN2 = p;
  }
  /**
   * Gets time constant K for Helium
   * @return Time constant K
   */
  getKHe() {
    return this.kHe;
  }
  /**
   * Gets time constant K for Nitrogen
   * @return Gets time constant K for Helium
   */
  getKN2() {
    return this.kN2;
  }
  /**
   * Sets time constant K for Helium
   * @param k Time constant K
   */
  setKHe(k) {
    this.kHe = k;
  }
  /**
   * Sets time constant K for Nitrogen
   * @param k Time constant K
   */
  setKN2(k) {
    this.kN2 = k;
  }
  /**
   * Gets Buhlmann A factor for Helium
   * @return Buhlmann A factor
   */
  getAHe() {
    return this.aHe;
  }
  /**
   * Gets Buhlmann B factor for Helium
   * @return Buhlmann B factor
   */
  getBHe() {
    return this.bHe;
  }
  /**
   * Gets Buhlmann A factor for Nitrogen
   * @return Buhlmann A factor
   */
  getAN2() {
    return this.aN2;
  }
  /**
   * Gets Buhlmann B factor for Nitrogen
   * @return Buhlmann B factor
   */
  getBN2() {
    return this.bN2;
  }
  /**
   * Sets Buhlmann A factor for Helium
   * @param d Buhlmann A factor
   */
  setAHe(d) {
    this.aHe = d;
  }
  /**
   * Sets Buhlmann B factor for Helium
   * @param d Buhlmann B factor
   */
  setBHe(d) {
    this.bHe = d;
  }
  /**
   * Sets Buhlmann A factor for Nitrogen
   * @param d Buhlmann A factor
   */
  setAN2(d) {
    this.aN2 = d;
  }
  /**
   * Sets Buhlmann B factor for Nitrogen
   * @param d Buhlmann B factor
   */
  setBN2(d) {
    this.bN2 = d;
  }
}
