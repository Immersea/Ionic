import {isNumber, round} from "lodash";

export class DiveTools {
  depthToPressFactor = 10.1325; // 10.1325 if meters 33. , if feets
  depthToPressFactorMsw = 10.1325;
  ltToCuFtFactor = 1;
  liquidSamples: any;
  gravitySamples: any;
  surfacePressureSamples: any;
  constants: any;
  conversions = {
    feetPerMeter: 3.25684678, //internet  3.26336, //originale 3.2808399,
    celsiusPerFahrenheit: 1.8,
    kilogramsPerPound: 0.45359237,
    barPerPsi: 14.5037738,
    litersPerCuFt: 0.03351351351, //0.035314666721, changed to account for ideal gases in US calculations
  };
  units = "Metric";
  depthUnit = "mt";
  pressUnit = "bar";
  volumeUnit = "lt";

  constructor() {
    /*
     * The effect of pressure and temperature on the densities of liquids
     * and solids is small. The compressibility for a typical liquid or
     * solid is 10−6 bar−1 (1 bar = 0.1 MPa) and a typical thermal
     * expansivity is 10−5 K−1. This roughly translates into needing
     * around ten thousand times atmospheric pressure to reduce the
     * volume of a substance by one percent. (Although the pressures
     * needed may be around a thousand times smaller for sandy soil
     * and some clays.) A one percent expansion of volume typically
     * requires a temperature increase on the order of thousands of degrees Celsius.
     */
    // current liquid sample density in kilogram per cubic meters (kg/m3) or grams per cubic centimeters (g/cm3)
    this.liquidSamples = {
      fresh: {
        density: function () {
          return this.density(1000, 1); // 1000kg / m3 at 0C / 32F (standard conditions for measurements)
        },
      },
      salt: {
        density: function () {
          return this.density(1030, 1); // 1000kg / m3 at 0C / 32F (standard conditions for measurements)
        },
      },
      mercury: {
        density: function () {
          return this.density(13595.1, 1); // 13595.1 kg / m3 at 0C / 32F (standard conditions)
        },
      },
    };

    // current gravity sample rates in meters per second per second (m/s2)
    this.gravitySamples = {
      earth: 9.80665,
      _current: 9.80665,
      current: function (_value) {
        if (typeof _value == "number") {
          this.gravitySamples._current = _value;
        }
        return this.gravitySamples._current;
      },
    };

    // current surface pressure measured in bar
    this.surfacePressureSamples = {
      earth: 1,
      _current: 1,
      current: function (_value) {
        if (typeof _value == "number") {
          this.surfacePressureSamples._current = _value;
        }
        return this.surfacePressureSamples._current;
      },
    };

    this.constants = {
      vapourPressure: {
        water: {
          tempRange_1_100: [8.07131, 1730.63, 233.426],
          tempRange_99_374: [8.14019, 1810.94, 244, 485],
        },
        lungsBreathing: {
          _current: null,
          current: function () {
            if (!this.constants.vapourPressure.lungsBreathing._current) {
              let value = this.waterVapourPressureInBars(35.2);
              this.constants.vapourPressure.lungsBreathing._current = value;
            }
            return this.constants.vapourPressure.lungsBreathing._current;
          },
        },
      },
      altitudePressure: {
        sealevel: 1,
        _current: 1,
        current: function (_value) {
          if (typeof _value == "number") {
            this.constants.altitudePressure._current = _value;
          }
          return this.constants.altitudePressure._current;
        },
      },
    };
  }

  //*****************************************
  // Method:   setMetric
  // Input:    true if metric false if imperiall
  // Output:   /
  //*****************************************
  setMetric(metric) {
    if (metric) {
      this.depthToPressFactor = 10.1325;
      this.ltToCuFtFactor = 1;
      this.depthUnit = "mt";
      this.pressUnit = "bar";
      this.volumeUnit = "lt";
      this.units = "Metric";
    } else {
      this.depthToPressFactor = 33;
      this.ltToCuFtFactor = 0.035315;
      this.depthUnit = "ft";
      this.pressUnit = "psi";
      this.volumeUnit = "cuft";
      this.units = "Imperial";
    }
  }

