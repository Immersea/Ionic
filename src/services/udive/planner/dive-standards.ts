import {TankModel} from "../../../interfaces/udive/planner/tank-model";
import {GasModel} from "../../../interfaces/udive/planner/gas-model";
import {DiveConfiguration} from "../../../interfaces/udive/planner/dive-configuration";
import {DecoplannerParameters} from "../../../interfaces/udive/planner/decoplanner-parameters";
import {cloneDeep, find} from "lodash";
import {DivePlan} from "./dive-plan";
import {DiveToolsService} from "./dive-tools";

export class DiveStandardsController {
  agencies = [
    {
      ag_name: "PADI",
      long_name: "Professional Association of Diving Instructors",
      description:
        "The largest and most widely recognized diving organization in the world.",
    },
    {
      ag_name: "SSI",
      long_name: "Scuba Schools International",
      description: "Another globally recognized diving certification agency.",
    },
    {
      ag_name: "NAUI",
      long_name: "National Association of Underwater Instructors",
      description:
        "One of the oldest diving organizations, with a strong focus on safety.",
    },
    {
      ag_name: "CMAS",
      long_name: "Confédération Mondiale des Activités Subaquatiques",
      description:
        "A French-based organization known for its international standards and multi-level certifications.",
    },
    {
      ag_name: "SDI",
      long_name: "Scuba Diving International",
      description:
        "Known for offering technical and recreational diving courses.",
    },
    {
      ag_name: "TDI",
      long_name: "Technical Diving International",
      description:
        "Specializes in technical diving, offering advanced certifications.",
    },
    {
      ag_name: "BSAC",
      long_name: "British Sub-Aqua Club",
      description:
        "The UK's national governing body for diving, with a strong emphasis on club diving.",
    },
    {
      ag_name: "IANTD",
      long_name: "International Association of Nitrox and Technical Divers",
      description:
        "Focuses on technical diving, including rebreather and mixed-gas diving.",
    },
    {
      ag_name: "RAID",
      long_name: "Rebreather Association of International Divers",
      description:
        "Known for its innovative approach, particularly in online learning.",
    },
    {
      ag_name: "GUE",
      long_name: "Global Underwater Explorers",
      description:
        "Specializes in rigorous training for technical and cave diving.",
    },
    {
      ag_name: "FAUI",
      long_name: "Federation of Australian Underwater Instructors",
      description:
        "Based in Australia, offering a range of diving certifications.",
    },
    {
      ag_name: "PSS",
      long_name: "Professional Scuba Schools",
      description: "An Italian-based diving organization with a global reach.",
    },
    {
      ag_name: "IDSA",
      long_name: "International Diving Schools Association",
      description: "Focuses on commercial diving standards and certifications.",
    },
    {
      ag_name: "ANDI",
      long_name: "American Nitrox Divers International",
      description: "Specializes in technical diving, particularly with nitrox.",
    },
    {
      ag_name: "FDT",
      long_name: "Federación de Deportes Subacuáticos",
      description:
        "Based in Spain, focusing on underwater sports and diving certifications.",
    },
    {
      ag_name: "ADIP",
      long_name: "Association of Diving Instructors Professional",
      description: "A European-based diving certification agency.",
    },
    {
      ag_name: "SNSI",
      long_name: "Scuba and Nitrox Safety International",
      description:
        "An Italian-based agency focused on recreational diving safety.",
    },
    {
      ag_name: "CFT",
      long_name: "Comhairle Fo-Thuinn",
      description:
        "The Irish Underwater Council, managing diving standards and training in Ireland.",
    },
    {
      ag_name: "CDAA",
      long_name: "Cave Divers Association of Australia",
      description:
        "Focused on cave diving certifications and training in Australia.",
    },
    {
      ag_name: "SDUE",
      long_name: "Society of Diving Underwater Enthusiasts",
      description: "Specializes in underwater photography and marine biology.",
    },
    {
      ag_name: "NASE",
      long_name: "National Academy of Scuba Educators",
      description:
        "Offers a range of recreational diving courses with a focus on education.",
    },
    {
      ag_name: "UTD",
      long_name: "Unified Team Diving",
      description:
        "Specializes in technical and cave diving with a strong emphasis on team diving.",
    },
    {
      ag_name: "NAEI",
      long_name: "National Association of Equipment Instructors",
      description: "Focuses on diving equipment and technical diving.",
    },
    {
      ag_name: "ISDA",
      long_name: "International Scuba Diving Academy",
      description:
        "Provides a variety of diving certifications, including technical and recreational diving.",
    },
    {
      ag_name: "SAA",
      long_name: "Sub-Aqua Association",
      description:
        "A UK-based organization offering diving certifications through clubs.",
    },
    {
      ag_name: "PDIC",
      long_name: "Professional Diving Instructors Corporation",
      description: "Offers recreational and technical diving certifications.",
    },
    {
      ag_name: "LUX",
      long_name: "LUX Diving",
      description:
        "Based in Luxembourg, focused on recreational diving training.",
    },
    {
      ag_name: "NASDS",
      long_name: "National Association of Scuba Diving Schools",
      description: "A US-based organization offering diving certifications.",
    },
    {
      ag_name: "AIDA",
      long_name: "International Association for the Development of Apnea",
      description: "Specializes in freediving certifications.",
    },
    {
      ag_name: "ADC",
      long_name: "Association of Diving Contractors International",
      description: "Offers certifications and standards for commercial diving.",
    },
    {
      ag_name: "IMCA",
      long_name: "International Marine Contractors Association",
      description: "Focuses on commercial diving standards and safety.",
    },
    {
      ag_name: "DCBC",
      long_name: "Diver Certification Board of Canada",
      description: "Provides commercial diving certifications in Canada.",
    },
    {
      ag_name: "HSE",
      long_name: "Health and Safety Executive",
      description:
        "The UK's national authority on commercial diving safety and certification.",
    },
    {
      ag_name: "PSD",
      long_name: "Public Safety Divers Association",
      description:
        "Offers training and certifications for public safety diving.",
    },
    {
      ag_name: "U.S. Navy Diving",
      long_name: "U.S. Navy Diving and Salvage Training Center",
      description: "Provides military diving certifications.",
    },
    {
      ag_name: "CFSSAR",
      long_name: "Canadian Forces School of Search and Rescue",
      description:
        "Offers military and search-and-rescue diving certifications.",
    },
  ];

