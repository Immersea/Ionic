import {ppO2Drop} from "./ppO2-drop";
import {DiveToolsService} from "./dive-tools";
import {Compartment} from "../../../interfaces/udive/planner/compartment";
import {BuhlPref} from "../../../interfaces/udive/planner/buhl-preferences";
import {DiveBuhlmann} from "./dive-buhlmann";

export class DiveVPM {
  configuration: string;
  conservatism: number;
  deco_gas_switch_time: number;
  lastStop6m20ft: boolean;
  altitude_dive_algorithm: string;
  minimum_deco_stop_time: number;
  critical_radius_n2_microns_basic = 0.55;
  critical_radius_n2_microns: number;
  critical_radius_he_microns_basic = 0.45;
  critical_radius_he_microns: number;
  critical_volume_algorithm: string;
  crit_volume_parameter_lambda = 6500.0;
  gradient_onset_of_imperm_atm = 8.2;
  surface_tension_gamma = 0.0179;
  skin_compression_gammac = 0.257;
  regeneration_time_constant = 20160.0;
  pressure_other_gases_mmhg = 102.0;
  diver_acclimatized_at_altitude: string;
  starting_acclimatized_altitude: number;
  ascent_to_altitude_hours: number;
  hours_at_altitude_before_dive: number;
  MAX_DECO_MIXES = 5;
  MAX_BOTTOM_MIXES = 5;
  MAX_PROFILE_POINTS = 10;
  MAX_OUTPUT_POINTS = 70;
  MAX_DIVES = 5;
  //LP change multiplier to brinh He = N2
  helium_half_time_multiplier: number;
  //VPM GFS params
  VPM_gf_high: number;
  VPM_GFS: boolean;

  units: string;
  altitude_of_dive: number;
  decoStepSize: number;
  finalAscentSpeed: number;

  dive_no: number;

  /* CCR setpoints */
  bottomMixSetPoint: Array<any>;
  decoMixSetPoint: Array<any>;
  decoMixUseDiluentGas: Array<any>;

  /* Deco Mixes */
  decoMixfO2: Array<any>;
  decoMixfHe: Array<any>;
  decoMOD: Array<any>;

  /* Bottom Mixes */
  bottomMixfO2: Array<any>;
  bottomMixfHe: Array<any>;

  /* Profile */
  profileDepth: Array<any>;
  profileTime: Array<any>;
  profileMix: Array<any>;
  profileDecAccSpeed: Array<any>;

  surfaceIntervals: Array<any>;

  /* Output Data */
  outputProfileDepth: Array<any>;
  outputProfileTime: Array<any>;
  outputProfileSegmentTime: Array<any>;
  outputProfileSegmentType: Array<any>;
  outputProfileMixO2: Array<any>;
  outputProfileMixHe: Array<any>;
  outputProfileGas: Array<any>;
  outputProfileCounter: number;
  decoProfileCalculated: boolean;
  outputStartOfDecoDepth: Array<any>;
  firstDecoProfilePoint: number;
  firstDecoPoint: Array<any>;

  deco_ceiling_depth: number;
  ascent_ceiling_depth: number;
  deco_stop_depth: number;
  next_deco_stop_depth: number;
  err: number;

  /* temp lets to simplify UNFMTLISTs */
  fO2: number;
  fHe: number;
  fN2: number;
  dc: number;
  rc: number;
  ssc: number;
  mc: number;

  /* Common Block Declarations */
  water_vapor_pressure: number;
  run_time: number;
  segment_number: number;
  segment_time: number;
  ending_ambient_pressure: number;
  mix_number: number;
  barometric_pressure: number;
  units_equal_fsw: boolean;
  units_equal_msw: boolean;
  units_factor: number;
  helium_time_constant: Array<any>;
  nitrogen_time_constant: Array<any>;
  helium_pressure: Array<any>;
  nitrogen_pressure: Array<any>;
  fraction_helium: Array<any>;
  fraction_nitrogen: Array<any>;
  fraction_pO2SetPoint: Array<any>;
  fraction_useDiluentGas: Array<any>;
  initial_critical_radius_he: Array<any>;
  initial_critical_radius_n2: Array<any>;
  adjusted_critical_radius_he: Array<any>;
  adjusted_critical_radius_n2: Array<any>;
  max_crushing_pressure_he: Array<any>;
  max_crushing_pressure_n2: Array<any>;
  surface_phase_volume_time: Array<any>;
  max_actual_gradient: Array<any>;
  amb_pressure_onset_of_imperm: Array<any>;
  gas_tension_onset_of_imperm: Array<any>;
  initial_helium_pressure: Array<any>;
  initial_nitrogen_pressure: Array<any>;
  regenerated_radius_he: Array<any>;
  regenerated_radius_n2: Array<any>;
  adjusted_crushing_pressure_he: Array<any>;
  adjusted_crushing_pressure_n2: Array<any>;
  allowable_gradient_he: Array<any>;
  allowable_gradient_n2: Array<any>;
  deco_gradient_he: Array<any>;
  deco_gradient_n2: Array<any>;
  initial_allowable_gradient_he: Array<any>;
  initial_allowable_gradient_n2: Array<any>;
  constant_pressure_other_gases: number;
  outputProfileGasRuntime: Array<any>;
  minimum_profile_depth: Array<any>;
  current_dive_number: number;
  run_bailout: boolean;
  metabolic_o2_consumption: number;
  rmv: number;
  tissues: Array<any> = [];
  descentppO2: number;
  //standard BUHL preferences
  pref: BuhlPref = new BuhlPref();
  diveBuhlmann: DiveBuhlmann = new DiveBuhlmann();

  constructor() {
    this.configuration = "OC"; // oc, pSCR, ccr
    this.conservatism = 2; // 0 to 4,
    this.deco_gas_switch_time = 1.0;
    this.lastStop6m20ft = false;
    this.altitude_dive_algorithm = "off";
    this.minimum_deco_stop_time = 1.0;
    this.critical_volume_algorithm = "on";
    this.diver_acclimatized_at_altitude = "no";
    this.starting_acclimatized_altitude = 0.0;
    this.ascent_to_altitude_hours = 2.0;
    this.hours_at_altitude_before_dive = 3.0;
    //LP change multiplier to brinh He = N2
    this.helium_half_time_multiplier = 0;
    this.descentppO2 = 0.7;
    //VPM GFS params
    this.VPM_gf_high = 90;
    this.VPM_GFS = false;

    /* set units */
    let units = "Metric";
    this.setUnits(units);

    this.dive_no = 0;

    /* CCR setpoints */
    this.bottomMixSetPoint = new Array();
    this.decoMixSetPoint = new Array();
    this.decoMixUseDiluentGas = new Array();

    /* Deco Mixes */
    this.decoMixfO2 = new Array();
    this.decoMixfHe = new Array();
    this.decoMOD = new Array();

    /* Bottom Mixes */
    this.bottomMixfO2 = new Array();
    this.bottomMixfHe = new Array();

    /* Profile */
    this.profileDepth = new Array();
    this.profileTime = new Array();
    this.profileMix = new Array();
    this.profileDecAccSpeed = new Array();

    this.surfaceIntervals = new Array();

    /* Output Data */
    this.outputProfileDepth = new Array();
    this.outputProfileTime = new Array();
    this.outputProfileSegmentTime = new Array();
    this.outputProfileSegmentType = new Array();
    this.outputProfileMixO2 = new Array();
    this.outputProfileMixHe = new Array();
    this.outputProfileGas = new Array();
    this.outputProfileCounter = 0;
    this.decoProfileCalculated = false;
    this.outputStartOfDecoDepth = new Array();
    this.firstDecoProfilePoint = null;
    this.firstDecoPoint = new Array();

    this.deco_ceiling_depth = null;
    this.ascent_ceiling_depth = null;
    this.deco_stop_depth = null;
    this.next_deco_stop_depth = null;
    this.err = null;

    /* temp lets to simplify UNFMTLISTs */
    this.fO2 = null;
    this.fHe = null;
    this.fN2 = null;
    this.dc = null;
    this.rc = null;
    this.ssc = null;
    this.mc = null;

    /* Common Block Declarations */
    this.water_vapor_pressure = null;
    this.run_time = null;
    this.segment_number = null;
    this.segment_time = null;
    this.ending_ambient_pressure = null;
    this.mix_number = null;
    this.barometric_pressure = null;
    this.units_equal_fsw = null;
    this.units_equal_msw = null;
    this.units_factor = null;
    this.helium_time_constant = new Array();
    this.nitrogen_time_constant = new Array();
    this.helium_pressure = new Array();
    this.nitrogen_pressure = new Array();
    this.fraction_helium = new Array();
    this.fraction_nitrogen = new Array();
    this.fraction_pO2SetPoint = new Array();
    this.fraction_useDiluentGas = new Array();
    this.initial_critical_radius_he = new Array();
    this.initial_critical_radius_n2 = new Array();
    this.adjusted_critical_radius_he = new Array();
    this.adjusted_critical_radius_n2 = new Array();
    this.max_crushing_pressure_he = new Array();
    this.max_crushing_pressure_n2 = new Array();
    this.surface_phase_volume_time = new Array();
    this.max_actual_gradient = new Array();
    this.amb_pressure_onset_of_imperm = new Array();
    this.gas_tension_onset_of_imperm = new Array();
    this.initial_helium_pressure = new Array();
    this.initial_nitrogen_pressure = new Array();
    this.regenerated_radius_he = new Array();
    this.regenerated_radius_n2 = new Array();
    this.adjusted_crushing_pressure_he = new Array();
    this.adjusted_crushing_pressure_n2 = new Array();
    this.allowable_gradient_he = new Array();
    this.allowable_gradient_n2 = new Array();
    this.deco_gradient_he = new Array();
    this.deco_gradient_n2 = new Array();
    this.initial_allowable_gradient_he = new Array();
    this.initial_allowable_gradient_n2 = new Array();
    this.constant_pressure_other_gases = null;
  }

  setUnits(units) {
    if (units === "Imperial") {
      this.units = "ft";
      this.altitude_of_dive = 3300.0;
      /* Final ascent data */
      this.decoStepSize = 10;
      this.finalAscentSpeed = -30;
    } else {
      this.units = "mt";
      this.altitude_of_dive = 1000.0;
      /* Final ascent data */
      this.decoStepSize = 3;
      this.finalAscentSpeed = -9;
    }
    this.pref.setUnitsTo(units == "Metric" ? 0 : 1);
  }