  //*****************************************
  // Method:   getSegmentOTU
  // Input:    segment data
  // Output:   OTU on this segment
  //*****************************************
  getSegmentOTU(
    startDepth,
    endDepth,
    fO2First,
    fO2Second,
    ascentRate,
    descenRate,
    segmentTime,
    units
  ) {
    // Calculates OTU on a given segment
    //Segment is a accent/decent and then constant depth
    let rate;
    let otu = 0;

    //convert to metric
    if (units !== "Metric") {
      startDepth = this.feetToMeters(startDepth);
      endDepth = this.feetToMeters(endDepth);
      ascentRate = this.feetToMeters(ascentRate);
      descenRate = this.feetToMeters(descenRate);
    }

    //*******************************
    // imput parameter testing
    //*******************************
    if (
      ascentRate > -1 ||
      descenRate < 1 ||
      startDepth < 0 ||
      endDepth < 0 ||
      segmentTime < 0 ||
      fO2First > 1 ||
      fO2First < 0 ||
      fO2Second > 1 ||
      fO2Second < 0
    )
      return -1;

    if (startDepth > endDepth) rate = ascentRate;
    else if (startDepth < endDepth) rate = descenRate;
    else rate = 1; // does not mater, but it maust be value you can devide with

    //*************************************
    // ascent/descent part of the segment
    //*************************************
    let firstSegmentTime = (endDepth - startDepth) / rate;
    if (firstSegmentTime > 0) {
      let startPres = startDepth / this.depthToPressFactorMsw + 1;
      let endPres = endDepth / this.depthToPressFactorMsw + 1;
      let maxPres = Math.max(startPres, endPres);
      let minPres = Math.min(startPres, endPres);
      let maxPO2 = maxPres * fO2First;
      let minPO2 = minPres * fO2First;
      if (maxPO2 > 0.5) {
        let lowPO2 = Math.max(0.5, minPO2);
        let o2Time = (firstSegmentTime * (maxPO2 - lowPO2)) / (maxPO2 - minPO2);
        otu =
          (((3.0 / 11.0) * o2Time) / (maxPO2 - lowPO2)) *
            Math.pow((maxPO2 - 0.5) / 0.5, 11.0 / 6.0) -
          Math.pow((lowPO2 - 0.5) / 0.5, 11.0 / 6.0);
        if (otu < 0) otu = 0;
      }
    }

    //*************************************
    // constant depth part of the segment
    //*************************************
    let secondSegmentTime = segmentTime - firstSegmentTime;
    let segmentPres = endDepth / this.depthToPressFactorMsw + 1;
    let segmentPO2 = segmentPres * fO2Second;
    if (segmentPO2 > 0.5 && secondSegmentTime > 0)
      otu += secondSegmentTime * Math.pow(0.5 / (segmentPO2 - 0.5), -5.0 / 6.0);

    return otu;
  }

  //*****************************************
  // Method:   getSegmentCNS
  // Input:    segment data
  // Output:   CNS on this segment
  //*****************************************
  getSegmentCNS(
    startDepth,
    endDepth,
    fO2First,
    fO2Second,
    ascentRate,
    descenRate,
    segmentTime,
    units
  ) {
    // Calculates CNS on a given segment
    //Segment is a accent/decent and then constant depth

    let rate;
    let cns = 0;
    let i;
    let noSegments = 10;
    let pO2lo = new Array(0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.5, 1.6, 1.7, 1.8);
    let pO2hi = new Array(0.6, 0.7, 0.8, 0.9, 1.1, 1.5, 1.6, 1.7, 1.8, 2.0);
    let limSLP = new Array(
      -1800,
      -1500,
      -1200,
      -900,
      -600,
      -300,
      -750,
      -280,
      -72,
      -44
    );
    let limINT = new Array(
      1800,
      1620,
      1410,
      1171,
      900,
      570,
      1245,
      493,
      139.4,
      89
    );

    //convert to metric
    if (units !== "Metric") {
      startDepth = this.feetToMeters(startDepth);
      endDepth = this.feetToMeters(endDepth);
      ascentRate = this.feetToMeters(ascentRate);
      descenRate = this.feetToMeters(descenRate);
    }

    //*******************************
    // imput parameter testing
    //*******************************
    if (
      ascentRate > -1 ||
      descenRate < 1 ||
      startDepth < 0 ||
      endDepth < 0 ||
      segmentTime < 0 ||
      fO2First > 1 ||
      fO2First < 0 ||
      fO2Second > 1 ||
      fO2Second < 0
    )
      return -1;

    if (startDepth > endDepth) rate = ascentRate;
    else if (startDepth < endDepth) rate = descenRate;
    else rate = 1; // does not mater, but it maust be value you can devide with

    //*************************************
    // ascent/descent part of the segment
    //*************************************
    let firstSegmentTime = (endDepth - startDepth) / rate;
    if (firstSegmentTime > 0) {
      let startPres = startDepth / this.depthToPressFactorMsw + 1;
      let endPres = endDepth / this.depthToPressFactorMsw + 1;
      let maxPres = Math.max(startPres, endPres);
      let minPres = Math.min(startPres, endPres);
      let maxPO2 = maxPres * fO2First;
      let minPO2 = minPres * fO2First;
      if (maxPO2 > 2.0) return 5 * segmentTime;

      if (maxPO2 > 0.5) {
        let lowPO2 = Math.max(0.5, minPO2);
        //let o2Time = firstSegmentTime*(maxPO2 - minPO2)/(maxPO2 - lowPO2);

        let oTime = new Array();
        let pO2o = new Array();
        let pO2f = new Array();
        let segpO2 = new Array();

        for (i = 0; i < noSegments; i++) {
          if (maxPO2 > pO2lo[i] && lowPO2 <= pO2hi[i]) {
            if (startDepth > endDepth) {
              pO2o[i] = Math.min(maxPO2, pO2hi[i]);
              pO2f[i] = Math.max(lowPO2, pO2lo[i]);
            } else {
              pO2o[i] = Math.max(lowPO2, pO2lo[i]);
              pO2f[i] = Math.min(maxPO2, pO2hi[i]);
            }

            segpO2[i] = pO2f[i] - pO2o[i];
            if (maxPO2 != lowPO2)
              oTime[i] =
                (firstSegmentTime * Math.abs(segpO2[i])) / (maxPO2 - lowPO2);
            else oTime[i] = 0.0;
          } else {
            oTime[i] = 0.0;
          }
        } // for

        for (i = 0; i < noSegments; i++) {
          let tlimi, mk;
          if (oTime[i] > 0.0) {
            tlimi = limSLP[i] * pO2o[i] + limINT[i];
            mk = limSLP[i] * (segpO2[i] / oTime[i]);
            cns +=
              (1.0 / mk) *
              (Math.log(Math.abs(tlimi + mk * oTime[i])) -
                Math.log(Math.abs(tlimi)));
          }
        } // for
      } // if (maxPO2>0.5)
    }

    //*************************************
    // constant depth part of the segment
    //*************************************
    let secondSegmentTime = segmentTime - firstSegmentTime;
    if (secondSegmentTime > 0) {
      let segmentPres = endDepth / this.depthToPressFactorMsw + 1;
      let segmentPO2 = segmentPres * fO2Second;
      let tlim = 0;

      if (segmentPO2 > 2.0) return cns + 5 * secondSegmentTime;

      if (segmentPO2 > 0.5) {
        for (i = 0; i < noSegments; i++) {
          if (segmentPO2 > pO2lo[i] && segmentPO2 <= pO2hi[i]) {
            tlim = limSLP[i] * segmentPO2 + limINT[i];
            break;
          }
        } // for
        if (tlim > 0) cns += secondSegmentTime / tlim;
        else return -1;
      } // if (maxPO2>0.5)
    }

    return cns;
  }

