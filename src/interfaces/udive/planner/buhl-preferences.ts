import { DiveToolsService } from "../../../services/udive/planner/dive-tools";

export class BuhlPref {
  /*
   * Buhl Preferences
   */
  /** Indicates metric units used for model - msw */
  METRIC = 0;
  /** Indicates imperial units used for model - fsw */
  IMPERIAL = 1;
  ALTITUDE_MAX = 3000;
  METERS_TO_FEET = DiveToolsService.conversions.feetPerMeter;
  BRIEF = 0;
  EXTENDED = 1;

  /** Segment is Constant depth */
  CONST = 1;
  stage_descr = [
    "descent",
    "bottom",
    "ascent",
    "waypoint",
    "ascent",
    "surface",
  ];
  /** Segment is Ascent */
  ASCENT = 2;
  /** Segment is Descent */
  DESCENT = 0;
  /** Segment is Deco */
  DECO = 4;
  /** Segment is Waypoint */
  WAYPOINT = 3;
  /** Segment is Surface */
  SURFACE = 5;

  public units: number; // 0 = metric or 1 = imperial
  public disableModUpdate: boolean; // Automatically update MODS on units switch
  public lastStopDepth: number; //msw
  public stopDepthIncrement: number; //msw
  public stopDepthMin: number;
  public stopDepthMax: number;
  public stopTimeIncrement: number; //minutes
  public ascentRate: number; //msw per min
  public ascentRateMin: number;
  public ascentRateMax: number;
  public descentRate: number; // "
  public descentRateMax: number;
  public descentRateMin: number;
  public extendedLimits: boolean; // Enables extended limits
  public gfHigh: number;
  public gfLow: number;
  public gfHigh_bailout: number;
  public gfLow_bailout: number;
  public bailout: boolean;
  public gfMax: number;
  public gfMin: number;
  public decoRMV: number; // RMV for gas calculations
  public diveRMV: number;
  public ocDeco: boolean; // Flag for OC deco
  public forceAllStops: boolean; // Flag to force a stop at all deco levels
  public runtimeFlag: boolean; // Flag for segtime == runtime (first non-zero segment)
  public gfMultilevelMode: boolean; // On multilevel mode the gf does not get set until final ascent.
  public prefGases: Array<any>; // Stores known gas list
  public prefSegments: Array<any>; // Stores dive segments
  public lastModelFile: string; // Stores last model filename used
  public agreedToTerms: boolean;
  public modifiers: Array<number>; // Default modifiers for multi-dive plans
  public factorComp: number;
  public factorDecomp: number;
  public modelClass: string;
  public bottomppO2: number;
  public decoppO2: number;
  public oxygenppO2: number;
  public configuration: string;
  public helium_half_time_multiplier: number;

  public pAmb: number; // Ambient pressure in units of pressure (msw or fsw).  TODO - rename to pSurface ?
  public pH2O: number; // Partial pressure of H2O in breath (msw or fsw)
  public pH2Omsw: number; // Partial pressure of H2O in breath (msw)
  public pConversion: number; // Pressure to unit/depth conversion. 10.1325 for metric, 33. for imperial
  public pConversionmsw: number; // Pressure to unit/depth conversion. 10.1325 for metric
  public altitude: number; // Stores current altitude
  public maxDepth: number;
  public maxSegmentTime: number;
  public maxSetpoint: number;
  public maxMOD: number;
  public maxPO2: number; // Maximum ppO2 permitted before O2 warning is given

  constructor() {
    this.setDefaultPrefs();
  }

  // Singleton pattern
  getPrefs() {
    return this;
  }

  setDefaultPrefs() {
    // Set defaults
    this.units = this.METRIC;
    this.disableModUpdate = false;
    this.lastStopDepth = 3;
    this.stopDepthIncrement = 3;
    this.stopTimeIncrement = 1.0;
    this.extendedLimits = true; // Default to standard limits
    this.stopDepthMax = 10.0;
    this.stopDepthMin = 1.0;
    this.ascentRate = -9;
    this.ascentRateMin = -1.0;
    this.ascentRateMax = -10.0;
    this.descentRate = 20;
    this.descentRateMin = 5.0;
    this.descentRateMax = 50.0;
    this.gfHigh = 0.85;
    this.gfLow = 0.2;
    this.gfHigh_bailout = 0.9;
    this.gfLow_bailout = 0.9;
    this.bailout = true;
    this.gfMin = 0.0;
    this.gfMax = 0.95;
    this.diveRMV = 20.0;
    this.decoRMV = 15.0;
    this.pAmb = 10.1325; // Sea level in msw
    this.pConversionmsw = 10.1325;
    this.pConversion = this.pAmb;
    this.altitude = 0.0;
    this.pH2O = 0.627;
    this.pH2Omsw = 0.627;
    this.ocDeco = false;
    this.forceAllStops = true;
    this.runtimeFlag = true;
    this.gfMultilevelMode = true;
    this.prefGases = [];
    this.prefSegments = [];
    /*var gas = new Gas(0.21,0.0,66.0)
        this.prefGases.push(gas);
        var seg = new SegmentDive(30.0,20.0,this.prefGases.get(0),1.3)
        this.prefSegments.push(seg);  */
    this.maxDepth = 330.0; // Default maximums
    this.maxSegmentTime = 1000.0;
    this.maxSetpoint = 1.6;
    this.maxMOD = 1.607;
    this.maxPO2 = 1.6;
    this.agreedToTerms = false;
    this.modifiers = [0, 2, 4, 6, 8]; // Default modifiers for multi-dive plans
    this.factorComp = 1.0;
    this.factorDecomp = 1.0;
    this.modelClass = "ZHL16B";
    this.bottomppO2 = 1.2;
    this.decoppO2 = 1.2;
    this.oxygenppO2 = 1.5;
    this.configuration = "OC";
    this.helium_half_time_multiplier = 0;
    this.setExtendedLimits(8);
  }

