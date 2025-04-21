import { Gas } from "../../../interfaces/udive/planner/gas";
import { GasSupply } from "../../../interfaces/udive/planner/gas-supply";

import { cloneDeep, toNumber } from "lodash";
import { TranslationService } from "../../common/translations";

/**
 * Computes a volume-based solution to the given gas blending problem.
 * Reads mStart, mTopup, have, and want.
 * Stores a result in vi, this.blend.vo2a, this.blend.vhea, and this.blend.vta.
 * @return true if a solution was found, false if the problem is
 * impossible to solve
 */

export class GasBlenderCtrl {
  blend: any;
  have: GasSupply;
  supply: GasSupply;
  mStart: Gas;
  mTopup: Gas;
  mRich: Gas;
  want: GasSupply;
  m: any;
  mStartPressure;
  pi;

  messages: {
    add: string;
    topup: string;
    drain: string;
  };

  solve() {
    this.messages = {
      add: TranslationService.getTransl("add", "ADD"),
      topup: TranslationService.getTransl("top-up", "TOP-UP"),
      drain: TranslationService.getTransl("drain", "DRAIN"),
    };
    /**
     * Compute and display the results of a blending operation based on the current
     * state
     * @author Ben Roberts (divestoclimb@gmail.com)
     */
    // We begin by converting the initial and desired pressures to
    // volumes. If using real gases, this is based on the mixes of each.
    // Then, we use linear algebra to compute the amounts of gases needed
    // to blend the desired mix.
    // The matrix equation we need to solve looks like this:
    // [ fo2r      0       fo2,t ] [ vo2,a ]   [ vf*fo2,f-vi*fo2,i ]
    // [ 0         1       fhe,t ] [ vhe,a ] = [ vf*fhe,f-vi*fhe,i ]
    // [ 1 - fo2r  0       fn2,t ] [ vt ,a ]   [ vf*fn2,f-vi*fn2,i ]
    // Where:
    // - vi = initial volume of gas in cylinder
    // - vf = desired volume
    // - fo2,t = fraction of O2 in top-up gas
    // - fhe,t = fraction of He in top-up gas
    // - fo2,f = desired fraction of O2
    // - fhe,f = desired fraction of He
    // - fo2,i = starting fraction of O2
    // - fhe,i = starting fraction of He
    // And the unknowns:
    // - vo2,a = volume of O2 to add
    // - vhe,a = volume of He to add
    // - vt,a = volume of top-up gas to add
    //
    // Once we have the volumes, we can convert these back to pressures.
    //
    let fo2i,
      fhei,
      //fn2i,
      fo2t,
      fhet,
      fn2t,
      fo2r,
      vo2i,
      vn2i,
      vhei,
      vo2f,
      vn2f,
      vhef,
      a,
      b;
    this.blend = {};
    this.supply = cloneDeep(this.have);
    this.pi = this.have.getPressure();
    this.mStartPressure = this.have.getPressure();
    this.mStart = this.have.getMix();
    fo2i = this.mStart.getFO2();
    fhei = this.mStart.getFHe();
    //fn2i = 1 - fo2i - fhei;
    fo2t = this.mTopup.getFO2();
    fhet = this.mTopup.getFHe();
    fn2t = 1 - fo2t - fhet;
    this.mRich = new Gas(1, 0);
    fo2r = this.mRich.getFO2(); //Oxygen
    vo2i = this.supply.getO2Amount();
    vn2i = this.supply.getN2Amount();
    vhei = this.supply.getHeAmount();
    vo2f = this.want.getO2Amount();
    vn2f = this.want.getN2Amount();
    vhef = this.want.getHeAmount();
    this.blend.vi = this.supply.getGasAmount();
    a = [
      [fo2r, 0, fo2t],
      [0, 1, fhet],
      [1 - fo2r, 0, fn2t],
    ];
    b = [[vo2f - vo2i], [vhef - vhei], [vn2f - vn2i]];

    this.m = {
      a11: a[0][0],
      a12: a[0][1],
      a13: a[0][2],
      a14: b[0][0],
      a21: a[1][0],
      a22: a[1][1],
      a23: a[1][2],
      a24: b[1][0],
      a31: a[2][0],
      a32: a[2][1],
      a33: a[2][2],
      a34: b[2][0],
    };
    this.solveMatrix(this.m);
    this.blend.vo2a = this.m.a14;
    this.blend.vhea = this.m.a24;
    this.blend.vta = this.m.a34;
    // Now handle the conditions where a negative volume was found
    if (this.blend.vo2a < 0) {
      this.blend.vo2a = 0;
      this.m.a11 = fo2i;
      this.m.a21 = fhei;
      this.m.a31 = 1 - fo2i - fhei;
      this.m.a14 = vo2f;
      this.m.a24 = vhef;
      this.m.a34 = vn2f;
      this.solveMatrix(this.m);
      this.blend.vi = this.m.a14;
      this.blend.vhea = this.m.a24;
      this.blend.vta = this.m.a34;
    }
    if (this.blend.vhea < 0) {
      this.blend.vhea = 0;
      this.m.a12 = fo2i;
      this.m.a22 = fhei;
      this.m.a32 = 1 - fo2i - fhei;
      this.m.a14 = vo2f;
      this.m.a24 = vhef;
      this.m.a34 = vn2f;
      this.solveMatrix(this.m);
      this.blend.vo2a = this.m.a14;
      this.blend.vi = this.m.a24;
      this.blend.vta = this.m.a34;
    }
    if (this.blend.vta < 0) {
      this.blend.vta = 0;
      this.m.a13 = fo2i;
      this.m.a23 = fhei;
      this.m.a33 = 1 - fo2i - fhei;
      this.m.a14 = vo2f;
      this.m.a24 = vhef;
      this.m.a34 = vn2f;
      this.solveMatrix(this.m);
      this.blend.vo2a = this.m.a14;
      this.blend.vhea = this.m.a24;
      this.blend.vi = this.m.a34;
    }
    // The final checks ensure that vi is within a realistic range.
    // The blender can't drain to a negative volume, and we can't
    // start with any more gas than is already in the cylinder.
    if (this.blend.vi < 0 || this.blend.vi > this.supply.getGasAmount()) {
      return false;
    }
    let pdrain = this.supply.drainToGasAmount(this.blend.vi).getPressure();
    this.mStartPressure = this.pi;
    if (this.pi - pdrain >= Math.pow(10, 0 * -1) * 0.5) {
      // Need to drain the gas
      this.mStartPressure = pdrain;
    }
    return true;
  }

