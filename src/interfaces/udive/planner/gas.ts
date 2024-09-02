import {BuhlPref} from "./buhl-preferences";
import {round, toNumber} from "lodash";
import {UserService} from "../../../services/common/user";
import {TranslationService} from "../../../services/common/translations";
import {DiveToolsService} from "../../../services/udive/planner/dive-tools";

/*
 * Gas
 *
 *  Represents a breathing gas. Maintains fractions of O2, He and N2,
 *  provides MOD and accumulates volume used in a dive.
 *
 */
export class Gas {
  public fHe: number;
  public fO2: number;
  public He: number;
  public O2: number;
  public ppO2: number;
  public fromDepth: number;
  public mod: number;
  public required: number;
  public used: number;
  public available: number;
  public units: string = "Metric";
  public useAsDiluent: boolean = false;
  private pref = new BuhlPref();

  constructor(
    fO2 = 0.32,
    fHe = 0.0,
    fromDepth = DiveToolsService.isMetric() ? 30 : 100,
    ppO2 = 1.2,
    units = DiveToolsService.units
  ) {
    /** Constructor for Gas objects. Fractions must add to <= 1.0. Remainder assumed Nitrogen.
     *  If constructed with erroneous data is set up as air.
     *
     *  @param fHe Fraction of helium (0.0 - 1.0)
     *  @param fO2 Fraction of Oxygen (0.0 - 1.0)
     *  @param mod Maximum Operating depth in m (ft)
     */
    this.updateGas(fO2, fHe, fromDepth, ppO2, units);
  }

  updateGas(fO2, fHe, fromDepth?, ppO2?, units?) {
    this.fHe = round(fHe, 3);
    this.fO2 = round(fO2, 3); // Gas fractions
    this.He = round(this.fHe * 100, 0);
    this.O2 = round(this.fO2 * 100, 0);
    if (ppO2) this.ppO2 = round(ppO2, 2); // max pO2
    // Maximum operating depth
    if (fromDepth) {
      this.fromDepth = toNumber(fromDepth);
    } else {
      //calculate max depth
      this.fromDepth = this.getModF(this.fO2, this.ppO2);
    }
    this.mod = this.getModF(this.fO2, this.ppO2);
    //TODO: set units according to user preference
    this.units = units ? units : DiveToolsService.units;
    this.pref.setUnitsTo(this.units === "Metric" ? 0 : 1);
  }

  /*
   * Method to validate a field for limits only
   */
  validateField(field, value) {
    if (field === "fHe" || field === "fO2") return value >= 0.0 && value <= 1.0;
    if (field === "mod")
      // Need to hard code nominal max value due to potential ofBuhlPrefServices not being fully set up when this is called
      return value >= 0.0 && value <= 900.0;
    return false;
  }

  /*
   * Method to validate all inputs (fO2, fHe and MOD)
   */
  validate(fHe, fO2, mod) {
    let passed = true;
    // Check individual fields for bounds
    passed = passed && this.validateField("fHe", fHe);
    passed = passed && this.validateField("fO2", fO2);
    passed = passed && this.validateField("mod", mod);
    if (!passed) return false;
    // Check combined fractions
    passed = passed && fHe + fO2 <= 1.0;
    if (!passed) return false;

    // Check MOD for sensible value
    if (fO2 == 0.0 && mod == 0.0)
      // Leave empty gases alone to allow construction
      return passed;
    if (DiveToolsService != null) {
      // Need to check that BuhlPrefServices exists. We can get to this point during the initilisation of theBuhlPrefServices object
      let d =
        ((mod + DiveToolsService.depthToPressFactor) /
          DiveToolsService.depthToPressFactor) *
        fO2;
      passed = d <= this.pref.getMaxMOD() + 0.05; // Tolerance of 0.05 to prevent unneccessary failure due to rounding
    }

    return passed;
  }

