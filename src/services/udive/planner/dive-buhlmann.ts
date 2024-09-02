import {BuhlPref} from "../../../interfaces/udive/planner/buhl-preferences";
import {OxTox} from "../../../interfaces/udive/planner/ox-tox";
import {Gradient} from "../../../interfaces/udive/planner/gradient";
import {Compartment} from "../../../interfaces/udive/planner/compartment";
import {SegmentAbstract} from "../../../interfaces/udive/planner/segment-abstract";
import {SegmentAscDec} from "../../../interfaces/udive/planner/segment-asc-desc";
import {SegmentDive} from "../../../interfaces/udive/planner/segment-dive";
import {SegmentDeco} from "../../../interfaces/udive/planner/segment-deco";
import {Gas} from "../../../interfaces/udive/planner/gas";
import {ppO2Drop} from "./ppO2-drop";
import {DiveTools, DiveToolsService} from "./dive-tools";
//import { ObjectsPipe } from '../../pipes/objects.pipe';
import {orderBy, toInteger} from "lodash";

/*
  MODEL for Buhlmann deco planner
*/

export class DiveBuhlmann {
  /** Return value - ZHL16BModel validated correctly */
  MODEL_VALIDATION_SUCCESS = 0;
  /** Return value - ZHL16BModel failed to validate correctly */
  MODEL_VALIDATION_FAILED = -1;
  /** Indicates metric units used for model - msw */
  METRIC = 0;
  /** Indicates imperial units used for model - fsw */
  IMPERIAL = 1;

  PROCESSING_ERROR = false;

  // Number of compartments
  COMPS = 16;

  //standard preferences
  pref: BuhlPref = new BuhlPref();

  /*
   * Buhl Model letiables
   */
  tissues: Array<Compartment>; // Buhlmann tissues == array of compartments
  gradient: Gradient; // Gradient factor object
  oxTox: OxTox; // Oxygen toxicity model
  unitsString: string; // Metric or imperial units
  modelName: string; // Contains model name

  inputSegments: Array<any>;
  metabolic_o2_consumption: number;
  rmv: number;
  descentppO2: number;
  outputSegmentsGasRuntime: any;
  outputSegments: Array<any>;
  gases: Array<any>;
  runtime: number;
  isRepetitiveDive: boolean;
  currentGas: Gas;
  currentDepth: number;
  ppO2: number;
  inFinalAscent: boolean;
  decotime: number;
  currentGasIndex: number;
  ccr_currentGasIndex: number;
  diveTools: DiveTools = new DiveTools();
  bailout = true;
  diveIndex = 0;

  constructor() {
    this.tissues = [];
    this.unitsString = "Metric";
    this.modelName = "ZHL16B";
    this.setUnits("Metric");

    this.initGradient();
    this.initOxTox();
  }

  setUnits(unit) {
    this.pref.setUnitsTo(unit == "Metric" ? 0 : 1);
  }

  /**
   * AbstractModel.java <br/>
   *
   * Base class for dive models.<br/>
   * Composed of a tissue array of Compartment[]<br/>
   * Has an OxTox and Gradient object <br/>
   * Can throw a ModelStateException propagated from a Compartment if pressures or time is out of bounds.<br/>
   *
   * Model can be initialised from scratch or may be rebuilt from a saved Model via the ModelDAO class. <br/>
   * Models are initialised by initModel() if they are new models, or<br/>
   * validated by validateModel() if they are rebuild from a saved this.<br/>
   *
   * The model is capable of ascending or descending via ascDec() using the ascDec() method of Compartment,<br/>
   * or accounting for a constant depth using the constDepth() method of Compartment.<br/>
   *
   *   @author Guy Wittig
   *   @version 17-Apr-2010
   */

  /**
   * Initialises the model's gradient factor object
   */
  initGradient() {
    this.gradient = new Gradient(this.pref.getGfLow(), this.pref.getGfHigh()); // Default Gradient factors
  }

  /**
   * Initialise OxTox model
   */
  initOxTox() {
    this.oxTox = new OxTox();
  }

  /****************** Accessor and mutator bean methods ****************/
  /**
   * Gets Gradient object for this model
   * @return return Gradient object
   */
  getGradient() {
    return this.gradient;
  }
  /**
   * Sets Gradient object for this model
   * @param g Gradient object
   */
  setGradient(g) {
    this.gradient = g;
  }
  /**
   * Gets OxTox object for this model
   * @return OxTox object
   */
  getOxTox() {
    return this.oxTox;
  }
  /**
   * Sets OxTox object for this model
   * @param o OxTox Object
   */
  setOxTox(o) {
    this.oxTox = o;
  }
  /**
   * Gets tissues as Array of Compartment[] for this model
   * @return tissues - Array of Compartment[]
   */
  getTissues() {
    return this.tissues;
  }
  /**
   * Sets tissues array of Compartment[]
   * @param t Tissue array of Compartment
   */
  setTissues(t) {
    this.tissues = t;
  }

  /**
   * AbstractZHL16Model.java <br/>
   *
   * Represents a Buhlmann this.<br/>
   * Composed of a tissue array of Compartment[]<br/>
   * Has an OxTox and Gradient object <br/>
   * Can throw a ModelStateException propagated from a Compartment if pressures or time is out of bounds.<br/>
   *
   * ZHL16CModel can be initialised from scratch or may be rebuilt from a saved ZHL16BModel via the ModelDAO class. <br/>
   * Models are initialised by initModel() if they are new models, or<br/>
   * validated by validateModel() if they are rebuild from a saved this.<br/>
   *
   * The model is capable of ascending or descending via ascDec() using the ascDec() method of Compartment,<br/>
   * or accounting for a constant depth using the constDepth() method of Compartment.<br/>
   *
   *   @author Guy Wittig
   *   @version 17-Apr-2010
   */
  setModel(modelName, oc) {
    this.modelName = modelName;

    /**
     * Constructor for objects of class ZHL16BModel
     */
    let c; // counter

    this.gradient = new Gradient(this.pref.getGfLow(), this.pref.getGfHigh());
    this.oxTox = new OxTox();

    //pAmb = surface pressure msw absolute

    for (c = 0; c < this.COMPS; c++) {
      // create and initialise compartments
      // oc mode is the first to run, when CCR mode there is no need to re-create all compartments
      if (oc)
        this.tissues[c] = new Compartment(this.pref, this.getAmbientPress());
      this.tissues[c].setPpHe(0.0); // Set initial ppHe = 0.0
      this.tissues[c].setPpN2(
        0.79 * (this.getAmbientPress() - this.pref.getPH2O())
      ); // Set ppN2 = Ambient - ppH2O
    }
    this.setTimeConstants();
  }

  /**
   * Determine the controlling compartment at ceiling (1-16)
   * @return Controlling compartment (1-16)
   */
  controlCompartment() {
    let c;
    let control = 0;
    let depth = 0.0;
    let p = 0.0;

    for (c = 0; c < this.COMPS; c++) {
      p =
        this.tissues[c].getMaxAmb(this.gradient.getGradientFactor()) -
        this.getAmbientPress(); // Get compartment max pressure
      if (p > depth) {
        control = c;
        depth = p;
      }
    }
    return control + 1;
  }

  /**
   * Determine the current ceiling depth
   *  @return Ceiling depth msw (fsw)
   */
  ceiling() {
    let c;
    let depth = 0.0; // depth in msw
    let p = 0.0; // compartment pressure in msw

    for (c = 0; c < this.COMPS; c++) {
      // For all compartments ...
      // Get compartment tolerated ambient pressure and convert from absolute pressure to depth
      p =
        this.tissues[c].getMaxAmb(this.gradient.getGradientFactor()) -
        this.getAmbientPress();
      // Save max depth
      if (p > depth) depth = p;
    }

    return depth;
  }

  /**
   * Determine the maximum M-Value for a given depth
   * @return Maximum M-Value
   * @param depth Depth in msw (fsw)
   */
  mValue(depth) {
    let c;
    let pAbsolute = depth + this.getAmbientPress(); // derive ambient pressure for the given depth
    let compartmentMV = 0.0;
    let maxMV = 0.0;

    for (c = 0; c < this.COMPS; c++) {
      compartmentMV = this.tissues[c].getMV(pAbsolute);
      if (compartmentMV > maxMV) maxMV = compartmentMV;
    }
    return maxMV;
  }