  //fromDepth in mt
  stdGases = [
    {
      O2: 100,
      He: 0,
      fromDepth: 6,
      ppO2: 1.5,
      deco: true,
      useAsDiluent: false,
    },
    {
      O2: 50,
      He: 0,
      fromDepth: 21,
      ppO2: 1.2,
      deco: true,
      useAsDiluent: false,
    },
    {
      O2: 35,
      He: 25,
      fromDepth: 36,
      ppO2: 1.2,
      deco: true,
      useAsDiluent: false,
    },
    {
      O2: 21,
      He: 35,
      fromDepth: 57,
      ppO2: 1.2,
      deco: true,
      useAsDiluent: false,
    },
    {
      O2: 32,
      He: 0,
      fromDepth: 30,
      ppO2: 1.4,
      deco: true,
      useAsDiluent: false,
    },
    {
      O2: 32,
      He: 0,
      fromDepth: 30,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: false,
    },
    {
      O2: 30,
      He: 30,
      fromDepth: 30,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: false,
    },
    {
      O2: 21,
      He: 35,
      fromDepth: 45,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: true,
    },
    {
      O2: 18,
      He: 45,
      fromDepth: 60,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: true,
    },
    {
      O2: 15,
      He: 55,
      fromDepth: 75,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: true,
    },
    {
      O2: 12,
      He: 65,
      fromDepth: 90,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: true,
    },
    {
      O2: 10,
      He: 70,
      fromDepth: 110,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: true,
    },
    {
      O2: 7,
      He: 93,
      fromDepth: 140,
      ppO2: 1.2,
      deco: false,
      useAsDiluent: true,
    },
  ];