  //*****************************************
  // Method:   getSegmentGas
  // Input:    segment data
  // Output:   gas needed on this segment
  //*****************************************
  getSegmentGas(
    startDepth,
    endDepth,
    rmv,
    ascentRate,
    descenRate,
    segmentTime,
    segment
  ) {
    // segment==1 calculate gas only on ascent/descent part of a segment
    // segment==2 calculate gas only on constant depth part of a segment
    // segment==3 calculate gas on both parts of a segment
    // Calculates gas needed on a given segment
    //Segment is a ascent/descent and then constant depth
    let rate;
    let gas = 0;
    //convert rmv in lt/min
    if (this.units == "Imperial") {
      rmv = this.cuFtToLt(rmv);
      startDepth = this.feetToMeters(startDepth);
      endDepth = this.feetToMeters(endDepth);
      ascentRate = this.feetToMeters(ascentRate);
      descenRate = this.feetToMeters(descenRate);
    }

    //*******************************
    // imput parameter testing
    //*******************************
    if (
      ascentRate > -1 ||
      descenRate < 1 ||
      startDepth < 0 ||
      endDepth < 0 ||
      segmentTime < 0
    )
      return -1;

    if (startDepth > endDepth) rate = ascentRate;
    else if (startDepth < endDepth) rate = descenRate;
    else rate = 1; // does not mater, but it must be value you can devide with

    // if not enough time
    if (startDepth != endDepth && (endDepth - startDepth) / rate > segmentTime)
      return -1;

    //*************************************
    // ascent/descent part of the segment
    //*************************************
    let firstSegmentTime = (endDepth - startDepth) / rate;
    if (firstSegmentTime > 0) {
      let startPres = startDepth / this.depthToPressFactorMsw + 1; //pres in bar
      let endPres = endDepth / this.depthToPressFactorMsw + 1; //pres in bar
      if ((segment & 1) == 1)
        gas = ((startPres + endPres) / 2) * rmv * firstSegmentTime;
    }

    //*************************************
    // constant depth part of the segment
    //*************************************
    let secondSegmentTime = segmentTime - firstSegmentTime;
    let segmentPres = endDepth / this.depthToPressFactorMsw + 1; //pres in bar
    if ((segment & 2) == 2) gas += segmentPres * rmv * secondSegmentTime; //in Lt
    if (this.units == "Imperial") {
      gas = this.ltToCuFt(gas);
    }
    return gas;
  }