  /**
   * Constant depth profile. Calls Compartment.constDepth for each compartment to update the this.
   * @param depth Depth of segment in metres
   * @param segTime Time of segment in minutes
   * @param fHe Fraction of inert gas Helium in inspired gas mix
   * @param fN2 Fraction of inert gas Nitrogen in inspired gas mix
   * @param pO2 For CCR mode, partial pressure of oxygen in bar. If == 0.0, then open circuit
   * @throws mvplan.this.ModelStateException Propagates ModelStateException
   */
  constDepth(depth, segTime, fHe, fN2, pO2, stage) {
    let ppHeInspired; // inspired gas pp
    let ppN2Inspired;
    let ppO2Inspired;
    let pInert; // Total inert gas pressure (msw)
    let pAmb = depth + this.getAmbientPress(); // Total ambient pressure
    let c;
    // Set inspired gas fractions.
    if (pO2 > 0.0) {
      // Rebreather mode
      // Determine pInert by subtracting absolute oxygen pressure (msw) and pH20 (msw)
      // Note that if fHe and fN2 == 0.0 then need to force pp's to zero

      if (fHe + fN2 > 0.0)
        pInert = pAmb - this.pref.getPH2O() - pO2 * this.pref.getPConversion();
      else pInert = 0.0;

      // Verify that pInert is positive. If the setpoint is close to or less than the depth
      // then there is no inert gas.
      if (pInert > 0.0) {
        ppHeInspired = (pInert * fHe) / (fHe + fN2);
        ppN2Inspired = (pInert * fN2) / (fHe + fN2);
      } else {
        ppHeInspired = 0.0;
        ppN2Inspired = 0.0;
      }
      // Update OxTox model - pO2 in atm NOT msw
      ppO2Inspired = pO2 * this.pref.getPConversion(); // Determine ppO2Inspired in msw
      // Check that ppO2Inspired is not greater than the depth. This occurs in shallow deco when the
      // setpoint specified is > depth in msw.
      if (ppO2Inspired <= depth + this.getAmbientPress() && pInert > 0.0)
        // pO2 is as per the setpoint
        this.oxTox.addO2(segTime, pO2);
      // pO2 is equal to the depth in atm. Also true if there is no inert gas in the gas
      else
        this.oxTox.addO2(
          segTime,
          (pAmb - this.pref.getPH2O()) / this.pref.getPConversion()
        );
    } else {
      //OC or pSCR modes
      ppHeInspired = (pAmb - this.pref.getPH2O()) * fHe; //set in msw/fsw - to obtain ATA -> /this.pref.getPConversion()
      ppN2Inspired = (pAmb - this.pref.getPH2O()) * fN2;
      ppO2Inspired = (pAmb - this.pref.getPH2O()) * (1.0 - fHe - fN2);
      // Update OxTox model - pO2 in atm NOT msw
      if (depth == 0.0) {
        // Surface
        this.oxTox.removeO2(segTime);
      } else {
        this.oxTox.addO2(segTime, ppO2Inspired / this.pref.getPConversion());
      }
    }

    // public void constDepth(double ppHeInspired, double ppN2Inspired, double segTime)
    if (segTime > 0) {
      for (c = 0; c < this.COMPS; c++) {
        this.tissues[c].constDepth(
          ppHeInspired,
          ppN2Inspired,
          segTime,
          depth,
          stage,
          1.0 - fHe - fN2,
          fHe,
          this.bailout,
          ppO2Inspired / this.pref.getPConversion(),
          this.diveIndex
        );
      }
    }
    /*console.log(
      "-->CONST: press " +
        (pAmb - this.getAmbientPress()) +
        ", t:" +
        segTime +
        " fHe:" +
        fHe +
        " fN2:" +
        fN2 +
        " ppO2:" +
        pO2 +
        " ppHei:" +
        ppHeInspired +
        " ppN2i:" +
        ppN2Inspired
    );*/
  }

  /**
   * Ascend/Descend in profile. Calls this.ascDec to update compartments
   * @param start - Start depth of segment in metres
   * @param finish - Finish depth of segment in metres
   * @param rate - Rate of ascent (-ve) or descent (+ve) in m/min
   * @param fHe Fraction of inert gas Helium in inspired gas mix
   * @param fN2 Fraction of inert gas Nitrogen in inspired gas mix
   * @param pO2 For CCR mode, partial pressure of oxygen in bar. If == 0.0, then open circuit
   * @throws mvplan.this.ModelStateException Propogates ModelStateException
   */
  ascDec(start, finish, rate, fHe, fN2, pO2) {
    let c;
    let ppHeInspired; // Initial inspired gas pp
    let ppN2Inspired;
    //let ppO2Inspired;
    let pO2InspiredAverage; // For oxtox calculations
    let segTime = Math.abs((finish - start) / rate); // derive segment time (mins)
    let rateHe; // Rate of change for each inert gas (msw/min)
    let rateN2;
    let pAmbStart = start + this.getAmbientPress(); // Starting ambient pressure
    let pAmbFinish = finish + this.getAmbientPress();
    let pInertStart, pInertFinish; //

    if (segTime > 0) {
      // Set inspired gas fractions.
      if (pO2 > 0.0) {
        // Rebreather mode
        // Calculate inert gas partial pressure (msw) == pAmb - pO2 - pH2O
        pInertStart =
          pAmbStart - pO2 * this.pref.getPConversion() - this.pref.getPH2O();

        pInertFinish =
          pAmbFinish - pO2 * this.pref.getPConversion() - this.pref.getPH2O();
        // Check that it doesn't go less than zero. Could be due to shallow deco or starting on high setpoint
        if (pInertStart < 0.0) pInertStart = 0;
        if (pInertFinish < 0.0) pInertFinish = 0.0;

        // Separate into He and N2 components, checking that we are not on pure O2 (or we get an arithmetic error)
        if (fHe + fN2 > 0.0) {
          ppHeInspired = (pInertStart * fHe) / (fHe + fN2);
          ppN2Inspired = (pInertStart * fN2) / (fHe + fN2);
          // Calculate rate of change of each inert gas
          rateHe =
            ((pInertFinish * fHe) / (fHe + fN2) - ppHeInspired) / segTime;
          rateN2 =
            ((pInertFinish * fN2) / (fHe + fN2) - ppN2Inspired) / segTime;
        } else {
          ppHeInspired = 0.0;
          ppN2Inspired = 0.0;
          rateHe = 0.0;
          rateN2 = 0.0;
        }

        // Update OxTox model, constant ppO2
        // TODO - what if depth is less than pO2 in msw ?
        this.oxTox.addO2(segTime, pO2);
      } else {
        // Open circuit mode or pSCR (no difference considered for ascent/descent)
        // Calculate He and N2 components
        ppHeInspired = (pAmbStart - this.pref.getPH2O()) * fHe;
        ppN2Inspired = (pAmbStart - this.pref.getPH2O()) * fN2;
        // Calculate rate of change of each inert gas
        rateHe = rate * fHe;
        rateN2 = rate * fN2;
        // Update OxTox model, use average ppO2
        pO2InspiredAverage =
          (((pAmbStart - pAmbFinish) / 2 + pAmbFinish - this.pref.getPH2O()) *
            (1.0 - fHe - fN2)) /
          this.pref.getPConversion();
        this.oxTox.addO2(segTime, pO2InspiredAverage);
        pO2 = pO2InspiredAverage;
      }
      for (c = 0; c < this.COMPS; c++) {
        this.tissues[c].ascDec(
          ppHeInspired,
          ppN2Inspired,
          rateHe,
          rateN2,
          segTime,
          start,
          finish,
          this.bailout,
          pO2,
          this.diveIndex
        );
      }
      /*console.log(
        "--> " +
          (start < finish ? "DESC" : "ASC") +
          " (to): press " +
          (pAmbFinish - 10) +
          "m, fHe:" +
          fHe +
          " fN2:" +
          fN2 +
          " ppO2:" +
          pO2 +
          " time:" +
          segTime
      );*/
    }
  }

