import {Gas} from "./gas";
import {DiveToolsService} from "../../../services/udive/planner/dive-tools";
import {toNumber} from "lodash";

const VanDerWaals_A_OXYGEN = 1.382;
const VanDerWaals_A_HELIUM = 0.0346;
const VanDerWaals_A_NITROGEN = 1.37;
const VanDerWaals_B_OXYGEN = 0.03186;
const VanDerWaals_B_HELIUM = 0.0238;
const VanDerWaals_B_NITROGEN = 0.0387;

// Avogradro's number
//const VanDerWaals_N_A = 6.022E23;

export class Cylinder {
  mInternalVolume;
  mServicePressure;
  universalGasConstant;
  atmPressure;
  /**
   * Constructor is meant to take values as returned from a tank data model
   * which stores internal volumes and service pressures (the metric way).
   *
   * @param internal_volume Internal volume of the cylinder in capacity units
   * @param service_pressure Service pressure of the cylinder
   */
  constructor(internal_volume, service_pressure?) {
    this.mInternalVolume = internal_volume;
    this.mServicePressure = service_pressure
      ? service_pressure
      : DiveToolsService.isMetric()
        ? 230
        : 3300;

    this.universalGasConstant = DiveToolsService.isMetric()
      ? 0.083144598
      : 10.73; // Gas constants in imperial (ft^3 psi R^-1 lb-mol^-1):10.73, metric (L bar K^-1 mol^-1) : 0.083144598
    this.atmPressure = DiveToolsService.isMetric() ? 1 : 14;
  }