  //*****************************************
  // Method:   depth2press
  // Input:    depth
  // Output:   preasure at depth/bar
  //*****************************************
  depth2press(depth) {
    return depth / this.depthToPressFactor + 1;
  }

  convertInlt(value) {
    return value / this.ltToCuFtFactor;
  }

  //*****************************************
  // Method:   gasmixToString
  // Input:    fraction of Oxygen and fraction of Helium
  // Output:   String Representaion of a mix
  //*****************************************
  gasmixToString(fO2, fHe) {
    let rv = "";

    if (fO2 == 1) return "Oxygen";
    if (fO2 >= 0.209 && fO2 <= 0.21 && fHe == 0) return "Air";
    if (fHe == 0) rv += "Nx";
    else rv += "Tx";
    if (Math.round(100 * fO2) == 100 * fO2) rv += Math.round(100 * fO2);
    else rv += Math.round(1000 * fO2) / 10;
    if (fHe == 0) return rv;
    if (Math.round(100 * fHe) == 100 * fHe)
      // no decimal point
      rv += "/" + Math.round(100 * fHe);
    else rv += "/" + Math.round(1000 * fHe) / 10;
    return rv;
  }

  calulateAverageDepthTime(profile) {
    //find depth and time columns
    let depth_column = 0,
      time_column = 0,
      i = 0,
      depth_array = [],
      time_array = [],
      average_depth = 0,
      average_bottom_depth = 0,
      average_bottom_time = 0,
      runtime = 0,
      maxdepth = 0;

    profile[0].forEach(function (column) {
      if (column == "Depth") {
        depth_column = i;
      } else if (column == "Time") {
        time_column = i;
      }
      i++;
    });

    //new array with depth and time difference
    for (i = 1; i < profile.length; i++) {
      depth_array.push(profile[i][depth_column]);
      let time_difference =
        i == 1
          ? profile[i][time_column]
          : profile[i][time_column] - profile[i - 1][time_column];
      time_array.push(time_difference);
      runtime = profile[i][time_column];
      maxdepth =
        profile[i][depth_column] > maxdepth
          ? profile[i][depth_column]
          : maxdepth;
      average_depth += profile[i][depth_column] * time_difference;
    }
    average_depth = average_depth / runtime;

    //caluclate time and depth at bottom
    let min_depth = maxdepth * 0.75; //75% of max depth
    for (i = 0; i < depth_array.length; i++) {
      if (depth_array[i] >= min_depth) {
        average_bottom_depth += depth_array[i] * time_array[i];
        average_bottom_time += time_array[i];
      }
    }
    average_bottom_depth = average_bottom_depth / average_bottom_time;
    let dive;
    (dive.avgDepth = parseFloat(average_depth.toFixed(1))),
      (dive.runtime = parseFloat((runtime / 60).toFixed(1))), //min
      (dive.maxDepth = maxdepth),
      (dive.avgBottomDepth = parseFloat(average_bottom_depth.toFixed(1))),
      (dive.avgBottomTime = parseFloat((average_bottom_time / 60).toFixed(1)));

    return dive;
  }

  mmHgToPascal(mmHg) {
    /// <summary>Returns the definition of mmHg (millimeters mercury) in terms of Pascal.</summary>
    /// <param name="mmHg" type="Number">Millimeters high or depth.</param>
    /// <returns>Typically defined as weight density of mercury</returns>

    if (!mmHg) {
      mmHg = 1;
    }

    return (
      (this.liquidSamples.mercury.density() / 1000) *
      this.gravitySamples.current() *
      mmHg
    );
  }

  pascalToBar(pascals) {
    /// <summary>Calculates the pascal to bar derived unit.</summary>
    /// <param name="pascal" type="Number">The pascal SI derived unit.</param>
    /// <returns>Bar derived unit of pressure from pascal</returns>

    // 100000 pascals = 1 bar
    return pascals / (this.surfacePressureSamples.current() * 100000);
  }

  barToPascal(bars) {
    /// <summary>Calculates the bar to pascal derived unit.</summary>
    /// <param name="bars" type="Number">The bar derived unit.</param>
    /// <returns>Pascal derived unit of pressure from bars</returns>

    if (!bars) {
      bars = 1;
    }

    // 100000 pascals = 1 bar
    return bars * (this.surfacePressureSamples.current() * 100000);
  }

  atmToBar(atm) {
    /// <summary>Calculates the internal pressure (measure of force per unit area) - often
    /// defined as one newton per square meter.</summary>
    /// <param name="atm" type="Number">The number of atmospheres (atm) to conver.</param>
    /// <returns>Bar dervied unit of pressure from atm.</returns>

    let pascals = this.atmToPascal(atm);
    return this.pascalToBar(pascals);
  }

