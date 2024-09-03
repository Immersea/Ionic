import { a4 as DiveToolsService, aG as Gas } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';

const VanDerWaals_A_OXYGEN = 1.382;
const VanDerWaals_A_HELIUM = 0.0346;
const VanDerWaals_A_NITROGEN = 1.37;
const VanDerWaals_B_OXYGEN = 0.03186;
const VanDerWaals_B_HELIUM = 0.0238;
const VanDerWaals_B_NITROGEN = 0.0387;
// Avogradro's number
//const VanDerWaals_N_A = 6.022E23;
class Cylinder {
    /**
     * Constructor is meant to take values as returned from a tank data model
     * which stores internal volumes and service pressures (the metric way).
     *
     * @param internal_volume Internal volume of the cylinder in capacity units
     * @param service_pressure Service pressure of the cylinder
     */
    constructor(internal_volume, service_pressure) {
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
    VanDerWaals_computeA(m) {
        let x = [m.getFO2(), m.getFN2(), m.getFHe()];
        let a = [
            VanDerWaals_A_OXYGEN,
            VanDerWaals_A_NITROGEN,
            VanDerWaals_A_HELIUM,
        ];
        let total = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                total += lodash.exports.toNumber(Math.sqrt(a[i] * a[j]) * x[i] * x[j]);
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
    VanDerWaals_computeB(m) {
        let x = [m.getFO2(), m.getFN2(), m.getFHe()];
        let b = [
            VanDerWaals_B_OXYGEN,
            VanDerWaals_B_NITROGEN,
            VanDerWaals_B_HELIUM,
        ];
        let total = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                total += lodash.exports.toNumber(Math.sqrt(b[i] * b[j]) * x[i] * x[j]);
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
        return lodash.exports.toNumber(this.getVdwCapacityAtPressure(this.mServicePressure, new Gas(0.21, 0)));
    }
    getIdealCapacity() {
        return lodash.exports.toNumber(this.getIdealCapacityAtPressure(this.mServicePressure));
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
        var a = this.VanDerWaals_computeA(m), b = this.VanDerWaals_computeB(m);
        // Source: http://en.wikipedia.org/wiki/Ideal_gas_constant
        var RT = T * this.universalGasConstant; //KELVIN 297 temp ambiente * gas constant
        // A bit of optimization to reduce number of calculations per iteration
        var PbRT = this.mServicePressure * b + RT, PbRT2 = 2 * PbRT, ab = a * b, P3 = 3 * this.mServicePressure;
        // Come up with a guess to seed Newton-Raphson. The equation is easily
        // solved if a and b were 0
        var v0, v1 = RT / this.mServicePressure;
        // We know what n is because we were given capacity:
        var n = capacity / RT;
        // Uncertainty math (see below)
        // V = nv
        // dV/dv = n
        var uncertainty = lodash.exports.toNumber(n / Math.pow(10, 1) / 2);
        do {
            v0 = v1;
            var f = this.mServicePressure * Math.pow(v0, 3) -
                PbRT * Math.pow(v0, 2) +
                a * v0 -
                ab;
            var fprime = P3 * Math.pow(v0, 2) - PbRT2 * v0 + a;
            v1 = v0 - f / fprime;
        } while (Math.abs(v0 - v1) >= uncertainty);
        this.mInternalVolume = lodash.exports.toNumber(v1 * n);
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
        var a = this.VanDerWaals_computeA(m), b = this.VanDerWaals_computeB(m);
        var RT = T * this.universalGasConstant; //KELVIN 297 temp ambiente * gas constant
        // A bit of optimization to reduce number of calculations per iteration
        var PbRT = P * b + RT, PbRT2 = 2 * PbRT, ab = a * b, P3 = 3 * P;
        // Come up with a guess to seed Newton-Raphson. The equation is easily
        // solved if a and b were 0
        var v0, v1 = RT / P;
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
        var v = (this.mInternalVolume * RT) / (this.atmPressure * capacity), a = this.VanDerWaals_computeA(m), b = this.VanDerWaals_computeB(m);
        return RT / (v - b) - a / Math.pow(v, 2);
    }
}

class GasSupply {
    constructor(c, m, pressure, ideal_gas_laws, temperature, units) {
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
    setMix(m) {
        this.mMix = m;
    }
    getCylinder() {
        return this.mCylinder;
    }
    setCylinder(c) {
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
        }
        else {
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
        }
        else {
            return this.mCylinder.getVdwCapacityAtPressure(this.mPressure, this.mMix, this.getKTemperature());
        }
    }
    getFO2() {
        return lodash.exports.round(this.mMix.getFO2(), 2);
    }
    getFN2() {
        return lodash.exports.round(this.mMix.getFN2(), 2);
    }
    getFHe() {
        return lodash.exports.round(this.mMix.getFHe(), 2);
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
        }
        else {
            this.mPressure = this.mCylinder.getVdwPressureAtCapacity(amt, this.mMix, this.getKTemperature());
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
        var current_amt = this.getGasAmount(), o2 = this.mMix.getFO2() * current_amt + mix.getFO2() * amt, he = this.mMix.getFHe() * current_amt + mix.getFHe() * amt, new_total_amt = current_amt + amt;
        this.mMix = new Gas(o2 / new_total_amt, he / new_total_amt);
        if (this.mUseIdealGasLaws) {
            this.mPressure = this.mCylinder.getIdealPressureAtCapacity(new_total_amt);
        }
        else {
            this.mPressure = this.mCylinder.getVdwPressureAtCapacity(new_total_amt, this.mMix, this.getKTemperature());
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
        var pressure = lodash.exports.toInteger(this.mPressure);
        // Start with two guesses for Secant Method
        // The first guess assumes ideal behavior as the gas is added, and assumes
        // the topup mix is close enough to determine capacity.
        var vt_n = (1 - pressure / final_pressure) *
            c.getVdwCapacityAtPressure(final_pressure, m, this.getKTemperature());
        // The second guess assumes ideal behavior as the gas is added, and assumes
        // the starting mix is close enough to determine capacity.
        var vt_n_1 = (1 - pressure / final_pressure) *
            c.getVdwCapacityAtPressure(final_pressure, mix, this.getKTemperature());
        var d;
        do {
            // Initialize a temporary this. Because addGas acts on the object,
            // we have to re-instantiate it each time.
            var test = new GasSupply(c, mix, pressure, this.mUseIdealGasLaws, this.getKTemperature()); //this.create(c, mix, pressure);
            // Each computation evaluates the difference between the actual pressure
            // after adding a certain amount of gas, and the desired pressure.
            var f_n = test.addGas(m, vt_n).getPressure() - final_pressure;
            test = new GasSupply(c, mix, pressure, this.mUseIdealGasLaws, this.getKTemperature()); //new this.create(c, mix, pressure);
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
            temp: lodash.exports.round(lodash.exports.toNumber(this.getTemperature()), 2),
            bar: lodash.exports.round(lodash.exports.toNumber(this.getPressure()), 2),
        };
        return form;
    }
}

export { Cylinder as C, GasSupply as G };

//# sourceMappingURL=gas-supply-a8f4201a.js.map