  //volume in lt
  stdTanks = [
    {
      name: "1,8lt",
      volume: 1.8,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "3lt",
      volume: 3,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "7lt",
      volume: 7,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "8,5lt",
      volume: 8.5,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "10lt",
      volume: 10,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "12lt",
      volume: 12,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "s80",
      volume: 11.1,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "15lt",
      volume: 15,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "18lt",
      volume: 18,
      no_of_tanks: 1,
      forDeco: false,
    },
    {
      name: "D7",
      volume: 14,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D8.5",
      volume: 17,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D10",
      volume: 20,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "2x80s",
      volume: 22.2,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D12",
      volume: 24,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "2xHP100",
      volume: 25.8,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D14",
      volume: 28,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D15",
      volume: 30,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "2xHP120",
      volume: 30.6,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "2xLP104",
      volume: 33,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "2xHP133",
      volume: 34,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D18",
      volume: 36,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "2xLP120",
      volume: 38,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "D20",
      volume: 40,
      no_of_tanks: 2,
      forDeco: false,
    },
    {
      name: "s40",
      volume: 5.7,
      no_of_tanks: 1,
      forDeco: true,
    },
    {
      name: "7lt",
      volume: 7,
      no_of_tanks: 1,
      forDeco: true,
    },
    {
      name: "s80",
      volume: 11.1,
      no_of_tanks: 1,
      forDeco: true,
    },
  ];

  stdConfigurations: Array<DiveConfiguration> = [];

  getStdGases() {
    let array = [];
    this.stdGases.forEach((gas) => {
      //take a copy of the gas
      gas = cloneDeep(gas);
      //convert gas depth to user units
      gas.fromDepth = DiveToolsService.isMetric()
        ? gas.fromDepth
        : DiveToolsService.metersToFeet(gas.fromDepth, -1);
      array.push(new GasModel(gas));
    });
    return array;
  }

  getStdTanks(): Array<TankModel> {
    let array = [];
    this.stdTanks.forEach((tank) => {
      //take a copy of the tank
      tank = cloneDeep(tank);
      //convert volumes for imperial
      tank.volume = DiveToolsService.isImperial()
        ? DiveToolsService.ltToCuFt(tank.volume)
        : tank.volume;
      array.push(new TankModel(tank));
    });
    return array;
  }