  setTimeConstants(tissues?) {
    if (!tissues) tissues = this.tissues;
    let half_time_vars = [
      [1.88, 5.0, 16.189, 0.477, 11.696, 0.5578],
      [3.02, 8.0, 13.83, 0.5747, 10.0, 0.6514],
      [4.72, 12.5, 11.919, 0.6527, 8.618, 0.7222],
      [6.99, 18.5, 10.458, 0.7223, 7.562, 0.7825],
      [10.21, 27.0, 9.22, 0.7582, 6.2, 0.8126],
      [14.48, 38.3, 8.205, 0.7957, 5.043, 0.8434],
      [20.53, 54.3, 7.305, 0.8279, 4.41, 0.8693],
      [29.11, 77.0, 6.502, 0.8553, 4.0, 0.891],
      [41.2, 109.0, 5.95, 0.8757, 3.75, 0.9092],
      [55.19, 146.0, 5.545, 0.8903, 3.5, 0.9222],
      [70.69, 187.0, 5.333, 0.8997, 3.295, 0.9319],
      [90.34, 239.0, 5.189, 0.9073, 3.065, 0.9403],
      [115.29, 305.0, 5.181, 0.9122, 2.835, 0.9477],
      [147.42, 390.0, 5.176, 0.9171, 2.61, 0.9544],
      [188.24, 498.0, 5.172, 0.9217, 2.48, 0.9602],
      [240.03, 635.0, 5.119, 0.9267, 2.327, 0.9653],
    ];

    let helium_half_time_var_a = [];
    let helium_half_time_var_b = [];
    let helium_half_time_var_h = [];
    let nitrogen_half_time_var_a = [];
    let nitrogen_half_time_var_b = [];
    let nitrogen_half_time_var_h = [];
    const divisore = 10.1; // 10.1 originale
    for (let i = 0; i < 16; i++) {
      if (this.pref.helium_half_time_multiplier >= 0) {
        helium_half_time_var_h[i] =
          ((half_time_vars[i][1] - half_time_vars[i][0]) / divisore) *
          this.pref.helium_half_time_multiplier;
        helium_half_time_var_a[i] =
          ((half_time_vars[i][4] - half_time_vars[i][2]) / divisore) *
          this.pref.helium_half_time_multiplier;
        helium_half_time_var_b[i] =
          ((half_time_vars[i][5] - half_time_vars[i][3]) / divisore) *
          this.pref.helium_half_time_multiplier;
        nitrogen_half_time_var_a[i] = 0;
        nitrogen_half_time_var_b[i] = 0;
        nitrogen_half_time_var_h[i] = 0;
      } else {
        nitrogen_half_time_var_h[i] =
          ((half_time_vars[i][1] - half_time_vars[i][0]) / divisore) *
          this.pref.helium_half_time_multiplier; // 0 = original - 10 = He == N2
        nitrogen_half_time_var_a[i] =
          ((half_time_vars[i][4] - half_time_vars[i][2]) / divisore) *
          this.pref.helium_half_time_multiplier;
        nitrogen_half_time_var_b[i] =
          ((half_time_vars[i][5] - half_time_vars[i][3]) / divisore) *
          this.pref.helium_half_time_multiplier;
        helium_half_time_var_h[i] = 0;
        helium_half_time_var_a[i] = 0;
        helium_half_time_var_b[i] = 0;
      }
    }

    if (this.modelName == "ZHL16C") {
      // public Compartment(double hHe,double hN2,double aHe,double bHe,double aN2,double bN2)
      // This is for Buhlmann ZHL-16C with the 1b halftimes
      // a = intercept at zero ambient pressure
      // b = reciprocal of slope of m-value line
      // public Compartment                        (index,   hHe,                         		hN2,       								aHe,    							bHe,    					aN2,    								bN2
      tissues[0].setCompartmentTimeConstants(
        0,
        1.88 + helium_half_time_var_h[0],
        5.0 + nitrogen_half_time_var_h[0],
        16.189 + helium_half_time_var_a[0],
        0.477 + helium_half_time_var_b[0],
        11.696 + nitrogen_half_time_var_a[0],
        0.5578 + nitrogen_half_time_var_b[0]
      );
      tissues[1].setCompartmentTimeConstants(
        1,
        3.02 + helium_half_time_var_h[1],
        8.0 + nitrogen_half_time_var_h[1],
        13.83 + helium_half_time_var_a[1],
        0.5747 + helium_half_time_var_b[1],
        10.0 + nitrogen_half_time_var_a[1],
        0.6514 + nitrogen_half_time_var_b[1]
      );
      tissues[2].setCompartmentTimeConstants(
        2,
        4.72 + helium_half_time_var_h[2],
        12.5 + nitrogen_half_time_var_h[2],
        11.919 + helium_half_time_var_a[2],
        0.6527 + helium_half_time_var_b[2],
        8.618 + nitrogen_half_time_var_a[2],
        0.7222 + nitrogen_half_time_var_b[2]
      );
      tissues[3].setCompartmentTimeConstants(
        3,
        6.99 + helium_half_time_var_h[3],
        18.5 + nitrogen_half_time_var_h[3],
        10.458 + helium_half_time_var_a[3],
        0.7223 + helium_half_time_var_b[3],
        7.562 + nitrogen_half_time_var_a[3],
        0.7825 + nitrogen_half_time_var_b[3]
      );
      tissues[4].setCompartmentTimeConstants(
        4,
        10.21 + helium_half_time_var_h[4],
        27.0 + nitrogen_half_time_var_h[4],
        9.22 + helium_half_time_var_a[4],
        0.7582 + helium_half_time_var_b[4],
        6.2 + nitrogen_half_time_var_a[4],
        0.8126 + nitrogen_half_time_var_b[4]
      );
      tissues[5].setCompartmentTimeConstants(
        5,
        14.48 + helium_half_time_var_h[5],
        38.3 + nitrogen_half_time_var_h[5],
        8.205 + helium_half_time_var_a[5],
        0.7957 + helium_half_time_var_b[5],
        5.043 + nitrogen_half_time_var_a[5],
        0.8434 + nitrogen_half_time_var_b[5]
      );
      tissues[6].setCompartmentTimeConstants(
        6,
        20.53 + helium_half_time_var_h[6],
        54.3 + nitrogen_half_time_var_h[6],
        7.305 + helium_half_time_var_a[6],
        0.8279 + helium_half_time_var_b[6],
        4.41 + nitrogen_half_time_var_a[6],
        0.8693 + nitrogen_half_time_var_b[6]
      );
      tissues[7].setCompartmentTimeConstants(
        7,
        29.11 + helium_half_time_var_h[7],
        77.0 + nitrogen_half_time_var_h[7],
        6.502 + helium_half_time_var_a[7],
        0.8553 + helium_half_time_var_b[7],
        4.0 + nitrogen_half_time_var_a[7],
        0.891 + nitrogen_half_time_var_b[7]
      );
      tissues[8].setCompartmentTimeConstants(
        8,
        41.2 + helium_half_time_var_h[8],
        109.0 + nitrogen_half_time_var_h[8],
        5.95 + helium_half_time_var_a[8],
        0.8757 + helium_half_time_var_b[8],
        3.75 + nitrogen_half_time_var_a[8],
        0.9092 + nitrogen_half_time_var_b[8]
      );
      tissues[9].setCompartmentTimeConstants(
        9,
        55.19 + helium_half_time_var_h[9],
        146.0 + nitrogen_half_time_var_h[9],
        5.545 + helium_half_time_var_a[9],
        0.8903 + helium_half_time_var_b[9],
        3.5 + nitrogen_half_time_var_a[9],
        0.9222 + nitrogen_half_time_var_b[9]
      );
      tissues[10].setCompartmentTimeConstants(
        10,
        70.69 + helium_half_time_var_h[10],
        187.0 + nitrogen_half_time_var_h[10],
        5.333 + helium_half_time_var_a[10],
        0.8997 + helium_half_time_var_b[10],
        3.295 + nitrogen_half_time_var_a[10],
        0.9319 + nitrogen_half_time_var_b[10]
      );
      tissues[11].setCompartmentTimeConstants(
        11,
        90.34 + helium_half_time_var_h[11],
        239.0 + nitrogen_half_time_var_h[11],
        5.189 + helium_half_time_var_a[11],
        0.9073 + helium_half_time_var_b[11],
        3.065 + nitrogen_half_time_var_a[11],
        0.9403 + nitrogen_half_time_var_b[11]
      );
      tissues[12].setCompartmentTimeConstants(
        12,
        115.29 + helium_half_time_var_h[12],
        305.0 + nitrogen_half_time_var_h[12],
        5.181 + helium_half_time_var_a[12],
        0.9122 + helium_half_time_var_b[12],
        2.835 + nitrogen_half_time_var_a[12],
        0.9477 + nitrogen_half_time_var_b[12]
      );
      tissues[13].setCompartmentTimeConstants(
        13,
        147.42 + helium_half_time_var_h[13],
        390.0 + nitrogen_half_time_var_h[13],
        5.176 + helium_half_time_var_a[13],
        0.9171 + helium_half_time_var_b[13],
        2.61 + nitrogen_half_time_var_a[13],
        0.9544 + nitrogen_half_time_var_b[13]
      );
      tissues[14].setCompartmentTimeConstants(
        14,
        188.24 + helium_half_time_var_h[14],
        498.0 + nitrogen_half_time_var_h[14],
        5.172 + helium_half_time_var_a[14],
        0.9217 + helium_half_time_var_b[14],
        2.48 + nitrogen_half_time_var_a[14],
        0.9602 + nitrogen_half_time_var_b[14]
      );
      tissues[15].setCompartmentTimeConstants(
        15,
        240.03 + helium_half_time_var_h[15],
        635.0 + nitrogen_half_time_var_h[15],
        5.119 + helium_half_time_var_a[15],
        0.9267 + helium_half_time_var_b[15],
        2.327 + nitrogen_half_time_var_a[15],
        0.9653 + nitrogen_half_time_var_b[15]
      );
    } else if (this.modelName == "ZHL16B") {
      tissues[0].setCompartmentTimeConstants(
        0,
        1.88 + helium_half_time_var_h[0],
        5.0 + nitrogen_half_time_var_h[0],
        16.189 + helium_half_time_var_a[0],
        0.477 + helium_half_time_var_b[0],
        11.696 + nitrogen_half_time_var_a[0],
        0.5578 + nitrogen_half_time_var_b[0]
      );
      tissues[1].setCompartmentTimeConstants(
        1,
        3.02 + helium_half_time_var_h[1],
        8.0 + nitrogen_half_time_var_h[1],
        13.83 + helium_half_time_var_a[1],
        0.5747 + helium_half_time_var_b[1],
        10.0 + nitrogen_half_time_var_a[1],
        0.6514 + nitrogen_half_time_var_b[1]
      );
      tissues[2].setCompartmentTimeConstants(
        2,
        4.72 + helium_half_time_var_h[2],
        12.5 + nitrogen_half_time_var_h[2],
        11.919 + helium_half_time_var_a[2],
        0.6527 + helium_half_time_var_b[2],
        8.618 + nitrogen_half_time_var_a[2],
        0.7222 + nitrogen_half_time_var_b[2]
      );
      tissues[3].setCompartmentTimeConstants(
        3,
        6.99 + helium_half_time_var_h[3],
        18.5 + nitrogen_half_time_var_h[3],
        10.458 + helium_half_time_var_a[3],
        0.7223 + helium_half_time_var_b[3],
        7.562 + nitrogen_half_time_var_a[3],
        0.7825 + nitrogen_half_time_var_b[3]
      );
      tissues[4].setCompartmentTimeConstants(
        4,
        10.21 + helium_half_time_var_h[4],
        27.0 + nitrogen_half_time_var_h[4],
        9.22 + helium_half_time_var_a[4],
        0.7582 + helium_half_time_var_b[4],
        6.667 + nitrogen_half_time_var_a[4],
        0.8126 + nitrogen_half_time_var_b[4]
      );
      tissues[5].setCompartmentTimeConstants(
        5,
        14.48 + helium_half_time_var_h[5],
        38.3 + nitrogen_half_time_var_h[5],
        8.205 + helium_half_time_var_a[5],
        0.7957 + helium_half_time_var_b[5],
        5.6 + nitrogen_half_time_var_a[5],
        0.8434 + nitrogen_half_time_var_b[5]
      );
      tissues[6].setCompartmentTimeConstants(
        6,
        20.53 + helium_half_time_var_h[6],
        54.3 + nitrogen_half_time_var_h[6],
        7.305 + helium_half_time_var_a[6],
        0.8279 + helium_half_time_var_b[6],
        4.947 + nitrogen_half_time_var_a[6],
        0.8693 + nitrogen_half_time_var_b[6]
      );
      tissues[7].setCompartmentTimeConstants(
        7,
        29.11 + helium_half_time_var_h[7],
        77.0 + nitrogen_half_time_var_h[7],
        6.502 + helium_half_time_var_a[7],
        0.8553 + helium_half_time_var_b[7],
        4.5 + nitrogen_half_time_var_a[7],
        0.891 + nitrogen_half_time_var_b[7]
      );
      tissues[8].setCompartmentTimeConstants(
        8,
        41.2 + helium_half_time_var_h[8],
        109.0 + nitrogen_half_time_var_h[8],
        5.95 + helium_half_time_var_a[8],
        0.8757 + helium_half_time_var_b[8],
        4.187 + nitrogen_half_time_var_a[8],
        0.9092 + nitrogen_half_time_var_b[8]
      );
      tissues[9].setCompartmentTimeConstants(
        9,
        55.19 + helium_half_time_var_h[9],
        146.0 + nitrogen_half_time_var_h[9],
        5.545 + helium_half_time_var_a[9],
        0.8903 + helium_half_time_var_b[9],
        3.798 + nitrogen_half_time_var_a[9],
        0.9222 + nitrogen_half_time_var_b[9]
      );
      tissues[10].setCompartmentTimeConstants(
        10,
        70.69 + helium_half_time_var_h[10],
        187.0 + nitrogen_half_time_var_h[10],
        5.333 + helium_half_time_var_a[10],
        0.8997 + helium_half_time_var_b[10],
        3.497 + nitrogen_half_time_var_a[10],
        0.9319 + nitrogen_half_time_var_b[10]
      );
      tissues[11].setCompartmentTimeConstants(
        11,
        90.34 + helium_half_time_var_h[11],
        239.0 + nitrogen_half_time_var_h[11],
        5.189 + helium_half_time_var_a[11],
        0.9073 + helium_half_time_var_b[11],
        3.223 + nitrogen_half_time_var_a[11],
        0.9403 + nitrogen_half_time_var_b[11]
      );
      tissues[12].setCompartmentTimeConstants(
        12,
        115.29 + helium_half_time_var_h[12],
        305.0 + nitrogen_half_time_var_h[12],
        5.181 + helium_half_time_var_a[12],
        0.9122 + helium_half_time_var_b[12],
        2.85 + nitrogen_half_time_var_a[12],
        0.9477 + nitrogen_half_time_var_b[12]
      );
      tissues[13].setCompartmentTimeConstants(
        13,
        147.42 + helium_half_time_var_h[13],
        390.0 + nitrogen_half_time_var_h[13],
        5.176 + helium_half_time_var_a[13],
        0.9171 + helium_half_time_var_b[13],
        2.737 + nitrogen_half_time_var_a[13],
        0.9544 + nitrogen_half_time_var_b[13]
      );
      tissues[14].setCompartmentTimeConstants(
        14,
        188.24 + helium_half_time_var_h[14],
        498.0 + nitrogen_half_time_var_h[14],
        5.172 + helium_half_time_var_a[14],
        0.9217 + helium_half_time_var_b[14],
        2.523 + nitrogen_half_time_var_a[14],
        0.9602 + nitrogen_half_time_var_b[14]
      );
      tissues[15].setCompartmentTimeConstants(
        15,
        240.03 + helium_half_time_var_h[15],
        635.0 + nitrogen_half_time_var_h[15],
        5.119 + helium_half_time_var_a[15],
        0.9267 + helium_half_time_var_b[15],
        2.327 + nitrogen_half_time_var_a[15],
        0.9653 + nitrogen_half_time_var_b[15]
      );
    }
    return tissues;
  }