  checkGas() {
    if (this.getFO2() + this.getFHe() > 1) {
      this.setFHe(1 - this.getFO2());
    }
  }
  /*
   * Method to get a maximum MOD based on O2 fraction
   */
  getMaxMod(o) {
    return (
      (this.pref.getMaxMOD() / o) * DiveToolsService.depthToPressFactor -
      DiveToolsService.depthToPressFactor
    );
  }
  /*
   * Method to get a deco depth for this gas
   */
  getFromDepth() {
    return this.fromDepth;
  }
  /*
   * Method to get a MOD based on O2 fraction and maximum ppO2
   */
  getModF(fO2, ppO2) {
    return round(
      (ppO2 / fO2) * DiveToolsService.depthToPressFactor -
        DiveToolsService.depthToPressFactor,
      1
    );
  }
  /*
   * Method to get a ppO2 based on O2 fraction and MOD
   */
  getppO2(f, m) {
    return (
      ((m + DiveToolsService.depthToPressFactor) * f) /
      DiveToolsService.depthToPressFactor
    );
  }

  /*
   * Method to get a ppO2 based on O2 fraction and MOD
   */
  getpO2atDepth(d, decimals = 2) {
    d = toNumber(d);
    const res = round(
      DiveToolsService.depth2press(d) * this.getFO2(),
      decimals
    );
    return res;
  }

  /** Gets Equivalent Narcosis Depth (END) in msw (fsw)
   *  @return Equivalent Narcosis Depth (END) in msw (fsw)
   */
  getEND(d, O2narcotic = true) {
    var pAbsolute = d + this.pref.getPAmb(); // msw (fsw)
    var fN2 = this.getFN2();
    var fHe = this.getFHe();
    var pInert;
    var ppN2Inspired;
    var ppO2Inspired;
    // Set inspired gas fractions.
    if (this.ppO2 > 0.0) {
      // Rebreather mode
      // Determine pInert by subtracting absolute oxygen pressure (msw), or force to zero if no inert fraction
      pInert =
        fHe + fN2 > 0.0
          ? pAbsolute - this.ppO2 * this.pref.getPConversion()
          : 0.0;
      ppN2Inspired = pInert > 0.0 ? (pInert * fN2) / (fHe + fN2) : 0.0;
      ppO2Inspired = this.ppO2 * this.pref.getPConversion();
    } else {
      // Open circuit mode
      ppN2Inspired = pAbsolute * fN2;
      ppO2Inspired = pAbsolute * (1 - fN2 - fHe);
    }
    var end =
      ppN2Inspired + (O2narcotic ? ppO2Inspired : 0) - this.pref.getPAmb();
    return end > 0.0 ? round(end, 1) : 0.0; // Only return positive numbers.
  }

  highPO2WarningatDepth(d, deco) {
    let maxpO2;
    if (deco) {
      maxpO2 = 1.6;
    } else {
      if (d < 40) {
        maxpO2 = 1.4;
      } else if (d < 80) {
        maxpO2 = 1.2;
      } else {
        maxpO2 = 1;
      }
    }
    return this.getpO2atDepth(d) > maxpO2;
  }

  highPO2WarningatDepthWithTarget(d, maxpO2) {
    return this.getpO2atDepth(d) > maxpO2;
  }

  highENDWarningatDepth(d) {
    const max = this.units === "Metric" ? 30 : 100;
    return this.getEND(d) > max;
  }

  /** Used to implement the Comparable interface. To compare gases
   *  based on their mod (Maximum Operating Depth).
   *  @param  Object (Gas) to compare to
   *  @return Integer, Mod of compared Gas - Mod of this gas
   */
  compareTo(o) {
    /*let m;
        let g = new Gas(o.fO2,o.fHe,o.mod);
        m=g.getMod();
        return (m-this.mod);*/
    return this.getFO2() == o.getFO2() && this.getFHe() == o.getFHe();
  }

  // Accessors
  getHe() {
    return round(this.He, 0);
  }
  getO2() {
    return round(this.O2, 0);
  }
  getFHe() {
    return round(this.fHe, 2);
  }
  getFO2() {
    return round(this.fO2, 2);
  }
  getFN2() {
    let n = 1.0 - round(this.fHe, 2) - round(this.fO2, 2);
    if (n < 0.0001) return 0.0;
    else return n;
  }
  getMod() {
    return this.mod;
  }
  getUseAsDiluent() {
    return this.useAsDiluent;
  }