  atmToPascal(atm) {
    /// <summary>Calculates the internal pressure (measure of force per unit area) - often
    /// defined as one newton per square meter.</summary>
    /// <param name="atm" type="Number">The number of atmospheres (atm) to conver.</param>
    /// <returns>Pascal SI dervied unit of pressure from atm.</returns>

    // atm is represented as the force per unit area exerted on a surface by the weight of the
    // air above that surface in the atmosphere. The unit of measurement on Earth is typically
    // 101325 pascals = 1 atm.
    // 100000 pascals = 1 bar
    //
    // On Jupiter (since there isn't technically a surface, the base is determined to be at about 10bars) or
    // 10 times the surface pressure on earth. It's funny how easy it is to use bar since you can essentially
    // say how much times the surface pressure on earth is X. Easy conversion.
    //
    // Interesting enough, according to http://en.wikipedia.org/wiki/Bar_(unit)#Definition_and_conversion
    // atm is a deprecated unit of measurement. Despite the fact that bars are not a standard unit of
    // measurement, meterologists and weather reporters worldwide have long measured air pressure in millibars
    // as the values are convenient. After hPa (hectopascals) were setup, meterologists often use hPa which
    // are numerically equivalent to millibars. (i.e. 1hPa = 1mbar = 100Pa).
    //
    // Given the case for Mars, which averages about 600 Pascals = 6hPa = 6mbar
    // That means that the surface pressure on mars is roughly 166 times weaker than
    // the surface pressure on Earth. Given that Mars's gravity is roughly 3.724m/s2.
    // Which means if you had fresh water on Mars (380kg/m3 accounting for density)
    // the weight density of water on mars would be 1415.12 N/m3. Given 600 Pascals = 600 N/m2.
    // You could dive (if fresh water existed on mars to a reasonanly depth), to reach the level
    // of pressure that you would experience typically at 10 meters here on Earth you would have to
    // dive up to 35.191361896 meters or about 115.457 feet.
    //
    // (Please tell me if I'm calculating this wrong, it seems about accurate to me)
    //

    // See also: https://twitter.com/nyxtom/status/296157625123500032
    // Essentially, thoughts that pondered on how Jupiter's gravitational pull would
    // affect the atmospheric pressure underwater for the moons surrounding it (that essentially made of ice and potentially
    // other water based liquid forms). http://www.planetaryexploration.net/jupiter/io/tidal_heating.html

    // atm is essentially a deprecated unit of measurement
    if (!atm) {
      atm = 1;
    }

    // 100000 pascal = 1 bar = 0.986923267 atm
    // 1 atm = 101325 pascal = 1.01325 bar
    return this.surfacePressureSamples.current() * 101325 * atm;
  }

  pascalToAtm(pascal) {
    /// <summary>Converts pascal to atm.</summary>
    /// <param type="pascal" type="Number">The pascal unit to convert.</param>
    /// <returns>The atmospheric pressure from pascal SI derived unit.<returns>

    return pascal / (this.surfacePressureSamples.current() * 101325);
  }

  density(weight, volume) {
    /// <summary>Calculates the liquid density of the mass for the given volume.</summary>
    /// <param name="weight" type="Number">The weight (in kilograms) of the given mass.</param>
    /// <param name="volume" type="Number">The volume of the given mass in (cubic meters m3).</param>
    /// <returns>Density of the mass</returns>

    return weight / volume;
  }

  depthInMetersToBars(depth, isFreshWater) {
    /// <summary>Calculates the absolute pressure (in bars) for 1 cubic meter of water for the given depth (meters).</summary>
    /// <param name="depth" type="Number">The depth in meters below the surface for 1 cubic meter volume of water.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The absolute pressure (in bars) for the given depth (in meters) of 1 cubic meter volume of water below the surface.</returns>

    let liquidDensity;
    if (isFreshWater) {
      liquidDensity = this.liquidSamples.fresh.density();
    } else {
      liquidDensity = this.liquidSamples.salt.density();
    }

    let weightDensity = liquidDensity * this.gravitySamples.current();
    return (
      this.pascalToBar(depth * weightDensity) +
      this.constants.altitudePressure.current()
    );
  }

  depthInMetersToAtm(depth, isFreshWater) {
    /// <summary>Calculates the absolute pressure (in atm) 1 cubic meter of water for the given depth (meters).</summary>
    /// <param name="depth" type="Number">The depth in meters below the surface for 1 cubic meter volume of water.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The absolute pressure (in atm) for the given depth (in meters) of 1 cubic meter volume of water below the surface.</returns>

    let liquidDensity;
    if (isFreshWater) {
      liquidDensity = this.liquidSamples.fresh.density();
    } else {
      liquidDensity = this.liquidSamples.salt.density();
    }

    let weightDensity = liquidDensity * this.gravitySamples.current();
    return (
      this.pascalToAtm(depth * weightDensity) +
      this.constants.altitudePressure.current()
    );
  }