  solveMatrix(m) {
    let a1 = [
      0,
      toNumber(m.a11),
      toNumber(m.a12),
      toNumber(m.a13),
      toNumber(m.a14),
    ];
    let a2 = [
      0,
      toNumber(m.a21),
      toNumber(m.a22),
      toNumber(m.a23),
      toNumber(m.a24),
    ];
    let a3 = [
      0,
      toNumber(m.a31),
      toNumber(m.a32),
      toNumber(m.a33),
      toNumber(m.a34),
    ];

    let t1 = a1;
    let t2 = a2;
    let t3 = a3;

    // First we need a one in the first spot
    if (a1[1] == 0) {
      console.log(
        "\rThere is a 0 in the first entry of the Matrix you entered\r\rI can't handle that at this time\r\rPlease Re-Enter the Matrix\r "
      );
      return;
    }
    let temp;

    if (a1[1] != 0) {
      temp = a1[1];
      for (let i = 1; i <= 4; i++) {
        a1[i] = a1[i] / temp;
      }
    }

    // Now we should have a 1 in the first entry - Now to zero out the column

    temp = -a2[1];

    for (let i = 1; i <= 4; i++) {
      a2[i] = a2[i] + a1[i] * temp;
    }

    temp = -a3[1];

    for (let i = 1; i <= 4; i++) {
      a3[i] = a3[i] + a1[i] * temp;
    }

    // Next Column  Check if 0 - if not put a 1 there

    if (a2[2] == 0) {
      // if = to 0 switch rows
      for (let i = 2; i <= 4; i++) {
        temp = a2[i];
        a2[i] = a3[i];
        a3[i] = temp;
      }
    }

    if (a2[2] != 0) {
      temp = a2[2];
      a2[2] = a2[2] / temp; // for statement would have taken longer
      a2[3] = a2[3] / temp;
      a2[4] = a2[4] / temp;

      // zero out column below

      temp = -a3[2];

      for (let i = 2; i <= 4; i++) {
        a3[i] = a3[i] + a2[i] * temp;
      }

      // zero out column above

      temp = -a1[2];

      for (let i = 2; i <= 4; i++) {
        a1[i] = a1[i] + a2[i] * temp;
      }
    } // ends if != 0

    // Final Column
    if (a3[3] != 0) {
      temp = a3[3];
      a3[3] = a3[3] / temp; // for statement would have taken longer
      a3[4] = a3[4] / temp;

      // zero out column above

      temp = -a2[3];
      a2[3] = a2[3] + a3[3] * temp;
      a2[4] = a2[4] + a3[4] * temp;

      temp = -a1[3];
      a1[3] = a1[3] + a3[3] * temp;
      a1[4] = a1[4] + a3[4] * temp;
    }

    this.m = {
      a11: a1[1],
      a12: a1[2],
      a13: a1[3],
      a14: a1[4],
      a21: a2[1],
      a22: a2[2],
      a23: a2[3],
      a24: a2[4],
      a31: a3[1],
      a32: a3[2],
      a33: a3[3],
      a34: a3[4],
    };

    // ALWAYS CHECK YOUR WORK

    if (t1[1] * a1[4] + t1[2] * a2[4] + t1[3] * a3[4] != t1[4]) {
      console.log(
        "The Solution I found does not check out. You may have entered a system of equations which have no solution, or infinite solutions."
      );
      //return res
    }

    if (t2[1] * a1[4] + t2[2] * a2[4] + t2[3] * a3[4] != t2[4]) {
      console.log(
        "\rThe Solution I found does not check out\r\rYou may have entered a system of equations which\r have no solution, or infinite solutions."
      );
      //return res
    }

    if (t3[1] * a1[4] + t3[2] * a2[4] + t3[3] * a3[4] != t3[4]) {
      console.log(
        "\rThe Solution I found does not check out\r\rYou may have entered a system of equations which\r have no solution, or infinite solutions."
      );
      //return res
    }
  }