  newMission() {
    /* Reset all VARIABLES and create arrays */
    let i, j;

    for (i = 0; i <= this.MAX_DECO_MIXES; i++) {
      if (!Array.isArray(this.decoMixfO2[i])) this.decoMixfO2[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.decoMixfO2[i][j] = -1;
      if (!Array.isArray(this.decoMixfHe[i])) this.decoMixfHe[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.decoMixfHe[i][j] = -1;
      if (!Array.isArray(this.decoMOD[i])) this.decoMOD[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.decoMOD[i][j] = -1;

      /* CCR setpoints */
      if (!Array.isArray(this.decoMixSetPoint[i]))
        this.decoMixSetPoint[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.decoMixSetPoint[i][j] = -1;
      /* CCR diluent gases */
      if (!Array.isArray(this.decoMixUseDiluentGas[i]))
        this.decoMixUseDiluentGas[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++)
        this.decoMixUseDiluentGas[i][j] = -1;
    }

    for (i = 0; i <= this.MAX_BOTTOM_MIXES; i++) {
      if (!Array.isArray(this.bottomMixfO2[i]))
        this.bottomMixfO2[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.bottomMixfO2[i][j] = -1;
      if (!Array.isArray(this.bottomMixfHe[i]))
        this.bottomMixfHe[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.bottomMixfHe[i][j] = -1;

      /* CCR setpoints */
      if (!Array.isArray(this.bottomMixSetPoint[i]))
        this.bottomMixSetPoint[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.bottomMixSetPoint[i][j] = -1;
    }

    for (i = 0; i <= this.MAX_PROFILE_POINTS; i++) {
      if (!Array.isArray(this.profileDepth[i]))
        this.profileDepth[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.profileDepth[i][j] = -1;
      if (!Array.isArray(this.profileTime[i]))
        this.profileTime[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.profileTime[i][j] = -1;
      if (!Array.isArray(this.profileMix[i])) this.profileMix[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.profileMix[i][j] = -1;
      if (!Array.isArray(this.profileDecAccSpeed[i]))
        this.profileDecAccSpeed[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.profileDecAccSpeed[i][j] = -1;
    }

    for (i = 0; i <= this.MAX_OUTPUT_POINTS; i++) {
      if (!Array.isArray(this.outputProfileDepth[i]))
        this.outputProfileDepth[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.outputProfileDepth[i][j] = -1;
      if (!Array.isArray(this.outputProfileTime[i]))
        this.outputProfileTime[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.outputProfileTime[i][j] = -1;
      if (!Array.isArray(this.outputProfileSegmentTime[i]))
        this.outputProfileSegmentTime[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++)
        this.outputProfileSegmentTime[i][j] = -1;
      if (!Array.isArray(this.outputProfileSegmentType[i]))
        this.outputProfileSegmentType[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++)
        this.outputProfileSegmentType[i][j] = -1;
      if (!Array.isArray(this.outputProfileMixO2[i]))
        this.outputProfileMixO2[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.outputProfileMixO2[i][j] = -1;
      if (!Array.isArray(this.outputProfileMixHe[i]))
        this.outputProfileMixHe[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.outputProfileMixHe[i][j] = -1;
      if (!Array.isArray(this.outputProfileGas[i]))
        this.outputProfileGas[i] = new Array();
      for (j = 0; j <= this.MAX_DIVES; j++) this.outputProfileGas[i][j] = -1;
    }

    this.outputProfileGasRuntime = new Array();
    for (j = 0; j <= this.MAX_DIVES; j++) this.outputProfileGasRuntime[j] = {};

    //minimum profile depths
    this.minimum_profile_depth = new Array();
    for (j = 0; j <= this.MAX_DIVES; j++)
      this.minimum_profile_depth[j] = 10000000;

    this.dive_no = 0;
    this.decoProfileCalculated = false;
  }

  addSurfaceInterval(interval) {
    if (this.dive_no < this.MAX_DIVES - 1) {
      this.dive_no++;
      this.surfaceIntervals[this.dive_no] = interval;
      return this.dive_no;
    }
    return -1;
  }

  addBottomMix(fO2, fHe, setpoint) {
    // add new bottom mix to deco mix list
    // returnes index>=0 if OK and -1 if not
    // posible errors:
    //         fO2+fHe>1
    //         fO2<0.01
    //         fHe<0
    //         the number of mixes already added > this.MAX_BOTTOM_MIXES
    let i;
    if (fO2 + fHe > 1 || fO2 < 0.01 || fHe < 0) return -1;

    for (i = 0; i < this.MAX_BOTTOM_MIXES; i++) {
      if (this.bottomMixfO2[i][this.dive_no] == -1) {
        // found empty spot
        this.bottomMixfO2[i][this.dive_no] = fO2;
        this.bottomMixfHe[i][this.dive_no] = fHe;

        /* add CCR setpoint for this depth/mix */
        this.bottomMixSetPoint[i][this.dive_no] = setpoint;

        return i;
      }
    }
    return -1;
  }

  addDecoMix(fO2, fHe, mod, setpoint, useAsDiluent) {
    // add new deco mix to deco mix list
    // mixes must be added deepest mod first
    // returnes index>=0 if OK and -1 if not
    // posible errors:
    //         fO2+fHe>1
    //         fO2<0.01
    //         fHe<0
    //         the number of mixes already added > this.MAX_BOTTOM_MIXES
    //         shalower mod exists in deco mix list

    let i;

    if (fO2 + fHe > 1 || fO2 < 0.01 || fHe < 0) return -1;

    for (i = 0; i < this.MAX_DECO_MIXES; i++) {
      if (i > 0 && mod >= this.decoMOD[i - 1][this.dive_no]) return -1;
      if (this.decoMixfO2[i][this.dive_no] == -1) {
        // found empty spot
        this.decoMixfO2[i][this.dive_no] = fO2;
        this.decoMixfHe[i][this.dive_no] = fHe;
        this.decoMOD[i][this.dive_no] = mod;

        /* add CCR setpoint and diluent for this depth/mix */
        this.decoMixSetPoint[i][this.dive_no] = setpoint;
        this.decoMixUseDiluentGas[i][this.dive_no] = useAsDiluent;

        return i;
      }
    }
    return -1;
  }

  addProfilePoint(depth, time, speed, mix) {
    // add new deco profile point to dive profile
    // profile points must be added from earlier one to later one
    // mix must be added with addBottomMix() metode
    // speed must be positive for descent and negative for ascent
    // returnes index>=0 if OK and -1 if not
    // posible errors:
    //         depth <=0
    //         mix not existent
    //         speed is 0 or wrong signed
    //         later time point already exists in dive profile
    //         no emty spot left
    let i;

    if (depth < 0 || mix < 0 || mix >= this.MAX_DECO_MIXES) return -1;
    for (i = 0; i < this.MAX_PROFILE_POINTS; i++) {
      if (this.profileDepth[i][this.dive_no] == -1) {
        // found empty spot
        //            if ((i!=0) && (time <= this.profileTime[i-1][this.dive_no]))
        //                return -1;
        if (
          i != 0 &&
          depth < this.profileDepth[i - 1][this.dive_no] &&
          speed >= 0
        )
          return -1;
        if (
          i != 0 &&
          depth > this.profileDepth[i - 1][this.dive_no] &&
          speed <= 0
        )
          return -1;
        if (i == 0 && speed <= 0) return -1;
        this.profileDepth[i][this.dive_no] = depth;
        this.profileTime[i][this.dive_no] = time;
        this.profileMix[i][this.dive_no] = mix;
        this.profileDecAccSpeed[i][this.dive_no] = speed;

        this.minimum_profile_depth[this.dive_no] =
          this.minimum_profile_depth[this.dive_no] < depth
            ? this.minimum_profile_depth[this.dive_no]
            : depth;

        return i;
      }
    }

    return 1; //-1;
  }

  getProfilePoint(index, parameter, dive) {
    // returnes profile point depth, time, f02 or fHe from calculated dive-deco profile
    // returnes profile point parameter>=0 if OK and -1 if not
    // posible errors:
    //          index too big
    //          wrong parameter
    //          dive-deco profile not yet calculated
    if (
      this.decoProfileCalculated == false ||
      index >= this.MAX_OUTPUT_POINTS ||
      dive >= this.MAX_DIVES
    )
      return -1;
    if (this.outputProfileDepth[index][dive] == -1) return -1;

    switch (parameter) {
      case 1:
        return this.outputProfileDepth[index][dive];
      case 2:
        return this.outputProfileTime[index][dive];
      case 3:
        return this.outputProfileSegmentTime[index][dive];
      case 4:
        return this.outputProfileMixO2[index][dive];
      case 5:
        return this.outputProfileMixHe[index][dive];
      case 6:
        return this.outputProfileSegmentType[index][dive];
    }
    return -1;
  }

  addInspiredGasRuntime(fHe, fN2, time) {
    if (
      !this.outputProfileGasRuntime[this.current_dive_number][fHe + "/" + fN2]
    )
      this.outputProfileGasRuntime[this.current_dive_number][fHe + "/" + fN2] =
        0;
    this.outputProfileGasRuntime[this.current_dive_number][fHe + "/" + fN2] +=
      time;
  }

  getProfileGasIndex(index, dive) {
    // returnes the index of the mix used on a given dive point
    // returnes profile point parameter>=0 if OK and -1 if not
    // posible errors:
    //          index too big
    //          wrong parameter
    //          dive-deco profile not yet calculated
    if (
      this.decoProfileCalculated == false ||
      index >= this.MAX_OUTPUT_POINTS ||
      dive >= this.MAX_DIVES
    )
      return -1;
    if (this.outputProfileDepth[index][dive] == -1) return -1;
    return this.outputProfileGas[index][dive];
  }

  runVPM(decoProfile: any, bailout: boolean) {
    this.newMission();
    this.run_bailout = bailout;
    // list of all the diferent mixes used in this dive
    let scope = decoProfile;
    scope.diveMixO2 = new Array();
    scope.diveMixHe = new Array();
    scope.diveMixSetPoint = new Array();
    scope.diveMixUseDiluentGas = new Array();
    scope.diveGas = new Array();
    let dive_num = 0;
    scope.noBottomMix = new Array(); // number of bottom mixes

    // set parameters
    this.decoStepSize = decoProfile.parameters.decoStepSize;
    this.descentppO2 = decoProfile.parameters.descentppO2;
    this.conservatism = bailout
      ? decoProfile.parameters.conservatism_bailout
      : decoProfile.parameters.conservatism;
    this.configuration = decoProfile.parameters.configuration;
    this.deco_gas_switch_time =
      decoProfile.parameters.time_at_gas_switch_for_min_gas;
    this.lastStop6m20ft = decoProfile.parameters.lastStop6m20ft;
    this.critical_volume_algorithm = decoProfile.parameters
      .critical_volume_algorithm
      ? "on"
      : "off";
    this.altitude_dive_algorithm =
      decoProfile.parameters.altitude_dive_algorithm;
    this.altitude_of_dive = decoProfile.parameters.altitude_of_dive;
    this.ascent_to_altitude_hours =
      decoProfile.parameters.ascent_to_altitude_hours;
    this.hours_at_altitude_before_dive =
      decoProfile.parameters.hours_at_altitude_before_dive;
    this.metabolic_o2_consumption =
      decoProfile.parameters.metabolic_o2_consumption;
    this.rmv = decoProfile.parameters.rmvBottom;
    this.helium_half_time_multiplier = parseFloat(
      decoProfile.parameters.helium_half_time_multiplier
    );
    this.VPM_GFS = decoProfile.parameters.VPM_GFS;
    this.VPM_gf_high = decoProfile.parameters.VPM_gf_high;
    let outputText;
    let mix, rate;

    for (
      let i = 0;
      i < this.MAX_BOTTOM_MIXES + decoProfile.parameters.MAX_DECOMIX;
      i++ // clear the table
    ) {
      for (let j = 0; j < this.MAX_DIVES; j++) {
        if (!Array.isArray(scope.diveMixO2[i]))
          scope.diveMixO2[i] = new Array();
        scope.diveMixO2[i][j] = -1;
        if (!Array.isArray(scope.diveMixHe[i]))
          scope.diveMixHe[i] = new Array();
        scope.diveMixHe[i][j] = -1;
        if (!Array.isArray(scope.diveMixSetPoint[i]))
          scope.diveMixSetPoint[i] = new Array();
        scope.diveMixSetPoint[i][j] = -1;
        if (!Array.isArray(scope.diveMixUseDiluentGas[i]))
          scope.diveMixUseDiluentGas[i] = new Array();
        scope.diveMixUseDiluentGas[i][j] = -1;
      }
      scope.diveGas[i] = 0;
    }
    for (dive_num = 0; dive_num < this.MAX_DIVES; dive_num++) {
      scope.noBottomMix[dive_num] = 0;
      for (let i = 0; i < decoProfile.parameters.MAX_DIVEPONTS; i++) {
        // add profile point
        if (decoProfile.profilePointDepth[i][dive_num] < 0) {
          // no more points to add
          if (i == 0) {
            /* if no dive points in this dive */
            let mix = this.addBottomMix(0.21, 0, 0);
            this.addProfilePoint(
              0,
              0,
              parseFloat(decoProfile.parameters.descentRate),
              mix
            );
          }
          break;
        }

        // add mix to mix table
        for (let j = 0; true; j++) {
          if (j == this.MAX_BOTTOM_MIXES) {
            outputText += "Max. number of bottom mixes exceded - " + j;
            console.log("1", outputText);
            return;
          }
          if (scope.diveMixO2[j][dive_num] == -1) {
            // found empty spot
            mix = this.addBottomMix(
              decoProfile.profilePointMixO2[i][dive_num] / 100,
              decoProfile.profilePointMixHe[i][dive_num] / 100,
              decoProfile.profilePointMixSetPoint[i][dive_num]
            );
            if (mix < 0) {
              outputText +=
                "Internal ERROR 1: mix=" + mix + "divepoint=" + i + "\n";
              console.log("2", outputText);
              return;
            }
            scope.diveMixO2[mix][dive_num] =
              decoProfile.profilePointMixO2[i][dive_num];
            scope.diveMixHe[mix][dive_num] =
              decoProfile.profilePointMixHe[i][dive_num];
            scope.diveMixSetPoint[mix][dive_num] =
              decoProfile.profilePointMixSetPoint[i][dive_num];
            //bottom phase
            scope.diveMixUseDiluentGas[mix][dive_num] = true;

            break;
          }
          if (
            decoProfile.profilePointMixO2[i][dive_num] ==
              scope.diveMixO2[j][dive_num] &&
            decoProfile.profilePointMixHe[i][dive_num] ==
              scope.diveMixHe[j][dive_num]
          ) {
            // mix like this already added
            mix = j;
            break;
          }
        }
        if (mix > scope.noBottomMix[dive_num])
          scope.noBottomMix[dive_num] = mix;

        if (i == 0)
          // if first point rate eq descent rate
          rate = parseFloat(decoProfile.parameters.descentRate);
        else if (
          decoProfile.profilePointDepth[i][dive_num] >
          decoProfile.profilePointDepth[i - 1][dive_num]
        )
          // descent
          rate = parseFloat(decoProfile.parameters.descentRate);
        // ascent
        else rate = -parseFloat(decoProfile.parameters.ascentRate);

        if (
          this.addProfilePoint(
            decoProfile.profilePointDepth[i][dive_num],
            decoProfile.profilePointRT[i][dive_num],
            rate,
            mix
          ) < 0
        ) {
          outputText += "Internal ERROR 2\n";
          console.log("3", outputText);
          return;
        }
      }
      for (let i = 0; i < decoProfile.parameters.MAX_DECOMIX; i++) {
        if (decoProfile.decomixfromdepth[i][dive_num] < 0) break;
        let ret = this.addDecoMix(
          decoProfile.decomixO2[i][dive_num] / 100,
          decoProfile.decomixHe[i][dive_num] / 100,
          decoProfile.decomixfromdepth[i][dive_num],
          decoProfile.decomixSetPoint[i][dive_num],
          decoProfile.decomixUseDiluentGas[i][dive_num]
        );
        if (ret < 0) {
          outputText +=
            "Internal ERROR 0: " +
            decoProfile.decomixO2[i][dive_num] / 100 +
            "-" +
            decoProfile.decomixHe[i][dive_num] / 100;
          console.log("4", outputText);
          return;
        }
        scope.diveMixO2[scope.noBottomMix[dive_num] + 1 + i][dive_num] =
          decoProfile.decomixO2[i][dive_num];
        scope.diveMixHe[scope.noBottomMix[dive_num] + 1 + i][dive_num] =
          decoProfile.decomixHe[i][dive_num];
        scope.diveMixSetPoint[scope.noBottomMix[dive_num] + 1 + i][dive_num] =
          decoProfile.decomixSetPoint[i][dive_num];
        scope.diveMixUseDiluentGas[scope.noBottomMix[dive_num] + 1 + i][
          dive_num
        ] = decoProfile.decomixUseDiluentGas[i][dive_num];
      }

      if (dive_num < this.MAX_DIVES - 1)
        if (
          this.addSurfaceInterval(decoProfile.surfaceIntervals[dive_num + 1]) <
          0
        ) {
          /* not on the last dive */
          outputText += "Internal ERROR 0.1: " + dive_num;
          console.log("5", outputText);
        }
    } /* dive_num */

    this.finalAscentSpeed = -parseFloat(decoProfile.parameters.ascentRate);
    let rv = this.calculate(); // HORAY
    if (rv < -1) {
      console.log(
        "Dive #" +
          (-rv / 100 + 1) +
          " Dive Point " +
          ((-rv % 100) + 1) +
          " to deep\n"
      );
      return false;
    } else if (rv < 0) {
      console.log("VPM Internal ERROR 3");
      return false;
    }
    return true;
  }

  calculate() {
    /* =============================================================================== */
    /*     ASSIGN HALF-TIME VALUES TO BUHLMANN COMPARTMENT ARRAYS */
    /* =============================================================================== */
    /* Initialized data */
    let half_time_lets = [
      [1.88, 5.0],
      [3.02, 8.0],
      [4.72, 12.5],
      [6.99, 18.5],
      [10.21, 27.0],
      [14.48, 38.3],
      [20.53, 54.3],
      [29.11, 77.0],
      [41.2, 109.0],
      [55.19, 146.0],
      [70.69, 187.0],
      [90.34, 239.0],
      [115.29, 305.0],
      [147.42, 390.0],
      [188.24, 498.0],
      [240.03, 635.0],
    ];

    let helium_half_time_let_h = [];
    let nitrogen_half_time_let_h = [];
    for (let i = 0; i < 16; i++) {
      if (this.helium_half_time_multiplier >= 0) {
        helium_half_time_let_h[i] =
          ((half_time_lets[i][1] - half_time_lets[i][0]) / 10.1) *
          this.helium_half_time_multiplier; // 0 = original - 10 = He == N2
        nitrogen_half_time_let_h[i] = 0;
      } else {
        helium_half_time_let_h[i] = 0;
        nitrogen_half_time_let_h[i] =
          ((half_time_lets[i][1] - half_time_lets[i][0]) / 10.1) *
          this.helium_half_time_multiplier; // 0 = original - -10 = N2 == He
      }
    }

    //create Buhlmann tissues for charts analysis
    for (let c = 0; c < 16; c++) {
      // create and initialise compartments
      this.tissues[c] = new Compartment(
        this.pref,
        this.diveBuhlmann.getAmbientPress()
      );
      this.tissues[c].setPpHe(0.0); // Set initial ppHe = 0.0
      this.tissues[c].setPpN2(
        0.79 * (this.diveBuhlmann.getAmbientPress() - this.pref.getPH2O())
      ); // Set ppN2 = Ambient - ppH2O
    }

    let helium_half_time = new Array(
      1.88 + helium_half_time_let_h[0],
      3.02 + helium_half_time_let_h[1],
      4.72 + helium_half_time_let_h[2],
      6.99 + helium_half_time_let_h[3],
      10.21 + helium_half_time_let_h[4],
      14.48 + helium_half_time_let_h[5],
      20.53 + helium_half_time_let_h[6],
      29.11 + helium_half_time_let_h[7],
      41.2 + helium_half_time_let_h[8],
      55.19 + helium_half_time_let_h[9],
      70.69 + helium_half_time_let_h[10],
      90.34 + helium_half_time_let_h[11],
      115.29 + helium_half_time_let_h[12],
      147.42 + helium_half_time_let_h[13],
      188.24 + helium_half_time_let_h[14],
      240.03 + helium_half_time_let_h[15]
    );

    let nitrogen_half_time = new Array(
      5 + nitrogen_half_time_let_h[0],
      8 + nitrogen_half_time_let_h[1],
      12.5 + nitrogen_half_time_let_h[2],
      18.5 + nitrogen_half_time_let_h[3],
      27 + nitrogen_half_time_let_h[4],
      38.3 + nitrogen_half_time_let_h[5],
      54.3 + nitrogen_half_time_let_h[6],
      77 + nitrogen_half_time_let_h[7],
      109 + nitrogen_half_time_let_h[8],
      146 + nitrogen_half_time_let_h[9],
      187 + nitrogen_half_time_let_h[10],
      239 + nitrogen_half_time_let_h[11],
      305 + nitrogen_half_time_let_h[12],
      390 + nitrogen_half_time_let_h[13],
      498 + nitrogen_half_time_let_h[14],
      635 + nitrogen_half_time_let_h[15]
    );

    let i1, r1;
    (this.critical_radius_n2_microns =
      this.critical_radius_n2_microns_basic + this.conservatism / 20),
      (this.critical_radius_he_microns =
        this.critical_radius_he_microns_basic + this.conservatism / 20);

    /* Local VARIABLES */
    let fraction_oxygen = new Array(),
      run_time_end_of_segment,
      rate,
      n2_pressure_start_of_ascent = new Array(),
      depth_change = new Array(),
      altitude_dive_algorithm_off,
      ending_depth,
      run_time_start_of_deco_zone,
      deepest_possible_stop_depth,
      he_pressure_start_of_ascent = new Array(),
      altitude_of_dive,
      step_size_change = new Array(),
      i,
      j,
      first_stop_depth,
      depth,
      depth_start_of_deco_zone,
      run_time_start_of_ascent,
      number_of_changes,
      stop_time,
      step_size,
      //next_stop,
      last_run_time,
      phase_volume_time = new Array(),
      surface_interval_time,
      mix_change = new Array();

    let critical_volume_algorithm_off,
      schedule_converged,
      starting_depth,
      deco_phase_volume_time,
      rate_change = new Array(),
      last_phase_volume_time = new Array(),
      n2_pressure_start_of_deco_zone = new Array(),
      critical_volume_comparison,
      segment_number_start_of_ascent,
      rounding_operation,
      rounding_operation2,
      he_pressure_start_of_deco_zone = new Array(),
      lastDivePointDepth = 0,
      noOfDecoMixes,
      noOfBottomMixes,
      min_deco_stop_time = 0;
    this.current_dive_number = 0;

    // JURE multilevel START
    let checkForDecoMix = true;
    // JURE multilevel END

    /* =============================================================================== */
    /*     READ IN PROGRAM SETTINGS AND CHECK FOR ERRORS */
    /*     IF THERE ARE ERRORS, WRITE AN ERROR MESSAGE AND TERMINATE PROGRAM */
    /* =============================================================================== */

    if (this.units == "ft" || this.units == "FT") {
      this.units_equal_fsw = true;
      this.units_equal_msw = false;
    } else if (this.units == "mt" || this.units == "MT") {
      this.units_equal_fsw = false;
      this.units_equal_msw = true;
    } else {
      return -1;
    }
    if (
      this.altitude_dive_algorithm == "ON" ||
      this.altitude_dive_algorithm == "on"
    ) {
      altitude_dive_algorithm_off = false;
    } else {
      altitude_dive_algorithm_off = true;
    }

    if (
      this.critical_radius_n2_microns < 0.2 ||
      this.critical_radius_n2_microns > 1.35
    ) {
      console.log(
        "critical_radius_n2_microns out of range",
        this.critical_radius_n2_microns
      );
      return -1;
    }
    if (
      this.critical_radius_he_microns < 0.2 ||
      this.critical_radius_he_microns > 1.35
    ) {
      console.log(
        "critical_radius_he_microns out of range",
        this.critical_radius_he_microns
      );
      return -1;
    }
    if (
      this.critical_volume_algorithm == "ON" ||
      this.critical_volume_algorithm == "on"
    ) {
      critical_volume_algorithm_off = false;
    } else {
      critical_volume_algorithm_off = true;
    }

    /* =============================================================================== */
    /*     INITIALIZE CONSTANTS/VARIABLES BASED ON SELECTION OF UNITS - FSW OR MSW */
    /*     fsw = feet of seawater, a unit of pressure */
    /*     msw = meters of seawater, a unit of pressure */
    /* =============================================================================== */

    if (this.units_equal_fsw) {
      this.units_factor = 33;
      this.water_vapor_pressure = 1.607; /* (Schreiner value)  based on respiratory quotient */
    } else {
      this.units_factor = 10.1325;
      this.water_vapor_pressure = 0.493; /* (Schreiner value)  based on respiratory quotien */
    }

    /* =============================================================================== */
    /*     INITIALIZE CONSTANTS/VARIABLES */
    /* =============================================================================== */

    this.constant_pressure_other_gases =
      (this.pressure_other_gases_mmhg / 760) * this.units_factor;
    this.run_time = 0;
    this.segment_number = 0;
    for (i = 1; i <= 16; ++i) {
      /* NOTE: equal to BUHL 
		  this.kHe=this.LOG2/hHe;   // Time constants
	   this.kN2=this.LOG2/hN2; */
      this.helium_time_constant[i - 1] = Math.log(2) / helium_half_time[i - 1];
      this.nitrogen_time_constant[i - 1] =
        Math.log(2) / nitrogen_half_time[i - 1];
      this.max_crushing_pressure_he[i - 1] = 0;
      this.max_crushing_pressure_n2[i - 1] = 0;
      this.max_actual_gradient[i - 1] = 0;
      this.surface_phase_volume_time[i - 1] = 0;
      this.amb_pressure_onset_of_imperm[i - 1] = 0;
      this.gas_tension_onset_of_imperm[i - 1] = 0;
      this.initial_critical_radius_n2[i - 1] =
        this.critical_radius_n2_microns * 1e-6;
      this.initial_critical_radius_he[i - 1] =
        this.critical_radius_he_microns * 1e-6;
    }

    /* =============================================================================== */
    /*     INITIALIZE VARIABLES FOR SEA LEVEL OR ALTITUDE DIVE */
    /*     See subroutines for explanation of altitude calculations.  Purposes are */
    /*     1) to determine barometric pressure and 2) set or adjust the VPM critical */
    /*     radius VARIABLES and gas loadings, as applicable, based on altitude, */
    /*     ascent to altitude before the dive, and time at altitude before the dive */
    /* =============================================================================== */

    if (altitude_dive_algorithm_off) {
      altitude_of_dive = 0;
      this.calc_barometric_pressure(altitude_of_dive);

      for (i = 1; i <= 16; ++i) {
        this.adjusted_critical_radius_n2[i - 1] =
          this.initial_critical_radius_n2[i - 1];
        this.adjusted_critical_radius_he[i - 1] =
          this.initial_critical_radius_he[i - 1];
        this.helium_pressure[i - 1] = 0;
        this.nitrogen_pressure[i - 1] =
          (this.barometric_pressure - this.water_vapor_pressure) * 0.79;
      }
    } else {
      this.vpm_altitude_dive_algorithm();
    }

    /* =============================================================================== */
    /*     START OF REPETITIVE DIVE LOOP */
    /*     This is the largest loop in the main program and operates between Lines */
    /*     30 and 330.  If there is one or more repetitive dives, the program will */
    /*     return to this point to process each repetitive dive. */
    /* =============================================================================== */
    /* L30: */
    while (true) {
      /* until there is an break statement */
      /* loop will run continuous */
      this.outputProfileCounter = 0;
      run_time_end_of_segment = 0;
      /* =============================================================================== */
      /*     INPUT DIVE DESCRIPTION AND GAS MIX DATA FROM ASCII TEXT INPUT FILE */
      /*     BEGIN WRITING HEADINGS/OUTPUT TO ASCII TEXT OUTPUT FILE */
      /*     See separate explanation of format for input file. */
      /* =============================================================================== */

      for (i = 1; i <= this.MAX_BOTTOM_MIXES; ++i) {
        if (this.bottomMixfO2[i - 1][this.current_dive_number] < 0) break;
        /* === CCR NOTE: insert pO2 fractions  ===== */
        fraction_oxygen[i - 1] =
          this.bottomMixfO2[i - 1][this.current_dive_number];
        this.fraction_helium[i - 1] =
          this.bottomMixfHe[i - 1][this.current_dive_number];
        this.fraction_nitrogen[i - 1] =
          1 -
          this.bottomMixfO2[i - 1][this.current_dive_number] -
          this.bottomMixfHe[i - 1][this.current_dive_number];
        this.fraction_pO2SetPoint[i - 1] =
          this.bottomMixSetPoint[i - 1][this.current_dive_number];
        this.fraction_useDiluentGas[i - 1] = true;
      }
      noOfBottomMixes = i - 1;

      for (j = 1; j <= this.MAX_DECO_MIXES; ++j) {
        if (this.decoMixfO2[j - 1][this.current_dive_number] < 0) break;
        /* === CCR NOTE: insert pO2 fractions  ===== */
        fraction_oxygen[i + j - 2] =
          this.decoMixfO2[j - 1][this.current_dive_number];
        this.fraction_helium[i + j - 2] =
          this.decoMixfHe[j - 1][this.current_dive_number];
        this.fraction_nitrogen[i + j - 2] =
          1 -
          this.decoMixfO2[j - 1][this.current_dive_number] -
          this.decoMixfHe[j - 1][this.current_dive_number];
        if (this.run_bailout) {
          this.fraction_pO2SetPoint[i + j - 2] = 0;
          this.fraction_useDiluentGas[i + j - 2] = true;
        } else {
          this.fraction_pO2SetPoint[i + j - 2] =
            this.decoMixSetPoint[j - 1][this.current_dive_number];
          this.fraction_useDiluentGas[i + j - 2] =
            this.decoMixUseDiluentGas[j - 1][this.current_dive_number];
        }
      }
      noOfDecoMixes = j - 1;

      /* =============================================================================== */
      /*     DIVE PROFILE LOOP - INPUT DIVE PROFILE DATA FROM ASCII TEXT INPUT FILE */
      /*     AND PROCESS DIVE AS A SERIES OF ASCENT/DESCENT AND CONSTANT DEPTH */
      /*     SEGMENTS.  THIS ALLOWS FOR MULTI-LEVEL DIVES AND UNUSUAL PROFILES.  UPDATE */
      /*     GAS LOADINGS FOR EACH SEGMENT.  IF IT IS A DESCENT SEGMENT, CALC CRUSHING */
      /*     PRESSURE ON CRITICAL RADII IN EACH COMPARTMENT. */
      /*     "Instantaneous" descents are not used in the this.  All ascent/descent */
      /*     segments must have a realistic rate of ascent/descent.  Unlike Haldanian */
      /*     models, the VPM is actually more conservative when the descent rate is */
      /*     slower becuase the effective crushing pressure is reduced.  Also, a */
      /*     realistic actual supersaturation gradient must be calculated during */
      /*     ascents as this affects critical radii adjustments for repetitive dives. */
      /*     Profile codes: 1 = Ascent/Descent, 2 = Constant Depth, 99 = Decompress */
      /* =============================================================================== */
      i = 0;
      deepest_possible_stop_depth = -1; // JURE multilevel
      while (true) {
        /* until there is an exit statement loop will run continuous */
        if (this.profileDepth[i][this.current_dive_number] < 0) break;
        // JURE multilevel START - end when the first dive shalower then deepest possible deco stop
        if (
          this.profileDepth[i][this.current_dive_number] <
          deepest_possible_stop_depth
        )
          break;
        // JURE multilevel END

        /* Ascent - Descent */

        if (i == 0) {
          this.mix_number = this.profileMix[i][this.current_dive_number] + 1;
          starting_depth = 0;
        } else {
          this.mix_number =
            this.profileMix[i - 1][this.current_dive_number] + 1;
          starting_depth = this.profileDepth[i - 1][this.current_dive_number];
        }
        ending_depth = this.profileDepth[i][this.current_dive_number];
        rate = this.profileDecAccSpeed[i][this.current_dive_number];
        this.gas_loadings_ascent_descent(starting_depth, ending_depth, rate);
        if (ending_depth > starting_depth) {
          this.calc_crushing_pressure(starting_depth, ending_depth, rate);
        }

        /* Descent Segments */

        if (i >= 0) {
          this.outputProfileDepth[this.outputProfileCounter][
            this.current_dive_number
          ] = ending_depth;
          this.outputProfileTime[this.outputProfileCounter][
            this.current_dive_number
          ] = this.run_time;
          this.outputProfileSegmentTime[this.outputProfileCounter][
            this.current_dive_number
          ] = this.segment_time;
          if (starting_depth < ending_depth) {
            //add bottom phase descent segment
            this.outputProfileSegmentType[this.outputProfileCounter][
              this.current_dive_number
            ] = "descent";
          } else {
            //add bottom phase ascent segment
            this.outputProfileSegmentType[this.outputProfileCounter][
              this.current_dive_number
            ] = "bottom_ascent";
          }

          /* CCR calc real gas */
          let bailout = false;
          if (i == 0) {
            bailout = this.run_bailout;
          }
          //force bailout to off for the descent - then set ot on again
          if (bailout) this.run_bailout = false;
          let fractions = this.calc_inspired_gas(
            ending_depth -
              (ending_depth - starting_depth) / 2 +
              this.barometric_pressure,
            this.fraction_helium[this.mix_number - 1],
            this.fraction_nitrogen[this.mix_number - 1],
            starting_depth === 0
              ? this.descentppO2
              : this.fraction_pO2SetPoint[this.mix_number - 1],
            this.fraction_useDiluentGas[this.mix_number - 1],
            this.segment_time
          );
          if (bailout) this.run_bailout = true;
          this.outputProfileMixO2[this.outputProfileCounter][
            this.current_dive_number
          ] = fractions.fraction_oxygen; //fraction_oxygen[this.mix_number-1];
          this.outputProfileMixHe[this.outputProfileCounter][
            this.current_dive_number
          ] = fractions.fraction_helium; // this.fraction_helium[this.mix_number-1];
          //add runtimes for each gas
          this.addInspiredGasRuntime(
            this.fraction_helium[this.mix_number - 1],
            this.fraction_nitrogen[this.mix_number - 1],
            this.segment_time
          );

          this.outputProfileCounter++;
        }

        /* Constant Depth */

        depth = this.profileDepth[i][this.current_dive_number];
        run_time_end_of_segment +=
          this.profileTime[i][this.current_dive_number];
        if (i > 0) {
          // if ascend add ascend time
          if (
            this.profileDepth[i][this.current_dive_number] <
            this.profileDepth[i - 1][this.current_dive_number]
          )
            run_time_end_of_segment += Math.floor(
              (this.profileDepth[i][this.current_dive_number] -
                this.profileDepth[i - 1][this.current_dive_number]) /
                this.profileDecAccSpeed[i][this.current_dive_number]
            );
        }
        this.mix_number = this.profileMix[i][this.current_dive_number] + 1;
        this.gas_loadings_constant_depth(depth, run_time_end_of_segment);
        lastDivePointDepth = ending_depth;
        i++;

        this.outputProfileDepth[this.outputProfileCounter][
          this.current_dive_number
        ] = depth;
        this.outputProfileTime[this.outputProfileCounter][
          this.current_dive_number
        ] = this.run_time;
        this.outputProfileSegmentTime[this.outputProfileCounter][
          this.current_dive_number
        ] = this.segment_time;
        this.outputProfileSegmentType[this.outputProfileCounter][
          this.current_dive_number
        ] = "bottom";

        /* CCR calc real gas */
        let fractions = this.calc_inspired_gas(
          depth + this.barometric_pressure,
          this.fraction_helium[this.mix_number - 1],
          this.fraction_nitrogen[this.mix_number - 1],
          this.fraction_pO2SetPoint[this.mix_number - 1],
          this.fraction_useDiluentGas[this.mix_number - 1],
          this.segment_time
        );
        this.outputProfileMixO2[this.outputProfileCounter][
          this.current_dive_number
        ] = fractions.fraction_oxygen; //fraction_oxygen[this.mix_number-1];
        this.outputProfileMixHe[this.outputProfileCounter][
          this.current_dive_number
        ] = fractions.fraction_helium; // this.fraction_helium[this.mix_number-1];
        //add runtimes for each gas
        this.addInspiredGasRuntime(
          this.fraction_helium[this.mix_number - 1],
          this.fraction_nitrogen[this.mix_number - 1],
          this.segment_time
        );

        this.outputProfileGas[this.outputProfileCounter][
          this.current_dive_number
        ] = this.mix_number - 1;
        // JURE multilevel START - calculate depest deco stop
        depth_start_of_deco_zone = this.calc_start_of_deco_zone(
          depth,
          this.finalAscentSpeed
        );
        if (this.units_equal_fsw) {
          if (this.decoStepSize < 10) {
            rounding_operation =
              depth_start_of_deco_zone / this.decoStepSize - 0.5;
            deepest_possible_stop_depth =
              Math.round(rounding_operation) * this.decoStepSize;
          } else {
            rounding_operation = depth_start_of_deco_zone / 10 - 0.5;
            deepest_possible_stop_depth = Math.round(rounding_operation) * 10;
          }
        }
        if (this.units_equal_msw) {
          if (this.decoStepSize < 3) {
            rounding_operation =
              depth_start_of_deco_zone / this.decoStepSize - 0.5;
            deepest_possible_stop_depth =
              Math.round(rounding_operation) * this.decoStepSize;
          } else {
            rounding_operation = depth_start_of_deco_zone / 3 - 0.5;
            deepest_possible_stop_depth = Math.round(rounding_operation) * 3;
          }
        }
        // JURE multilevel END
        this.outputProfileCounter++;
      }
      if (ending_depth > 0 && i > 0) {
        this.firstDecoProfilePoint = this.outputProfileCounter - 1;
      }

      /* =============================================================================== */
      /*     BEGIN PROCESS OF ASCENT AND DECOMPRESSION */
      /*     First, calculate the regeneration of critical radii that takes place over */
      /*     the dive time.  The regeneration time constant has a time scale of weeks */
      /*     so this will have very little impact on dives of normal length, but will */
      /*     have major impact for saturation dives. */
      /* =============================================================================== */

      this.nuclear_regeneration(this.run_time);

      /* =============================================================================== */
      /*     CALCULATE INITIAL ALLOWABLE GRADIENTS FOR ASCENT */
      /*     This is based on the maximum effective crushing pressure on critical radii */
      /*     in each compartment achieved during the dive profile. */
      /* =============================================================================== */

      this.calc_initial_allowable_gradient();

      /* =============================================================================== */
      /*     SAVE VARIABLES AT START OF ASCENT (END OF BOTTOM TIME) SINCE THESE WILL */
      /*     BE USED LATER TO COMPUTE THE FINAL ASCENT PROFILE THAT IS WRITTEN TO THE */
      /*     OUTPUT FILE. */
      /*     The VPM uses an iterative process to compute decompression schedules so */
      /*     there will be more than one pass through the decompression loop. */
      /* =============================================================================== */

      for (i = 1; i <= 16; ++i) {
        he_pressure_start_of_ascent[i - 1] = this.helium_pressure[i - 1];
        n2_pressure_start_of_ascent[i - 1] = this.nitrogen_pressure[i - 1];
      }
      run_time_start_of_ascent = this.run_time;
      segment_number_start_of_ascent = this.segment_number;

      /* =============================================================================== */
      /*     INPUT PARAMETERS TO BE USED FOR STAGED DECOMPRESSION AND SAVE IN ARRAYS. */
      /*     ASSIGN INITAL PARAMETERS TO BE USED AT START OF ASCENT */
      /*     The user has the ability to change mix, ascent rate, and step size in any */
      /*     combination at any depth during the ascent. */
      /* =============================================================================== */

      /* first point in deco profile is the last dive point */

      number_of_changes = noOfDecoMixes + 1;

      depth_change[0] = lastDivePointDepth;
      mix_change[0] = this.mix_number; /* last bottom mix */
      rate_change[0] = this.finalAscentSpeed;
      step_size_change[0] = this.decoStepSize;

      for (i = 1; i <= noOfDecoMixes; i++) {
        depth_change[i] = this.decoMOD[i - 1][this.current_dive_number];
        mix_change[i] = noOfBottomMixes + i;
        rate_change[i] = this.finalAscentSpeed;
        step_size_change[i] = this.decoStepSize;
      }
      // JURE - 6m/20ft START
      if (this.lastStop6m20ft) {
        for (i = 1; i <= noOfDecoMixes; i++) {
          if (depth_change[i] == 2 * this.decoStepSize)
            step_size_change[i] = 2 * this.decoStepSize;
        }

        if (i >= noOfDecoMixes) {
          depth_change[i] = 2 * this.decoStepSize;
          mix_change[i] = mix_change[i - 1];
          rate_change[i] = this.finalAscentSpeed;
          step_size_change[i] = 2 * this.decoStepSize;
          number_of_changes++;
        }
      }
      // JURE - 6m/20ft END
      starting_depth = depth_change[0];
      this.mix_number = mix_change[0];
      rate = rate_change[0];
      step_size = step_size_change[0];

      /* =============================================================================== */
      /*     CALCULATE THE DEPTH WHERE THE DECOMPRESSION ZONE BEGINS FOR THIS PROFILE */
      /*     BASED ON THE INITIAL ASCENT PARAMETERS AND WRITE THE DEEPEST POSSIBLE */
      /*     DECOMPRESSION STOP DEPTH TO THE OUTPUT FILE */
      /*     Knowing where the decompression zone starts is very important.  Below */
      /*     that depth there is no possibility for bubble formation because there */
      /*     will be no supersaturation gradients.  Deco stops should never start */
      /*     below the deco zone.  The deepest possible stop deco stop depth is */
      /*     defined as the next "standard" stop depth above the point where the */
      /*     leading compartment enters the deco zone.  Thus, the program will not */
      /*     base this calculation on step sizes larger than 10 fsw or 3 msw.  The */
      /*     deepest possible stop depth is not used in the program, per se, rather */
      /*     it is information to tell the diver where to start putting on the brakes */
      /*     during ascent.  This should be prominently displayed by any deco program. */
      /* =============================================================================== */

      depth_start_of_deco_zone = this.calc_start_of_deco_zone(
        starting_depth,
        rate
      );
      this.outputStartOfDecoDepth[this.current_dive_number] =
        depth_start_of_deco_zone;
      if (this.units_equal_fsw) {
        if (step_size < 10) {
          rounding_operation = depth_start_of_deco_zone / step_size - 0.5;
          deepest_possible_stop_depth =
            Math.round(rounding_operation) * step_size;
        } else {
          rounding_operation = depth_start_of_deco_zone / 10 - 0.5;
          deepest_possible_stop_depth = Math.round(rounding_operation) * 10;
        }
      }
      if (this.units_equal_msw) {
        if (step_size < 3) {
          rounding_operation = depth_start_of_deco_zone / step_size - 0.5;
          deepest_possible_stop_depth =
            Math.round(rounding_operation) * step_size;
        } else {
          rounding_operation = depth_start_of_deco_zone / 3 - 0.5;
          deepest_possible_stop_depth = Math.round(rounding_operation) * 3;
        }
      }

      /* =============================================================================== */
      /*     TEMPORARILY ASCEND PROFILE TO THE START OF THE DECOMPRESSION ZONE, SAVE */
      /*     VARIABLES AT THIS POINT, AND INITIALIZE VARIABLES FOR CRITICAL VOLUME LOOP */
      /*     The iterative process of the VPM Critical Volume Algorithm will operate */
      /*     only in the decompression zone since it deals with excess gas volume */
      /*     released as a result of supersaturation gradients (not possible below the */
      /*     decompression zone). */
      /* =============================================================================== */

      this.gas_loadings_ascent_descent(
        starting_depth,
        depth_start_of_deco_zone,
        rate
      );
      run_time_start_of_deco_zone = this.run_time;
      deco_phase_volume_time = 0;
      last_run_time = 0;
      schedule_converged = false;
      for (i = 1; i <= 16; ++i) {
        last_phase_volume_time[i - 1] = 0;
        he_pressure_start_of_deco_zone[i - 1] = this.helium_pressure[i - 1];
        n2_pressure_start_of_deco_zone[i - 1] = this.nitrogen_pressure[i - 1];
        this.max_actual_gradient[i - 1] = 0;
      }
      /* =============================================================================== */
      /*     START OF CRITICAL VOLUME LOOP */
      /*     This loop operates between Lines 50 and 100.  If the Critical Volume */
      /*     Algorithm is toggled "off" in the program settings, there will only be */
      /*     one pass through this loop.  Otherwise, there will be two or more passes */
      /*     through this loop until the deco schedule is "converged" - that is when a */
      /*     comparison between the phase volume time of the present iteration and the */
      /*     last iteration is less than or equal to one minute.  This implies that */
      /*     the volume of released gas in the most recent iteration differs from the */
      /*     "critical" volume limit by an acceptably small amount.  The critical */
      /*     volume limit is set by the Critical Volume Parameter Lambda in the program */
      /*     settings (default setting is 7500 fsw-min with adjustability range from */
      /*     from 6500 to 8300 fsw-min according to Bruce Wienke). */
      /* =============================================================================== */
      /* L50: */

      while (true) {
        /* loop will run continuous there is an exit stateme */

        /* =============================================================================== */
        /*     CALCULATE CURRENT ASCENT CEILING BASED ON ALLOWABLE SUPERSATURATION */
        /*     GRADIENTS AND SET FIRST DECO STOP.  CHECK TO MAKE SURE THAT SELECTED STEP */
        /*     SIZE WILL NOT ROUND UP FIRST STOP TO A DEPTH THAT IS BELOW THE DECO ZONE. */
        /* =============================================================================== */

        this.calc_ascent_ceiling();
        if (this.ascent_ceiling_depth <= 0) {
          this.deco_stop_depth = 0;
        } else {
          rounding_operation2 = this.ascent_ceiling_depth / step_size + 0.5;
          this.deco_stop_depth = Math.round(rounding_operation2) * step_size;
        }
        if (this.deco_stop_depth > depth_start_of_deco_zone) {
          return -1;
        }

        /* =============================================================================== */
        /*     PERFORM A SEPARATE "PROJECTED ASCENT" OUTSIDE OF THE MAIN PROGRAM TO MAKE */
        /*     SURE THAT AN INCREASE IN GAS LOADINGS DURING ASCENT TO THE FIRST STOP WILL */
        /*     NOT CAUSE A VIOLATION OF THE DECO CEILING.  IF SO, ADJUST THE FIRST STOP */
        /*     DEEPER BASED ON STEP SIZE UNTIL A SAFE ASCENT CAN BE MADE. */
        /*     Note: this situation is a possibility when ascending from extremely deep */
        /*     dives or due to an unusual gas mix selection. */
        /*     CHECK AGAIN TO MAKE SURE THAT ADJUSTED FIRST STOP WILL NOT BE BELOW THE */
        /*     DECO ZONE. */
        /* =============================================================================== */

        this.projected_ascent(depth_start_of_deco_zone, rate, step_size);
        if (this.deco_stop_depth > depth_start_of_deco_zone) {
          return -1;
        }

        /* =============================================================================== */
        /*     HANDLE THE SPECIAL CASE WHEN NO DECO STOPS ARE REQUIRED - ASCENT CAN BE */
        /*     MADE DIRECTLY TO THE SURFACE */
        /*     Write ascent data to output file and exit the Critical Volume Loop. */
        /* =============================================================================== */

        if (this.deco_stop_depth == 0) {
          for (i = 1; i <= 16; ++i) {
            this.helium_pressure[i - 1] = he_pressure_start_of_ascent[i - 1];
            this.nitrogen_pressure[i - 1] = n2_pressure_start_of_ascent[i - 1];
          }
          this.run_time = run_time_start_of_ascent;
          this.segment_number = segment_number_start_of_ascent;
          starting_depth = depth_change[0];
          ending_depth = 0;
          this.gas_loadings_ascent_descent(starting_depth, ending_depth, rate);

          break; /* exit the critical volume l */
        }

        /* =============================================================================== */
        /*     ASSIGN VARIABLES FOR ASCENT FROM START OF DECO ZONE TO FIRST STOP.  SAVE */
        /*     FIRST STOP DEPTH FOR LATER USE WHEN COMPUTING THE FINAL ASCENT PROFILE */
        /* =============================================================================== */

        starting_depth = depth_start_of_deco_zone;
        // JURE multilevel START
        let decoDivePoints = 0;
        //for multi-level dives - insert minimum deco stop time if the stop is above the first deco stop
        if (
          this.profileDepth[this.firstDecoProfilePoint][
            this.current_dive_number
          ] >= this.deco_stop_depth &&
          this.profileDepth[this.firstDecoProfilePoint][
            this.current_dive_number
          ] > 0
        ) {
          this.deco_stop_depth =
            this.profileDepth[this.firstDecoProfilePoint][
              this.current_dive_number
            ];
          min_deco_stop_time =
            this.profileTime[this.firstDecoProfilePoint][
              this.current_dive_number
            ];
          this.mix_number =
            this.profileMix[this.firstDecoProfilePoint][
              this.current_dive_number
            ] + 1;
          rate =
            this.profileDecAccSpeed[this.firstDecoProfilePoint][
              this.current_dive_number
            ];
          decoDivePoints++;
          checkForDecoMix = false;
        }
        // JURE multilevel END
        first_stop_depth = this.deco_stop_depth;

        /* =============================================================================== */
        /*     DECO STOP LOOP BLOCK WITHIN CRITICAL VOLUME LOOP */
        /*     This loop computes a decompression schedule to the surface during each */
        /*     iteration of the critical volume loop.  No output is written from this */
        /*     loop, rather it computes a schedule from which the in-water portion of the */
        /*     total phase volume time (Deco_Phase_Volume_Time) can be extracted.  Also, */
        /*     the gas loadings computed at the end of this loop are used the subroutine */
        /*     which computes the out-of-water portion of the total phase volume time */
        /*     (Surface_Phase_Volume_Time) for that schedule. */

        /*     Note that exit is made from the loop after last ascent is made to a deco */
        /*     stop depth that is less than or equal to zero.  A final deco stop less */
        /*     than zero can happen when the user makes an odd step size change during */
        /*     ascent - such as specifying a 5 msw step size change at the 3 msw stop! */
        /* =============================================================================== */
        while (true) {
          /* loop will run continuous there is an break statement */
          // JURE multilevel - the code in a loop was changed
          this.gas_loadings_ascent_descent(
            starting_depth,
            this.deco_stop_depth,
            rate
          );
          if (this.deco_stop_depth <= 0) {
            break;
          }
          if (checkForDecoMix) {
            if (number_of_changes > 1) {
              i1 = number_of_changes;
              for (i = 2; i <= i1; ++i) {
                if (depth_change[i - 1] == this.deco_stop_depth)
                  min_deco_stop_time = Math.max(
                    this.deco_gas_switch_time,
                    min_deco_stop_time
                  );
                if (depth_change[i - 1] >= this.deco_stop_depth) {
                  this.mix_number = mix_change[i - 1];
                  rate = rate_change[i - 1];
                  step_size = step_size_change[i - 1];
                }
              }
            }
          } //if (checkForDecoMix)
          checkForDecoMix = true;

          this.next_deco_stop_depth = this.deco_stop_depth - step_size;
          this.next_deco_stop_depth = this.roundDecoStop(
            this.next_deco_stop_depth,
            step_size
          );

          if (
            this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
              this.current_dive_number
            ] >=
              this.next_deco_stop_depth - step_size / 2 &&
            this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
              this.current_dive_number
            ] > 0
          ) {
            if (
              this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
                this.current_dive_number
              ] >
              this.profileDepth[
                this.firstDecoProfilePoint + decoDivePoints - 1
              ][this.current_dive_number]
            )
              return -(
                this.firstDecoProfilePoint +
                decoDivePoints +
                100 * this.current_dive_number
              ); // no recompression after start of deco
            this.next_deco_stop_depth =
              this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
                this.current_dive_number
              ];

            this.boyles_law_compensation(
              first_stop_depth,
              this.deco_stop_depth,
              this.deco_stop_depth - this.next_deco_stop_depth
            );
            this.decompression_stop(
              this.deco_stop_depth,
              this.deco_stop_depth - this.next_deco_stop_depth,
              0,
              min_deco_stop_time
            );

            min_deco_stop_time =
              this.profileTime[this.firstDecoProfilePoint + decoDivePoints][
                this.current_dive_number
              ];
            this.mix_number =
              this.profileMix[this.firstDecoProfilePoint + decoDivePoints][
                this.current_dive_number
              ] + 1;
            rate =
              this.profileDecAccSpeed[
                this.firstDecoProfilePoint + decoDivePoints
              ][this.current_dive_number];
            decoDivePoints++;
            checkForDecoMix = false;
          } else {
            this.boyles_law_compensation(
              first_stop_depth,
              this.deco_stop_depth,
              this.deco_stop_depth - this.next_deco_stop_depth
            );
            this.decompression_stop(
              this.deco_stop_depth,
              this.deco_stop_depth - this.next_deco_stop_depth,
              0,
              min_deco_stop_time
            );
            min_deco_stop_time = 0;
          }

          if (this.next_deco_stop_depth < 0) this.next_deco_stop_depth = 0;

          starting_depth = this.deco_stop_depth;
          last_run_time = this.run_time;
          this.deco_stop_depth = this.next_deco_stop_depth;
        }

        /* =============================================================================== */
        /*     COMPUTE TOTAL PHASE VOLUME TIME AND MAKE CRITICAL VOLUME COMPARISON */
        /*     The deco phase volume time is computed from the run time.  The surface */
        /*     phase volume time is computed in a subroutine based on the surfacing gas */
        /*     loadings from previous deco loop block.  Next the total phase volume time */
        /*     (in-water + surface) for each compartment is compared against the previous */
        /*     total phase volume time.  The schedule is converged when the difference is */
        /*     less than or equal to 1 minute in any one of the 16 compartments. */

        /*     Note:  the "phase volume time" is somewhat of a mathematical concept. */
        /*     It is the time divided out of a total integration of supersaturation */
        /*     gradient x time (in-water and surface).  This integration is multiplied */
        /*     by the excess bubble number to represent the amount of free-gas released */
        /*     as a result of allowing a certain number of excess bubbles to form. */
        /* =============================================================================== */
        /* end of deco stop loop */

        deco_phase_volume_time = this.run_time - run_time_start_of_deco_zone;
        this.calc_surface_phase_volume_time();

        for (i = 1; i <= 16; ++i) {
          phase_volume_time[i - 1] =
            deco_phase_volume_time + this.surface_phase_volume_time[i - 1];
          critical_volume_comparison = Math.abs(
            (r1 = phase_volume_time[i - 1] - last_phase_volume_time[i - 1])
          );

          if (critical_volume_comparison <= 1) {
            schedule_converged = true;
          }
        }

        /* =============================================================================== */
        /*     CRITICAL VOLUME DECISION TREE BETWEEN LINES 70 AND 99 */
        /*     There are two options here.  If the Critical Volume Agorithm setting is */
        /*     "on" and the schedule is converged, or the Critical Volume Algorithm */
        /*     setting was "off" in the first place, the program will re-assign VARIABLES */
        /*     to their values at the start of ascent (end of bottom time) and process */
        /*     a complete decompression schedule once again using all the same ascent */
        /*     parameters and first stop depth.  This decompression schedule will match */
        /*     the last iteration of the Critical Volume Loop and the program will write */
        /*     the final deco schedule to the output file. */

        /*     Note: if the Critical Volume Agorithm setting was "off", the final deco */
        /*     schedule will be based on "Initial Allowable Supersaturation Gradients." */
        /*     If it was "on", the final schedule will be based on "Adjusted Allowable */
        /*     Supersaturation Gradients" (gradients that are "relaxed" as a result of */
        /*     the Critical Volume Algorithm). */

        /*     If the Critical Volume Agorithm setting is "on" and the schedule is not */
        /*     converged, the program will re-assign VARIABLES to their values at the */
        /*     start of the deco zone and process another trial decompression schedule. */
        /* =============================================================================== */

        if (schedule_converged || critical_volume_algorithm_off) {
          for (i = 1; i <= 16; ++i) {
            this.helium_pressure[i - 1] = he_pressure_start_of_ascent[i - 1];
            this.nitrogen_pressure[i - 1] = n2_pressure_start_of_ascent[i - 1];
          }
          this.run_time = run_time_start_of_ascent;
          this.segment_number = segment_number_start_of_ascent;
          starting_depth = depth_change[0];
          this.mix_number = mix_change[0];
          rate = rate_change[0];
          step_size = step_size_change[0];
          this.deco_stop_depth = first_stop_depth;
          last_run_time = 0;
          // JURE multilevel START
          decoDivePoints = 0;
          if (
            this.profileDepth[this.firstDecoProfilePoint][
              this.current_dive_number
            ] == this.deco_stop_depth
          ) {
            min_deco_stop_time =
              this.profileTime[this.firstDecoProfilePoint][
                this.current_dive_number
              ];
            this.mix_number =
              this.profileMix[this.firstDecoProfilePoint][
                this.current_dive_number
              ] + 1;
            rate =
              this.profileDecAccSpeed[this.firstDecoProfilePoint][
                this.current_dive_number
              ];
            decoDivePoints++;
            checkForDecoMix = false;
          }
          // JURE multilevel END

          /* =============================================================================== */
          /*     DECO STOP LOOP BLOCK FOR FINAL DECOMPRESSION SCHEDULE */
          /* =============================================================================== */

          while (true) {
            /* loop will run continuous there is an break statement */
            // JURE multilevel - the code in a loop was changed
            this.calc_max_actual_gradient(this.deco_stop_depth);
            this.gas_loadings_ascent_descent(
              starting_depth,
              this.deco_stop_depth,
              rate
            );
            /* =============================================================================== */
            /*     DURING FINAL DECOMPRESSION SCHEDULE PROCESS, COMPUTE MAXIMUM ACTUAL */
            /*     SUPERSATURATION GRADIENT RESULTING IN EACH COMPARTMENT */
            /*     If there is a repetitive dive, this will be used later in the VPM */
            /*     Repetitive Algorithm to adjust the values for critical radii. */
            /* =============================================================================== */

            if (this.deco_stop_depth <= 0) {
              break;
            }
            if (checkForDecoMix) {
              if (number_of_changes > 1) {
                i1 = number_of_changes;
                for (i = 2; i <= i1; ++i) {
                  if (depth_change[i - 1] == this.deco_stop_depth)
                    min_deco_stop_time = Math.max(
                      this.deco_gas_switch_time,
                      min_deco_stop_time
                    );
                  if (depth_change[i - 1] >= this.deco_stop_depth) {
                    this.mix_number = mix_change[i - 1];
                    rate = rate_change[i - 1];
                    step_size = step_size_change[i - 1];
                  }
                }
              }
            } //if (checkForDecoMix)
            checkForDecoMix = true;

            this.next_deco_stop_depth = this.deco_stop_depth - step_size;
            this.next_deco_stop_depth = this.roundDecoStop(
              this.next_deco_stop_depth,
              step_size
            );

            if (
              this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
                this.current_dive_number
              ] >=
                this.next_deco_stop_depth - step_size / 2 &&
              this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
                this.current_dive_number
              ] > 0
            ) {
              if (
                this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
                  this.current_dive_number
                ] >
                this.profileDepth[
                  this.firstDecoProfilePoint + decoDivePoints - 1
                ][this.current_dive_number]
              )
                return -(
                  this.firstDecoProfilePoint +
                  decoDivePoints +
                  100 * this.current_dive_number
                ); // no recompression after start of deco
              this.next_deco_stop_depth =
                this.profileDepth[this.firstDecoProfilePoint + decoDivePoints][
                  this.current_dive_number
                ];

              this.boyles_law_compensation(
                first_stop_depth,
                this.deco_stop_depth,
                this.deco_stop_depth - this.next_deco_stop_depth
              );
              this.decompression_stop(
                this.deco_stop_depth,
                this.deco_stop_depth - this.next_deco_stop_depth,
                0,
                min_deco_stop_time
              );

              min_deco_stop_time =
                this.profileTime[this.firstDecoProfilePoint + decoDivePoints][
                  this.current_dive_number
                ];
              /* =============================================================================== */
              /*     This next bit justs rounds up the stop time at the first stop to be in */
              /*     whole increments of the minimum stop time (to make for a nice deco table). */
              /* =============================================================================== */
              if (last_run_time == 0) {
                r1 = this.segment_time / this.minimum_deco_stop_time + 0.5;
                stop_time = Math.round(r1) * this.minimum_deco_stop_time;
              } else {
                stop_time = this.run_time - last_run_time;
              }
              /* CCR calc real gas */
              let fractions = this.calc_inspired_gas(
                this.deco_stop_depth + this.barometric_pressure,
                this.fraction_helium[this.mix_number - 1],
                this.fraction_nitrogen[this.mix_number - 1],
                this.fraction_pO2SetPoint[this.mix_number - 1],
                this.fraction_useDiluentGas[this.mix_number - 1],
                stop_time
              );
              this.outputProfileMixO2[this.outputProfileCounter][
                this.current_dive_number
              ] = fractions.fraction_oxygen; //fraction_oxygen[this.mix_number-1];
              this.outputProfileMixHe[this.outputProfileCounter][
                this.current_dive_number
              ] = fractions.fraction_helium; // this.fraction_helium[this.mix_number-1];

              this.outputProfileGas[this.outputProfileCounter][
                this.current_dive_number
              ] = this.mix_number - 1;

              this.mix_number =
                this.profileMix[this.firstDecoProfilePoint + decoDivePoints][
                  this.current_dive_number
                ] + 1;
              rate =
                this.profileDecAccSpeed[
                  this.firstDecoProfilePoint + decoDivePoints
                ][this.current_dive_number];
              decoDivePoints++;
              checkForDecoMix = false;
            } else {
              this.boyles_law_compensation(
                first_stop_depth,
                this.deco_stop_depth,
                this.deco_stop_depth - this.next_deco_stop_depth
              );
              this.decompression_stop(
                this.deco_stop_depth,
                this.deco_stop_depth - this.next_deco_stop_depth,
                0,
                min_deco_stop_time
              );
              min_deco_stop_time = 0;
              /* =============================================================================== */
              /*     This next bit justs rounds up the stop time at the first stop to be in */
              /*     whole increments of the minimum stop time (to make for a nice deco table). */
              /* =============================================================================== */
              if (last_run_time == 0) {
                r1 = this.segment_time / this.minimum_deco_stop_time + 0.5;
                stop_time = Math.round(r1) * this.minimum_deco_stop_time;
              } else {
                stop_time = this.run_time - last_run_time;
              }

              /* CCR calc real gas */
              let fractions = this.calc_inspired_gas(
                this.deco_stop_depth + this.barometric_pressure,
                this.fraction_helium[this.mix_number - 1],
                this.fraction_nitrogen[this.mix_number - 1],
                this.fraction_pO2SetPoint[this.mix_number - 1],
                this.fraction_useDiluentGas[this.mix_number - 1],
                stop_time
              );
              this.outputProfileMixO2[this.outputProfileCounter][
                this.current_dive_number
              ] = fractions.fraction_oxygen; //fraction_oxygen[this.mix_number-1];
              this.outputProfileMixHe[this.outputProfileCounter][
                this.current_dive_number
              ] = fractions.fraction_helium; // this.fraction_helium[this.mix_number-1];

              this.outputProfileGas[this.outputProfileCounter][
                this.current_dive_number
              ] = this.mix_number - 1;
            }

            this.outputProfileDepth[this.outputProfileCounter][
              this.current_dive_number
            ] = this.deco_stop_depth;
            this.outputProfileTime[this.outputProfileCounter][
              this.current_dive_number
            ] = this.run_time;
            this.outputProfileSegmentTime[this.outputProfileCounter][
              this.current_dive_number
            ] = stop_time;
            //add runtimes for each gas
            this.addInspiredGasRuntime(
              this.fraction_helium[this.mix_number - 1],
              this.fraction_nitrogen[this.mix_number - 1],
              stop_time
            );

            //insert first ascent point from bottom
            if (this.outputProfileCounter == this.firstDecoProfilePoint + 1) {
              //first ascent after bottom phase
              this.outputProfileSegmentType[this.outputProfileCounter][
                this.current_dive_number
              ] = "first_ascent";
            }

            this.outputProfileCounter++;
            this.outputProfileSegmentType[this.outputProfileCounter][
              this.current_dive_number
            ] = checkForDecoMix ? "ascent" : "bottom";

            this.outputProfileDepth[this.outputProfileCounter][
              this.current_dive_number
            ] = -1;
            starting_depth = this.deco_stop_depth;
            last_run_time = this.run_time;
            this.deco_stop_depth = this.next_deco_stop_depth;
          }
          /* for final deco sche */
          /* end of deco stop lo */
          break;
          /* final deco schedule */
          /* exit critical volume l */

          /* =============================================================================== */
          /*     IF SCHEDULE NOT CONVERGED, COMPUTE RELAXED ALLOWABLE SUPERSATURATION */
          /*     GRADIENTS WITH VPM CRITICAL VOLUME ALGORITHM AND PROCESS ANOTHER */
          /*     ITERATION OF THE CRITICAL VOLUME LOOP */
          /* =============================================================================== */
        } else {
          this.critical_volume(deco_phase_volume_time);

          deco_phase_volume_time = 0;
          this.run_time = run_time_start_of_deco_zone;
          starting_depth = depth_start_of_deco_zone;
          this.mix_number = mix_change[0];
          rate = rate_change[0];
          step_size = step_size_change[0];
          for (i = 1; i <= 16; ++i) {
            last_phase_volume_time[i - 1] = phase_volume_time[i - 1];
            this.helium_pressure[i - 1] = he_pressure_start_of_deco_zone[i - 1];
            this.nitrogen_pressure[i - 1] =
              n2_pressure_start_of_deco_zone[i - 1];
          }
          continue;
        }
      } /* end of critical vol loop */

      /* =============================================================================== */
      /*     PROCESSING OF DIVE COMPLETE.  READ INPUT FILE TO DETERMINE IF THERE IS A */
      /*     REPETITIVE DIVE.  IF NONE, THEN EXIT REPETITIVE LOOP. */
      /* =============================================================================== */
      if (this.current_dive_number++ >= this.dive_no) break;

      /* =============================================================================== */
      /*     IF THERE IS A REPETITIVE DIVE, COMPUTE GAS LOADINGS (OFF-GASSING) DURING */
      /*     SURFACE INTERVAL TIME.  ADJUST CRITICAL RADII USING VPM REPETITIVE */
      /*     ALGORITHM.  RE-INITIALIZE SELECTED VARIABLES AND RETURN TO START OF */
      /*     REPETITIVE LOOP AT LINE 30. */
      /* =============================================================================== */

      surface_interval_time = this.surfaceIntervals[this.current_dive_number];

      this.gas_loadings_surface_interval(surface_interval_time);

      this.vpm_repetitive_algorithm(surface_interval_time);

      for (i = 1; i <= 16; ++i) {
        this.max_crushing_pressure_he[i - 1] = 0;
        this.max_crushing_pressure_n2[i - 1] = 0;
        this.max_actual_gradient[i - 1] = 0;
      }
      this.run_time = 0;
      this.segment_number = 0;
    }

    /* =============================================================================== */
    /*     FINAL WRITES TO OUTPUT AND CLOSE PROGRAM FILES */
    /* =============================================================================== */
    /* End of repetit */

    this.decoProfileCalculated = true;
    return 0;
  } /* MAIN__ */

  /* =============================================================================== */
  /*     NOTE ABOUT PRESSURE UNITS USED IN CALCULATIONS: */
  /*     It is the convention in decompression calculations to compute all gas */
  /*     loadings, absolute pressures, partial pressures, etc., in the units of */
  /*     depth pressure that you are diving - either feet of seawater (fsw) or */
  /*     meters of seawater (msw).  This program follows that convention with the */
  /*     the exception that all VPM calculations are performed in SI units (by */
  /*     necessity).  Accordingly, there are several conversions back and forth */
  /*     between the diving pressure units and the SI units. */
  /* =============================================================================== */
  /* =============================================================================== */
  /*     FUNCTION SUBPROGRAM FOR GAS LOADING CALCULATIONS - ASCENT AND DESCENT */
  /* =============================================================================== */

  schreiner_equation__(
    initial_inspired_gas_pressure,
    rate_change_insp_gas_pressure,
    interval_time,
    gas_time_constant,
    initial_gas_pressure
  ) {
    /* System generated locals */
    let ret_val;

    /* =============================================================================== */
    /*     Note: The Schreiner equation is applied when calculating the uptake or */
    /*     elimination of compartment gases during linear ascents or descents at a */
    /*     constant rate.  For ascents, a negative number for rate must be used. */
    /* =============================================================================== */

    ret_val =
      initial_inspired_gas_pressure +
      rate_change_insp_gas_pressure * (interval_time - 1 / gas_time_constant) -
      (initial_inspired_gas_pressure -
        initial_gas_pressure -
        rate_change_insp_gas_pressure / gas_time_constant) *
        Math.exp(-gas_time_constant * interval_time);
    return ret_val;
  } /* this.schreiner_equation__ */

  /* =============================================================================== */
  /*     FUNCTION SUBPROGRAM FOR GAS LOADING CALCULATIONS - CONSTANT DEPTH */
  /* =============================================================================== */

  haldane_equation__(
    initial_gas_pressure,
    inspired_gas_pressure,
    gas_time_constant,
    interval_time
  ) {
    /* System generated locals */
    let ret_val;

    /* =============================================================================== */
    /*     Note: The Haldane equation is applied when calculating the uptake or */
    /*     elimination of compartment gases during intervals at constant depth (the */
    /*     outside ambient pressure does not change). */
    /* =============================================================================== */

    ret_val =
      initial_gas_pressure +
      (inspired_gas_pressure - initial_gas_pressure) *
        (1 - Math.exp(-gas_time_constant * interval_time));
    return ret_val;
  } /* this.haldane_equation__ */

  /* =============================================================================== */
  /*     SUBROUTINE CCR calculate real inspired gas */
  /*     Purpose: ... */
  /* =============================================================================== */

  calc_inspired_gas(
    ambient_pressure,
    fraction_helium,
    fraction_nitrogen,
    fraction_pO2SetPoint,
    fraction_useDiluentGas,
    segTime
  ) {
    //ambient_pressure: in mt or ft - corresponds to the absolute pressure of the specified depth (i.e.: 10mt - ambient_pressure = 20mt)
    // BAILOUT if fraction_pO2SetPoint == 0
    if (
      this.run_bailout &&
      ambient_pressure - this.barometric_pressure <
        this.minimum_profile_depth[this.current_dive_number]
    ) {
      //if depth is lower than last profile bottom point then bailout
      fraction_pO2SetPoint = 0;
    }

    if (!fraction_helium || isNaN(fraction_helium)) fraction_helium = 0;
    if (!fraction_nitrogen || isNaN(fraction_nitrogen)) fraction_nitrogen = 0;
    let fraction_oxygen = 1.0 - fraction_helium - fraction_nitrogen;
    let depth = ambient_pressure - this.barometric_pressure;
    if (this.configuration == "CCR" && fraction_pO2SetPoint != 0) {
      //check if fraction pO2
      let diluent_inert_fraction = fraction_useDiluentGas
        ? fraction_helium + fraction_nitrogen
        : this.fraction_helium[0] + this.fraction_nitrogen[0];
      let inert_fraction_helium =
        (fraction_useDiluentGas ? fraction_helium : this.fraction_helium[0]) /
        diluent_inert_fraction;
      let inert_fraction_nitrogen =
        (fraction_useDiluentGas
          ? fraction_nitrogen
          : this.fraction_nitrogen[0]) / diluent_inert_fraction;
      let fO2 = fraction_pO2SetPoint / DiveToolsService.depth2press(depth);
      let fInert = 1 - fO2;
      let fHe = fInert * inert_fraction_helium;
      let fN2 = fInert * inert_fraction_nitrogen;

      if (fO2 > 1) {
        //not possible - surface interval
      } else {
        //console.log("real gas inspired @ "+(ambient_pressure - this.barometric_pressure),fO2,fHe,fN2)
        fraction_helium = fHe;
        fraction_nitrogen = fN2;
        fraction_oxygen = fO2;
      }
    } else if (this.configuration == "pSCR" && fraction_pO2SetPoint != 0) {
      //pSCR mod
      if (fraction_oxygen < 1 && segTime > 0) {
        //excluding oxygen - calculate real gas
        let ppO2_drop = new ppO2Drop(this.rmv, this.metabolic_o2_consumption);

        let gas_runtime =
          (this.outputProfileGasRuntime[this.current_dive_number][
            fraction_helium + "/" + fraction_nitrogen
          ]
            ? this.outputProfileGasRuntime[this.current_dive_number][
                fraction_helium + "/" + fraction_nitrogen
              ]
            : 0) + segTime;

        let ppO2Avg = ppO2_drop.PFavg(
          depth,
          gas_runtime,
          fraction_oxygen * 100
        ); //in ata

        let fO2 = ppO2Avg / DiveToolsService.depth2press(depth);
        let fInert = 1 - fO2;
        let inert_fraction_helium =
          fraction_helium / (fraction_helium + fraction_nitrogen);
        let inert_fraction_nitrogen =
          fraction_nitrogen / (fraction_helium + fraction_nitrogen);
        let fHe = fInert * inert_fraction_helium;
        let fN2 = fInert * inert_fraction_nitrogen;
        if (ppO2Avg >= 0.16) {
          //check if gas is breatable at this depth - or switch to OC
          fraction_helium = fHe;
          fraction_nitrogen = fN2;
          fraction_oxygen = fO2;
        }
        //console.log("PSCR",ppO2Avg,fraction_helium,fraction_oxygen)
      }
    } else {
      //console.log("OC")
    }
    return {
      fraction_oxygen: fraction_oxygen,
      fraction_helium: fraction_helium,
      fraction_nitrogen: fraction_nitrogen,
    };
  }

  /* =============================================================================== */
  /*     SUBROUTINE GAS_LOADINGS_ASCENT_DESCENT */
  /*     Purpose: This subprogram applies the Schreiner equation to update the */
  /*     gas loadings (partial pressures of helium and nitrogen) in the half-time */
  /*     compartments due to a linear ascent or descent segment at a constant rate. */
  /* =============================================================================== */

  gas_loadings_ascent_descent(starting_depth, ending_depth, rate) {
    let last_segment_number, i;
    let initial_inspired_n2_pressure,
      initial_inspired_he_pressure,
      nitrogen_rate,
      last_run_time,
      starting_ambient_pressure;

    let helium_rate;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    this.segment_time = (ending_depth - starting_depth) / rate;
    last_run_time = this.run_time;
    this.run_time = last_run_time + this.segment_time;
    last_segment_number = this.segment_number;
    this.segment_number = last_segment_number + 1;
    this.ending_ambient_pressure = ending_depth + this.barometric_pressure;
    starting_ambient_pressure = starting_depth + this.barometric_pressure;
    /* === CCR NOTE: inspired pressures let according to the set pO2 of CCR  ===== */
    let average_depth = ending_depth - (ending_depth - starting_depth) / 2;
    let fractions = this.calc_inspired_gas(
      average_depth + this.barometric_pressure,
      this.fraction_helium[this.mix_number - 1],
      this.fraction_nitrogen[this.mix_number - 1],
      this.fraction_pO2SetPoint[this.mix_number - 1],
      this.fraction_useDiluentGas[this.mix_number - 1],
      1
    );
    initial_inspired_he_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_helium;
    initial_inspired_n2_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_nitrogen;
    helium_rate = rate * fractions.fraction_helium;
    nitrogen_rate = rate * fractions.fraction_nitrogen;
    for (i = 1; i <= 16; ++i) {
      this.initial_helium_pressure[i - 1] = this.helium_pressure[i - 1];
      this.initial_nitrogen_pressure[i - 1] = this.nitrogen_pressure[i - 1];
      this.helium_pressure[i - 1] = this.schreiner_equation__(
        initial_inspired_he_pressure,
        helium_rate,
        this.segment_time,
        this.helium_time_constant[i - 1],
        this.initial_helium_pressure[i - 1]
      );
      this.nitrogen_pressure[i - 1] = this.schreiner_equation__(
        initial_inspired_n2_pressure,
        nitrogen_rate,
        this.segment_time,
        this.nitrogen_time_constant[i - 1],
        this.initial_nitrogen_pressure[i - 1]
      );
    }
    return 0;
  } /* this.gas_loadings_ascent_descent */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_CRUSHING_PRESSURE */
  /*     Purpose: Compute the effective "crushing pressure" in each compartment as */
  /*     a result of descent segment(s).  The crushing pressure is the gradient */
  /*     (difference in pressure) between the outside ambient pressure and the */
  /*     gas tension inside a VPM nucleus (bubble seed).  This gradient acts to */
  /*     reduce (shrink) the radius smaller than its initial value at the surface. */
  /*     This phenomenon has important ramifications because the smaller the radius */
  /*     of a VPM nucleus, the greater the allowable supersaturation gradient upon */
  /*     ascent.  Gas loading (uptake) during descent, especially in the fast */
  /*     compartments, will reduce the magnitude of the crushing pressure.  The */
  /*     crushing pressure is not cumulative over a multi-level descent.  It will */
  /*     be the maximum value obtained in any one discrete segment of the overall */
  /*     descent.  Thus, the program must compute and store the maximum crushing */
  /*     pressure for each compartment that was obtained across all segments of */
  /*     the descent profile. */

  /*     The calculation of crushing pressure will be different depending on */
  /*     whether or not the gradient is in the VPM permeable range (gas can diffuse */
  /*     across skin of VPM nucleus) or the VPM impermeable range (molecules in */
  /*     skin of nucleus are squeezed together so tight that gas can no longer */
  /*     diffuse in or out of nucleus; the gas becomes trapped and further resists */
  /*     the crushing pressure).  The solution for crushing pressure in the VPM */
  /*     permeable range is a simple linear equation.  In the VPM impermeable */
  /*     range, a cubic equation must be solved using a numerical method. */

  /*     Separate crushing pressures are tracked for helium and nitrogen because */
  /*     they can have different critical radii.  The crushing pressures will be */
  /*     the same for helium and nitrogen in the permeable range of the model, but */
  /*     they will start to diverge in the impermeable range.  This is due to */
  /*     the differences between starting radius, radius at the onset of */
  /*     impermeability, and radial compression in the impermeable range. */
  /* =============================================================================== */

  calc_crushing_pressure(starting_depth, ending_depth, rate) {
    /* System generated locals */
    let r1, r2;

    let low_bound_n2,
      ending_radius_n2,
      ending_ambient_pressure,
      gradient_onset_of_imperm_pa;
    let low_bound_he,
      ending_radius_he,
      high_bound_n2,
      crushing_pressure_n2 = 0;
    let i;
    let crushing_pressure_pascals_n2,
      gradient_onset_of_imperm,
      starting_gas_tension,
      high_bound_he,
      crushing_pressure_he = 0,
      amb_press_onset_of_imperm_pa,
      crushing_pressure_pascals_he,
      radius_onset_of_imperm_n2,
      starting_gradient,
      radius_onset_of_imperm_he,
      starting_ambient_pressure,
      ending_gas_tension;

    let ending_ambient_pressure_pa,
      a_n2,
      b_n2,
      c_n2,
      ending_gradient,
      gas_tension_onset_of_imperm_pa,
      a_he,
      b_he,
      c_he;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     First, convert the Gradient for Onset of Impermeability from units of */
    /*     atmospheres to diving pressure units (either fsw or msw) and to Pascals */
    /*     (SI units).  The reason that the Gradient for Onset of Impermeability is */
    /*     given in the program settings in units of atmospheres is because that is */
    /*     how it was reported in the original research papers by Yount and */
    /*     colleauges. */
    /* =============================================================================== */

    gradient_onset_of_imperm =
      this.gradient_onset_of_imperm_atm * this.units_factor;
    gradient_onset_of_imperm_pa = this.gradient_onset_of_imperm_atm * 101325;

    /* =============================================================================== */
    /*     Assign values of starting and ending ambient pressures for descent segment */
    /* =============================================================================== */

    starting_ambient_pressure = starting_depth + this.barometric_pressure;
    ending_ambient_pressure = ending_depth + this.barometric_pressure;

    /* =============================================================================== */
    /*     MAIN LOOP WITH NESTED DECISION TREE */
    /*     For each compartment, the program computes the starting and ending */
    /*     gas tensions and gradients.  The VPM is different than some dissolved gas */
    /*     algorithms, Buhlmann for example, in that it considers the pressure due to */
    /*     oxygen, carbon dioxide, and water vapor in each compartment in addition to */
    /*     the inert gases helium and nitrogen.  These "other gases" are included in */
    /*     the calculation of gas tensions and gradients. */
    /* =============================================================================== */

    for (i = 1; i <= 16; ++i) {
      starting_gas_tension =
        this.initial_helium_pressure[i - 1] +
        this.initial_nitrogen_pressure[i - 1] +
        this.constant_pressure_other_gases;
      starting_gradient = starting_ambient_pressure - starting_gas_tension;
      ending_gas_tension =
        this.helium_pressure[i - 1] +
        this.nitrogen_pressure[i - 1] +
        this.constant_pressure_other_gases;
      ending_gradient = ending_ambient_pressure - ending_gas_tension;

      /* =============================================================================== */
      /*     Compute radius at onset of impermeability for helium and nitrogen */
      /*     critical radii */
      /* =============================================================================== */

      radius_onset_of_imperm_he =
        1 /
        (gradient_onset_of_imperm_pa /
          ((this.skin_compression_gammac - this.surface_tension_gamma) * 2) +
          1 / this.adjusted_critical_radius_he[i - 1]);
      radius_onset_of_imperm_n2 =
        1 /
        (gradient_onset_of_imperm_pa /
          ((this.skin_compression_gammac - this.surface_tension_gamma) * 2) +
          1 / this.adjusted_critical_radius_n2[i - 1]);

      /* =============================================================================== */
      /*     FIRST BRANCH OF DECISION TREE - PERMEABLE RANGE */
      /*     Crushing pressures will be the same for helium and nitrogen */
      /* =============================================================================== */

      if (ending_gradient <= gradient_onset_of_imperm) {
        crushing_pressure_he = ending_ambient_pressure - ending_gas_tension;
        crushing_pressure_n2 = ending_ambient_pressure - ending_gas_tension;
      }

      /* =============================================================================== */
      /*     SECOND BRANCH OF DECISION TREE - IMPERMEABLE RANGE */
      /*     Both the ambient pressure and the gas tension at the onset of */
      /*     impermeability must be computed in order to properly solve for the ending */
      /*     radius and resultant crushing pressure.  The first decision block */
      /*     addresses the special case when the starting gradient just happens to be */
      /*     equal to the gradient for onset of impermeability (not very likely!). */
      /* =============================================================================== */

      if (ending_gradient > gradient_onset_of_imperm) {
        if (starting_gradient == gradient_onset_of_imperm) {
          this.amb_pressure_onset_of_imperm[i - 1] = starting_ambient_pressure;
          this.gas_tension_onset_of_imperm[i - 1] = starting_gas_tension;
        }

        /* =============================================================================== */
        /*     In most cases, a subroutine will be called to find these values using a */
        /*     numerical method. */
        /* =============================================================================== */

        if (starting_gradient < gradient_onset_of_imperm) {
          this.onset_of_impermeability(
            starting_ambient_pressure,
            ending_ambient_pressure,
            rate,
            i
          );
        }

        /* =============================================================================== */
        /*     Next, using the values for ambient pressure and gas tension at the onset */
        /*     of impermeability, the equations are set up to process the calculations */
        /*     through the radius root finder subroutine.  This subprogram will find the */
        /*     root (solution) to the cubic equation using a numerical method.  In order */
        /*     to do this efficiently, the equations are placed in the form */
        /*     Ar^3 - Br^2 - C = 0, where r is the ending radius after impermeable */
        /*     compression.  The coefficients A, B, and C for helium and nitrogen are */
        /*     computed and passed to the subroutine as arguments.  The high and low */
        /*     bounds to be used by the numerical method of the subroutine are also */
        /*     computed (see separate page posted on Deco List ftp site entitled */
        /*     "VPM: Solving for radius in the impermeable regime").  The subprogram */
        /*     will return the value of the ending radius and then the crushing */
        /*     pressures for helium and nitrogen can be calculated. */
        /* =============================================================================== */

        ending_ambient_pressure_pa =
          (ending_ambient_pressure / this.units_factor) * 101325;
        amb_press_onset_of_imperm_pa =
          (this.amb_pressure_onset_of_imperm[i - 1] / this.units_factor) *
          101325;
        gas_tension_onset_of_imperm_pa =
          (this.gas_tension_onset_of_imperm[i - 1] / this.units_factor) *
          101325;
        b_he = (this.skin_compression_gammac - this.surface_tension_gamma) * 2;
        a_he =
          ending_ambient_pressure_pa -
          amb_press_onset_of_imperm_pa +
          gas_tension_onset_of_imperm_pa +
          ((this.skin_compression_gammac - this.surface_tension_gamma) * 2) /
            radius_onset_of_imperm_he;
        /* Computing 3rd power */
        r1 = radius_onset_of_imperm_he;
        c_he = gas_tension_onset_of_imperm_pa * (r1 * (r1 * r1));
        high_bound_he = radius_onset_of_imperm_he;
        low_bound_he = b_he / a_he;
        ending_radius_he = this.radius_root_finder(
          a_he,
          b_he,
          c_he,
          low_bound_he,
          high_bound_he
        );
        /* Computing 3rd power */
        r1 = radius_onset_of_imperm_he;
        /* Computing 3rd power */
        r2 = ending_radius_he;
        crushing_pressure_pascals_he =
          gradient_onset_of_imperm_pa +
          ending_ambient_pressure_pa -
          amb_press_onset_of_imperm_pa +
          gas_tension_onset_of_imperm_pa *
            (1 - (r1 * (r1 * r1)) / (r2 * (r2 * r2)));
        crushing_pressure_he =
          (crushing_pressure_pascals_he / 101325) * this.units_factor;
        b_n2 = (this.skin_compression_gammac - this.surface_tension_gamma) * 2;
        a_n2 =
          ending_ambient_pressure_pa -
          amb_press_onset_of_imperm_pa +
          gas_tension_onset_of_imperm_pa +
          ((this.skin_compression_gammac - this.surface_tension_gamma) * 2) /
            radius_onset_of_imperm_n2;
        /* Computing 3rd power */
        r1 = radius_onset_of_imperm_n2;
        c_n2 = gas_tension_onset_of_imperm_pa * (r1 * (r1 * r1));
        high_bound_n2 = radius_onset_of_imperm_n2;
        low_bound_n2 = b_n2 / a_n2;
        ending_radius_n2 = this.radius_root_finder(
          a_n2,
          b_n2,
          c_n2,
          low_bound_n2,
          high_bound_n2
        );
        /* Computing 3rd power */
        r1 = radius_onset_of_imperm_n2;
        /* Computing 3rd power */
        r2 = ending_radius_n2;
        crushing_pressure_pascals_n2 =
          gradient_onset_of_imperm_pa +
          ending_ambient_pressure_pa -
          amb_press_onset_of_imperm_pa +
          gas_tension_onset_of_imperm_pa *
            (1 - (r1 * (r1 * r1)) / (r2 * (r2 * r2)));
        crushing_pressure_n2 =
          (crushing_pressure_pascals_n2 / 101325) * this.units_factor;
      }

      /* =============================================================================== */
      /*     UPDATE VALUES OF MAX CRUSHING PRESSURE IN GLOBAL ARRAYS */
      /* =============================================================================== */

      /* Computing MAX */
      r1 = this.max_crushing_pressure_he[i - 1];
      this.max_crushing_pressure_he[i - 1] = Math.max(r1, crushing_pressure_he);
      /* Computing MAX */
      r1 = this.max_crushing_pressure_n2[i - 1];
      this.max_crushing_pressure_n2[i - 1] = Math.max(r1, crushing_pressure_n2);
    }
    return 0;
  } /* calc_crushing_pressure */

  /* =============================================================================== */
  /*     SUBROUTINE ONSET_OF_IMPERMEABILITY */
  /*     Purpose:  This subroutine uses the Bisection Method to find the ambient */
  /*     pressure and gas tension at the onset of impermeability for a given */
  /*     compartment.  Source:  "Numerical Recipes in Fortran 77", */
  /*     Cambridge University Press, 1992. */
  /* =============================================================================== */

  onset_of_impermeability(
    starting_ambient_pressure,
    ending_ambient_pressure,
    rate,
    i
  ) {
    let printError = true;
    /* Local VARIABLES */
    let time, last_diff_change, mid_range_nitrogen_pressure;
    let j;
    let gas_tension_at_mid_range = 0,
      initial_inspired_n2_pressure,
      gradient_onset_of_imperm,
      starting_gas_tension,
      low_bound,
      initial_inspired_he_pressure,
      high_bound_nitrogen_pressure,
      nitrogen_rate,
      function_at_mid_range,
      function_at_low_bound,
      high_bound,
      mid_range_helium_pressure,
      mid_range_time,
      ending_gas_tension,
      function_at_high_bound;

    let mid_range_ambient_pressure = 0,
      high_bound_helium_pressure,
      helium_rate,
      differential_change;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     First convert the Gradient for Onset of Impermeability to the diving */
    /*     pressure units that are being used */
    /* =============================================================================== */

    gradient_onset_of_imperm =
      this.gradient_onset_of_imperm_atm * this.units_factor;

    /* =============================================================================== */
    /*     ESTABLISH THE BOUNDS FOR THE ROOT SEARCH USING THE BISECTION METHOD */
    /*     In this case, we are solving for time - the time when the ambient pressure */
    /*     minus the gas tension will be equal to the Gradient for Onset of */
    /*     Impermeabliity.  The low bound for time is set at zero and the high */
    /*     bound is set at the elapsed time (segment time) it took to go from the */
    /*     starting ambient pressure to the ending ambient pressure.  The desired */
    /*     ambient pressure and gas tension at the onset of impermeability will */
    /*     be found somewhere between these endpoints.  The algorithm checks to */
    /*     make sure that the solution lies in between these bounds by first */
    /*     computing the low bound and high bound function values. */
    /* =============================================================================== */
    /* CCR NOTE: pO2 setpoint */
    let fractions = this.calc_inspired_gas(
      starting_ambient_pressure,
      this.fraction_helium[this.mix_number - 1],
      this.fraction_nitrogen[this.mix_number - 1],
      this.fraction_pO2SetPoint[this.mix_number - 1],
      this.fraction_useDiluentGas[this.mix_number - 1],
      1
    );

    initial_inspired_he_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_helium;
    initial_inspired_n2_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_nitrogen;
    helium_rate = rate * fractions.fraction_helium;
    nitrogen_rate = rate * fractions.fraction_nitrogen;
    low_bound = 0;
    high_bound = (ending_ambient_pressure - starting_ambient_pressure) / rate;
    starting_gas_tension =
      this.initial_helium_pressure[i - 1] +
      this.initial_nitrogen_pressure[i - 1] +
      this.constant_pressure_other_gases;
    function_at_low_bound =
      starting_ambient_pressure -
      starting_gas_tension -
      gradient_onset_of_imperm;
    high_bound_helium_pressure = this.schreiner_equation__(
      initial_inspired_he_pressure,
      helium_rate,
      high_bound,
      this.helium_time_constant[i - 1],
      this.initial_helium_pressure[i - 1]
    );
    high_bound_nitrogen_pressure = this.schreiner_equation__(
      initial_inspired_n2_pressure,
      nitrogen_rate,
      high_bound,
      this.nitrogen_time_constant[i - 1],
      this.initial_nitrogen_pressure[i - 1]
    );
    ending_gas_tension =
      high_bound_helium_pressure +
      high_bound_nitrogen_pressure +
      this.constant_pressure_other_gases;
    function_at_high_bound =
      ending_ambient_pressure - ending_gas_tension - gradient_onset_of_imperm;
    if (function_at_high_bound * function_at_low_bound >= 0) {
      this.pause();
    }

    /* =============================================================================== */
    /*     APPLY THE BISECTION METHOD IN SEVERAL ITERATIONS UNTIL A SOLUTION WITH */
    /*     THE DESIRED ACCURACY IS FOUND */
    /*     Note: the program allows for up to 100 iterations.  Normally an exit will */
    /*     be made from the loop well before that number.  If, for some reason, the */
    /*     program exceeds 100 iterations, there will be a this.pause to alert the user. */
    /* =============================================================================== */

    if (function_at_low_bound < 0) {
      time = low_bound;
      differential_change = high_bound - low_bound;
    } else {
      time = high_bound;
      differential_change = low_bound - high_bound;
    }
    for (j = 1; j <= 100; ++j) {
      last_diff_change = differential_change;
      differential_change = last_diff_change * 0.5;
      mid_range_time = time + differential_change;
      mid_range_ambient_pressure =
        starting_ambient_pressure + rate * mid_range_time;
      mid_range_helium_pressure = this.schreiner_equation__(
        initial_inspired_he_pressure,
        helium_rate,
        mid_range_time,
        this.helium_time_constant[i - 1],
        this.initial_helium_pressure[i - 1]
      );
      mid_range_nitrogen_pressure = this.schreiner_equation__(
        initial_inspired_n2_pressure,
        nitrogen_rate,
        mid_range_time,
        this.nitrogen_time_constant[i - 1],
        this.initial_nitrogen_pressure[i - 1]
      );
      gas_tension_at_mid_range =
        mid_range_helium_pressure +
        mid_range_nitrogen_pressure +
        this.constant_pressure_other_gases;
      function_at_mid_range =
        mid_range_ambient_pressure -
        gas_tension_at_mid_range -
        gradient_onset_of_imperm;
      if (function_at_mid_range <= 0) {
        time = mid_range_time;
      }
      if (Math.abs(differential_change) < 0.001 || function_at_mid_range == 0) {
        printError = false;
        break;
      }
    }
    if (printError) {
      this.pause();
    }

    /* =============================================================================== */
    /*     When a solution with the desired accuracy is found, the program jumps out */
    /*     of the loop to Line 100 and assigns the solution values for ambient */
    /*     pressure and gas tension at the onset of impermeability. */
    /* =============================================================================== */

    this.amb_pressure_onset_of_imperm[i - 1] = mid_range_ambient_pressure;
    this.gas_tension_onset_of_imperm[i - 1] = gas_tension_at_mid_range;
    return 0;
  } /* this.onset_of_impermeability */

  /* =============================================================================== */
  /*     SUBROUTINE RADIUS_ROOT_FINDER */
  /*     Purpose: This subroutine is a "fail-safe" routine that combines the */
  /*     Bisection Method and the Newton-Raphson Method to find the desired root. */
  /*     This hybrid algorithm takes a bisection step whenever Newton-Raphson would */
  /*     take the solution out of bounds, or whenever Newton-Raphson is not */
  /*     converging fast enough.  Source:  "Numerical Recipes in Fortran 77", */
  /*     Cambridge University Press, 1992. */
  /* =============================================================================== */

  radius_root_finder(a, b, c, low_bound, high_bound) {
    /* System generated locals */
    let ending_radius;

    /* Local VARIABLES */
    let radius_at_low_bound,
      last_diff_change,
      function_let,
      radius_at_high_bound;
    let i;
    let function_at_low_bound,
      last_ending_radius,
      function_at_high_bound,
      derivative_of_function,
      differential_change;
    /* loop */
    /* =============================================================================== */
    /*     BEGIN CALCULATIONS BY MAKING SURE THAT THE ROOT LIES WITHIN BOUNDS */
    /*     In this case we are solving for radius in a cubic equation of the form, */
    /*     Ar^3 - Br^2 - C = 0.  The coefficients A, B, and C were passed to this */
    /*     subroutine as arguments. */
    /* =============================================================================== */

    function_at_low_bound = low_bound * (low_bound * (a * low_bound - b)) - c;
    function_at_high_bound =
      high_bound * (high_bound * (a * high_bound - b)) - c;
    if (function_at_low_bound > 0 && function_at_high_bound > 0) {
      this.pause();
    }

    /* =============================================================================== */
    /*     Next the algorithm checks for special conditions and then prepares for */
    /*     the first bisection. */
    /* =============================================================================== */

    if (function_at_low_bound < 0 && function_at_high_bound < 0) {
      this.pause();
    }
    if (function_at_low_bound == 0) {
      ending_radius = low_bound;
      return ending_radius;
    } else if (function_at_high_bound == 0) {
      ending_radius = high_bound;
      return ending_radius;
    } else if (function_at_low_bound < 0) {
      radius_at_low_bound = low_bound;
      radius_at_high_bound = high_bound;
    } else {
      radius_at_high_bound = low_bound;
      radius_at_low_bound = high_bound;
    }
    ending_radius = (low_bound + high_bound) * 0.5;
    last_diff_change = Math.abs(high_bound - low_bound);
    differential_change = last_diff_change;

    /* =============================================================================== */
    /*     At this point, the Newton-Raphson Method is applied which uses a function_let*/
    /*     and its first derivative to rapidly converge upon a solution. */
    /*     Note: the program allows for up to 100 iterations.  Normally an exit will */
    /*     be made from the loop well before that number.  If, for some reason, the */
    /*     program exceeds 100 iterations, there will be a this.pause to alert the user. */
    /*     When a solution with the desired accuracy is found, exit is made from the */
    /*     loop by returning to the calling program.  The last value of ending */
    /*     radius has been assigned as the solution. */
    /* =============================================================================== */

    function_let =
      ending_radius * (ending_radius * (a * ending_radius - b)) - c;
    derivative_of_function = ending_radius * (ending_radius * 3 * a - b * 2);

    for (i = 1; i <= 100; ++i) {
      if (
        ((ending_radius - radius_at_high_bound) * derivative_of_function -
          function_let) *
          ((ending_radius - radius_at_low_bound) * derivative_of_function -
            function_let) >=
          0 ||
        Math.abs(function_let * 2) >
          Math.abs(last_diff_change * derivative_of_function)
      ) {
        last_diff_change = differential_change;
        differential_change =
          (radius_at_high_bound - radius_at_low_bound) * 0.5;
        ending_radius = radius_at_low_bound + differential_change;
        if (radius_at_low_bound == ending_radius) {
          return ending_radius;
        }
      } else {
        last_diff_change = differential_change;
        differential_change = function_let / derivative_of_function;
        last_ending_radius = ending_radius;
        ending_radius -= differential_change;
        if (last_ending_radius == ending_radius) {
          return ending_radius;
        }
      }
      if (Math.abs(differential_change) < 1e-12) {
        return ending_radius;
      }
      function_let =
        ending_radius * (ending_radius * (a * ending_radius - b)) - c;
      derivative_of_function = ending_radius * (ending_radius * 3 * a - b * 2);
      if (function_let < 0) {
        radius_at_low_bound = ending_radius;
      } else {
        radius_at_high_bound = ending_radius;
      }
    }
    this.pause();
    return 0;
  } /* this.radius_root_finder */

  /* =============================================================================== */
  /*     SUBROUTINE GAS_LOADINGS_CONSTANT_DEPTH */
  /*     Purpose: This subprogram applies the Haldane equation to update the */
  /*     gas loadings (partial pressures of helium and nitrogen) in the half-time */
  /*     compartments for a segment at constant depth. */
  /* =============================================================================== */

  gas_loadings_constant_depth(depth, run_time_end_of_segment) {
    let inspired_nitrogen_pressure;
    let last_segment_number;
    let initial_helium_pressure;

    let i;
    let ambient_pressure,
      inspired_helium_pressure,
      last_run_time,
      initial_nitrogen_pressure;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    this.segment_time = run_time_end_of_segment - this.run_time;
    last_run_time = run_time_end_of_segment;
    this.run_time = last_run_time;
    last_segment_number = this.segment_number;
    this.segment_number = last_segment_number + 1;
    ambient_pressure = depth + this.barometric_pressure;
    /* === CCR NOTE: inspired pressures lety according to the set pO2 of CCR  ===== */

    let fractions = this.calc_inspired_gas(
      ambient_pressure,
      this.fraction_helium[this.mix_number - 1],
      this.fraction_nitrogen[this.mix_number - 1],
      this.fraction_pO2SetPoint[this.mix_number - 1],
      this.fraction_useDiluentGas[this.mix_number - 1],
      this.segment_time
    );

    inspired_helium_pressure =
      (ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_helium;

    inspired_nitrogen_pressure =
      (ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_nitrogen;
    this.ending_ambient_pressure = ambient_pressure;
    for (i = 1; i <= 16; ++i) {
      initial_helium_pressure = this.helium_pressure[i - 1];
      initial_nitrogen_pressure = this.nitrogen_pressure[i - 1];
      this.helium_pressure[i - 1] = this.haldane_equation__(
        initial_helium_pressure,
        inspired_helium_pressure,
        this.helium_time_constant[i - 1],
        this.segment_time
      );
      this.nitrogen_pressure[i - 1] = this.haldane_equation__(
        initial_nitrogen_pressure,
        inspired_nitrogen_pressure,
        this.nitrogen_time_constant[i - 1],
        this.segment_time
      );
    }
    return;
  } /* this.gas_loadings_constant_depth */

  /* =============================================================================== */
  /*     SUBROUTINE NUCLEAR_REGENERATION */
  /*     Purpose: This subprogram calculates the regeneration of VPM critical */
  /*     radii that takes place over the dive time.  The regeneration time constant */
  /*     has a time scale of weeks so this will have very little impact on dives of */
  /*     normal length, but will have a major impact for saturation dives. */
  /* =============================================================================== */

  nuclear_regeneration(dive_time) {
    /* Local VARIABLES */
    let crush_pressure_adjust_ratio_he, ending_radius_n2, ending_radius_he;
    let i;
    let crushing_pressure_pascals_n2,
      crushing_pressure_pascals_he,
      adj_crush_pressure_n2_pascals,
      adj_crush_pressure_he_pascals,
      crush_pressure_adjust_ratio_n2;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     First convert the maximum crushing pressure obtained for each compartment */
    /*     to Pascals.  Next, compute the ending radius for helium and nitrogen */
    /*     critical nuclei in each compartment. */
    /* =============================================================================== */

    for (i = 1; i <= 16; ++i) {
      crushing_pressure_pascals_he =
        (this.max_crushing_pressure_he[i - 1] / this.units_factor) * 101325;
      crushing_pressure_pascals_n2 =
        (this.max_crushing_pressure_n2[i - 1] / this.units_factor) * 101325;
      ending_radius_he =
        1 /
        (crushing_pressure_pascals_he /
          ((this.skin_compression_gammac - this.surface_tension_gamma) * 2) +
          1 / this.adjusted_critical_radius_he[i - 1]);
      ending_radius_n2 =
        1 /
        (crushing_pressure_pascals_n2 /
          ((this.skin_compression_gammac - this.surface_tension_gamma) * 2) +
          1 / this.adjusted_critical_radius_n2[i - 1]);

      /* =============================================================================== */
      /*     A "regenerated" radius for each nucleus is now calculated based on the */
      /*     regeneration time constant.  This means that after application of */
      /*     crushing pressure and reduction in radius, a nucleus will slowly grow */
      /*     back to its original initial radius over a period of time.  This */
      /*     phenomenon is probabilistic in nature and depends on absolute temperature. */
      /*     It is independent of crushing pressure. */
      /* =============================================================================== */

      this.regenerated_radius_he[i - 1] =
        this.adjusted_critical_radius_he[i - 1] +
        (ending_radius_he - this.adjusted_critical_radius_he[i - 1]) *
          Math.exp(-dive_time / this.regeneration_time_constant);
      this.regenerated_radius_n2[i - 1] =
        this.adjusted_critical_radius_n2[i - 1] +
        (ending_radius_n2 - this.adjusted_critical_radius_n2[i - 1]) *
          Math.exp(-dive_time / this.regeneration_time_constant);

      /* =============================================================================== */
      /*     In order to preserve reference back to the initial critical radii after */
      /*     regeneration, an "adjusted crushing pressure" for the nuclei in each */
      /*     compartment must be computed.  In other words, this is the value of */
      /*     crushing pressure that would have reduced the original nucleus to the */
      /*     to the present radius had regeneration not taken place.  The ratio */
      /*     for adjusting crushing pressure is obtained from algebraic manipulation */
      /*     of the standard VPM equations.  The adjusted crushing pressure, in lieu */
      /*     of the original crushing pressure, is then applied in the VPM Critical */
      /*     Volume Algorithm and the VPM Repetitive Algorithm. */
      /* =============================================================================== */

      crush_pressure_adjust_ratio_he =
        (ending_radius_he *
          (this.adjusted_critical_radius_he[i - 1] -
            this.regenerated_radius_he[i - 1])) /
        (this.regenerated_radius_he[i - 1] *
          (this.adjusted_critical_radius_he[i - 1] - ending_radius_he));
      crush_pressure_adjust_ratio_n2 =
        (ending_radius_n2 *
          (this.adjusted_critical_radius_n2[i - 1] -
            this.regenerated_radius_n2[i - 1])) /
        (this.regenerated_radius_n2[i - 1] *
          (this.adjusted_critical_radius_n2[i - 1] - ending_radius_n2));
      adj_crush_pressure_he_pascals =
        crushing_pressure_pascals_he * crush_pressure_adjust_ratio_he;
      adj_crush_pressure_n2_pascals =
        crushing_pressure_pascals_n2 * crush_pressure_adjust_ratio_n2;
      this.adjusted_crushing_pressure_he[i - 1] =
        (adj_crush_pressure_he_pascals / 101325) * this.units_factor;
      this.adjusted_crushing_pressure_n2[i - 1] =
        (adj_crush_pressure_n2_pascals / 101325) * this.units_factor;
    }
    return 0;
  } /* nuclear_regeneration */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_INITIAL_ALLOWABLE_GRADIENT */
  /*     Purpose: This subprogram calculates the initial allowable gradients for */
  /*     helium and nitrogren in each compartment.  These are the gradients that */
  /*     will be used to set the deco ceiling on the first pass through the deco */
  /*     loop.  If the Critical Volume Algorithm is set to "off", then these */
  /*     gradients will determine the final deco schedule.  Otherwise, if the */
  /*     Critical Volume Algorithm is set to "on", these gradients will be further */
  /*     "relaxed" by the Critical Volume Algorithm subroutine.  The initial */
  /*     allowable gradients are referred to as "PssMin" in the papers by Yount */
  /*     and colleauges, i.e., the minimum supersaturation pressure gradients */
  /*     that will probe bubble formation in the VPM nuclei that started with the */
  /*     designated minimum initial radius (critical radius). */

  /*     The initial allowable gradients are computed directly from the */
  /*     "regenerated" radii after the Nuclear Regeneration subroutine.  These */
  /*     gradients are tracked separately for helium and nitrogen. */
  /* =============================================================================== */

  calc_initial_allowable_gradient() {
    let initial_allowable_grad_n2_pa, initial_allowable_grad_he_pa;
    let i;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     The initial allowable gradients are computed in Pascals and then converted */
    /*     to the diving pressure units.  Two different sets of arrays are used to */
    /*     save the calculations - Initial Allowable Gradients and Allowable */
    /*     Gradients.  The Allowable Gradients are assigned the values from Initial */
    /*     Allowable Gradients however the Allowable Gradients can be changed later */
    /*     by the Critical Volume subroutine.  The values for the Initial Allowable */
    /*     Gradients are saved in a global array for later use by both the Critical */
    /*     Volume subroutine and the VPM Repetitive Algorithm subroutine. */
    /* =============================================================================== */

    for (i = 1; i <= 16; ++i) {
      initial_allowable_grad_n2_pa =
        (this.surface_tension_gamma *
          2 *
          (this.skin_compression_gammac - this.surface_tension_gamma)) /
        (this.regenerated_radius_n2[i - 1] * this.skin_compression_gammac);
      initial_allowable_grad_he_pa =
        (this.surface_tension_gamma *
          2 *
          (this.skin_compression_gammac - this.surface_tension_gamma)) /
        (this.regenerated_radius_he[i - 1] * this.skin_compression_gammac);
      this.initial_allowable_gradient_n2[i - 1] =
        (initial_allowable_grad_n2_pa / 101325) * this.units_factor;
      this.initial_allowable_gradient_he[i - 1] =
        (initial_allowable_grad_he_pa / 101325) * this.units_factor;
      this.allowable_gradient_he[i - 1] =
        this.initial_allowable_gradient_he[i - 1];
      this.allowable_gradient_n2[i - 1] =
        this.initial_allowable_gradient_n2[i - 1];
    }
    return 0;
  } /* calc_initial_allowable_gradient */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_ASCENT_CEILING */
  /*     Purpose: This subprogram calculates the ascent ceiling (the safe ascent */
  /*     depth) in each compartment, based on the allowable gradients, and then */
  /*     finds the deepest ascent ceiling across all compartments. */
  /* =============================================================================== */

  calc_ascent_ceiling() {
    /* System generated locals */
    let r1, r2;

    /* Local VARIABLES */
    let weighted_allowable_gradient;
    let i;
    let compartment_ascent_ceiling = new Array(),
      gas_loading,
      tolerated_ambient_pressure;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     Since there are two sets of allowable gradients being tracked, one for */
    /*     helium and one for nitrogen, a "weighted allowable gradient" must be */
    /*     computed each time based on the proportions of helium and nitrogen in */
    /*     each compartment.  This proportioning follows the methodology of */
    /*     Buhlmann/Keller.  If there is no helium and nitrogen in the compartment, */
    /*     such as after extended periods of oxygen breathing, then the minimum value */
    /*     across both gases will be used.  It is important to note that if a */
    /*     compartment is empty of helium and nitrogen, then the weighted allowable */
    /*     gradient formula cannot be used since it will result in division by zero. */
    /* =============================================================================== */

    /* NOTE for CCR: from BUHLMANN
	    getMaxAmb : function( gf)
	    {
	        let aHeN2,bHeN2;
	        let pHeN2;

	        pHeN2 = this.ppHe + this.ppN2;    // Sum partial pressures						== gas_loading
	        // Calculate adjusted a, b coefficients based on those of He and N2
	        aHeN2 = ((this.aHe * this.ppHe) + (this.aN2 * this.ppN2)) / pHeN2;				== aHe = allowable_gradient_he / 
	        bHeN2 = ((this.bHe * this.ppHe) + (this.bN2 * this.ppN2)) / pHeN2;				== aHeN2 , bHeN2 = weighted_allowable_gradient
        
	        return (pHeN2 - aHeN2*gf)/(gf/bHeN2-gf+1.0);
	    } */

    for (i = 1; i <= 16; ++i) {
      gas_loading = this.helium_pressure[i - 1] + this.nitrogen_pressure[i - 1];
      if (gas_loading > 0) {
        let gf = this.VPM_GFS ? this.VPM_gf_high / 100 : 1;
        weighted_allowable_gradient =
          (this.allowable_gradient_he[i - 1] * this.helium_pressure[i - 1] +
            this.allowable_gradient_n2[i - 1] * this.nitrogen_pressure[i - 1]) /
          gas_loading;
        tolerated_ambient_pressure =
          gas_loading +
          this.constant_pressure_other_gases -
          weighted_allowable_gradient * gf;
      } else {
        /* Computing MIN */
        r1 = this.allowable_gradient_he[i - 1];
        r2 = this.allowable_gradient_n2[i - 1];
        weighted_allowable_gradient = Math.min(r1, r2);
        tolerated_ambient_pressure =
          this.constant_pressure_other_gases - weighted_allowable_gradient;
      }

      /* =============================================================================== */
      /*     The tolerated ambient pressure cannot be less than zero absolute, i.e., */
      /*     the vacuum of outer space! */
      /* =============================================================================== */

      if (tolerated_ambient_pressure < 0) {
        tolerated_ambient_pressure = 0;
      }
      compartment_ascent_ceiling[i - 1] =
        tolerated_ambient_pressure - this.barometric_pressure;
    }

    /* =============================================================================== */
    /*     The Ascent Ceiling Depth is computed in a loop after all of the individual */
    /*     compartment ascent ceilings have been calculated.  It is important that the */
    /*     Ascent Ceiling Depth (max ascent ceiling across all compartments) only be */
    /*     extracted from the compartment values and not be compared against some */
    /*     initialization value.  For example, if MAX(Ascent_Ceiling_Depth . .) was */
    /*     compared against zero, this could cause a program lockup because sometimes */
    /*     the Ascent Ceiling Depth needs to be negative (but not less than zero */
    /*     absolute ambient pressure) in order to decompress to the last stop at zero */
    /*     depth. */
    /* =============================================================================== */

    this.ascent_ceiling_depth = compartment_ascent_ceiling[0];
    for (i = 2; i <= 16; ++i) {
      /* Computing MAX */
      r1 = this.ascent_ceiling_depth;
      r2 = compartment_ascent_ceiling[i - 1];
      this.ascent_ceiling_depth = Math.max(r1, r2);
    }
    return 0;
  } /* calc_ascent_ceiling */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_MAX_ACTUAL_GRADIENT */
  /*     Purpose: This subprogram calculates the actual supersaturation gradient */
  /*     obtained in each compartment as a result of the ascent profile during */
  /*     decompression.  Similar to the concept with crushing pressure, the */
  /*     supersaturation gradients are not cumulative over a multi-level, staged */
  /*     ascent.  Rather, it will be the maximum value obtained in any one discrete */
  /*     step of the overall ascent.  Thus, the program must compute and store the */
  /*     maximum actual gradient for each compartment that was obtained across all */
  /*     steps of the ascent profile.  This subroutine is invoked on the last pass */
  /*     through the deco stop loop block when the final deco schedule is being */
  /*     generated. */
  /**/
  /*     The max actual gradients are later used by the VPM Repetitive Algorithm to */
  /*     determine if adjustments to the critical radii are required.  If the max */
  /*     actual gradient did not exceed the initial alllowable gradient, then no */
  /*     adjustment will be made.  However, if the max actual gradient did exceed */
  /*     the intitial allowable gradient, such as permitted by the Critical Volume */
  /*     Algorithm, then the critical radius will be adjusted (made larger) on the */
  /*     repetitive dive to compensate for the bubbling that was allowed on the */
  /*     previous dive.  The use of the max actual gradients is intended to prevent */
  /*     the repetitive algorithm from being overly conservative. */
  /* =============================================================================== */

  calc_max_actual_gradient(deco_stop_depth) {
    /* System generated locals */
    let r1;

    /* Local VARIABLES */
    let i;
    let compartment_gradient;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     Note: negative supersaturation gradients are meaningless for this */
    /*     application, so the values must be equal to or greater than zero. */
    /* =============================================================================== */

    for (i = 1; i <= 16; ++i) {
      compartment_gradient =
        this.helium_pressure[i - 1] +
        this.nitrogen_pressure[i - 1] +
        this.constant_pressure_other_gases -
        (deco_stop_depth + this.barometric_pressure);
      if (compartment_gradient <= 0) {
        compartment_gradient = 0;
      }
      /* Computing MAX */
      r1 = this.max_actual_gradient[i - 1];
      this.max_actual_gradient[i - 1] = Math.max(r1, compartment_gradient);
    }
    return 0;
  } /* this.calc_max_actual_gradient */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_SURFACE_PHASE_VOLUME_TIME */
  /*     Purpose: This subprogram computes the surface portion of the total phase */
  /*     volume time.  This is the time factored out of the integration of */
  /*     supersaturation gradient x time over the surface interval.  The VPM */
  /*     considers the gradients that allow bubbles to form or to drive bubble */
  /*     growth both in the water and on the surface after the dive. */

  /*     This subroutine is a new development to the VPM algorithm in that it */
  /*     computes the time course of supersaturation gradients on the surface */
  /*     when both helium and nitrogen are present.  Refer to separate write-up */
  /*     for a more detailed explanation of this algorithm. */
  /* =============================================================================== */

  calc_surface_phase_volume_time() {
    /* Local VARIABLES */
    let decay_time_to_zero_gradient;
    let i;
    let integral_gradient_x_time, surface_inspired_n2_pressure;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    surface_inspired_n2_pressure =
      (this.barometric_pressure - this.water_vapor_pressure) * 0.79;
    for (i = 1; i <= 16; ++i) {
      if (this.nitrogen_pressure[i - 1] > surface_inspired_n2_pressure) {
        this.surface_phase_volume_time[i - 1] =
          (this.helium_pressure[i - 1] / this.helium_time_constant[i - 1] +
            (this.nitrogen_pressure[i - 1] - surface_inspired_n2_pressure) /
              this.nitrogen_time_constant[i - 1]) /
          (this.helium_pressure[i - 1] +
            this.nitrogen_pressure[i - 1] -
            surface_inspired_n2_pressure);
      } else if (
        this.nitrogen_pressure[i - 1] <= surface_inspired_n2_pressure &&
        this.helium_pressure[i - 1] + this.nitrogen_pressure[i - 1] >=
          surface_inspired_n2_pressure
      ) {
        decay_time_to_zero_gradient =
          (1 /
            (this.nitrogen_time_constant[i - 1] -
              this.helium_time_constant[i - 1])) *
          Math.log(
            (surface_inspired_n2_pressure - this.nitrogen_pressure[i - 1]) /
              this.helium_pressure[i - 1]
          );
        integral_gradient_x_time =
          (this.helium_pressure[i - 1] / this.helium_time_constant[i - 1]) *
            (1 -
              Math.exp(
                -this.helium_time_constant[i - 1] * decay_time_to_zero_gradient
              )) +
          ((this.nitrogen_pressure[i - 1] - surface_inspired_n2_pressure) /
            this.nitrogen_time_constant[i - 1]) *
            (1 -
              Math.exp(
                -this.nitrogen_time_constant[i - 1] *
                  decay_time_to_zero_gradient
              ));
        this.surface_phase_volume_time[i - 1] =
          integral_gradient_x_time /
          (this.helium_pressure[i - 1] +
            this.nitrogen_pressure[i - 1] -
            surface_inspired_n2_pressure);
      } else {
        this.surface_phase_volume_time[i - 1] = 0;
      }
    }
    return 0;
  } /* calc_surface_phase_volume_time */

  /* =============================================================================== */
  /*     SUBROUTINE CRITICAL_VOLUME */
  /*     Purpose: This subprogram applies the VPM Critical Volume Algorithm.  This */
  /*     algorithm will compute "relaxed" gradients for helium and nitrogen based */
  /*     on the setting of the Critical Volume Parameter Lambda. */
  /* =============================================================================== */

  critical_volume(deco_phase_volume_time) {
    /* System generated locals */
    let r1;

    /* Local VARIABLES */
    let initial_allowable_grad_n2_pa,
      initial_allowable_grad_he_pa,
      parameter_lambda_pascals,
      b,
      c;
    let i;
    let new_allowable_grad_n2_pascals,
      phase_volume_time = new Array(),
      new_allowable_grad_he_pascals,
      adj_crush_pressure_n2_pascals,
      adj_crush_pressure_he_pascals;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     Note:  Since the Critical Volume Parameter Lambda was defined in units of */
    /*     fsw-min in the original papers by Yount and colleauges, the same */
    /*     convention is retained here.  Although Lambda is adjustable only in units */
    /*     of fsw-min in the program settings (range from 6500 to 8300 with default */
    /*     7500), it will convert to the proper value in Pascals-min in this */
    /*     subroutine regardless of which diving pressure units are being used in */
    /*     the main program - feet of seawater (fsw) or meters of seawater (msw). */
    /*     The allowable gradient is computed using the quadratic formula (refer to */
    /*     separate write-up posted on the Deco List web site). */
    /* =============================================================================== */

    parameter_lambda_pascals =
      (this.crit_volume_parameter_lambda / 33) * 101325;
    for (i = 1; i <= 16; ++i) {
      phase_volume_time[i - 1] =
        deco_phase_volume_time + this.surface_phase_volume_time[i - 1];
    }
    for (i = 1; i <= 16; ++i) {
      adj_crush_pressure_he_pascals =
        (this.adjusted_crushing_pressure_he[i - 1] / this.units_factor) *
        101325;
      initial_allowable_grad_he_pa =
        (this.initial_allowable_gradient_he[i - 1] / this.units_factor) *
        101325;
      b =
        initial_allowable_grad_he_pa +
        (parameter_lambda_pascals * this.surface_tension_gamma) /
          (this.skin_compression_gammac * phase_volume_time[i - 1]);
      c =
        (this.surface_tension_gamma *
          (this.surface_tension_gamma *
            (parameter_lambda_pascals * adj_crush_pressure_he_pascals))) /
        (this.skin_compression_gammac *
          (this.skin_compression_gammac * phase_volume_time[i - 1]));
      /* Computing 2nd power */
      r1 = b;
      new_allowable_grad_he_pascals = (b + Math.sqrt(r1 * r1 - c * 4)) / 2;
      this.allowable_gradient_he[i - 1] =
        (new_allowable_grad_he_pascals / 101325) * this.units_factor;
    }
    for (i = 1; i <= 16; ++i) {
      adj_crush_pressure_n2_pascals =
        (this.adjusted_crushing_pressure_n2[i - 1] / this.units_factor) *
        101325;
      initial_allowable_grad_n2_pa =
        (this.initial_allowable_gradient_n2[i - 1] / this.units_factor) *
        101325;
      b =
        initial_allowable_grad_n2_pa +
        (parameter_lambda_pascals * this.surface_tension_gamma) /
          (this.skin_compression_gammac * phase_volume_time[i - 1]);
      c =
        (this.surface_tension_gamma *
          (this.surface_tension_gamma *
            (parameter_lambda_pascals * adj_crush_pressure_n2_pascals))) /
        (this.skin_compression_gammac *
          (this.skin_compression_gammac * phase_volume_time[i - 1]));
      /* Computing 2nd power */
      r1 = b;
      new_allowable_grad_n2_pascals = (b + Math.sqrt(r1 * r1 - c * 4)) / 2;
      this.allowable_gradient_n2[i - 1] =
        (new_allowable_grad_n2_pascals / 101325) * this.units_factor;
    }
    return 0;
  } /* critical_volume */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_START_OF_DECO_ZONE */
  /*     Purpose: This subroutine uses the Bisection Method to find the depth at */
  /*     which the leading compartment just enters the decompression zone. */
  /*     Source:  "Numerical Recipes in Fortran 77", Cambridge University Press, */
  /*     1992. */
  /* =============================================================================== */

  calc_start_of_deco_zone(starting_depth, rate) {
    let printError = true;
    /* Local VARIABLES */
    let depth_start_of_deco_zone;
    let last_diff_change, initial_helium_pressure, mid_range_nitrogen_pressure;
    let i, j;
    let initial_inspired_n2_pressure,
      cpt_depth_start_of_deco_zone,
      low_bound,
      initial_inspired_he_pressure,
      high_bound_nitrogen_pressure,
      nitrogen_rate,
      function_at_mid_range,
      function_at_low_bound,
      high_bound,
      mid_range_helium_pressure,
      mid_range_time,
      starting_ambient_pressure,
      initial_nitrogen_pressure,
      function_at_high_bound;

    let time_to_start_of_deco_zone,
      high_bound_helium_pressure,
      helium_rate,
      differential_change;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /*     First initialize some VARIABLES */
    /* =============================================================================== */

    depth_start_of_deco_zone = 0;
    starting_ambient_pressure = starting_depth + this.barometric_pressure;
    /* === CCR NOTE: inspired pressures lety according to the set pO2 of CCR  ===== */

    let fractions = this.calc_inspired_gas(
      starting_ambient_pressure,
      this.fraction_helium[this.mix_number - 1],
      this.fraction_nitrogen[this.mix_number - 1],
      this.fraction_pO2SetPoint[this.mix_number - 1],
      this.fraction_useDiluentGas[this.mix_number - 1],
      1
    );

    initial_inspired_he_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_helium;
    initial_inspired_n2_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_nitrogen;
    helium_rate = rate * fractions.fraction_helium;
    nitrogen_rate = rate * fractions.fraction_nitrogen;

    /* =============================================================================== */
    /*     ESTABLISH THE BOUNDS FOR THE ROOT SEARCH USING THE BISECTION METHOD */
    /*     AND CHECK TO MAKE SURE THAT THE ROOT WILL BE WITHIN BOUNDS.  PROCESS */
    /*     EACH COMPARTMENT INDIVIDUALLY AND FIND THE MAXIMUM DEPTH ACROSS ALL */
    /*     COMPARTMENTS (LEADING COMPARTMENT) */
    /*     In this case, we are solving for time - the time when the gas tension in */
    /*     the compartment will be equal to ambient pressure.  The low bound for time */
    /*     is set at zero and the high bound is set at the time it would take to */
    /*     ascend to zero ambient pressure (absolute).  Since the ascent rate is */
    /*     negative, a multiplier of -1.0 is used to make the time positive.  The */
    /*     desired point when gas tension equals ambient pressure is found at a time */
    /*     somewhere between these endpoints.  The algorithm checks to make sure that */
    /*     the solution lies in between these bounds by first computing the low bound */
    /*     and high bound function values. */
    /* =============================================================================== */

    low_bound = 0;
    high_bound = (starting_ambient_pressure / rate) * -1;
    for (i = 1; i <= 16; ++i) {
      initial_helium_pressure = this.helium_pressure[i - 1];
      initial_nitrogen_pressure = this.nitrogen_pressure[i - 1];
      function_at_low_bound =
        initial_helium_pressure +
        initial_nitrogen_pressure +
        this.constant_pressure_other_gases -
        starting_ambient_pressure;
      high_bound_helium_pressure = this.schreiner_equation__(
        initial_inspired_he_pressure,
        helium_rate,
        high_bound,
        this.helium_time_constant[i - 1],
        initial_helium_pressure
      );
      high_bound_nitrogen_pressure = this.schreiner_equation__(
        initial_inspired_n2_pressure,
        nitrogen_rate,
        high_bound,
        this.nitrogen_time_constant[i - 1],
        initial_nitrogen_pressure
      );
      function_at_high_bound =
        high_bound_helium_pressure +
        high_bound_nitrogen_pressure +
        this.constant_pressure_other_gases;
      if (function_at_high_bound * function_at_low_bound >= 0) {
        this.pause();
      }

      /* =============================================================================== */
      /*     APPLY THE BISECTION METHOD IN SEVERAL ITERATIONS UNTIL A SOLUTION WITH */
      /*     THE DESIRED ACCURACY IS FOUND */
      /*     Note: the program allows for up to 100 iterations.  Normally an exit will */
      /*     be made from the loop well before that number.  If, for some reason, the */
      /*     program exceeds 100 iterations, there will be a this.pause to alert the user. */
      /* =============================================================================== */

      if (function_at_low_bound < 0) {
        time_to_start_of_deco_zone = low_bound;
        differential_change = high_bound - low_bound;
      } else {
        time_to_start_of_deco_zone = high_bound;
        differential_change = low_bound - high_bound;
      }
      for (j = 1; j <= 100; ++j) {
        last_diff_change = differential_change;
        differential_change = last_diff_change * 0.5;
        mid_range_time = time_to_start_of_deco_zone + differential_change;
        mid_range_helium_pressure = this.schreiner_equation__(
          initial_inspired_he_pressure,
          helium_rate,
          mid_range_time,
          this.helium_time_constant[i - 1],
          initial_helium_pressure
        );
        mid_range_nitrogen_pressure = this.schreiner_equation__(
          initial_inspired_n2_pressure,
          nitrogen_rate,
          mid_range_time,
          this.nitrogen_time_constant[i - 1],
          initial_nitrogen_pressure
        );
        function_at_mid_range =
          mid_range_helium_pressure +
          mid_range_nitrogen_pressure +
          this.constant_pressure_other_gases -
          (starting_ambient_pressure + rate * mid_range_time);
        if (function_at_mid_range <= 0) {
          time_to_start_of_deco_zone = mid_range_time;
        }
        if (
          Math.abs(differential_change) < 0.001 ||
          function_at_mid_range == 0
        ) {
          printError = false;
          break;
        }
        /* L150: */
      }
      if (printError) {
        this.pause();
      }

      /* =============================================================================== */
      /*     When a solution with the desired accuracy is found, the program jumps out */
      /*     of the loop to Line 170 and assigns the solution value for the individual */
      /*     compartment. */
      /* =============================================================================== */

      cpt_depth_start_of_deco_zone =
        starting_ambient_pressure +
        rate * time_to_start_of_deco_zone -
        this.barometric_pressure;

      /* =============================================================================== */
      /*     The overall solution will be the compartment with the maximum depth where */
      /*     gas tension equals ambient pressure (leading compartment). */
      /* =============================================================================== */

      depth_start_of_deco_zone = Math.max(
        depth_start_of_deco_zone,
        cpt_depth_start_of_deco_zone
      );
      /* L200: */
    }
    return depth_start_of_deco_zone;
  } /* calc_start_of_deco_zone */

  /* =============================================================================== */
  /*     SUBROUTINE PROJECTED_ASCENT */
  /*     Purpose: This subprogram performs a simulated ascent outside of the main */
  /*     program to ensure that a deco ceiling will not be violated due to unusual */
  /*     gas loading during ascent (on-gassing).  If the deco ceiling is violated, */
  /*     the stop depth will be adjusted deeper by the step size until a safe */
  /*     ascent can be made. */
  /* =============================================================================== */

  projected_ascent(starting_depth, rate, step_size) {
    /* System generated locals */
    let r1, r2;

    /* Local VARIABLES */
    let weighted_allowable_gradient,
      //ending_ambient_pressure,
      initial_helium_pressure = new Array(),
      temp_gas_loading = new Array(),
      segment_time;
    let i;
    let initial_inspired_n2_pressure,
      new_ambient_pressure,
      temp_helium_pressure,
      initial_inspired_he_pressure,
      allowable_gas_loading = new Array(),
      nitrogen_rate,
      starting_ambient_pressure,
      initial_nitrogen_pressure = new Array();

    let helium_rate, temp_nitrogen_pressure;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    new_ambient_pressure = this.deco_stop_depth + this.barometric_pressure;
    starting_ambient_pressure = starting_depth + this.barometric_pressure;
    /* === CCR NOTE: inspired pressures lety according to the set pO2 of CCR  ===== */

    let fractions = this.calc_inspired_gas(
      starting_ambient_pressure,
      this.fraction_helium[this.mix_number - 1],
      this.fraction_nitrogen[this.mix_number - 1],
      this.fraction_pO2SetPoint[this.mix_number - 1],
      this.fraction_useDiluentGas[this.mix_number - 1],
      1
    );

    initial_inspired_he_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_helium;
    initial_inspired_n2_pressure =
      (starting_ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_nitrogen;
    helium_rate = rate * fractions.fraction_helium;
    nitrogen_rate = rate * fractions.fraction_nitrogen;
    for (i = 1; i <= 16; ++i) {
      initial_helium_pressure[i - 1] = this.helium_pressure[i - 1];
      initial_nitrogen_pressure[i - 1] = this.nitrogen_pressure[i - 1];
    }

    while (true) {
      let break_loop = false;
      this.ending_ambient_pressure = new_ambient_pressure;
      segment_time =
        (this.ending_ambient_pressure - starting_ambient_pressure) / rate;
      for (i = 1; i <= 16; ++i) {
        temp_helium_pressure = this.schreiner_equation__(
          initial_inspired_he_pressure,
          helium_rate,
          segment_time,
          this.helium_time_constant[i - 1],
          initial_helium_pressure[i - 1]
        );
        temp_nitrogen_pressure = this.schreiner_equation__(
          initial_inspired_n2_pressure,
          nitrogen_rate,
          segment_time,
          this.nitrogen_time_constant[i - 1],
          initial_nitrogen_pressure[i - 1]
        );
        temp_gas_loading[i - 1] = temp_helium_pressure + temp_nitrogen_pressure;
        if (temp_gas_loading[i - 1] > 0) {
          weighted_allowable_gradient =
            (this.allowable_gradient_he[i - 1] * temp_helium_pressure +
              this.allowable_gradient_n2[i - 1] * temp_nitrogen_pressure) /
            temp_gas_loading[i - 1];
        } else {
          /* Computing MIN */
          r1 = this.allowable_gradient_he[i - 1];
          r2 = this.allowable_gradient_n2[i - 1];
          weighted_allowable_gradient = Math.min(r1, r2);
        }
        allowable_gas_loading[i - 1] =
          this.ending_ambient_pressure +
          weighted_allowable_gradient -
          this.constant_pressure_other_gases;
        /* L670: */
      }
      for (i = 1; i <= 16; ++i) {
        if (temp_gas_loading[i - 1] > allowable_gas_loading[i - 1]) {
          new_ambient_pressure = this.ending_ambient_pressure + step_size;
          this.deco_stop_depth += step_size;
        } else {
          break_loop = true; // JURE preglej !!
          break;
        }
        /* L671: */
      }
      if (break_loop) break;
    }

    return 0;
  } /* projected_ascent */

  /* =============================================================================== */
  /*     SUBROUTINE BOYLES_LAW_COMPENSATION */
  /*     Purpose: This subprogram calculates the reduction in allowable gradients */
  /*     with decreasing ambient pressure during the decompression profile based */
  /*     on Boyle's Law considerations. */
  /* =============================================================================== */
  boyles_law_compensation(first_stop_depth, deco_stop_depth, step_size) {
    /* Local VARIABLES */
    let i;
    let next_stop;
    let ambient_pressure_first_stop, ambient_pressure_next_stop;
    let amb_press_first_stop_pascals, amb_press_next_stop_pascals;
    let a, b, c, low_bound, high_bound, ending_radius;
    let deco_gradient_pascals;
    let allow_grad_first_stop_he_pa, radius_first_stop_he;
    let allow_grad_first_stop_n2_pa, radius_first_stop_n2;

    let radius1_he = new Array(),
      radius2_he = new Array();
    let radius1_n2 = new Array(),
      radius2_n2 = new Array();

    /* =============================================================================== */
    /*      CALCULATIONS */
    /* =============================================================================== */
    next_stop = deco_stop_depth - step_size;
    ambient_pressure_first_stop = first_stop_depth + this.barometric_pressure;
    ambient_pressure_next_stop = next_stop + this.barometric_pressure;
    amb_press_first_stop_pascals =
      (ambient_pressure_first_stop / this.units_factor) * 101325.0;
    amb_press_next_stop_pascals =
      (ambient_pressure_next_stop / this.units_factor) * 101325.0;

    for (i = 1; i <= 16; ++i) {
      allow_grad_first_stop_he_pa =
        (this.allowable_gradient_he[i - 1] / this.units_factor) * 101325.0;
      radius_first_stop_he =
        (2.0 * this.surface_tension_gamma) / allow_grad_first_stop_he_pa;
      radius1_he[i - 1] = radius_first_stop_he;
      a = amb_press_next_stop_pascals;
      b = -2.0 * this.surface_tension_gamma;
      c =
        (amb_press_first_stop_pascals +
          (2.0 * this.surface_tension_gamma) / radius_first_stop_he) *
        radius_first_stop_he *
        (radius_first_stop_he * radius_first_stop_he);
      low_bound = radius_first_stop_he;
      high_bound =
        radius_first_stop_he *
        this.cbrtf(
          amb_press_first_stop_pascals / amb_press_next_stop_pascals
        ); /* JURE  ** */
      ending_radius = this.radius_root_finder(a, b, c, low_bound, high_bound);
      radius2_he[i - 1] = ending_radius;
      deco_gradient_pascals =
        (2.0 * this.surface_tension_gamma) / ending_radius;
      this.deco_gradient_he[i - 1] =
        (deco_gradient_pascals / 101325.0) * this.units_factor;
    }

    for (i = 1; i <= 16; ++i) {
      allow_grad_first_stop_n2_pa =
        (this.allowable_gradient_n2[i - 1] / this.units_factor) * 101325.0;
      radius_first_stop_n2 =
        (2.0 * this.surface_tension_gamma) / allow_grad_first_stop_n2_pa;
      radius1_n2[i - 1] = radius_first_stop_n2;
      a = amb_press_next_stop_pascals;
      b = -2.0 * this.surface_tension_gamma;
      c =
        (amb_press_first_stop_pascals +
          (2.0 * this.surface_tension_gamma) / radius_first_stop_n2) *
        radius_first_stop_n2 *
        (radius_first_stop_n2 * radius_first_stop_n2);
      low_bound = radius_first_stop_n2;
      high_bound =
        radius_first_stop_n2 *
        this.cbrtf(amb_press_first_stop_pascals / amb_press_next_stop_pascals);
      ending_radius = this.radius_root_finder(a, b, c, low_bound, high_bound);
      radius2_n2[i - 1] = ending_radius;
      deco_gradient_pascals =
        (2.0 * this.surface_tension_gamma) / ending_radius;
      this.deco_gradient_n2[i - 1] =
        (deco_gradient_pascals / 101325.0) * this.units_factor;
    }
    /* =============================================================================== */
    /*      END OF SUBROUTINE */
    /* =============================================================================== */
    return 0;
  }

  /* =============================================================================== */
  /*     SUBROUTINE DECOMPRESSION_STOP */
  /*     Purpose: This subprogram calculates the required time at each */
  /*     decompression stop. */
  /* =============================================================================== */

  decompression_stop(
    deco_stop_depth,
    step_size,
    addition_time,
    min_stop_time // JURE extended decostops - added parameters addition_time - the time you want prolonge deco stop for //                           min_stop_time - mimimum deco stop time
  ) {
    /* System generated locals */
    let r1;

    /* Local VARIABLES */
    let inspired_nitrogen_pressure;
    let last_segment_number;
    let weighted_allowable_gradient,
      initial_helium_pressure = new Array();

    let time_counter;
    let i;
    let ambient_pressure;
    let inspired_helium_pressure, next_stop, last_run_time, temp_segment_time;

    let initial_nitrogen_pressure = new Array(),
      round_up_operation;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    last_run_time = this.run_time;
    r1 = last_run_time / this.minimum_deco_stop_time + 0.5;
    round_up_operation = Math.round(r1) * this.minimum_deco_stop_time;
    this.segment_time = round_up_operation - this.run_time;
    this.run_time = round_up_operation;
    temp_segment_time = this.segment_time;
    last_segment_number = this.segment_number;
    this.segment_number = last_segment_number + 1;
    ambient_pressure = deco_stop_depth + this.barometric_pressure;
    this.ending_ambient_pressure = ambient_pressure;
    next_stop = deco_stop_depth - step_size;
    /* === CCR NOTE: inspired pressures lety according to the set pO2 of CCR  ===== */
    let main = this;
    function updateFractions(segment_time) {
      return main.calc_inspired_gas(
        ambient_pressure,
        main.fraction_helium[main.mix_number - 1],
        main.fraction_nitrogen[main.mix_number - 1],
        main.fraction_pO2SetPoint[main.mix_number - 1],
        main.fraction_useDiluentGas[main.mix_number - 1],
        segment_time
      );
    }
    let fractions = updateFractions(this.segment_time);
    inspired_helium_pressure =
      (ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_helium;
    inspired_nitrogen_pressure =
      (ambient_pressure - this.water_vapor_pressure) *
      fractions.fraction_nitrogen;
    /* =============================================================================== */
    /*     Check to make sure that program won't lock up if unable to decompress */
    /*     to the next stop.  If so, write error message and terminate program. */
    /* =============================================================================== */

    /* === CCR NOTE GRADIENT: weighted gradient  ===== */
    for (i = 1; i <= 16; ++i) {
      if (inspired_helium_pressure + inspired_nitrogen_pressure > 0) {
        weighted_allowable_gradient =
          (this.deco_gradient_he[i - 1] * inspired_helium_pressure +
            this.deco_gradient_n2[i - 1] * inspired_nitrogen_pressure) /
          (inspired_helium_pressure + inspired_nitrogen_pressure);
        if (
          inspired_helium_pressure +
            inspired_nitrogen_pressure +
            this.constant_pressure_other_gases -
            weighted_allowable_gradient >
          next_stop + this.barometric_pressure
        ) {
          this.exit(1);
        }
      }
    }

    while (true) {
      //update inspired inert fractions for pSCR
      fractions = updateFractions(this.run_time - last_run_time);
      inspired_helium_pressure =
        (ambient_pressure - this.water_vapor_pressure) *
        fractions.fraction_helium;
      inspired_nitrogen_pressure =
        (ambient_pressure - this.water_vapor_pressure) *
        fractions.fraction_nitrogen;

      //run loop
      for (i = 1; i <= 16; ++i) {
        initial_helium_pressure[i - 1] = this.helium_pressure[i - 1];
        initial_nitrogen_pressure[i - 1] = this.nitrogen_pressure[i - 1];
        this.helium_pressure[i - 1] = this.haldane_equation__(
          initial_helium_pressure[i - 1],
          inspired_helium_pressure,
          this.helium_time_constant[i - 1],
          this.segment_time
        );
        this.nitrogen_pressure[i - 1] = this.haldane_equation__(
          initial_nitrogen_pressure[i - 1],
          inspired_nitrogen_pressure,
          this.nitrogen_time_constant[i - 1],
          this.segment_time
        );
        /* L720: */
      }
      this.calc_deco_ceiling();
      if (this.deco_ceiling_depth > next_stop) {
        this.segment_time = this.minimum_deco_stop_time;
        time_counter = temp_segment_time;
        temp_segment_time = time_counter + this.minimum_deco_stop_time;
        this.run_time = this.run_time + this.minimum_deco_stop_time;
      } else break;
    }

    // JURE extended stops - START
    if (addition_time > 0) {
      this.segment_time = addition_time;
      temp_segment_time += this.segment_time;
      this.run_time += this.segment_time;

      for (i = 1; i <= 16; ++i) {
        initial_helium_pressure[i - 1] = this.helium_pressure[i - 1];
        initial_nitrogen_pressure[i - 1] = this.nitrogen_pressure[i - 1];
        this.helium_pressure[i - 1] = this.haldane_equation__(
          initial_helium_pressure[i - 1],
          inspired_helium_pressure,
          this.helium_time_constant[i - 1],
          this.segment_time
        );
        this.nitrogen_pressure[i - 1] = this.haldane_equation__(
          initial_nitrogen_pressure[i - 1],
          inspired_nitrogen_pressure,
          this.nitrogen_time_constant[i - 1],
          this.segment_time
        );
      }
      this.calc_deco_ceiling();
    }

    if (this.run_time - Math.floor(last_run_time) < min_stop_time) {
      this.segment_time =
        min_stop_time - (this.run_time - Math.floor(last_run_time));
      temp_segment_time += this.segment_time;
      this.run_time += this.segment_time;

      for (i = 1; i <= 16; ++i) {
        initial_helium_pressure[i - 1] = this.helium_pressure[i - 1];
        initial_nitrogen_pressure[i - 1] = this.nitrogen_pressure[i - 1];
        this.helium_pressure[i - 1] = this.haldane_equation__(
          initial_helium_pressure[i - 1],
          inspired_helium_pressure,
          this.helium_time_constant[i - 1],
          this.segment_time
        );
        this.nitrogen_pressure[i - 1] = this.haldane_equation__(
          initial_nitrogen_pressure[i - 1],
          inspired_nitrogen_pressure,
          this.nitrogen_time_constant[i - 1],
          this.segment_time
        );
      }
      this.calc_deco_ceiling();
    }
    // JURE extended stops - END

    this.segment_time = temp_segment_time;
    return 0;
  } /* this.decompression_stop */

  /* =============================================================================== */
  /*      SUBROUTINE CALC_DECO_CEILING */
  /*      Purpose: This subprogram calculates the deco ceiling (the safe ascent */
  /*      depth) in each compartment, based on the allowable "deco gradients" */
  /*      computed in the Boyle's Law Compensation subroutine, and then finds the */
  /*      deepest deco ceiling across all compartments.  This deepest value */
  /*      (Deco Ceiling Depth) is then used by the Decompression Stop subroutine */
  /*      to determine the actual deco schedule. */
  /* =============================================================================== */
  calc_deco_ceiling = function () {
    /* Local VARIABLES */
    let i;
    let gas_loading, weighted_allowable_gradient;
    let tolerated_ambient_pressure;
    let compartment_deco_ceiling = new Array();

    /* =============================================================================== */
    /*      CALCULATIONS */
    /*      Since there are two sets of deco gradients being tracked, one for */
    /*      helium and one for nitrogen, a "weighted allowable gradient" must be */
    /*      computed each time based on the proportions of helium and nitrogen in */
    /*      each compartment.  This proportioning follows the methodology of */
    /*      Buhlmann/Keller.  If there is no helium and nitrogen in the compartment, */
    /*      such as after extended periods of oxygen breathing, then the minimum value */
    /*      across both gases will be used.  It is important to note that if a */
    /*      compartment is empty of helium and nitrogen, then the weighted allowable */
    /*      gradient formula cannot be used since it will result in division by zero. */
    /* =============================================================================== */
    for (i = 1; i <= 16; ++i) {
      gas_loading = this.helium_pressure[i - 1] + this.nitrogen_pressure[i - 1];

      if (gas_loading > 0.0) {
        weighted_allowable_gradient =
          (this.deco_gradient_he[i - 1] * this.helium_pressure[i - 1] +
            this.deco_gradient_n2[i - 1] * this.nitrogen_pressure[i - 1]) /
          (this.helium_pressure[i - 1] + this.nitrogen_pressure[i - 1]);

        tolerated_ambient_pressure =
          gas_loading +
          this.constant_pressure_other_gases -
          weighted_allowable_gradient;
      } else {
        weighted_allowable_gradient = Math.min(
          this.deco_gradient_he[i - 1],
          this.deco_gradient_n2[i - 1]
        );

        tolerated_ambient_pressure =
          this.constant_pressure_other_gases - weighted_allowable_gradient;
      }
      /* =============================================================================== */
      /*      The tolerated ambient pressure cannot be less than zero absolute, i.e., */
      /*      the vacuum of outer space! */
      /* =============================================================================== */
      if (tolerated_ambient_pressure < 0.0) {
        tolerated_ambient_pressure = 0.0;
      }
      /* =============================================================================== */
      /*      The Deco Ceiling Depth is computed in a loop after all of the individual */
      /*      compartment deco ceilings have been calculated.  It is important that the */
      /*      Deco Ceiling Depth (max deco ceiling across all compartments) only be */
      /*      extracted from the compartment values and not be compared against some */
      /*      initialization value.  For example, if MAX(Deco_Ceiling_Depth . .) was */
      /*      compared against zero, this could cause a program lockup because sometimes */
      /*      the Deco Ceiling Depth needs to be negative (but not less than absolute */
      /*      zero) in order to decompress to the last stop at zero depth. */
      /* =============================================================================== */
      compartment_deco_ceiling[i - 1] =
        tolerated_ambient_pressure - this.barometric_pressure;
    }

    this.deco_ceiling_depth = compartment_deco_ceiling[0];
    for (i = 2; i <= 16; ++i) {
      this.deco_ceiling_depth = Math.max(
        this.deco_ceiling_depth,
        compartment_deco_ceiling[i - 1]
      );
    }
    /* =============================================================================== */
    /*      END OF SUBROUTINE */
    /* =============================================================================== */
    return 0;
  };

  /* =============================================================================== */
  /*     SUBROUTINE GAS_LOADINGS_SURFACE_INTERVAL */
  /*     Purpose: This subprogram calculates the gas loading (off-gassing) during */
  /*     a surface interval. */
  /* =============================================================================== */

  gas_loadings_surface_interval(surface_interval_time) {
    let inspired_nitrogen_pressure, initial_helium_pressure;

    let i;
    let inspired_helium_pressure, initial_nitrogen_pressure;

    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    inspired_helium_pressure = 0;
    inspired_nitrogen_pressure =
      (this.barometric_pressure - this.water_vapor_pressure) * 0.79;
    for (i = 1; i <= 16; ++i) {
      initial_helium_pressure = this.helium_pressure[i - 1];
      initial_nitrogen_pressure = this.nitrogen_pressure[i - 1];
      this.helium_pressure[i - 1] = this.haldane_equation__(
        initial_helium_pressure,
        inspired_helium_pressure,
        this.helium_time_constant[i - 1],
        surface_interval_time
      );
      this.nitrogen_pressure[i - 1] = this.haldane_equation__(
        initial_nitrogen_pressure,
        inspired_nitrogen_pressure,
        this.nitrogen_time_constant[i - 1],
        surface_interval_time
      );
    }
    return 0;
  } /* this.gas_loadings_surface_interval */

  /* =============================================================================== */
  /*     SUBROUTINE VPM_REPETITIVE_ALGORITHM */
  /*     Purpose: This subprogram implements the VPM Repetitive Algorithm that was */
  /*     envisioned by Professor David E. Yount only months before his passing. */

  /* =============================================================================== */
  vpm_repetitive_algorithm = function (surface_interval_time) {
    /* Local VARIABLES */
    let max_actual_gradient_pascals;
    // let initial_allowable_grad_n2_pa,
    //initial_allowable_grad_he_pa;
    let i;
    let adj_crush_pressure_n2_pascals,
      new_critical_radius_n2,
      adj_crush_pressure_he_pascals,
      new_critical_radius_he;
    /* loop */
    /* =============================================================================== */
    /*     CALCULATIONS */
    /* =============================================================================== */

    for (i = 1; i <= 16; ++i) {
      max_actual_gradient_pascals =
        (this.max_actual_gradient[i - 1] / this.units_factor) * 101325;
      adj_crush_pressure_he_pascals =
        (this.adjusted_crushing_pressure_he[i - 1] / this.units_factor) *
        101325;
      adj_crush_pressure_n2_pascals =
        (this.adjusted_crushing_pressure_n2[i - 1] / this.units_factor) *
        101325;
      /*initial_allowable_grad_he_pa =
        (this.initial_allowable_gradient_he[i - 1] / this.units_factor) *
        101325;
      initial_allowable_grad_n2_pa =
        (this.initial_allowable_gradient_n2[i - 1] / this.units_factor) *
        101325;*/
      if (
        this.max_actual_gradient[i - 1] >
        this.initial_allowable_gradient_n2[i - 1]
      ) {
        new_critical_radius_n2 =
          (this.surface_tension_gamma *
            2 *
            (this.skin_compression_gammac - this.surface_tension_gamma)) /
          (max_actual_gradient_pascals * this.skin_compression_gammac -
            this.surface_tension_gamma * adj_crush_pressure_n2_pascals);
        this.adjusted_critical_radius_n2[i - 1] =
          this.initial_critical_radius_n2[i - 1] +
          (this.initial_critical_radius_n2[i - 1] - new_critical_radius_n2) *
            Math.exp(-surface_interval_time / this.regeneration_time_constant);
      } else {
        this.adjusted_critical_radius_n2[i - 1] =
          this.initial_critical_radius_n2[i - 1];
      }
      if (
        this.max_actual_gradient[i - 1] >
        this.initial_allowable_gradient_he[i - 1]
      ) {
        new_critical_radius_he =
          (this.surface_tension_gamma *
            2 *
            (this.skin_compression_gammac - this.surface_tension_gamma)) /
          (max_actual_gradient_pascals * this.skin_compression_gammac -
            this.surface_tension_gamma * adj_crush_pressure_he_pascals);
        this.adjusted_critical_radius_he[i - 1] =
          this.initial_critical_radius_he[i - 1] +
          (this.initial_critical_radius_he[i - 1] - new_critical_radius_he) *
            Math.exp(-surface_interval_time / this.regeneration_time_constant);
      } else {
        this.adjusted_critical_radius_he[i - 1] =
          this.initial_critical_radius_he[i - 1];
      }
    }
    return 0;
  }; /* this.vpm_repetitive_algorithm */

  /* =============================================================================== */
  /*     SUBROUTINE CALC_BAROMETRIC_PRESSURE */
  /*     Purpose: This sub calculates barometric pressure at altitude based on the */
  /*     publication "U.S. Standard Atmosphere, 1976", U.S. Government Printing */
  /*     Office, Washington, D.C. The source for this code is a Fortran 90 program */
  /*     written by Ralph L. Carmichael (retired NASA researcher) and endorsed by */
  /*     the National Geophysical Data Center of the National Oceanic and */
  /*     Atmospheric Administration.  It is available for download free from */
  /*     Public Domain Aeronautical Software at:  http://www.pdas.com/atmos.htm */
  /* =============================================================================== */

  calc_barometric_pressure(altitude) {
    /* Local VARIABLES */
    let altitude_meters,
      molecular_weight_of_air,
      acceleration_of_operation,
      altitude_kilometers,
      altitude_feet,
      temp_gradient,
      temp_at_sea_level,
      pressure_at_sea_level,
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
    if (this.units_equal_fsw) {
      altitude_feet = altitude;
      altitude_kilometers = altitude_feet / 3280.839895;
      pressure_at_sea_level = pressure_at_sea_level_fsw;
    } else {
      altitude_meters = altitude;
      altitude_kilometers = altitude_meters / 1e3;
      pressure_at_sea_level = pressure_at_sea_level_msw;
    }
    geopotential_altitude =
      (altitude_kilometers * radius_of_earth) /
      (altitude_kilometers + radius_of_earth);
    temp_at_geopotential_altitude =
      temp_at_sea_level + temp_gradient * geopotential_altitude;
    this.barometric_pressure =
      pressure_at_sea_level *
      Math.exp(
        (Math.log(temp_at_sea_level / temp_at_geopotential_altitude) *
          gmr_factor) /
          temp_gradient
      );

    return 0;
  } /* this.calc_barometric_pressure */

  /* =============================================================================== */
  /*     SUBROUTINE VPM_ALTITUDE_DIVE_ALGORITHM */
  /*     Purpose:  This subprogram updates gas loadings and adjusts critical radii */
  /*     (as required) based on whether or not diver is acclimatized at altitude or */
  /*     makes an ascent to altitude before the dive. */
  /* =============================================================================== */

  vpm_altitude_dive_algorithm() {
    let i;

    let inspired_nitrogen_pressure,
      ending_radius_n2,
      rate,
      ascent_to_altitude_time,
      ending_ambient_pressure,
      ending_radius_he;

    let gradient_n2_bubble_formation;

    let gradient_he_bubble_formation,
      time_at_altitude_before_dive,
      compartment_gradient,
      initial_inspired_n2_pressure;

    let regenerated_radius_n2,
      compartment_gradient_pascals,
      nitrogen_rate,
      regenerated_radius_he;

    let new_critical_radius_n2, starting_ambient_pressure;
    let diver_acclimatized;
    let initial_nitrogen_pressure, new_critical_radius_he;

    if (this.units_equal_fsw && this.altitude_of_dive > 30000.0) {
      this.exit(1);
    }
    if (this.units_equal_msw && this.altitude_of_dive > 9144) {
      this.exit(1);
    }
    if (
      this.diver_acclimatized_at_altitude == "YES" ||
      this.diver_acclimatized_at_altitude == "yes"
    ) {
      diver_acclimatized = true;
    } else {
      diver_acclimatized = false;
    }

    ascent_to_altitude_time = this.ascent_to_altitude_hours * 60;
    time_at_altitude_before_dive = this.hours_at_altitude_before_dive * 60;
    if (diver_acclimatized) {
      this.calc_barometric_pressure(this.altitude_of_dive);

      for (i = 1; i <= 16; ++i) {
        this.adjusted_critical_radius_n2[i - 1] =
          this.initial_critical_radius_n2[i - 1];
        this.adjusted_critical_radius_he[i - 1] =
          this.initial_critical_radius_he[i - 1];
        this.helium_pressure[i - 1] = 0;
        this.nitrogen_pressure[i - 1] =
          (this.barometric_pressure - this.water_vapor_pressure) * 0.79;
      }
    } else {
      if (
        this.starting_acclimatized_altitude >= this.altitude_of_dive ||
        this.starting_acclimatized_altitude < 0
      ) {
        this.exit(1);
      }
      this.calc_barometric_pressure(this.starting_acclimatized_altitude);

      starting_ambient_pressure = this.barometric_pressure;
      for (i = 1; i <= 16; ++i) {
        this.helium_pressure[i - 1] = 0;
        this.nitrogen_pressure[i - 1] =
          (this.barometric_pressure - this.water_vapor_pressure) * 0.79;
      }
      this.calc_barometric_pressure(this.altitude_of_dive);

      ending_ambient_pressure = this.barometric_pressure;
      initial_inspired_n2_pressure =
        (starting_ambient_pressure - this.water_vapor_pressure) * 0.79;
      rate =
        (ending_ambient_pressure - starting_ambient_pressure) /
        ascent_to_altitude_time;
      nitrogen_rate = rate * 0.79;
      for (i = 1; i <= 16; ++i) {
        initial_nitrogen_pressure = this.nitrogen_pressure[i - 1];
        this.nitrogen_pressure[i - 1] = this.schreiner_equation__(
          initial_inspired_n2_pressure,
          nitrogen_rate,
          ascent_to_altitude_time,
          this.nitrogen_time_constant[i - 1],
          initial_nitrogen_pressure
        );
        compartment_gradient =
          this.nitrogen_pressure[i - 1] +
          this.constant_pressure_other_gases -
          ending_ambient_pressure;
        compartment_gradient_pascals =
          (compartment_gradient / this.units_factor) * 101325;
        gradient_he_bubble_formation =
          (this.surface_tension_gamma *
            2 *
            (this.skin_compression_gammac - this.surface_tension_gamma)) /
          (this.initial_critical_radius_he[i - 1] *
            this.skin_compression_gammac);
        if (compartment_gradient_pascals > gradient_he_bubble_formation) {
          new_critical_radius_he =
            (this.surface_tension_gamma *
              2 *
              (this.skin_compression_gammac - this.surface_tension_gamma)) /
            (compartment_gradient_pascals * this.skin_compression_gammac);
          this.adjusted_critical_radius_he[i - 1] =
            this.initial_critical_radius_he[i - 1] +
            (this.initial_critical_radius_he[i - 1] - new_critical_radius_he) *
              Math.exp(
                -time_at_altitude_before_dive / this.regeneration_time_constant
              );
          this.initial_critical_radius_he[i - 1] =
            this.adjusted_critical_radius_he[i - 1];
        } else {
          ending_radius_he =
            1 /
            (compartment_gradient_pascals /
              ((this.surface_tension_gamma - this.skin_compression_gammac) *
                2) +
              1 / this.initial_critical_radius_he[i - 1]);
          regenerated_radius_he =
            this.initial_critical_radius_he[i - 1] +
            (ending_radius_he - this.initial_critical_radius_he[i - 1]) *
              Math.exp(
                -time_at_altitude_before_dive / this.regeneration_time_constant
              );
          this.initial_critical_radius_he[i - 1] = regenerated_radius_he;
          this.adjusted_critical_radius_he[i - 1] =
            this.initial_critical_radius_he[i - 1];
        }
        gradient_n2_bubble_formation =
          (this.surface_tension_gamma *
            2 *
            (this.skin_compression_gammac - this.surface_tension_gamma)) /
          (this.initial_critical_radius_n2[i - 1] *
            this.skin_compression_gammac);
        if (compartment_gradient_pascals > gradient_n2_bubble_formation) {
          new_critical_radius_n2 =
            (this.surface_tension_gamma *
              2 *
              (this.skin_compression_gammac - this.surface_tension_gamma)) /
            (compartment_gradient_pascals * this.skin_compression_gammac);
          this.adjusted_critical_radius_n2[i - 1] =
            this.initial_critical_radius_n2[i - 1] +
            (this.initial_critical_radius_n2[i - 1] - new_critical_radius_n2) *
              Math.exp(
                -time_at_altitude_before_dive / this.regeneration_time_constant
              );
          this.initial_critical_radius_n2[i - 1] =
            this.adjusted_critical_radius_n2[i - 1];
        } else {
          ending_radius_n2 =
            1 /
            (compartment_gradient_pascals /
              ((this.surface_tension_gamma - this.skin_compression_gammac) *
                2) +
              1 / this.initial_critical_radius_n2[i - 1]);
          regenerated_radius_n2 =
            this.initial_critical_radius_n2[i - 1] +
            (ending_radius_n2 - this.initial_critical_radius_n2[i - 1]) *
              Math.exp(
                -time_at_altitude_before_dive / this.regeneration_time_constant
              );
          this.initial_critical_radius_n2[i - 1] = regenerated_radius_n2;
          this.adjusted_critical_radius_n2[i - 1] =
            this.initial_critical_radius_n2[i - 1];
        }
      }
      inspired_nitrogen_pressure =
        (this.barometric_pressure - this.water_vapor_pressure) * 0.79;
      for (i = 1; i <= 16; ++i) {
        initial_nitrogen_pressure = this.nitrogen_pressure[i - 1];
        this.nitrogen_pressure[i - 1] = this.haldane_equation__(
          initial_nitrogen_pressure,
          inspired_nitrogen_pressure,
          this.nitrogen_time_constant[i - 1],
          time_at_altitude_before_dive
        );
      }
    }

    return 0;
  } // vpm_altitude_dive_algorithm

  exit(a) {
    console.log("exit", a);
  }

  pause() {}

  cbrtf(a) {
    // computes the cube root of the argument
    if (a > 0) return Math.exp(Math.log(a) / 3);
    else if (a < 0) return -Math.exp(Math.log(-a) / 3);
    // a==0
    else return 0;
  }

  // JURE multilevel START
  roundDecoStop(stop_depth, step_size) {
    let rounding_operation;

    if (this.units_equal_fsw) {
      if (step_size < 10) {
        rounding_operation = stop_depth / step_size + 0.5;
        stop_depth = Math.floor(rounding_operation) * step_size;
      } else {
        rounding_operation = stop_depth / 10 + 0.5;
        stop_depth = Math.floor(rounding_operation) * 10;
      }
    }
    if (this.units_equal_msw) {
      if (step_size < 3) {
        rounding_operation = stop_depth / step_size + 0.5;
        stop_depth = Math.floor(rounding_operation) * step_size;
      } else {
        rounding_operation = stop_depth / 3 + 0.5;
        stop_depth = Math.floor(rounding_operation) * 3;
      }
    }

    if (stop_depth < 0) stop_depth = 0;

    return stop_depth;
  }
  // JURE multilevel END
}