  barToDepthInMeters(bars, isFreshWater) {
    /// <summary>Calculates the depth (in meters) for the given atmosphere (bar).</summary>
    /// <param name="bars" type="Number">The number of atmospheric pressure (in bars) to convert.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The depth (in meters) for the given number of atmospheres.</returns>

    let liquidDensity;
    if (isFreshWater) {
      liquidDensity = this.liquidSamples.fresh.density();
    } else {
      liquidDensity = this.liquidSamples.salt.density();
    }

    if (!bars) {
      bars = 1;
    }

    let weightDensity = liquidDensity * this.gravitySamples.current();
    let pressure = this.barToPascal(bars);
    return pressure / weightDensity;
  }

  atmToDepthInMeters(atm, isFreshWater) {
    /// <summary>Calculates the depth (in meters) for the given atmosphere (atm).</summary>
    /// <param name="atm" type="Number">The number of atmospheres (atm) to convert.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The depth (in meters) for the given number of atmospheres.</returns>

    /*
     * Liquid pressure is defined as: pgh (density of liquid x gravity at the surface x height).
     * or Pressure = weight density x depth
     *
     * Standard Weight Density: (kg/m3) at 32F or 0C
     *  Water (fresh): 1000 kg/m3
     *  Water (salt): 1030 kg/m3
     *
     * since there is always 1atm (above water)
     *
     *  P = depth x weight density + 1P atm
     *
     *  So to calculate the depth under liquid at which pressure is 2x atm,
     *
     *  depth x weight density + atm pressure (P) = 2 atm
     *  depth = 1P atm / weight density
     *
     *  weight density = density x gravity
     *  1 ATM = 101,325 Pa
     *
     *  weight density of water (fresh) at 0C = 1000 kg/m3 x 9.8m/s2
     *
     *  depth = 101325 Pa / (1000 kg/m3 x 9.8m/s2)
     *  1 newton = kg*m/s2
     *  1 pascal = 1 newton / m2
     *
     *
     *  101325 newton per m2 / (9800 kg*m/m3*s2)
     *  9800 kg*m/m3*s2 = 9800 newton per m3
     *
     *  101325 N/m2 / 9800 N/m3 = 10.339285714 meters
     */

    let liquidDensity;
    if (isFreshWater) {
      liquidDensity = this.liquidSamples.fresh.density();
    } else {
      liquidDensity = this.liquidSamples.salt.density();
    }

    if (!atm) {
      atm = 1;
    }

    let weightDensity = liquidDensity * this.gravitySamples.current();
    let pressure = this.atmToPascal(atm);
    return pressure / weightDensity;
  }

  dac(psiIn, psiOut, runTime) {
    /// <summary>Calculates depth air consumption rate in psi/min.</summary>
    /// <param name="psiIn" type="Number">Pounds/square inch that one starts their dive with.</param>
    /// <param name="psiOut" type="Number">Pounds/square inch that one ends their dive with.</param>
    /// <param name="runTime" type="Number">The total time (in minutes) of a given dive.</param>
    /// <returns>The depth air consumption (DAC) rate in psi/min for the given psi in/out and dive time in minutes.</returns>

    return (psiIn - psiOut) / runTime;
  }

  sac(dac, avgDepth, isFreshWater) {
    /// <summary>Calculates surface air consumption rate in psi/min based on DAC (depth air consumption) rate.</summary>
    /// <param name="dac" type="Number">Depth air consumption rate in psi/min.</param>
    /// <param name="avgDepth" type="Number">Average depth (in meters) for length of dive.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate for fresh water rates, false or undefined for salt water.</param>
    /// <returns>The surface air consumption (SAC) rate in psi/min for the given DAC and average depth.</returns>

    let depthToOneATM = this.atmToDepthInMeters(1, isFreshWater);
    return dac / (avgDepth / depthToOneATM + 1);
  }

  rmv(sac, tankVolume, workingTankPsi) {
    /// <summary>Calculates the respiratory minute volume rate in ft^3/min based on SAC (surface air consumption) rate.</summary>
    /// <param name="sac" type="Number">Surface air consumption rate in psi/min.</param>
    /// <param name="tankVolume" type="Number">Tank volume in cubic feet (typically 80ft^3 or 100ft^3).</param>
    /// <param name="workingTankPsi" type="Number">The working pressure in psi for the given tank (typically stamped on the tank neck).</param>
    /// <returns>The respiratory minute volume rate (SCR) in cubic feet / minute.</returns>

    let tankConversionFactor = tankVolume / workingTankPsi;
    return sac * tankConversionFactor;
  }

