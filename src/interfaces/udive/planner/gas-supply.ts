import { Gas } from "./gas";
import { Cylinder } from "./cylinder";
import { DiveToolsService } from "../../../services/udive/planner/dive-tools";
import { round, toInteger, toNumber } from "lodash";

export class GasSupply {
  /**
   * Create a new gas source from a cylinder size, an initial mix, and a starting
   * pressure.
   * @param c The cylinder object to use for this supply
   * @param m The initial mix in the cylinder
   * @param pressure The initial pressure of the cylinder's content, in the same
   * units that were used for the cylinder object.
   */
  mMix: Gas;
  mCylinder: Cylinder;
  mPressure: number;
  mUseIdealGasLaws: boolean;
  mTemperature: number;
  mUnits: string;

  constructor(c, m, pressure, ideal_gas_laws, temperature, units?) {
    this.mCylinder = c;
    this.mMix = m;
    this.mPressure = pressure;
    this.mUseIdealGasLaws = ideal_gas_laws;
    this.mTemperature = temperature;
    this.mUnits = units ? units : DiveToolsService.units;
  }

  useIdealGasLaws(ideal) {
    this.mUseIdealGasLaws = ideal;
  }

  getMix() {
    return this.mMix;
  }

  setMix(m: Gas) {
    this.mMix = m;
  }

  getCylinder() {
    return this.mCylinder;
  }

  setCylinder(c: Cylinder) {
    this.mCylinder = c;
  }

  getPressure() {
    return this.mPressure;
  }

  setPressure(p) {
    this.mPressure = p;
  }

  getTemperature() {
    return this.mTemperature;
  }

  getKTemperature() {
    //Kelvin
    if (this.mUnits == "Imperial") {
      return ((this.mTemperature - 32) * 5) / 9 + 273.15;
    } else {
      return this.mTemperature + 273.15;
    }
  }

  setTemperature(t) {
    this.mTemperature = t;
  }
  /**
   * Get the total amount of gas in capacity units at sea level pressure
   * @return The amount of gas in the supply
   */
  getGasAmount() {
    if (this.mUseIdealGasLaws) {
      return this.mCylinder.getIdealCapacityAtPressure(this.mPressure);
    } else {
      return this.mCylinder.getVdwCapacityAtPressure(
        this.mPressure,
        this.mMix,
        this.getKTemperature()
      );
    }
  }

  getFO2() {
    return round(this.mMix.getFO2(), 2);
  }

  getFN2() {
    return round(this.mMix.getFN2(), 2);
  }

  getFHe() {
    return round(this.mMix.getFHe(), 2);
  }

  getO2Amount() {
    return this.getGasAmount() * this.getFO2();
  }

  getN2Amount() {
    return this.getGasAmount() * this.getFN2();
  }

  getHeAmount() {
    return this.getGasAmount() * this.getFHe();
  }

  /**
   * Adjust the pressure in the supply so there's the given amount of gas.
   * @param amt The amount to leave in the cylinder in capacity units at
   * sea level pressure
   * @return The GasSupply object
   */
  drainToGasAmount(amt) {
    if (this.mUseIdealGasLaws) {
      this.mPressure = this.mCylinder.getIdealPressureAtCapacity(amt);
    } else {
      this.mPressure = this.mCylinder.getVdwPressureAtCapacity(
        amt,
        this.mMix,
        this.getKTemperature()
      );
    }
    return this;
  }

  /**
   * Adjust the pressure in the supply so there's the given amount of oxygen.
   * @param amt The amount of oxygen to leave in the cylinder in capacity
   * units at sea level pressure
   * @return The GasSupply object
   */
  drainToO2Amount(amt) {
    return this.drainToGasAmount(amt / this.mMix.getFO2());
  }

  drainToN2Amount(amt) {
    return this.drainToGasAmount(amt / this.mMix.getFHe());
  }

  drainToHeAmount(amt) {
    return this.drainToGasAmount(amt / this.mMix.getFN2());
  }

  /**
   * Add a given amount of oxygen to the cylinder, updating the mix and pressure
   * accordingly.
   * @param amt The amount of oxygen to add in 1-atm volumes
   * @return The modified GasSupply object
   */
  addO2(amt) {
    return this.addGas(new Gas(1, 0), amt);
  }