  getAmbientPress() {
    /* Local letiables */
    let altitude_meters,
      molecular_weight_of_air,
      acceleration_of_operation,
      altitude_kilometers,
      //altitude_feet,
      temp_gradient,
      temp_at_sea_level,
      geopotential_altitude,
      gmr_factor,
      pressure_at_sea_level_fsw,
      pressure_at_sea_level_msw,
      temp_at_geopotential_altitude,
      gas_constant_r,
      radius_of_earth;
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    radius_of_earth = 6369; /* ki */
    acceleration_of_operation = 9.80665; /* meters/ */
    molecular_weight_of_air = 28.9644;
    gas_constant_r = 8.31432; /* Joules/mol*de */
    temp_at_sea_level = 288.15; /* degree */
    pressure_at_sea_level_fsw = 33; /* at sea level (Standard Atm */
    /* feet of seawater based on 1 */
    pressure_at_sea_level_msw = 10.1325; /* at sea level (European */
    /* meters of seawater based on 1 */
    temp_gradient = -6.5; /* change in geopotential a */
    /* valid for first layer of at */
    /* up to 11 kilometers or 36, */
    /* Change in Temp deg Kel */
    gmr_factor =
      (acceleration_of_operation * molecular_weight_of_air) / gas_constant_r;
    altitude_meters = this.pref.getAltitudeInMsw();
    altitude_kilometers = altitude_meters / 1e3;
    geopotential_altitude =
      (altitude_kilometers * radius_of_earth) /
      (altitude_kilometers + radius_of_earth);
    temp_at_geopotential_altitude =
      temp_at_sea_level + temp_gradient * geopotential_altitude;
    const ambPressInMsw =
      pressure_at_sea_level_msw *
      Math.exp(
        (Math.log(temp_at_sea_level / temp_at_geopotential_altitude) *
          gmr_factor) /
          temp_gradient
      );
    const ambPressInFsw =
      pressure_at_sea_level_fsw *
      Math.exp(
        (Math.log(temp_at_sea_level / temp_at_geopotential_altitude) *
          gmr_factor) /
          temp_gradient
      );
    return DiveToolsService.isImperial() ? ambPressInFsw : ambPressInMsw;
  }