  setLimits(limits) {
    if (limits) {
      // Set for expedition mode
      this.gfMax = 1.0;
      this.maxSegmentTime = 10000.0;
      this.maxSetpoint = 1.6;
      this.maxMOD = 1.607;
    } else {
      this.maxSegmentTime = 100.0;
      this.maxSetpoint = 1.6;
      this.maxMOD = 1.607;
      this.gfMax = 0.95;
    }
    if (this.units == this.METRIC) this.maxDepth = limits ? 330.0 : 100.0;
    else this.maxDepth = limits ? 1100.0 : 330.0;
  }

  /*
   * Used to change the units. Needs to make some changes to some parameters
   */
  setUnitsTo(units) {
    if (this.units == units) return;
    if (units != this.METRIC) {
      //Imperial
      this.units = this.IMPERIAL;
      this.lastStopDepth = 10;
      this.stopDepthIncrement = 10;
      this.stopDepthMax = 33.0;
      this.stopDepthMin = 3.0;
      this.ascentRate = -30;
      this.ascentRateMin = -3.0;
      this.ascentRateMax = -33.0;
      this.descentRate = 60;
      this.descentRateMin = 16.0;
      this.descentRateMax = 160.0;
      this.pAmb = 33; // Sea level in fsw
      this.pH2O = 2.0461; //2.041;
      this.maxDepth = 1000.0;
    } else {
      //Metric
      this.units = this.METRIC;
      this.lastStopDepth = 3;
      this.stopDepthIncrement = 3;
      this.stopDepthMax = 10.0;
      this.stopDepthMin = 1.0;
      this.ascentRate = -9;
      this.ascentRateMin = -1.0;
      this.ascentRateMax = -10.0;
      this.descentRate = 20;
      this.descentRateMin = 5.0;
      this.descentRateMax = 50.0;
      this.pAmb = 10.1325; // Sea level in msw
      this.pH2O = 0.627;
      this.maxDepth = 330.0;
    }
    this.pConversion = this.pAmb;
  }

  /*
   * Sets altitude and corresponding ambient pressure pAmb
   */
  setAltitude(alt) {
    if (this.units == this.METRIC) {
      // Bounds check
      if (alt < 0.0 || alt > this.ALTITUDE_MAX) alt = 0.0;
      this.pAmb = this.altitudeToPressure(alt);
      this.altitude = alt;
    } else {
      // Bounds check
      if (alt < 0.0 || alt > this.ALTITUDE_MAX * this.METERS_TO_FEET) alt = 0.0;
      this.pAmb =
        this.altitudeToPressure(alt / this.METERS_TO_FEET) *
        this.METERS_TO_FEET; // This class is metric so convert for feet
      this.altitude = alt;
    }
  }

  /**
   * Converts altitude in meters to pressure in msw
   * @return Pressure in msw or 0.0 if out of bounds.
   * @param altitude Altitude in meters
   */
  altitudeToPressure(altitude) {
    if (altitude == 0.0) return this.pAmb;
    else if (altitude > 0.0)
      return Math.pow((44330.8 - altitude) / 4946.54, 5.25588) / 10131.0;
    else return 0.0;
  }