  setFHe(f) {
    this.fHe = round(f, 2);
    this.He = this.fHe * 100;
    if (this.fO2 + this.fHe > 1) {
      this.setFO2(1 - this.fHe);
    }
  }
  async setFO2(f) {
    this.fO2 = round(f, 2);
    this.O2 = this.fO2 * 100;

    if (this.fO2 + this.fHe > 1) {
      //check user licence
      if (await UserService.checkLicence("trimix")) {
        //correct He value
        this.setFHe(1 - this.fO2);
      } else {
        //reset O2 to max value
        this.setFO2(1 - this.fHe);
      }
    }
  }
  setMod(m) {
    this.mod = m;
  }
  setFromDepth(d) {
    this.fromDepth = d;
  }
  setUseAsDiluent(value: boolean) {
    this.useAsDiluent = value;
  }

  /* setGas() - sets gas fractions
   * or creates Air by default
   */
  setGas(fHe, fO2, mod) {
    if (this.validate(fHe, fO2, mod)) {
      this.fHe = fHe;
      this.fO2 = fO2;
      this.mod = mod;
    } else {
      // Set it up for air
      this.fHe = 0;
      this.fO2 = 0.21;
      this.mod = DiveToolsService.isMetric() ? 30 : 100;
    }
    this.units = DiveToolsService.units;
  }

  isEqualTo(m2: Gas) {
    return this.getFO2() == m2.getFO2() && this.getFHe() == m2.getFHe();
  }

  /*
   * Construct a human readable name for this gas and override Object.toString method
   */
  toString() {
    let name;
    let composition;
    if (this.fHe == 0.0) composition = Math.round(this.fO2 * 100.0);
    else
      composition =
        Math.round(this.fO2 * 100.0) + "/" + Math.round(this.fHe * 100.0);
    if (this.fHe > 0.0) {
      if (this.fHe == 1.0)
        name = TranslationService.getTransl("helium", "Helium");
      else if (this.fHe + this.fO2 == 1.0) name = "Heliox " + composition;
      else name = "Tx " + composition;
    } else if (this.fO2 == 0.21)
      name = TranslationService.getTransl("air", "Air");
    else if (this.fO2 == 1.0)
      name = TranslationService.getTransl("oxygen", "Oxygen");
    else name = "Nx " + composition;
    return name;
  }

  /*
   * Make short name for tables
   */
  getShortName() {
    return this.toString();
  }

  /*
   * create forms
   */
  getForm() {
    let form = {
      o2: this.getO2(),
      he: this.getHe(),
      fromDepth: this.getFromDepth(),
      ppO2: this.ppO2,
      useAsDiluent: this.getUseAsDiluent(),
    };
    return form; /*{
      O2: [
        this.O2,
        Validators.compose([
          Validators.required,
          CustomValidators.positiveNumberValidator
        ])
      ],
      He: [this.He, Validators.compose([Validators.required])],
      fromDepth: [
        this.fromDepth,
        Validators.compose([
          Validators.required,
          CustomValidators.positiveNumberValidator
        ])
      ],
      ppO2: [
        this.ppO2,
        Validators.compose([
          Validators.required,
          CustomValidators.positiveNumberValidator
        ])
      ]
    };*/
  }

  getPresetValues() {
    let value = {
      O2: {
        order: 0,
        value: 0,
        label: "O2",
        type: "input",
        format: "number",
      },
      He: {
        order: 1,
        value: 0,
        label: "He",
        type: "input",
        format: "number",
      },
      fromDepth: {
        order: 2,
        value: 0,
        label: "Used from depth",
        type: "input",
        format: "number",
      },
      ppO2: {
        order: 3,
        value: 1.2,
        label: "pO2 Set Point",
        type: "input",
        format: "number",
      },
    };
    return value;
  }

  convertUnit(metric) {
    if (
      (this.units === "Imperial" && metric) ||
      (this.units === "Metric" && !metric)
    ) {
      //execute conversion
      this.units = metric ? "Metric" : "Imperial";
      this.fromDepth = metric
        ? DiveToolsService.feetToMeters(this.fromDepth, 0)
        : DiveToolsService.metersToFeet(this.fromDepth, -1);
      this.mod = metric
        ? DiveToolsService.feetToMeters(this.mod, 0)
        : DiveToolsService.metersToFeet(this.mod, -1);
      this.pref.setUnitsTo(metric ? 0 : 1);
    }
    return this;
  }
}