  /**
   * Computes the particle attraction factor a for a theoretical homogeneous
   * gas equivalent in behavior to the given gas mixture.
   * @param m The gas mix to generate a for.
   * @return The value of a.
   */
  VanDerWaals_computeA(m: Gas) {
    let x = [m.getFO2(), m.getFN2(), m.getFHe()];
    let a = [
      VanDerWaals_A_OXYGEN,
      VanDerWaals_A_NITROGEN,
      VanDerWaals_A_HELIUM,
    ];
    let total = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        total += toNumber(Math.sqrt(a[i] * a[j]) * x[i] * x[j]);
      }
    }
    return total;
  }

  /**
   * Computes the particle volume factor b for a theoretical homogeneous
   * gas equivalent in behavior to the given gas mixture.
   * @param m The gas mix to generate b for.
   * @return The value of b.
   */
  VanDerWaals_computeB(m: Gas) {
    let x = [m.getFO2(), m.getFN2(), m.getFHe()];
    let b = [
      VanDerWaals_B_OXYGEN,
      VanDerWaals_B_NITROGEN,
      VanDerWaals_B_HELIUM,
    ];
    let total = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        total += toNumber(Math.sqrt(b[i] * b[j]) * x[i] * x[j]);
      }
    }
    return total;
  }

  /**
   * Build a Cylinder object with a capacity instead of an internal volume
   * @param capacity The volume of gas the cylinder's contents would occupy at
   * sea level pressure when the cylinder is filled to the service pressure
   * @param service_pressure Service pressure of the cylinder
   * @return A Cylinder object initialized with the given parameters
   */
  fromCapacityVdw(capacity, service_pressure) {
    var c = new Cylinder(0, service_pressure);
    c.setVdwCapacity(capacity);
    return c;
  }

  fromCapacityIdeal(capacity, service_pressure) {
    var c = new Cylinder(0, service_pressure);
    c.setIdealCapacity(capacity);
    return c;
  }

  /** Returns the air capacity of the cylinder(s)
   * @return The volume of gas the cylinder's contents would occupy at sea level
   * pressure when the cylinder is filled with air to the service pressure, in
   * capacity units
   */
  getVdwCapacity() {
    return toNumber(
      this.getVdwCapacityAtPressure(this.mServicePressure, new Gas(0.21, 0))
    );
  }

  getIdealCapacity() {
    return toNumber(this.getIdealCapacityAtPressure(this.mServicePressure));
  }

  setIdealCapacity(capacity) {
    this.mInternalVolume = capacity / this.mServicePressure;
  }

  setVdwCapacity(capacity, T = 297) {
    //T in Kelvin
    // This is quite similar to getVdwCapacityAtPressure, except
    // we are solving for V instead of n. The cubic
    // polynomial is the same, it's just that the
    // uncertainty is calculated differently.
    var m = new Gas(0.21, 0);
    var a = this.VanDerWaals_computeA(m),
      b = this.VanDerWaals_computeB(m);
    // Source: http://en.wikipedia.org/wiki/Ideal_gas_constant
    var RT = T * this.universalGasConstant; //KELVIN 297 temp ambiente * gas constant
    // A bit of optimization to reduce number of calculations per iteration
    var PbRT = this.mServicePressure * b + RT,
      PbRT2 = 2 * PbRT,
      ab = a * b,
      P3 = 3 * this.mServicePressure;
    // Come up with a guess to seed Newton-Raphson. The equation is easily
    // solved if a and b were 0
    var v0,
      v1 = RT / this.mServicePressure;

    // We know what n is because we were given capacity:
    var n = capacity / RT;

    // Uncertainty math (see below)
    // V = nv
    // dV/dv = n
    var uncertainty = toNumber(n / Math.pow(10, 1) / 2);

    do {
      v0 = v1;
      var f =
        this.mServicePressure * Math.pow(v0, 3) -
        PbRT * Math.pow(v0, 2) +
        a * v0 -
        ab;
      var fprime = P3 * Math.pow(v0, 2) - PbRT2 * v0 + a;
      v1 = v0 - f / fprime;
    } while (Math.abs(v0 - v1) >= uncertainty);

    this.mInternalVolume = toNumber(v1 * n);
  }

  /**
   * Get the internal volume of this cylinder
   * @return The internal volume in capacity units
   */
  getInternalVolume() {
    return this.mInternalVolume;
  }

  setInternalVolume(internal_volume) {
    this.mInternalVolume = internal_volume;
  }

  getServicePressure() {
    return this.mServicePressure;
  }

  setServicePressure(service_pressure) {
    this.mServicePressure = service_pressure;
  }

  getIdealCapacityAtPressure(pressure) {
    return (this.mInternalVolume * pressure) / this.atmPressure; //1 atm pression
  }

  getIdealPressureAtCapacity(capacity) {
    return (capacity * this.atmPressure) / this.mInternalVolume; //1 atm pression
  }

  /**
   * Solves Van der Waals gas equation to get equivalent atmospheric volume at
   * a given pressure
   * @param P The pressure of the gas in the cylinder
   * @param mix The mix in the cylinder, needed to determine a and b constants.
   * @return The amount of gas in the cylinder to one decimal place
   */
  getVdwCapacityAtPressure(P, m, T = 297) {
    //T in Kelvin
    // First, the trivial solution. This will cause a divide by 0 if we try to
    // solve.
    if (P == 0) {
      return 0;
    }
    // This is solved by finding the root of a cubic polynomial
    // for the molar volume v = V/n:
    // choose a reasonable value for T
    //   P * v^3 - (P*b + R*T) * v^2 + a * v - a * b = 0
    //   n = V/v
    // Then we can use ideal gas laws to convert n to V @ 1 ata
    var a = this.VanDerWaals_computeA(m),
      b = this.VanDerWaals_computeB(m);
    var RT = T * this.universalGasConstant; //KELVIN 297 temp ambiente * gas constant
    // A bit of optimization to reduce number of calculations per iteration
    var PbRT = P * b + RT,
      PbRT2 = 2 * PbRT,
      ab = a * b,
      P3 = 3 * P;
    // Come up with a guess to seed Newton-Raphson. The equation is easily
    // solved if a and b were 0
    var v0,
      v1 = RT / P;

    // First-order uncertainty propagation. This lets us know within what
    // tolerance we need to compute v to get the right volume.
    // The variable we are solving for is v.
    // The result we care about the uncertainty for is V0, the volume at 1 ata.
    //   V0 = n * R * T / P0 [ideal gas law] = V * R * T / (P0 * v)
    // To compute the uncertainty in V0, we use the Taylor series method for
    // v alone.
    //   deltaV0 = dV0/dv*deltav
    // ...where dV0/dv = - V*R*T / (P0 * v^2)
    // We want to make sure deltaV0 is less than 0.05, so...
    //   deltav < P0 * v^2 / (20 * V * R * T)
    var uncertainty_multiplier = 1 / (20 * this.mInternalVolume * RT);

    do {
      v0 = v1;
      var f = P * Math.pow(v0, 3) - PbRT * Math.pow(v0, 2) + a * v0 - ab;
      var fprime = P3 * Math.pow(v0, 2) - PbRT2 * v0 + a;
      v1 = v0 - f / fprime;
    } while (Math.abs(v0 - v1) / uncertainty_multiplier >= v1 * v1);

    const capacity = (this.mInternalVolume * RT) / (this.atmPressure * v1);

    return capacity;
  }

  getVdwPressureAtCapacity(capacity, m, T) {
    //T in Kelvin
    // This is given by the following:
    // choose a reasonable value for T
    // n = Patm*V/(R*T) (since volume is at atmospheric pressure, it's close enough to ideal)
    // v = V/n
    // P = R * T / (v - b) - a / v^2
    var RT = T * this.universalGasConstant;
    var v = (this.mInternalVolume * RT) / (this.atmPressure * capacity),
      a = this.VanDerWaals_computeA(m),
      b = this.VanDerWaals_computeB(m);
    return RT / (v - b) - a / Math.pow(v, 2);
  }
}
