import { Gas } from "./gas";
import { DiveToolsService } from "../../../services/udive/planner/dive-tools";
import { DiveStandardsService } from "../../../services/udive/planner/dive-standards";
import { find, round, toNumber } from "lodash";

export class Tank {
  name: string;
  volume: number;
  no_of_tanks: number;
  pressure: number;
  gas: Gas;
  units: string;

  constructor(
    name: string,
    volume: number,
    no_of_tanks: number,
    gas?: Gas,
    pressure?: number,
    units?: string
  ) {
    const stdTanks = DiveStandardsService.getStdTanks();
    //search stdTank
    const tank = find(stdTanks, { name: name });
    this.name = name;
    this.units = units ? units : "Metric";
    //get volume from standard tanks
    this.volume = tank ? tank.volume : volume;
    this.no_of_tanks = tank ? tank.no_of_tanks : no_of_tanks;
    this.gas = gas
      ? new Gas(gas.fO2, gas.fHe, gas.fromDepth, gas.ppO2, this.units)
      : new Gas();
    this.pressure = pressure ? pressure : this.units == "Metric" ? 200 : 3000;
  }

  setGas(gas: Gas) {
    this.gas = gas;
  }

  setPressure(press: number) {
    this.pressure = press;
  }

  setTankType(tank) {
    this.name = tank.name;
    this.volume = tank.volume;
    this.no_of_tanks = tank.no_of_tanks;
  }

  getGasVolume() {
    //pressure always in bar
    const bar =
      this.units === "Metric"
        ? this.pressure
        : DiveToolsService.psiToBar(this.pressure);
    const lt =
      this.units === "Metric"
        ? this.volume
        : DiveToolsService.cuFtToLt(this.volume);
    const volInLt = toNumber(bar) * toNumber(lt);
    const volInCuft = DiveToolsService.ltToCuFt(volInLt);
    const res = this.units === "Metric" ? volInLt : volInCuft;
    return round(res);
  }

  convertUnit(metric) {
    this.gas.convertUnit(metric);
    if (
      (this.units === "Imperial" && metric) ||
      (this.units === "Metric" && !metric)
    ) {
      //execute conversion
      this.pressure = metric
        ? DiveToolsService.psiToBar(this.pressure)
        : DiveToolsService.barToPsi(this.pressure);
      this.volume = metric
        ? DiveToolsService.cuFtToLt(this.volume)
        : DiveToolsService.ltToCuFt(this.volume);
      this.units = metric ? "Metric" : "Imperial";
    }
  }

  /*
   * create forms
   */
  getForm() {
    let form = {
      pressure: this.pressure,
      O2: this.gas.getO2(),
      He: this.gas.getHe(),
      fromDepth: this.gas.fromDepth,
      ppO2: this.gas.ppO2,
    };
    return form;
    /*new FormBuilder().group({
            pressure: [this.pressure,Validators.compose([Validators.required, CustomValidators.positiveNumberValidator])],
            O2: [this.gas.O2,Validators.compose([Validators.required, CustomValidators.positiveNumberValidator])],
			He: [this.gas.He,Validators.compose([Validators.required])],
			fromDepth: [this.gas.fromDepth, Validators.compose([Validators.required, CustomValidators.positiveNumberValidator])],
			ppO2: [this.gas.ppO2, Validators.compose([Validators.required, CustomValidators.positiveNumberValidator])],
        });*/
  }
}