  /**
   * Performs a partial pressure blending and builds the readable
   * explanation for how to replicate it.
   * @return A descriptive version of the blend that was done
   */
  getPPSteps(he_first) {
    let //po2,
      p1,
      p2,
      pdrain = this.mStartPressure,
      pstart = this.have.getPressure(),
      supply = cloneDeep(this.supply);

    //let pretop;
    let steps = new Array();
    if (pstart > pdrain) {
      steps.push({
        type: "drain",
        blend: this.messages.drain,
        mix: supply.getMix(),
        startPress: pstart,
        pressToAdd: pdrain - pstart,
        finalPress: pdrain,
      });
    }
    if (he_first) {
      if (this.blend.vhea > 0) {
        p1 = parseFloat(supply.addHe(this.blend.vhea).getPressure().toFixed(1));
        steps.push({
          type: "add",
          blend: this.messages.add,
          mix: new Gas(0, 1),
          startPress: pdrain,
          pressToAdd: p1 - pdrain,
          finalPress: p1,
        });
      } else {
        p1 = pdrain;
      }
      if (this.blend.vo2a > 0) {
        p2 = parseFloat(supply.addO2(this.blend.vo2a).getPressure().toFixed(1));
        steps.push({
          type: "add",
          blend: this.messages.add,
          mix: new Gas(1, 0),
          startPress: p1,
          pressToAdd: p2 - p1,
          finalPress: p2,
        });
      } else {
        p2 = p1;
      }
      //pretop = p2;
    } else {
      if (this.blend.vo2a > 0) {
        p1 = parseFloat(supply.addO2(this.blend.vo2a).getPressure().toFixed(1));
        steps.push({
          type: "add",
          blend: this.messages.add,
          mix: new Gas(1, 0),
          startPress: pdrain,
          pressToAdd: p1 - pdrain,
          finalPress: p1,
        });
      } else {
        p1 = pdrain;
      }
      if (this.blend.vhea > 0) {
        p2 = parseFloat(supply.addHe(this.blend.vhea).getPressure().toFixed(1));
        steps.push({
          type: "add",
          blend: this.messages.add,
          mix: new Gas(0, 1),
          startPress: p1,
          pressToAdd: p2 - p1,
          finalPress: p2,
        });
      } else {
        p2 = p1;
      }
      //pretop = p2;
    }
    if (this.blend.vta > 0) {
      let pt =
        Math.round(
          supply.addGas(this.mTopup, this.blend.vta).getPressure() * 10
        ) / 10;
      steps.push({
        type: "topup",
        blend: this.messages.topup,
        mix: this.mTopup,
        startPress: p2,
        pressToAdd: pt - p2,
        finalPress: pt,
      });
    }
    return steps;
  }