  /**
   * Add a given amount of helium to the cylinder, updating the mix and pressure
   * accordingly.
   * @param amt The amount of helium to add in 1-atm volumes
   * @return The modified GasSupply object
   */
  addHe(amt) {
    return this.addGas(new Gas(0, 1), amt);
  }

  /**
   * Add a given amount of arbitrary gas to the cylinder, updating the mix and
   * pressure accordingly.
   * @param mix The gas mix being added
   * @param amt The amount of gas to add in 1-atm volumes
   * @return The modified GasSupply object
   */
  addGas(mix, amt) {
    var current_amt = this.getGasAmount(),
      o2 = this.mMix.getFO2() * current_amt + mix.getFO2() * amt,
      he = this.mMix.getFHe() * current_amt + mix.getFHe() * amt,
      new_total_amt = current_amt + amt;
    this.mMix = new Gas(o2 / new_total_amt, he / new_total_amt);
    if (this.mUseIdealGasLaws) {
      this.mPressure = this.mCylinder.getIdealPressureAtCapacity(new_total_amt);
    } else {
      this.mPressure = this.mCylinder.getVdwPressureAtCapacity(
        new_total_amt,
        this.mMix,
        this.getKTemperature()
      );
    }
    return this;
  }

  /**
   * Add a mix to the current contents of the supply.
   * @param m The mix to add
   * @param final_pressure The final pressure for the supply
   * @return The modified GasSupply object.
   */
  topup(m, final_pressure) {
    // Trivial solution: we're adding the same mix that's already in the cylinder
    if (this.mMix.isEqualTo(m)) {
      this.mPressure = final_pressure;
      return this;
    }
    // This method uses the Secant Method to numerically determine
    // the result to within 1/2% of each final mix. We do this because
    // writing out the single equation for the system would be terrible,
    // not to mention calculating its derivative.

    // Compute uncertainty
    // Max uncertainty in fo2 and fhe is 0.5% = 0.005.
    // fo2 == fo2i + fo2t == fo2i + vt * fo2t
    // e_fo2 == fo2t * e_vt <= 0.005
    // e_fhe == fhet * e_vt <= 0.005
    var error = 0.005 / Math.max(m.getFO2(), m.getFHe());

    // cache member variables as local
    var c = this.mCylinder;
    var mix = this.mMix;
    var pressure = toInteger(this.mPressure);

    // Start with two guesses for Secant Method
    // The first guess assumes ideal behavior as the gas is added, and assumes
    // the topup mix is close enough to determine capacity.
    var vt_n =
      (1 - pressure / final_pressure) *
      c.getVdwCapacityAtPressure(final_pressure, m, this.getKTemperature());
    // The second guess assumes ideal behavior as the gas is added, and assumes
    // the starting mix is close enough to determine capacity.
    var vt_n_1 =
      (1 - pressure / final_pressure) *
      c.getVdwCapacityAtPressure(final_pressure, mix, this.getKTemperature());

    var d;
    do {
      // Initialize a temporary this. Because addGas acts on the object,
      // we have to re-instantiate it each time.
      var test = new GasSupply(
        c,
        mix,
        pressure,
        this.mUseIdealGasLaws,
        this.getKTemperature()
      ); //this.create(c, mix, pressure);
      // Each computation evaluates the difference between the actual pressure
      // after adding a certain amount of gas, and the desired pressure.
      var f_n = test.addGas(m, vt_n).getPressure() - final_pressure;
      test = new GasSupply(
        c,
        mix,
        pressure,
        this.mUseIdealGasLaws,
        this.getKTemperature()
      ); //new this.create(c, mix, pressure);
      var f_n_1 = test.addGas(m, vt_n_1).getPressure() - final_pressure;
      d = ((vt_n - vt_n_1) / (f_n - f_n_1)) * f_n;
      vt_n_1 = vt_n;
      vt_n -= d;
    } while (Math.abs(d) < error);

    // Now that we have our solution, run addGas on self.
    this.addGas(m, vt_n);
    // Cheat! Set mPressure to what would be expected since addGas may not have
    // gotten it exactly.
    this.mPressure = final_pressure;
    return this;
  }

  /*
   * create forms
   */
  getForm() {
    let form = {
      o2: this.mMix.getO2(),
      he: this.mMix.getHe(),
      temp: round(toNumber(this.getTemperature()), 2),
      bar: round(toNumber(this.getPressure()), 2),
    };
    return form;
  }
}