  /*
   * Surface Interval
   * Conducts a surface interval by performing a constant depth calculation on air at zero meters.
   *
   */
  doSurfaceInterval(time) {
    this.constDepth(0.0, time, 0.0, 0.79, 0.0, "surface"); // Do constant depth of zero on air
    // Note that pAmb is applied in the model so changes in altitude will be handled
    return true;
  }

  calc_inspired_gas(
    depth,
    fraction_helium,
    fraction_nitrogen,
    fraction_pO2SetPoint,
    useAsDiluent,
    segTime
  ) {
    //ambient_pressure: in mt or ft - corresponds to the absolute pressure of the specified depth (i.e.: 10mt - ambient_pressure = 20mt)
    /* from BUHLMANN: if ((fHe+fN2)>0.0)
                                pInert = pAmb - pO2*this.pref.getPConversion()-this.pref.getPH2O();
                            else
                                pInert=0.0; */
    // BAILOUT if fraction_pO2SetPoint == 0
    if (!fraction_helium || isNaN(fraction_helium)) fraction_helium = 0;
    if (!fraction_nitrogen || isNaN(fraction_nitrogen)) fraction_nitrogen = 0;
    let fraction_oxygen = 1.0 - fraction_helium - fraction_nitrogen;
    let depthInMsw =
      this.pref.units == 0 ? depth : DiveToolsService.feetToMeters(depth);
    if (this.pref.configuration == "CCR" && fraction_pO2SetPoint != 0) {
      let diluent_gas = useAsDiluent
        ? new Gas(1 - fraction_helium - fraction_nitrogen, fraction_helium)
        : this.inputSegments[0].getGas();
      let diluent_inert_fraction = diluent_gas.getFHe() + diluent_gas.getFN2();
      let inert_fraction_helium = diluent_gas.getFHe() / diluent_inert_fraction;
      let inert_fraction_nitrogen =
        diluent_gas.getFN2() / diluent_inert_fraction;
      fraction_oxygen =
        fraction_pO2SetPoint /
        ((depthInMsw + this.pref.getPConversioninMsw()) /
          this.pref.getPConversioninMsw());
      let fInert = 1 - fraction_oxygen;
      let fHe = fInert * inert_fraction_helium;
      let fN2 = fInert * inert_fraction_nitrogen;
      if (fraction_oxygen > 1) {
        //not possible - pure oxygen
        fraction_oxygen = 1;
        fraction_helium = 0;
        fraction_nitrogen = 0;
      } else {
        fraction_helium = fHe;
        fraction_nitrogen = fN2;
      }
    } else if (this.pref.configuration == "pSCR" && !this.pref.getOcDeco()) {
      //pSCR mode
      //console.log("PSCR");
      if (fraction_oxygen < 1 && segTime > 0) {
        //excluding oxygen - calculate real gas
        let ppO2_drop = new ppO2Drop(this.rmv, this.metabolic_o2_consumption);
        let gas_runtime =
          (this.outputSegmentsGasRuntime[
            fraction_helium + "/" + fraction_nitrogen
          ]
            ? this.outputSegmentsGasRuntime[
                fraction_helium + "/" + fraction_nitrogen
              ]
            : 0) + segTime;
        let ppO2Avg = ppO2_drop.PFavg(
          depth,
          gas_runtime,
          fraction_oxygen * 100
        ); //in ata

        let fO2 =
          ppO2Avg /
          ((depthInMsw + this.pref.getPConversioninMsw()) /
            this.pref.getPConversioninMsw());

        let fInert = 1 - fO2;
        let inert_fraction_helium =
          fraction_helium / (fraction_helium + fraction_nitrogen);
        let inert_fraction_nitrogen =
          fraction_nitrogen / (fraction_helium + fraction_nitrogen);
        let fHe = fInert * inert_fraction_helium;
        let fN2 = fInert * inert_fraction_nitrogen;

        fraction_helium = fHe;
        fraction_nitrogen = fN2;
        fraction_oxygen = fO2;
      } else {
        fraction_oxygen = 1;
        fraction_helium = 0;
        fraction_nitrogen = 0;
      }
    } else {
      //console.log("OC");
    }

    let gas = new Gas(
      fraction_oxygen,
      fraction_helium,
      parseInt(depth),
      fraction_pO2SetPoint
    );
    return gas;
  }

  addInspiredGasRuntime(fHe, fN2, time) {
    if (!this.outputSegmentsGasRuntime[fHe + "/" + fN2])
      this.outputSegmentsGasRuntime[fHe + "/" + fN2] = 0;
    this.outputSegmentsGasRuntime[fHe + "/" + fN2] += time;
  }