  getContinuousNxSteps() {
    let pnx,
      phe,
      pdrain = this.mStartPressure,
      pstart = this.have.getPressure(),
      supply = cloneDeep(this.supply);

    // Take this.blend.vo2a and this.blend.vta and combine them into a single Mix.
    let vca = this.blend.vo2a + this.blend.vta;
    let continuousAdd = new Gas(
      (this.blend.vo2a + this.blend.vta * this.mTopup.getFO2()) / vca,
      0
    );

    let steps = new Array();
    if (pstart > pdrain) {
      steps.push({
        type: "drain",
        blend: this.messages.drain,
        mix: supply.getMix(),
        startPress: pstart,
        pressToAdd: pdrain - pstart,
        finalPress: pdrain,
      });
    }

    // Always add helium first. Although we could use the he_first setting to decide,
    // it's unlikely anyone would want to top up with helium last.
    if (this.blend.vhea > 0) {
      phe = parseFloat(supply.addHe(this.blend.vhea).getPressure().toFixed(1));
      steps.push({
        type: "add",
        blend: this.messages.add,
        mix: new Gas(0, 1),
        startPress: pdrain,
        pressToAdd: phe - pdrain,
        finalPress: phe,
      });
    } else {
      phe = pdrain;
    }
    if (this.blend.vhea > 0) {
      pnx = parseFloat(
        supply.addGas(continuousAdd, vca).getPressure().toFixed(1)
      );
      steps.push({
        type: "add",
        blend: this.messages.add,
        mix: continuousAdd,
        startPress: phe,
        pressToAdd: pnx - phe,
        finalPress: pnx,
      });
    } else {
      pnx = phe;
    }
    return steps;
  }

  getContinuousTmxSteps() {
    let ptmx,
      pdrain = this.mStartPressure,
      pstart = this.have.getPressure(),
      supply = cloneDeep(this.supply);

    // Take this.blend.vo2a and this.blend.vta and combine them into a single Mix.
    let vca = this.blend.vo2a + this.blend.vhea + this.blend.vta;
    let continuousAdd = new Gas(
      (this.blend.vo2a + this.blend.vta * this.mTopup.getFO2()) / vca,
      (this.blend.vhea + this.blend.vta * this.mTopup.getFHe()) / vca
    );

    // Now do the blend
    let steps = new Array();
    if (pstart > pdrain) {
      steps.push({
        type: "drain",
        blend: this.messages.drain,
        mix: supply.getMix(),
        startPress: pstart,
        pressToAdd: pdrain - pstart,
        finalPress: pdrain,
      });
    }
    ptmx = parseFloat(
      supply.addGas(continuousAdd, vca).getPressure().toFixed(1)
    );
    steps.push({
      type: "add",
      blend: this.messages.add,
      mix: continuousAdd,
      startPress: pdrain,
      pressToAdd: ptmx - pdrain,
      finalPress: ptmx,
    });
    return steps;
  }

  getGasName(gas: Gas) {
    let name = gas.getShortName();

    return name;
  }
}
export const GasBlenderService = new GasBlenderCtrl();