  // Accessor methods
  isDisableModUpdate() {
    return this.disableModUpdate;
  }
  getLastStopDepth() {
    return this.lastStopDepth;
  }
  getStopDepthIncrement() {
    return this.stopDepthIncrement;
  }
  getStopTimeIncrement() {
    return this.stopTimeIncrement;
  }
  getStopDepthMax() {
    return this.stopDepthMax;
  }
  getStopDepthMin() {
    return this.stopDepthMin;
  }
  getAscentRate() {
    return this.ascentRate;
  }
  getAscentRateMax() {
    return this.ascentRateMax;
  }
  getAscentRateMin() {
    return this.ascentRateMin;
  }
  getDescentRate() {
    return this.descentRate;
  }
  getDescentRateMax() {
    return this.descentRateMax;
  }
  getDescentRateMin() {
    return this.descentRateMin;
  }
  getExtendedLimits() {
    return this.extendedLimits;
  }
  getGfHigh() {
    if (this.getBailout() && this.configuration != "OC") {
      return this.gfHigh_bailout;
    } else {
      return this.gfHigh;
    }
  }
  getGfLow() {
    if (this.getBailout() && this.configuration != "OC") {
      return this.gfLow_bailout;
    } else {
      return this.gfLow;
    }
  }
  getGfMax() {
    return this.gfMax;
  }
  getGfMin() {
    return this.gfMin;
  }
  getDecoRMV() {
    return this.decoRMV;
  }
  getDiveRMV() {
    return this.diveRMV;
  }
  getOcDeco() {
    return this.ocDeco;
  }
  getForceAllStops() {
    return this.forceAllStops;
  }
  getRuntimeFlag() {
    return this.runtimeFlag;
  }
  getGfMultilevelMode() {
    return this.gfMultilevelMode;
  }
  getPrefGases() {
    return this.prefGases;
  }
  getPrefSegments() {
    return this.prefSegments;
  }
  getLastModelFile() {
    return this.lastModelFile;
  }
  getPAmb() {
    return this.pAmb;
  }
  getPConversion() {
    return this.pConversion;
  }
  getPConversioninMsw() {
    return this.pConversionmsw;
  }
  getPH2O() {
    return this.pH2O;
  }
  getPH2Omsw() {
    return this.pH2Omsw;
  }
  getAltitude() {
    return this.altitude;
  }
  getAltitudeInMsw() {
    return this.units
      ? DiveToolsService.feetToMeters(this.altitude, 0)
      : this.altitude;
  }

  getAgreedToTerms() {
    return this.agreedToTerms;
  }
  getMaxDepth() {
    return this.maxDepth;
  }
  getMaxSegmentTime() {
    return this.maxSegmentTime;
  }
  getMaxSetpoint() {
    return this.maxSetpoint;
  }
  getMaxMOD() {
    return this.maxMOD;
  }
  getMaxPO2() {
    return this.maxPO2;
  }
  getModifiers() {
    return this.modifiers;
  }
  getFactorComp() {
    return this.factorComp;
  }
  getFactorDecomp() {
    return this.factorDecomp;
  }
  getBailout() {
    return this.bailout;
  }
  //isUsingFactors()         { return !( Double.compare(factorComp, 1.0d)==0  && Double.compare(factorDecomp,1.0d)==0); }

  // Mutator methods - TODO no bounds checking here
  setDisableModUpdate(b) {
    this.disableModUpdate = b;
  }
  setLastStopDepth(d) {
    this.lastStopDepth = d;
  }
  setStopDepthIncrement(d) {
    this.stopDepthIncrement = d;
  }
  setStopTimeIncrement(t) {
    this.stopTimeIncrement = t;
  }
  setAscentRate(r) {
    this.ascentRate = -r;
  }
  setDescentRate(r) {
    this.descentRate = r;
  }
  setGfHigh(gf) {
    this.gfHigh = gf;
  }
  setGfLow(gf) {
    this.gfLow = gf;
  }
  setGfHigh_bailout(gf) {
    this.gfHigh_bailout = gf;
  }
  setGfLow_bailout(gf) {
    this.gfLow_bailout = gf;
  }
  setDecoRMV(rmv) {
    this.decoRMV = rmv;
  }
  setDiveRMV(rmv) {
    this.diveRMV = rmv;
  }
  setOcDeco(b) {
    this.ocDeco = b;
  }
  setForceAllStops(b) {
    this.forceAllStops = b;
  }
  setRuntimeFlag(b) {
    this.runtimeFlag = b;
  }
  setGfMultilevelMode(b) {
    this.gfMultilevelMode = b;
  }
  setPrefGases(a) {
    this.prefGases = a;
  }
  setPrefSegments(a) {
    this.prefSegments = a;
  }
  setLastModelFile(f) {
    this.lastModelFile = f;
  }
  setPAmb(d) {
    this.pAmb = d;
  }
  setPH2O(d) {
    this.pH2O = d;
  }
  setAgreedToTerms(b) {
    this.agreedToTerms = b;
  }
  setModifiers(ia) {
    this.modifiers = ia;
  }
  setFactorComp(d) {
    this.factorComp = d;
  }
  setFactorDecomp(d) {
    this.factorDecomp = d;
  }
  setConfiguration(d) {
    this.configuration = d;
  }
  setBailout(d) {
    this.bailout = d;
  }
  setHelium_half_time_multiplier(d) {
    this.helium_half_time_multiplier = parseFloat(d);
  }

  /* Flags are used to alter program operation level
   * Currently:
   *  8 = expedition mode with extended limits.
   *
   */
  setExtendedLimits(b) {
    this.extendedLimits = b;
    // Update limits
    this.setLimits(this.extendedLimits);
  }

  getUnits() {
    return this.units;
  }

  setUnits(units) {
    this.units = units;
  }
}