  /** Process the dive */
  doDive(params, knownSegments, knownGases, repetitive, bailout, diveIndex) {
    this.diveIndex = diveIndex;
    this.bailout = bailout;
    if (!params.metric) {
      this.pref.setUnitsTo(this.pref.IMPERIAL);
    } else {
      this.pref.setUnitsTo(this.pref.METRIC);
    }
    this.pref.setHelium_half_time_multiplier(
      params.helium_half_time_multiplier
    );
    this.pref.bottomppO2 = params.bottomppO2;
    this.pref.decoppO2 = params.decoppO2;
    this.pref.oxygenppO2 = params.oxygenppO2;
    this.pref.setAltitude(toInteger(params.altitude_of_dive)); //msw
    this.pref.setGfLow(parseInt(params.gfLow) / 100);
    this.pref.setGfHigh(parseInt(params.gfHigh) / 100);
    this.pref.setGfLow_bailout(parseInt(params.gfLow_bailout) / 100);
    this.pref.setGfHigh_bailout(parseInt(params.gfHigh_bailout) / 100);
    let lastStopDepth = params.lastStop6m20ft
      ? params.metric
        ? 6
        : 20
      : params.metric
        ? 3
        : 10;
    this.pref.setLastStopDepth(lastStopDepth);
    this.pref.setStopDepthIncrement(params.decoStepSize);
    this.pref.setAscentRate(params.ascentRate);
    this.pref.setDescentRate(params.descentRate);
    this.pref.setConfiguration(params.configuration);
    this.pref.setOcDeco(params.configuration != "OC" ? false : true);
    this.pref.setBailout(bailout ? true : false);
    this.metabolic_o2_consumption = params.metabolic_o2_consumption;
    this.rmv = params.rmvBottom;
    this.descentppO2 = params.descentppO2;

    // Is this a new model or a repetative dive ?
    if (repetitive === false) {
      // Initialise new this.
      this.isRepetitiveDive = false;
      //console.log("Loading model class:" + this.modelName, bailout);
      this.setModel(params.buhlModel, bailout);
    } else {
      // ZHL16B exists
      // TODO - Resources
      this.isRepetitiveDive = true;
      // Reset the Gradient Factors
      this.initGradient();
      //console.log("Loading repetitive:", this);
    }

    this.inputSegments = [];
    this.outputSegments = [];
    this.outputSegmentsGasRuntime = {};
    this.gases = [];
    this.runtime = 0;

    // Construct list of dive segments from known segments
    knownSegments.forEach((segment) => {
      //insert all profile points
      let s = new SegmentAbstract({}, this.pref);
      s.setDepth(parseFloat(segment.depth));
      s.setTime(parseFloat(segment.time));
      let gas = segment.gas; //new Gas(parseInt(segment.fO2)/100,parseInt(segment.fHe)/100,parseInt(segment.depth))
      s.setGas(gas);
      //reset setpoint if no CCR
      s.setSetpoint(
        segment.setpoint && params.configuration == "CCR"
          ? parseFloat(segment.setpoint)
          : 0.0
      );
      s.setEnable(true);
      this.inputSegments.push(s);
    });
    // construct list of dive gases from known gases
    for (let i in knownGases) {
      let gas = knownGases[i];
      //gas = gasnew Gas(parseInt(gas.fO2)/100,parseInt(gas.fHe)/100,parseInt(gas.fromDepth))
      this.gases.push(gas);
    }
    //Order by fromDepth
    this.gases = orderBy(this.gases, "fromDepth", "desc");
    let returnCode = null;
    let s = null;
    let sd = null;
    let t = null;
    let deltaDepth = null;
    let runtimeFlag = true; // Used to decide if segment represents runtime or segtime
    //let metaData = null
    // Set initial state
    s = new SegmentAbstract(this.inputSegments[0], this.pref); // Set the first segment and set initial gas from it
    this.currentGas = s.getGas();
    this.currentDepth = 0.0;
    this.ppO2 = s.getSetpoint() > 0 ? this.descentppO2 : 0; // // Set initial ppO2 based on descent ppO2
    //Determine if we are Open or Closed circuit
    /*if (this.ppO2==0.0){
        this.closedCircuit=false;
        } else{
        this.closedCircuit=true;
        }*/
    this.inFinalAscent = false; // Flag used to work out when all segments are complete and are in final ascent

    // Process segment list of user defined segments through model
    this.inputSegments.forEach((segment) => {
      s = segment; // Get segment
      //console.log("Processing: ", s);
      if (s.getType() == this.pref.CONST) {
        // Should be constant depth segments only
        sd = s;
        deltaDepth = sd.getDepth() - this.currentDepth; // Has depth changed ?
        // Ascend or descend to dive segment, using existing gas and ppO2
        if (deltaDepth > 0.0) {
          // Segment causes a descent
          // Add segment to output segments
          let descent_time = deltaDepth / this.pref.getDescentRate();
          let average_descent_depth =
            sd.getDepth() - (sd.getDepth() - this.currentDepth) / 2;
          let actual_gas = this.calc_inspired_gas(
            average_descent_depth,
            this.currentGas.getFHe(),
            this.currentGas.getFN2(),
            this.ppO2,
            this.currentGas.getUseAsDiluent(),
            descent_time
          );
          this.ascDec(
            this.currentDepth,
            sd.getDepth(),
            this.pref.getDescentRate(),
            actual_gas.getFHe(),
            actual_gas.getFN2(),
            this.ppO2
          );
          this.outputSegments.push(
            new SegmentAscDec(
              this.currentDepth,
              sd.getDepth(),
              this.pref.getDescentRate(),
              actual_gas,
              actual_gas.getpO2atDepth(sd.getDepth() / 2, 1),
              this.pref
            )
          );
          this.addInspiredGasRuntime(
            this.currentGas.getFHe(),
            this.currentGas.getFN2(),
            descent_time
          );

          this.runtime += descent_time;
        } else if (deltaDepth < 0.0) {
          // Segment causes an ascent.
          // Call ascend() to process this as it can require decompression
          //here deco may be required with deco gas changes
          this.inFinalAscent = true;
          this.ascend(sd.getDepth());
        }

        // Now at desired depth so process dive segments.
        this.currentDepth = sd.getDepth(); // Reset current depth
        this.ppO2 = sd.getSetpoint(); // Set ppO2
        this.currentGas = s.getGas(); // Set gas used
        let actual_gas = this.currentGas;
        // Process segment.
        if (sd.getTime() > 0) {
          // Only do this if it is not a waypoint.
          // Interpret first segment time as runtime or segment time depending on runtimeFlag
          if (runtimeFlag) {
            actual_gas = this.calc_inspired_gas(
              this.currentDepth,
              this.currentGas.getFHe(),
              this.currentGas.getFN2(),
              this.ppO2,
              this.currentGas.getUseAsDiluent(),
              sd.getTime() - this.runtime
            );
            runtimeFlag = false; // Do this once only. Make segment == runtime
            try {
              this.constDepth(
                sd.getDepth(),
                sd.getTime() - this.runtime,
                actual_gas.getFHe(),
                actual_gas.getFN2(),
                this.ppO2,
                "bottom"
              );
            } catch (e) {
              return this.PROCESSING_ERROR;
            }
            // Add segment to output segments
            this.outputSegments.push(
              new SegmentDive(
                sd.getDepth(),
                sd.getTime() - this.runtime,
                actual_gas,
                this.pref.configuration == "CCR"
                  ? sd.setpoint
                  : actual_gas.getpO2atDepth(sd.getDepth(), 1),
                this.pref
              )
            );
            this.addInspiredGasRuntime(
              this.currentGas.getFHe(),
              this.currentGas.getFN2(),
              Math.abs(sd.getTime() - this.runtime)
            );
            this.runtime = sd.getTime(); // Reset runTime to segment end time
          } else {
            // Segtime is segtime
            actual_gas = this.calc_inspired_gas(
              this.currentDepth,
              this.currentGas.getFHe(),
              this.currentGas.getFN2(),
              this.ppO2,
              this.currentGas.getUseAsDiluent(),
              sd.getTime()
            );
            try {
              this.constDepth(
                sd.getDepth(),
                sd.getTime(),
                actual_gas.getFHe(),
                actual_gas.getFN2(),
                this.ppO2,
                "bottom"
              );
            } catch (e) {
              return this.PROCESSING_ERROR;
            }
            // Add segment to output segments
            this.outputSegments.push(
              new SegmentDive(
                sd.getDepth(),
                sd.getTime(),
                actual_gas,
                this.pref.configuration == "CCR"
                  ? sd.setpoint
                  : actual_gas.getpO2atDepth(sd.getDepth(), 1),
                this.pref
              )
            );
            this.addInspiredGasRuntime(
              this.currentGas.getFHe(),
              this.currentGas.getFN2(),
              sd.getTime()
            );
            this.runtime += sd.getTime(); // update runtime
          }
        } else {
          // Process waypoint
          // Add waypoint to output segments
          this.outputSegments.push(
            new SegmentDive(
              sd.getDepth(),
              sd.getTime(),
              actual_gas,
              this.pref.configuration == "CCR"
                ? sd.setpoint
                : actual_gas.getpO2atDepth(sd.getDepth(), 1),
              this.pref
            )
          );
        }
      }
    });

    // Processed all specified segments, now get back to surface
    this.inFinalAscent = true; // Enables automatic gas selection in ascend() method

    //set OC deco in case of bailout
    this.pref.setOcDeco(
      params.configuration != "OC" && !bailout ? false : true
    );

    // Call ascend to move to the surface
    returnCode = this.ascend(0.0);
    // Was there an error ?
    if (returnCode != true) return returnCode;
    // Calculate runtimes and update the segments
    t = 0;
    let segments = [];
    //adapt to existing model
    this.decotime = 0;
    this.outputSegments.forEach((s) => {
      t += s.time; // Set segment runtime
      s.runtime = t;
      if (s.type != 2) {
        //exclude ascent - only deco
        let seg = {
          depth: s.depth,
          equal: {},
          gas: s.gas,
          linear: {},
          mix: 0,
          ppO2:
            s.setpoint > 0
              ? s.setpoint
              : s.gas.getpO2atDepth(this.currentDepth, 1),
          rangeShape: "model",
          rmv: 0,
          runtime: t,
          s: {},
          stage: this.pref.stage_descr[s.type],
          model: {
            runtime: t,
            stoptime: s.time,
          },
        };
        segments.push(seg);
      }

      if (s.type == 4) {
        this.decotime += s.time;
      }
      this.runtime = t;
    });
    // Write metadata into the model
    this.outputSegments = segments;
    return this;
  }

