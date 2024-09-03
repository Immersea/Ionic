import { l as lodash } from './lodash-68d560b6.js';
import { a6 as LocationIQ, N as MapService } from './map-dae4acde.js';

class CustomerLocation {
    constructor(data) {
        this.plant_name_en = data && data.plant_name_en ? data.plant_name_en : null;
        this.plant_name_other =
            data && data.plant_name_other ? data.plant_name_other : null;
        this.other_plant_name_en =
            data && data.other_plant_name_en ? data.other_plant_name_en : null;
        this.other_plant_name_other =
            data && data.other_plant_name_other ? data.other_plant_name_other : null;
        this.soe_status = data && data.soe_status ? data.soe_status : null;
        this.soe_state_department =
            data && data.soe_state_department ? data.soe_state_department : null;
        this.type = data && data.type ? data.type : null;
        this.address = data && data.address ? data.address : null;
        this.municipality = data && data.municipality ? data.municipality : null;
        this.province = data && data.province ? data.province : null;
        this.country = data && data.country ? data.country : null;
        this.region = data && data.region ? data.region : null;
        this.location_other_language =
            data && data.location_other_language
                ? data.location_other_language
                : null;
        this.location =
            data && data.location ? new LocationIQ(data.location) : new LocationIQ();
        this.position =
            data && data.position ? MapService.setPosition(data.position) : null;
        this.coordinate_accuracy =
            data && data.coordinate_accuracy ? data.coordinate_accuracy : null;
        this.gem_wiki_page_en =
            data && data.gem_wiki_page_en ? data.gem_wiki_page_en : null;
        this.gem_wiki_page_other =
            data && data.gem_wiki_page_other ? data.gem_wiki_page_other : null;
        this.status = data && data.status ? data.status : null;
        this.proposed_date = data && data.proposed_date ? data.proposed_date : null;
        this.construction_date =
            data && data.construction_date ? data.construction_date : null;
        this.start_date = data && data.start_date ? data.start_date : null;
        this.plant_age =
            data && data.plant_age
                ? !isNaN(lodash.exports.toNumber(data.plant_age))
                    ? lodash.exports.toNumber(data.plant_age)
                    : data.plant_age
                : null;
        this.closed_date = data && data.closed_date ? data.closed_date : null;
        this.category_steel_product =
            data && data.category_steel_product ? data.category_steel_product : null;
        this.steel_products =
            data && data.steel_products ? data.steel_products : null;
        this.steel_sector_end_users =
            data && data.steel_sector_end_users ? data.steel_sector_end_users : null;
        this.workforce_size =
            data && data.workforce_size
                ? !isNaN(lodash.exports.toNumber(data.workforce_size))
                    ? lodash.exports.toNumber(data.workforce_size)
                    : data.workforce_size
                : null;
        this.ISO_14001 =
            data && lodash.exports.has(data, "ISO_14001")
                ? lodash.exports.isBoolean(data.ISO_14001)
                    ? data.ISO_14001
                    : lodash.exports.isString(data.ISO_14001)
                        ? data.ISO_14001
                        : null
                : null;
        this.ISO_50001 =
            data && lodash.exports.has(data, "ISO_50001")
                ? lodash.exports.isBoolean(data.ISO_50001)
                    ? data.ISO_50001
                    : lodash.exports.isString(data.ISO_50001)
                        ? data.ISO_50001
                        : null
                : null;
        this.responsible_steel_certification =
            data && lodash.exports.has(data, "responsible_steel_certification")
                ? lodash.exports.isBoolean(data.responsible_steel_certification)
                    ? data.responsible_steel_certification
                    : lodash.exports.isString(data.responsible_steel_certification)
                        ? data.responsible_steel_certification
                        : null
                : null;
        this.main_production_process =
            data && data.main_production_process
                ? data.main_production_process
                : null;
        this.main_production_equipment =
            data && data.main_production_equipment
                ? data.main_production_equipment
                : null;
        this.detailed_production_equipment =
            data && data.detailed_production_equipment
                ? data.detailed_production_equipment
                : null;
        this.power_source = data && data.power_source ? data.power_source : null;
        this.iron_ore_source =
            data && data.iron_ore_source ? data.iron_ore_source : null;
        this.met_coal_source =
            data && data.met_coal_source ? data.met_coal_source : null;
        this.electrodesData = [];
        if (data && data.electrodesData) {
            data.electrodesData.forEach((electrode) => {
                const elect = new CustomerLocationElectrodesData(electrode);
                this.electrodesData.push(elect);
            });
        }
    }
}
class CustomerConditions {
    constructor(data) {
        this.EAF = [];
        if (data && data.EAF && data.EAF.length > 0) {
            data.EAF.forEach((eaf) => {
                this.EAF.push(new CustomerConditionEAF(eaf));
            });
        }
        this.LF = [];
        if (data && data.LF && data.LF.length > 0) {
            data.LF.forEach((lf) => {
                this.LF.push(new CustomerConditionLF(lf));
            });
        }
        this.CCM = [];
        if (data && data.CCM && data.CCM.length > 0) {
            data.CCM.forEach((ccm) => {
                this.CCM.push(new CustomerConditionCCM(ccm));
            });
        }
    }
}
class CustomerConditionEAF {
    constructor(data) {
        this.date = data && data.date ? data.date : new Date().toISOString();
        this.n_shells = data && data.n_shells ? data.n_shells : null;
        this.shell_diam = data && data.shell_diam ? data.shell_diam : null;
        this.tap_system = data && data.tap_system ? data.tap_system : null;
        this.n_heats_day = data && data.n_heats_day ? data.n_heats_day : null;
        this.ttt = data && data.ttt ? data.ttt : null;
        this.tap_temp = data && data.tap_temp ? data.tap_temp : null;
        this.carbon_cons = data && data.carbon_cons ? data.carbon_cons : null;
        this.o2_cons = data && data.o2_cons ? data.o2_cons : null;
        this.n_burners = data && data.n_burners ? data.n_burners : null;
        this.foaming_slag = data && data.foaming_slag ? data.foaming_slag : null;
        this.porous_plugs = data && data.porous_plugs ? data.porous_plugs : null;
        this.stirring_gas = data && data.stirring_gas ? data.stirring_gas : null;
        this.alloys = data && data.alloys ? data.alloys : null;
        this.current_lifetime =
            data && data.current_lifetime ? data.current_lifetime : null;
        this.target_lifetime =
            data && data.target_lifetime ? data.target_lifetime : null;
        this.working_lining_weight =
            data && data.working_lining_weight ? data.working_lining_weight : null;
        this.weak_area = data && data.weak_area ? data.weak_area : null;
    }
}
class CustomerConditionLF {
    constructor(data) {
        this.date = data && data.date ? data.date : new Date().toISOString();
    }
}
class CustomerConditionCCM {
    constructor(data) {
        this.date = data && data.date ? data.date : new Date().toISOString();
    }
}
class CustomerProductionData {
    constructor(data) {
        this.ferronickel_capacity =
            data && data.ferronickel_capacity ? data.ferronickel_capacity : null;
        this.sinter_plant_capacity =
            data && data.sinter_plant_capacity ? data.sinter_plant_capacity : null;
        this.coking_plant_capacity =
            data && data.coking_plant_capacity ? data.coking_plant_capacity : null;
        this.pelletizing_plant_capacity =
            data && data.pelletizing_plant_capacity
                ? data.pelletizing_plant_capacity
                : null;
        this.crude_steel_production = {
            nominal: null,
            byYear: {},
        };
        if (data &&
            data.crude_steel_production &&
            lodash.exports.has(data.crude_steel_production, "nominal")) {
            (this.crude_steel_production.nominal =
                data.crude_steel_production.nominal),
                (this.crude_steel_production.byYear =
                    data.crude_steel_production.byYear);
        }
        else if (data && data.nominal_crude_steel_capacity) {
            //from json DB
            this.crude_steel_production.nominal = data.nominal_crude_steel_capacity;
            if (data.crude_steel_production) {
                this.crude_steel_production.byYear[2019] =
                    data.crude_steel_production._2019;
                this.crude_steel_production.byYear[2020] =
                    data.crude_steel_production._2020;
                this.crude_steel_production.byYear[2021] =
                    data.crude_steel_production._2021;
            }
        }
        this.BOF_steel_production = {
            nominal: null,
            byYear: {},
        };
        if (data &&
            data.BOF_steel_production &&
            lodash.exports.has(data.BOF_steel_production, "nominal")) {
            (this.BOF_steel_production.nominal = data.BOF_steel_production.nominal),
                (this.BOF_steel_production.byYear = data.BOF_steel_production.byYear);
        }
        else if (data && data.nominal_BOF_steel_capacity) {
            //from json DB
            this.BOF_steel_production.nominal = data.nominal_BOF_steel_capacity;
            if (data.BOF_steel_production) {
                this.BOF_steel_production.byYear[2019] =
                    data.BOF_steel_production._2019;
                this.BOF_steel_production.byYear[2020] =
                    data.BOF_steel_production._2020;
                this.BOF_steel_production.byYear[2021] =
                    data.BOF_steel_production._2021;
            }
        }
        this.EAF_steel_production = {
            nominal: null,
            byYear: {},
        };
        if (data &&
            data.EAF_steel_production &&
            lodash.exports.has(data.EAF_steel_production, "nominal")) {
            (this.EAF_steel_production.nominal = data.EAF_steel_production.nominal),
                (this.EAF_steel_production.byYear = data.EAF_steel_production.byYear);
        }
        else if (data && data.nominal_EAF_steel_capacity) {
            //from json DB
            this.EAF_steel_production.nominal = data.nominal_EAF_steel_capacity;
            if (data.EAF_steel_production) {
                this.EAF_steel_production.byYear[2019] =
                    data.EAF_steel_production._2019;
                this.EAF_steel_production.byYear[2020] =
                    data.EAF_steel_production._2020;
                this.EAF_steel_production.byYear[2021] =
                    data.EAF_steel_production._2021;
            }
        }
        this.OHF_steel_production = {
            nominal: null,
            byYear: {},
        };
        if (data &&
            data.OHF_steel_production &&
            lodash.exports.has(data.OHF_steel_production, "nominal")) {
            (this.OHF_steel_production.nominal = data.OHF_steel_production.nominal),
                (this.OHF_steel_production.byYear = data.OHF_steel_production.byYear);
        }
        else if (data && data.nominal_OHF_steel_capacity) {
            //from json DB
            this.OHF_steel_production.nominal = data.nominal_OHF_steel_capacity;
            if (data.OHF_steel_production) {
                this.OHF_steel_production.byYear[2019] =
                    data.OHF_steel_production._2019;
                this.OHF_steel_production.byYear[2020] =
                    data.OHF_steel_production._2020;
                this.OHF_steel_production.byYear[2021] =
                    data.OHF_steel_production._2021;
            }
        }
        this.iron_production = {
            nominal: null,
            byYear: {},
        };
        if (data && data.iron_production && lodash.exports.has(data.iron_production, "nominal")) {
            (this.iron_production.nominal = data.iron_production.nominal),
                (this.iron_production.byYear = data.iron_production.byYear);
        }
        else if (data && data.nominal_iron_capacity) {
            //from json DB
            this.iron_production.nominal = data.nominal_iron_capacity;
            if (data.iron_production) {
                this.iron_production.byYear[2019] = data.iron_production._2019;
                this.iron_production.byYear[2020] = data.iron_production._2020;
                this.iron_production.byYear[2021] = data.iron_production._2021;
            }
        }
        this.BF_production = {
            nominal: null,
            byYear: {},
        };
        if (data && data.BF_production && lodash.exports.has(data.BF_production, "nominal")) {
            (this.BF_production.nominal = data.BF_production.nominal),
                (this.BF_production.byYear = data.BF_production.byYear);
        }
        else if (data && data.nominal_BF_capacity) {
            //from json DB
            this.BF_production.nominal = data.nominal_BF_capacity;
            if (data.BF_production) {
                this.BF_production.byYear[2019] = data.BF_production._2019;
                this.BF_production.byYear[2020] = data.BF_production._2020;
                this.BF_production.byYear[2021] = data.BF_production._2021;
            }
        }
        this.DRI_production = {
            nominal: null,
            byYear: {},
        };
        if (data && data.DRI_production && lodash.exports.has(data.DRI_production, "nominal")) {
            (this.DRI_production.nominal = data.DRI_production.nominal),
                (this.DRI_production.byYear = data.DRI_production.byYear);
        }
        else if (data && data.nominal_DRI_capacity) {
            //from json DB
            this.DRI_production.nominal = data.nominal_DRI_capacity;
            if (data.DRI_production) {
                this.DRI_production.byYear[2019] = data.DRI_production._2019;
                this.DRI_production.byYear[2020] = data.DRI_production._2020;
                this.DRI_production.byYear[2021] = data.DRI_production._2021;
            }
        }
    }
}
class CustomerLocationElectrodesData {
    constructor(data) {
        this.application = data && data.application ? data.application : null;
        this.dia_in_mm = data && data.dia_in_mm ? data.dia_in_mm : null;
        this.length_in_mm = data && data.length_in_mm ? data.length_in_mm : null;
        this.dia_in_inches = data && data.dia_in_inches ? data.dia_in_inches : null;
        this.length_in_inches =
            data && data.length_in_inches ? data.length_in_inches : null;
        this.grade = data && data.grade ? data.grade : null;
        this.pin_nominal_dia_in_mm =
            data && data.pin_nominal_dia_in_mm ? data.pin_nominal_dia_in_mm : null;
        this.pin_nominal_dia_in_inches =
            data && data.pin_nominal_dia_in_inches
                ? data.pin_nominal_dia_in_inches
                : null;
        this.TPI = data && data.TPI ? lodash.exports.toNumber(data.TPI) : null;
        this.pin_length_type_code =
            data && data.pin_length_type_code ? data.pin_length_type_code : null;
        this.pin_length = data && data.pin_length ? data.pin_length : null;
        this.pin_size_in_mm =
            data && data.pin_size_in_mm ? data.pin_size_in_mm : null;
        this.pin_size_in_inches =
            data && data.pin_size_in_inches ? data.pin_size_in_inches : null;
        this.dust_groove =
            data && lodash.exports.isBoolean(data.dust_groove) ? data.dust_groove : null;
        this.pitch_plug =
            data && lodash.exports.isBoolean(data.pitch_plug) ? data.pitch_plug : null;
        this.preset = data && lodash.exports.isBoolean(data.preset) ? data.preset : null;
    }
}
/*
//each customer can have several locations
export class OLDCustomerLocation {
  type: string;
  position: Position; //gps coordinates
  location: LocationIQ; //locationIQ specific address
  plantConfiguration: PlantConfig;
  electrodes: ElectrodeType[];

  constructor(data?) {
    this.type = data && data.type ? data.type : null;
    this.position =
      data && data.position
        ? MapService.setPosition(data.position)
        : MapService.getPosition();
    this.location =
      data && data.location ? new LocationIQ(data.location) : new LocationIQ();
    this.plantConfiguration =
      data && data.plantConfiguration
        ? new PlantConfig(data.plantConfiguration)
        : new PlantConfig();
    this.electrodes = [];
    data && data.electrodes
      ? data.electrodes.forEach((electrode) =>
          this.electrodes.push(new ElectrodeType(electrode))
        )
      : undefined;
  }

  setAddress(location: LocationIQ) {
    this.location = new LocationIQ(location);
  }
}

//configuration of electrodes for each location
export class OLDElectrodeType {
  application: string;
  diaMm: number;
  lengthMm: number;
  diaInch: number;
  lenghtInch: number;
  grade: string;
  pinNomDiaMm: number;
  pinNomDiaInch: number;
  tpi: number;
  pinLengthCode: string;
  pinLength: string;
  dustGroove: boolean;
  pitchPlug: boolean;
  preset: boolean;

  constructor(data?) {
    this.application = data && data.application ? data.application : null;
    this.diaMm = data && data.diaMm ? data.diaMm : null;
    this.lengthMm = data && data.lengthMm ? data.lengthMm : null;
    this.diaInch = data && data.diaInch ? data.diaInch : null;
    this.lenghtInch = data && data.lenghtInch ? data.lenghtInch : null;
    this.grade = data && data.grade ? data.grade : null;
    this.pinNomDiaMm = data && data.pinNomDiaMm ? data.pinNomDiaMm : null;
    this.pinNomDiaInch = data && data.pinNomDiaInch ? data.pinNomDiaInch : null;
    this.tpi = data && data.tpi ? data.tpi : null;
    this.pinLengthCode = data && data.pinLengthCode ? data.pinLengthCode : null;
    this.pinLength = data && data.pinLength ? data.pinLength : null;
    this.dustGroove = data && data.dustGroove ? data.dustGroove : null;
    this.pitchPlug = data && data.pitchPlug ? data.pitchPlug : null;
    this.preset = data && data.preset ? data.preset : null;
  }
}

//confirguratin of the plant
export class OLDPlantConfig {
  EAF: string;
  LF: string;
  VD: string;
  CCM: string;
  rollingMill: string;

  constructor(data?) {
    this.EAF = data && data.EAF ? data.EAF : null;
    this.LF = data && data.LF ? data.LF : null;
    this.VD = data && data.VD ? data.VD : null;
    this.CCM = data && data.CCM ? data.CCM : null;
    this.rollingMill = data && data.rollingMill ? data.rollingMill : null;
  }
}*/

export { CustomerLocation as C, CustomerConditions as a, CustomerProductionData as b, CustomerConditionEAF as c, CustomerConditionLF as d, CustomerConditionCCM as e, CustomerLocationElectrodesData as f };

//# sourceMappingURL=customerLocation-71248eea.js.map