  getStdConfigurations(): Array<DiveConfiguration> {
    this.stdConfigurations = [];
    let stdParams = new DecoplannerParameters();
    stdParams.setUnits(DiveToolsService.units);
    let stdGases = this.getStdGases();
    let stdTanks = this.getStdTanks();
    let rec1BottomTank = cloneDeep(find(stdTanks, {name: "15lt"}));
    rec1BottomTank.setGas(stdGases[5].getGas());
    let rec1 = new DiveConfiguration({
      parameters: stdParams,
      stdName: "Rec 1",
      maxDepth: DiveToolsService.isMetric() ? 20 : 70,
      maxTime: 30,
      configuration: {
        bottom: [rec1BottomTank],
        deco: [],
      },
    });
    this.stdConfigurations.push(rec1);
    let rec2BottomTank = cloneDeep(find(stdTanks, {name: "D12"}));
    rec2BottomTank.setGas(stdGases[5].getGas());
    let rec2 = new DiveConfiguration({
      parameters: stdParams,
      stdName: "Rec 2",
      maxDepth: DiveToolsService.isMetric() ? 30 : 100,
      maxTime: 30,
      configuration: {
        bottom: [rec2BottomTank],
        deco: [],
      },
    });
    this.stdConfigurations.push(rec2);

    let rec3BottomTank = cloneDeep(find(stdTanks, {name: "D12"}));
    rec3BottomTank.setGas(stdGases[7].getGas());
    let rec3DecoTank = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    rec3DecoTank.setGas(stdGases[4].getGas());
    rec3DecoTank.gas.fromDepth = DiveToolsService.isMetric() ? 21 : 70;
    let rec3 = new DiveConfiguration({
      parameters: stdParams,
      stdName: "Rec 3",
      maxDepth: DiveToolsService.isMetric() ? 39 : 130,
      maxTime: 20,
      configuration: {
        bottom: [rec3BottomTank],
        deco: [rec3DecoTank],
      },
    });
    this.stdConfigurations.push(rec3);

    let tec1BottomTank = cloneDeep(find(stdTanks, {name: "D12"}));
    tec1BottomTank.setGas(stdGases[7].getGas());
    let tec1DecoTank = cloneDeep(find(stdTanks, {name: "7lt"}, 8));
    tec1DecoTank.setGas(stdGases[1].getGas());
    let tec1Parameters = stdParams;
    tec1Parameters.time_at_bottom_for_min_gas = 1;
    tec1Parameters.time_at_gas_switch_for_min_gas = 1;
    let tec1 = new DiveConfiguration({
      parameters: tec1Parameters,
      stdName: "Tech 1",
      maxDepth: DiveToolsService.isMetric() ? 50 : 170,
      maxTime: 25,
      configuration: {
        bottom: [tec1BottomTank],
        deco: [tec1DecoTank],
      },
    });
    this.stdConfigurations.push(tec1);

    let tec1pBottomTank = cloneDeep(find(stdTanks, {name: "D12"}));
    tec1pBottomTank.setGas(stdGases[8].getGas());
    let tec1pDecoTank1 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    tec1pDecoTank1.setGas(stdGases[1].getGas());
    let tec1pDecoTank2 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    tec1pDecoTank2.setGas(stdGases[0].getGas());
    let tec1p = new DiveConfiguration({
      parameters: tec1Parameters,
      stdName: "Tech 60",
      maxDepth: DiveToolsService.isMetric() ? 60 : 200,
      maxTime: 30,
      configuration: {
        bottom: [tec1pBottomTank],
        deco: [tec1pDecoTank1, tec1pDecoTank2],
      },
    });
    this.stdConfigurations.push(tec1p);
    let tec2BottomTank1 = cloneDeep(find(stdTanks, {name: "D15"}));
    tec2BottomTank1.setGas(stdGases[9].getGas());
    let tec2BottomTank2 = cloneDeep(find(stdTanks, {name: "s80"}));
    tec2BottomTank2.setGas(stdGases[9].getGas());
    let tec2DecoTank1 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    tec2DecoTank1.setGas(stdGases[2].getGas());
    let tec2DecoTank2 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    tec2DecoTank2.setGas(stdGases[1].getGas());
    let tec2DecoTank3 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    tec2DecoTank3.setGas(stdGases[0].getGas());
    let tec2Parameters = tec1Parameters;
    tec2Parameters.deco_gas_reserve = 0;
    tec2Parameters.rmvBottom_multiplier_for_min_gas = 1;
    let tec2 = new DiveConfiguration({
      parameters: tec2Parameters,
      stdName: "Tech 2",
      maxDepth: DiveToolsService.isMetric() ? 75 : 250,
      maxTime: 30,
      configuration: {
        bottom: [tec2BottomTank1, tec2BottomTank2],
        deco: [tec2DecoTank1, tec2DecoTank2, tec2DecoTank3],
      },
    });
    this.stdConfigurations.push(tec2);
    let tec2pBottomTank1 = cloneDeep(find(stdTanks, {name: "D18"}));
    tec2pBottomTank1.setGas(stdGases[10].getGas());
    let tec2pBottomTank2 = cloneDeep(find(stdTanks, {name: "s80"}));
    tec2pBottomTank2.setGas(stdGases[10].getGas());
    let tec2pDecoTank1 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    tec2pDecoTank1.setGas(stdGases[3].getGas());
    let tec2pDecoTank2 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    tec2pDecoTank2.setGas(stdGases[2].getGas());
    let tec2pDecoTank3 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    tec2pDecoTank3.setGas(stdGases[1].getGas());
    let tec2pDecoTank4 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    tec2pDecoTank4.setGas(stdGases[0].getGas());
    let tec2p = new DiveConfiguration({
      parameters: tec2Parameters,
      stdName: "Tech 2+",
      maxDepth: DiveToolsService.isMetric() ? 90 : 300,
      maxTime: 30,
      configuration: {
        bottom: [tec2pBottomTank1, tec2pBottomTank2],
        deco: [tec2pDecoTank1, tec2pDecoTank2, tec2pDecoTank3, tec2pDecoTank4],
      },
    });
    this.stdConfigurations.push(tec2p);

    let ccrBottomTank1 = cloneDeep(find(stdTanks, {name: "D7"}));
    ccrBottomTank1.setGas(stdGases[11].getGas());
    let ccrBottomTank2 = cloneDeep(find(stdTanks, {name: "3lt"}));
    ccrBottomTank2.setGas(stdGases[0].getGas());
    let ccrDecoTank1 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    ccrDecoTank1.setGas(stdGases[3].getGas());
    let ccrDecoTank2 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    ccrDecoTank2.setGas(stdGases[2].getGas());
    let ccrDecoTank3 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    ccrDecoTank3.setGas(stdGases[1].getGas());
    let ccrDecoTank4 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    ccrDecoTank4.setGas(stdGases[0].getGas());
    let ccrParameters = tec2Parameters;
    ccrParameters.rmvBottom_multiplier_for_min_gas = 1.5;
    ccrParameters.number_of_divers_for_min_gas = 1;
    ccrParameters.configuration = "CCR";
    let ccr = new DiveConfiguration({
      parameters: ccrParameters,
      stdName: "CCR",
      maxDepth: DiveToolsService.isMetric() ? 100 : 330,
      maxTime: 30,
      configuration: {
        bottom: [ccrBottomTank1, ccrBottomTank2],
        deco: [ccrDecoTank1, ccrDecoTank2, ccrDecoTank3, ccrDecoTank4],
      },
    });
    this.stdConfigurations.push(ccr);

    let pscrBottomTank1 = cloneDeep(find(stdTanks, {name: "D8.5"}));
    pscrBottomTank1.setGas(stdGases[11].getGas());
    let pscrBottomTank2 = cloneDeep(find(stdTanks, {name: "s80"}));
    pscrBottomTank2.setGas(stdGases[10].getGas());
    let pscrDecoTank1 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    pscrDecoTank1.setGas(stdGases[3].getGas());
    let pscrDecoTank2 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    pscrDecoTank2.setGas(stdGases[2].getGas());
    let pscrDecoTank3 = cloneDeep(find(stdTanks, {name: "s80"}, 8));
    pscrDecoTank3.setGas(stdGases[1].getGas());
    let pscrDecoTank4 = cloneDeep(find(stdTanks, {name: "s40"}, 8));
    pscrDecoTank4.setGas(stdGases[0].getGas());
    let pscrParameters = ccrParameters;
    pscrParameters.ace_time = 400;
    pscrParameters.configuration = "pSCR";
    let pscr = new DiveConfiguration({
      parameters: ccrParameters,
      stdName: "pSCR",
      maxDepth: DiveToolsService.isMetric() ? 100 : 330,
      maxTime: 30,
      configuration: {
        bottom: [pscrBottomTank1, pscrBottomTank2],
        deco: [pscrDecoTank1, pscrDecoTank2, pscrDecoTank3, pscrDecoTank4],
      },
    });
    this.stdConfigurations.push(pscr);
    return this.stdConfigurations;
  }

  getDivePlansFromConfigurations(configurations: DiveConfiguration[]) {
    var plans = [];
    configurations.forEach((conf) => {
      //create first set of user local plans
      const plan = new DivePlan();
      plan.setConfiguration(conf);
      const dive = plan.addDive();
      plan.resetDiveWithConfiguration(dive, conf, false);
      plans.push(plan.getDivePlanModel());
    });
    return plans;
  }
}

export const DiveStandardsService = new DiveStandardsController();