  /*
   * Ascend to target depth, decompressing if necessary.
   * If this.inFinalAscent then gradient factors start changing, and automatic gas selection is made.
   */
  ascend(target) {
    //boolean surfacing=false;    // Flag to indicate we are headed for final deco to surface
    //boolean openCircuit=true;   // Flag to indicate that we are OC or bailing out
    let inDecoCycle = false; // Flag to track if we are in a deco cycle
    let inAscentCycle = false; // Flag to track if we are in a free ascent cycle as opposed to a deco cycle
    let forceDecoStop = false; // Flag for forcing every deco stop. // TODO - ALWAYS TRUE IN LOGIC
    let stopTime; // Used for deco stop time
    let decoStopTime = 0; // Accumulates deco stop time
    let startDepth; // Holds depth at start of ascent segment
    let maxMV = 0; // Holds maximum mvgradient at each stop
    let nextStopDepth; // Next proposed stop depth
    let control = 0; // Stores controlling compartment at new depth
    //let ceiling;             // Used to store ceiling
    let tempGas;
    let decoSegment; // Use for adding deco segments

    //console.log("\nASCEND: started ascent to: " + target);
    //console.log("RT: " + this.runtime + " ppO2: " + this.ppO2);
    /*
     * Set up some initial stuff:
     *      Are we surfacing
     *      Are we open circuit deco == bailing out
     */
    //console.log("OCDECO: ", this.pref.getOcDeco());
    //console.log("this.pref: ", this.pref);
    if (this.inFinalAscent && this.pref.getOcDeco()) {
      // Switch to Open circuit deco
      this.currentGasIndex = -1;
      this.setDecoGas(this.currentDepth); // Or pick a better gas. Also sets OC mode
    }

    if (this.currentDepth < target)
      // Going backwards !
      return this.PROCESSING_ERROR;

    // Set initial stop to be the next integral stop depth
    if (this.currentDepth % this.pref.getStopDepthIncrement() > 0)
      // Are we on a stop depth already ?
      // If not, go to next stop depth
      nextStopDepth =
        (this.currentDepth / this.pref.getStopDepthIncrement()) *
        this.pref.getStopDepthIncrement();
    else nextStopDepth = this.currentDepth - this.pref.getStopDepthIncrement();

    // Check in case we are overshooting or hit last stop or any of the other bizzar combinations ...
    if (
      nextStopDepth < target ||
      this.currentDepth < this.pref.getStopDepthIncrement()
    )
      nextStopDepth = target;
    else if (this.currentDepth == this.pref.getLastStopDepth())
      nextStopDepth = target;
    else if (nextStopDepth < this.pref.getLastStopDepth())
      nextStopDepth = this.pref.getLastStopDepth();

    startDepth = this.currentDepth; // Initialise ascent segment start depth
    inAscentCycle = true; // Start in free ascent

    // Initialise gradient factor for next (in this case first) stop depth
    this.getGradient().setGfAtDepth(nextStopDepth);

    // Remember maxM-Value and controlling compartment
    maxMV = this.mValue(this.currentDepth);
    control = this.controlCompartment();

    //console.log("Initial stop depth: " + nextStopDepth);
    //console.log(" ... set m-value gradient for: " + nextStopDepth);

    // <Andreas addition>
    /*let travelTimeBetweenStops = Math.abs(
      this.pref.getStopDepthIncrement() / this.pref.getAscentRate()
    );*/
    // </Andreas addition>

    let actual_gas = this.currentGas;
    while (this.currentDepth > target) {
      // Can we move to the proposed next stop depth ?
      /*console.log(
        " ... ceiling is now:",
        this.ceiling() / this.pref.getPConversion(),
        forceDecoStop,
        this.ceiling(),
        nextStopDepth / this.pref.getPConversion()
      );*/
      while (forceDecoStop || nextStopDepth < this.ceiling()) {
        // Need to decompress .... enter decompression loop
        //console.log(" ... entering decompression loop ...");
        inDecoCycle = true;
        forceDecoStop = false; // Only used for first entry into deco stop
        if (inAscentCycle) {
          // Finalise last ascent cycle as we are now decompressing
          if (startDepth > this.currentDepth) {
            // Did we ascend at all ?
            // Add ascent segment
            //console.log("Add ascent segment 1", startDepth, actual_gas);
            let seg = new SegmentAscDec(
              startDepth,
              this.currentDepth,
              this.pref.getAscentRate(),
              actual_gas,
              actual_gas.getpO2atDepth(this.currentDepth, 1),
              this.pref
            );
            this.outputSegments.push(seg);
          }
          inAscentCycle = false;
          // TODO - start depth is not re-initialised after first use
        }

        // set m-value gradient under the following conditions:
        //      if not in multilevel mode, then set it as soon as we do a decompression cycle
        //      otherwise wait until we are finally surfacing before setting it
        if (
          (!this.pref.getGfMultilevelMode() || this.inFinalAscent) &&
          !this.getGradient().isGfSet()
        ) {
          this.getGradient().setGfSlopeAtDepth(this.currentDepth);
          /*console.log(
            " ... m-Value gradient slope set at: " +
              this.currentDepth +
              " GF is:" +
              this.getGradient().getGf()
          );*/
          this.getGradient().setGfAtDepth(nextStopDepth);
          /*console.log(
            " ... set m-value gradient for: " +
              nextStopDepth +
              " to:" +
              this.getGradient().getGf()
          );*/
        }

        // Round up runtime to integral number of minutes - only first time through on this cycle
        // <Andreas addition>
        if (decoStopTime == 0) {
          let runTimeRoundedUp =
            Math.round(this.runtime / this.pref.getStopTimeIncrement() + 0.5) *
            this.pref.getStopTimeIncrement();
          stopTime = runTimeRoundedUp - this.runtime;
        } else {
          stopTime = this.pref.getStopTimeIncrement();
        }
        // </Andreas addition>

        /*if (
          decoStopTime == 0 &&
          this.runtime % this.pref.getStopTimeIncrement() > 0
        )
          // Is this not an integral time
          stopTime =
            (this.runtime / this.pref.getStopTimeIncrement()) *
              this.pref.getStopTimeIncrement() +
            this.pref.getStopTimeIncrement() -
            this.runtime;
        else stopTime = this.pref.getStopTimeIncrement();*/

        // Sanity check the rounding
        if (stopTime == 0) stopTime = this.pref.getStopTimeIncrement();
        if (stopTime > 0 && stopTime <= 1) stopTime = 1;

        // Execute stop
        decoStopTime += stopTime;
        actual_gas = this.calc_inspired_gas(
          this.currentDepth,
          this.currentGas.getFHe(),
          this.currentGas.getFN2(),
          this.ppO2,
          this.currentGas.getUseAsDiluent(),
          decoStopTime
        );
        /*console.log(
          " ... decompressing at depth: " +
            this.currentDepth +
            " next depth :" +
            nextStopDepth +
            " Stop: " +
            stopTime +
            " ppO2: " +
            this.ppO2 +
            "actual gas:" +
            actual_gas.toString() +
            "current gas:" +
            this.currentGas.toString()
        );*/
        //update ppO2 according to the gas and depth
        this.constDepth(
          this.currentDepth,
          stopTime,
          actual_gas.getFHe(),
          actual_gas.getFN2(),
          this.ppO2,
          "ascent"
        );
        //console.log(" ... ceiling is now:" + this.ceiling());
        // Sanity check decoStopTime for infinite loop
        if (decoStopTime > 5000) {
          //console.log("Infinite loop on deco stop at " + this.currentDepth);
          return false;
        }
      }
      // Finished decompression loop
      if (inDecoCycle) {
        // Finalise last deco cycle ...
        this.runtime += decoStopTime;
        forceDecoStop = true; // ALWAYS TRUE AT THIS POINT

        // write deco segment
        decoSegment = new SegmentDeco(
          this.currentDepth,
          decoStopTime, // + travelTimeBetweenStops,
          actual_gas,
          actual_gas.getpO2atDepth(this.currentDepth, 1),
          this.pref
        ); // <Andreas addition> : added + travelTimeBetweenStops

        decoSegment.setMvMax(maxMV);
        decoSegment.setGfUsed(this.getGradient().getGf());
        decoSegment.setControlCompartment(control);
        this.outputSegments.push(decoSegment);
        this.addInspiredGasRuntime(
          this.currentGas.getFHe(),
          this.currentGas.getFN2(),
          decoStopTime
        );
        inDecoCycle = false;
        decoStopTime = 0;
      } else if (inAscentCycle) {
        // Did not decompress, just ascend
        // TODO - if we enable this code always (remove else if) then model will ascend between deco stops, but ... this causes collateral damage to runtim calculations
        /*console.log(
          "inAscentCycle",
          this.currentDepth,
          nextStopDepth,
          this.ppO2
        );*/
        this.ascDec(
          this.currentDepth,
          nextStopDepth,
          this.pref.getAscentRate(),
          actual_gas.getFHe(),
          actual_gas.getFN2(),
          this.ppO2
        );

        this.runtime +=
          (this.currentDepth - nextStopDepth) /
          (-1 * this.pref.getAscentRate());
        // TODO - Issue here is that this ascent time is not accounted for in any segments unless it was in an ascent cycle
      }

      // Moved up to next depth ...
      /*console.log(
        "Now at next stop depth: " +
          nextStopDepth +
          " runtime: " +
          this.runtime,
        "actual gas:",
        actual_gas.toString(),
        "current gas:",
        this.currentGas.toString()
      );*/

      this.currentDepth = nextStopDepth;
      maxMV = this.mValue(this.currentDepth);
      control = this.controlCompartment();

      // Check and switch deco gases
      tempGas = actual_gas; // Remember this in case we switch
      if (this.setDecoGas(this.currentDepth) == true) {
        // If true we have changed gases
        if (inAscentCycle) {
          // To switch gases during ascent need to force a waypoint
          //console.log(" ... forcing waypoint for gas switch");
          //console.log("Add ascent segment 2", startDepth, tempGas);
          let seg = new SegmentAscDec(
            startDepth,
            this.currentDepth,
            this.pref.getAscentRate(),
            tempGas,
            tempGas.getpO2atDepth(this.currentDepth, 1),
            this.pref
          );
          this.outputSegments.push(seg);
          startDepth = this.currentDepth;
        }
      }

      // Set next rounded stop depth
      nextStopDepth = this.roundUpMultiple(
        this.currentDepth - this.pref.getStopDepthIncrement(),
        this.pref.getStopDepthIncrement()
      );

      // Check in case we are overshooting or hit last stop
      if (
        nextStopDepth < target ||
        this.currentDepth < this.pref.getLastStopDepth()
      )
        nextStopDepth = target;
      else if (this.currentDepth == this.pref.getLastStopDepth())
        nextStopDepth = target;
      else if (nextStopDepth < this.pref.getLastStopDepth())
        nextStopDepth = this.pref.getLastStopDepth();

      if (this.getGradient().isGfSet()) {
        // Update GF for next stop
        this.getGradient().setGfAtDepth(nextStopDepth);
        /*console.log(
          " ... set m-value gradient for: " +
            nextStopDepth +
            " to:" +
            this.getGradient().getGf()
        );*/
      }
    }
    // Are we still in an ascent segment ?
    if (inAscentCycle) {
      let seg = new SegmentAscDec(
        startDepth,
        this.currentDepth,
        this.pref.getAscentRate(),
        actual_gas,
        actual_gas.getpO2atDepth(this.currentDepth, 1),
        this.pref
      );
      //console.log("last seg", seg);
      this.outputSegments.push(seg);
    }
    //if(Mvplan.DEBUG > 1) this.printModel();
    return true;
  } // ascend