  partialPressure(absPressure, volumeFraction) {
    /// <summary>Calculates the partial pressure of a gas component from the volume gas fraction and total pressure.</summary>
    /// <param name="absPressure" type="Number">The total pressure P in bars (typically 1 bar of atmospheric pressure + x bars of water pressure).</param>
    /// <param name="volumeFraction" type="Number">The volume fraction of gas component (typically 0.79 for 79%) measured as percentage in decimal.</param>
    /// <returns>The partial pressure of gas component in bar absolute.</returns>

    return absPressure * volumeFraction;
  }

  partialPressureAtDepth(depth, volumeFraction, isFreshWater) {
    /// <summary>Calculates the partial pressure of a gas component from the volume gas fraction and total pressure from depth in meters.</summary>
    /// <param name="depth" type="Number">The depth in meters below sea level.</param>
    /// <param name="volumeFraction" type="Number">The volume fraction of gas component (typically 0.79 for 79%) measured as percentage in decimal.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The partial pressure of gas component in bar absolute.</returns>

    let p = this.depthInMetersToBars(depth, isFreshWater);
    return p * volumeFraction;
  }

  waterVapourPressure(degreesCelcius) {
    /// <summary>The vapour pressure of water may be approximated as a function of temperature.</summary>
    /// <param name="temp" type="Number">The temperature to approximate the pressure of water vapour.</param>
    /// <returns>Water vapour pressure in terms of mmHg.</returns>

    /* Based on the Antoine_equation http://en.wikipedia.org/wiki/Antoine_equation */
    /* http://en.wikipedia.org/wiki/Vapour_pressure_of_water */
    let rangeConstants;
    if (degreesCelcius >= 1 && degreesCelcius <= 100)
      rangeConstants = this.constants.vapourPressure.water.tempRange_1_100;
    else if (degreesCelcius >= 99 && degreesCelcius <= 374)
      rangeConstants = this.constants.vapourPressure.water.tempRange_99_374;
    else return NaN;

    let logp =
      rangeConstants[0] -
      rangeConstants[1] / (rangeConstants[2] + degreesCelcius);
    return Math.pow(10, logp);
  }

  waterVapourPressureInBars(degreesCelcius) {
    /// <summary>The vapour pressure of water may be approximated as a function of temperature.</summary>
    /// <param name="temp" type="Number">The temperature to approximate the pressure of water vapour.</param>
    /// <returns>Water vapour pressure in terms of bars.</returns>

    let mmHg = this.waterVapourPressure(degreesCelcius);
    let pascals = this.mmHgToPascal(mmHg);
    return this.pascalToBar(pascals);
  }

  maxOperatingDepth(ppO2, fO2, isFreshWater) {
    /// <summary>Returns the maximum operating depth in meters from the desired partial pressure of oxygen limit and
    /// the volume fraction percent of oxygen in the gas mixture.</summary>
    /// <param name="ppO2" type="Number">The desired partial pressure of oxygen in bars.</param>
    /// <param name="fO2" type="Number">The volume fraction percent of oxygen in a given gas mixture.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate for fresh water, default false to calculate salt water.</param>
    /// <returns>The maximum recommended operating depth for the given desired PPO2 and FO2.</returns>

    let meters = this.barToDepthInMeters(1, isFreshWater);
    return meters * (ppO2 / fO2 - this.constants.altitudePressure.current());
  }

  equivNarcoticDepth(fO2, fN2, fHe, depth, isFreshWater) {
    /// <summary>Calculates the equivalent narcotic depth to estimate the narcotic effect of a gas mixture.</summary>
    /// <param name="fO2" type="Number">The volume fraction percent of oxygen in a given gas mixture.</param>
    /// <param name="fN2" type="Number">The volume fraction percent of nitrogen in a given gas mixture.</param>
    /// <param name="fHe" type="Number">The volume fraction percent of helium in a given gas mixture.</param>
    /// <param name="depth" type="Number">The operating depth with the given gas mixture to calculate the END.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate for fresh water, default false to calculate salt water.</param>
    /// <returns>The END for the given gas mixture and operating depth with the assumption that all 3 gases are narcotic.</returns>

    /* Based on http://www.techdiver.ws/trimix_narcosis.shtml */
    // http://en.wikipedia.org/wiki/Equivalent_narcotic_depth
    // Original wikipedia article only uses Method 1 based on the idea
    // that only nitrogen is narcotic whereas this equation simply
    // calculates the equivalent depth based on partial pressures and
    // narcotic factors in relation to the gas mixture of air

    let ppO2 = this.partialPressureAtDepth(depth, fO2, isFreshWater);
    let ppN2 = this.partialPressureAtDepth(depth, fN2, isFreshWater);
    let ppHe = this.partialPressureAtDepth(depth, fHe, isFreshWater);

    // Helium has a narc factor of 0.23 while N2 and O2 have a narc factor of 1
    let narcIndex = ppO2 + ppN2 + ppHe * 0.23;

    // Argon is present in the air at 0.0934% and has a narc factor of 2.33
    let ppO2Air = this.partialPressure(1, 0.2095);
    let ppN2Air = this.partialPressure(1, 0.7808);
    let ppArAir = this.partialPressure(1, 0.00934);
    let narcIndexAir = ppO2Air * 1 + ppN2Air * 1 + ppArAir * 2.33;

    let relation = narcIndex / narcIndexAir;
    return (
      (relation - this.constants.altitudePressure.current()) *
      this.barToDepthInMeters(1, isFreshWater)
    );
  }