  roundUpMultiple(num, div) {
    return num + ((div - (num % div)) % div);
  }

  /**
   * Select appropriate deco gas for the depth specified
   * Returns true if a gas switch occured
   */
  setDecoGas(depth) {
    let g;
    let finished = false;
    let gasSwitch = false;
    //console.log("Evaluating deco gas at " + depth);
    // Check to see if we should be changing gases at all ... if so just return doing nothing
    if (!this.inFinalAscent) return false; // Not ascending yet so no gas switching
    //if (!this.pref.getOcDeco())   return false;   // No OC deco so no bailout
    if (this.gases.length == 0) return false; // No gases to change to

    // If this is the first time that this method is called we need to change to Open Circuit bailout
    if (this.pref.getOcDeco() || this.pref.configuration == "pSCR") {
      //this.closedCircuit=false;
      this.currentGas = this.gases[0]; // Select the first gas in the list based on MOD
      this.currentGasIndex = 0;
      this.ppO2 = 0.0;

      // Check and switch deco gases for OC
      while (!finished && this.currentGasIndex + 1 < this.gases.length) {
        // Is there another gas to switch to anyway ?
        g = this.gases[this.currentGasIndex + 1]; // Look at next gas then
        // Check MOD, Can move to this gas ?
        if (g.getFromDepth() >= depth) {
          //do not switch lo a lower O2% gas - can happen in case of multilevel profile
          this.currentGasIndex += 1; // Yes !
          if (this.currentGas.O2 <= g.O2) {
            this.currentGas = g;
            //console.log(" ... OC/pSCR changing gas to " + g, depth, this.gases);
            gasSwitch = true;
          }
        } else {
          finished = true;
        } // Look no more
      }
    } else {
      //CCR
      this.ccr_currentGasIndex = 0;
      // Check and switch deco gases for OC
      while (!finished && this.ccr_currentGasIndex + 1 < this.gases.length) {
        // Is there another gas to switch to anyway ?
        g = this.gases[this.ccr_currentGasIndex + 1]; // Look at next gas then
        //switch gas and always switch at 6mt
        if (
          g.getFromDepth() >= depth ||
          this.diveTools.depth2press(depth) <= 1.7
        ) {
          // Check MOD, Can move to this gas ?
          this.ccr_currentGasIndex += 1; // Yes !
          this.currentGas = g;
          //ccr_gasSwitch=true;

          //check if oxygen gas switch and the deco gas is not oxyegn
          //then set the ppO2 to oxygen settings
          if (this.diveTools.depth2press(depth) <= 1.7 && g.O2 < 95) {
            this.ppO2 = this.pref.oxygenppO2;
          } else {
            this.ppO2 = g.ppO2;
          }
          /*console.log(
            " ... CCR changing gas to " + g,
            this.ccr_currentGasIndex,
            depth,
            this.ppO2,
            this.gases
          );*/
          gasSwitch = true;
        } else {
          finished = true;
        } // Look no more
      }
    }
    return gasSwitch;
  }
}