  depthChangeInBarsPerMinute(beginDepth, endDepth, time, isFreshWater) {
    /// <summary>Calculates the depth change speed in bars per minute.</summary>
    /// <param name="beginDepth" type="Number">The begin depth in meters.</param>
    /// <param name="endDepth" type="Number">The end depth in meters.</param>
    /// <param name="time" type="Number">The time that lapsed during the depth change in minutes.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate changes in depth while in fresh water, false for salt water.</param>
    /// <returns>The depth change in bars per minute.</returns>

    let speed = (endDepth - beginDepth) / time;
    return (
      this.depthInMetersToBars(speed, isFreshWater) -
      this.constants.altitudePressure.current()
    );
  }

  gasRateInBarsPerMinute(beginDepth, endDepth, time, fGas, isFreshWater) {
    /// <summary>Calculates the gas loading rate for the given depth change in terms of bars inert gas.</summary>
    /// <param name="beginDepth" type="Number">The starting depth in meters.</param>
    /// <param name="endDepth" type="Number">The end depth in meters.</param>
    /// <param name="time" type="Number">The time in minutes that lapsed between the begin and end depths.</param>
    /// <param name="fGas" type="Number">The fraction of gas to calculate for.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate changes in depth while in fresh water, false for salt water.</param>
    /// <returns>The gas loading rate in bars times the fraction of inert gas.</param>

    return (
      Math.abs(
        this.depthChangeInBarsPerMinute(
          beginDepth,
          endDepth,
          time,
          isFreshWater
        )
      ) * fGas
    );
  }

  gasPressureBreathingInBars(depth, fGas, isFreshWater) {
    /// <summary>Calculates the approximate pressure of the fraction of gas for each breath taken.</summary>
    /// <param name="depth" type="Number">The depth in meters.</param>
    /// <param name="fGas" type="Number">The fraction of the gas taken in.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate changes while in fresh water, false for salt water.</param>
    /// <returns>The gas pressure in bars taken in with each breath (accounting for water vapour pressure in the lungs).</returns>

    let bars = this.depthInMetersToBars(depth, isFreshWater);
    bars =
      bars -
      this.constants.altitudePressure.current() -
      this.constants.vapourPressure.lungsBreathing.current();
    return bars * fGas;
  }

  //converter
  // Define the "instance" methods using the prototype
  // and standard prototypal inheritance.
  feetToMeters(feet, decimals?) {
    var input = Number(feet);
    let res = input / this.conversions.feetPerMeter;
    if (isNumber(decimals)) {
      res = round(res, decimals);
    }
    return res;
  }

  metersToFeet(meters, decimals?) {
    var input = Number(meters);
    let res = input * this.conversions.feetPerMeter;
    if (isNumber(decimals)) {
      res = round(res, decimals);
    }
    return res;
  }

  celsiusToFahrenheit(celsius) {
    var input = Number(celsius);
    return input * this.conversions.celsiusPerFahrenheit + 32;
  }

  fahrenheitToCelsius(fahrenheit) {
    var input = Number(fahrenheit);
    return (input - 32) / this.conversions.celsiusPerFahrenheit;
  }

  barToPsi(bar) {
    var input = Number(bar);
    return round(input * this.conversions.barPerPsi, -1);
  }

  psiToBar(psi) {
    var input = Number(psi);
    return round(input / this.conversions.barPerPsi, 0);
  }

  ltToCuFt(lt) {
    var input = Number(lt);
    return round(input * this.conversions.litersPerCuFt, 3);
  }

  cuFtToLt(cuft) {
    var input = Number(cuft);
    return round(input / this.conversions.litersPerCuFt, 1);
  }

  kilogramsToPound(kg) {
    var input = Number(kg);
    return input / this.conversions.kilogramsPerPound;
  }

  poundsToKilograms(pounds) {
    var input = Number(pounds);
    return input * this.conversions.kilogramsPerPound;
  }

  isMetric() {
    return this.units === "Metric";
  }

  isImperial() {
    return this.units === "Imperial";
  }
}

export const DiveToolsService = new DiveTools();
