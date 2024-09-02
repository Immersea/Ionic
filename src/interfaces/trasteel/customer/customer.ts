import {toNumber} from "lodash";
import {
  CustomerProductionData,
  CustomerLocation,
  CustomerConditions,
} from "./customerLocation";
import {MapService, Position} from "../../../services/common/map";
import {LngLat, LngLatLike} from "mapbox-gl";

export class GlobalSteelPlantsDB {
  plant_ID: string;
  plant_name_en: string;
  plant_name_other: string;
  other_plant_name_en: string;
  other_plant_name_other: string;
  soe_status: "full" | "N/A" | "partial";
  soe_state_department: string;
  group: {
    groupId: string;
    groupName: string;
    groupOwnershipPerc: number;
  }[];
  owner: {
    groupId: string;
    groupName: string;
  };
  address: string;
  municipality: string;
  province: string;
  country: string;
  region: string;
  location_other_language: string;
  position: Position;
  coordinate_accuracy: "exact" | "approximate";
  gem_wiki_page_en: string;
  gem_wiki_page_other: string;
  status: string;
  proposed_date: string;
  construction_date: string;
  start_date: string;
  plant_age: number | "N/A" | "unknown";
  closed_date: string;
  nominal_crude_steel_capacity: number | "N/A";
  nominal_BOF_steel_capacity: number | "N/A";
  nominal_EAF_steel_capacity: number | "N/A";
  nominal_OHF_steel_capacity: number | "N/A";
  nominal_iron_capacity: number | "N/A";
  nominal_BF_capacity: number | "N/A";
  nominal_DRI_capacity: number | "N/A";
  ferronickel_capacity: number | "N/A";
  sinter_plant_capacity: number | "N/A";
  coking_plant_capacity: number | "N/A";
  pelletizing_plant_capacity: number | "N/A";
  category_steel_product: string;
  steel_products: string;
  steel_sector_end_users: string;
  workforce_size: number | "N/A" | "unknown";
  ISO_14001: boolean | "N/A";
  ISO_50001: boolean | "N/A";
  responsible_steel_certification: boolean | "N/A";
  main_production_process: string;
  main_production_equipment: string;
  detailed_production_equipment: string;
  power_source: string;
  iron_ore_source: string;
  met_coal_source: string;
  constructor(data?) {
    this.plant_ID = data && data["Plant ID"] ? data["Plant ID"] : null;
    this.plant_name_en =
      data && data["Plant name (English)"]
        ? data["Plant name (English)"]
        : null;
    this.plant_name_other =
      data && data["Plant name (other language)"]
        ? data["Plant name (other language)"]
        : null;
    this.other_plant_name_en =
      data && data["Other plant names (English)"]
        ? data["Other plant names (English)"]
        : null;
    this.other_plant_name_other =
      data && data["Other plant names (other language)"]
        ? data["Other plant names (other language)"]
        : null;
    this.soe_status = data && data["SOE status"] ? data["SOE status"] : null;
    this.soe_state_department =
      data && data["SOE state department"]
        ? data["SOE state department"]
        : null;
    this.group = [];
    //create parent
    if (data && data["Parent [formula]"]) {
      //split parents
      const parents = data["Parent [formula]"].split("; ");
      const parentIDs = data["Parent PermID [formula]"].split("; ");
      parents.map((parent, index) => {
        const parentId = parentIDs[index];
        const id = parentId.substring(0, parentId.search("\\[") - 1);
        const perc = parentId.substring(
          parentId.search("\\[") + 1,
          parentId.length - 2
        );
        const name = parent.substring(0, parent.search("\\[") - 1);
        const parentObject = {
          groupId: id,
          groupName: name,
          groupOwnershipPerc: toNumber(perc),
        };
        this.group.push(parentObject);
      });
    }
    this.owner = {
      groupId: data && data["Owner PermID"] ? data["Owner PermID"] : null,
      groupName: data && data["Owner"] ? data["Owner"] : null,
    };

    this.address =
      data && data["Location address"] ? data["Location address"] : null;
    this.municipality =
      data && data["Municipality"] ? data["Municipality"] : null;
    this.province =
      data && data["Subnational unit (province/state)"]
        ? data["Subnational unit (province/state)"]
        : null;
    this.country = data && data["Country"] ? data["Country"] : null;
    this.region = data && data["Region"] ? data["Region"] : null;
    this.location_other_language =
      data && data["Other language location address"]
        ? data["Other language location address"]
        : null;
    this.position = null;
    if (data && data["Coordinates"]) {
      const coordArray = data["Coordinates"].split(", ");
      const lat = toNumber(coordArray[0]);
      const lon = toNumber(coordArray[1]);
      this.position = MapService.getPosition(lat, lon);
    }
    this.coordinate_accuracy =
      data && data["Coordinate accuracy"] ? data["Coordinate accuracy"] : null;
    this.gem_wiki_page_en =
      data && data["GEM wiki page"] ? data["GEM wiki page"] : null;
    this.gem_wiki_page_other =
      data && data["GEM wiki page (other language)"]
        ? data["GEM wiki page (other language)"]
        : null;
    this.status = data && data["Status"] ? data["Status"] : null;
    this.proposed_date =
      data && data["Proposed date"] ? data["Proposed date"] : null;
    this.construction_date =
      data && data["Construction date"] ? data["Construction date"] : null;
    this.start_date = data && data["Start date"] ? data["Start date"] : null;
    this.plant_age =
      data && data["Plant age (years)"]
        ? !isNaN(toNumber(data["Plant age (years)"]))
          ? toNumber(data["Plant age (years)"])
          : data["Plant age (years)"]
        : null;
    this.closed_date =
      data && data["Closed/idled date"] ? data["Closed/idled date"] : null;
    this.nominal_crude_steel_capacity =
      data && data["Nominal crude steel capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal crude steel capacity (ttpa)"]))
          ? toNumber(data["Nominal crude steel capacity (ttpa)"])
          : data["Nominal crude steel capacity (ttpa)"]
        : null;
    this.nominal_BOF_steel_capacity =
      data && data["Nominal BOF steel capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal BOF steel capacity (ttpa)"]))
          ? toNumber(data["Nominal BOF steel capacity (ttpa)"])
          : data["Nominal BOF steel capacity (ttpa)"]
        : null;
    this.nominal_EAF_steel_capacity =
      data && data["Nominal EAF steel capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal EAF steel capacity (ttpa)"]))
          ? toNumber(data["Nominal EAF steel capacity (ttpa)"])
          : data["Nominal EAF steel capacity (ttpa)"]
        : null;
    this.nominal_OHF_steel_capacity =
      data && data["Nominal OHF steel capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal OHF steel capacity (ttpa)"]))
          ? toNumber(data["Nominal OHF steel capacity (ttpa)"])
          : data["Nominal OHF steel capacity (ttpa)"]
        : null;
    this.nominal_iron_capacity =
      data && data["Nominal iron capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal iron capacity (ttpa)"]))
          ? toNumber(data["Nominal iron capacity (ttpa)"])
          : data["Nominal iron capacity (ttpa)"]
        : null;
    this.nominal_BF_capacity =
      data && data["Nominal BF capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal BF capacity (ttpa)"]))
          ? toNumber(data["Nominal BF capacity (ttpa)"])
          : data["Nominal BF capacity (ttpa)"]
        : null;
    this.nominal_DRI_capacity =
      data && data["Nominal DRI capacity (ttpa)"]
        ? !isNaN(toNumber(data["Nominal DRI capacity (ttpa)"]))
          ? toNumber(data["Nominal DRI capacity (ttpa)"])
          : data["Nominal DRI capacity (ttpa)"]
        : null;
    this.ferronickel_capacity =
      data && data["Ferronickel capacity (ttpa)"]
        ? !isNaN(toNumber(data["Ferronickel capacity (ttpa)"]))
          ? toNumber(data["Ferronickel capacity (ttpa)"])
          : data["Ferronickel capacity (ttpa)"]
        : null;
    this.sinter_plant_capacity =
      data && data["Sinter plant capacity (ttpa)"]
        ? !isNaN(toNumber(data["Sinter plant capacity (ttpa)"]))
          ? toNumber(data["Sinter plant capacity (ttpa)"])
          : data["Sinter plant capacity (ttpa)"]
        : null;
    this.coking_plant_capacity =
      data && data["Coking plant capacity (ttpa)"]
        ? !isNaN(toNumber(data["Coking plant capacity (ttpa)"]))
          ? toNumber(data["Coking plant capacity (ttpa)"])
          : data["Coking plant capacity (ttpa)"]
        : null;
    this.pelletizing_plant_capacity =
      data && data["Pelletizing plant capacity (ttpa)"]
        ? !isNaN(toNumber(data["Pelletizing plant capacity (ttpa)"]))
          ? toNumber(data["Pelletizing plant capacity (ttpa)"])
          : data["Pelletizing plant capacity (ttpa)"]
        : null;
    this.category_steel_product =
      data && data["Category steel product"]
        ? data["Category steel product"]
        : null;
    this.steel_products =
      data && data["Steel products"] ? data["Steel products"] : null;
    this.steel_sector_end_users =
      data && data["Steel sector end users"]
        ? data["Steel sector end users"]
        : null;
    this.workforce_size =
      data && data["Workforce size"]
        ? !isNaN(toNumber(data["Workforce size"]))
          ? toNumber(data["Workforce size"])
          : data["Workforce size"]
        : null;
    this.ISO_14001 =
      data && data["ISO 14001"]
        ? data["ISO 14001"] == "yes"
          ? true
          : data["ISO 14001"] == "no"
            ? false
            : "N/A"
        : null;
    this.ISO_50001 =
      data && data["ISO 50001"]
        ? data["ISO 50001"] == "yes"
          ? true
          : data["ISO 50001"] == "no"
            ? false
            : "N/A"
        : null;
    this.responsible_steel_certification =
      data && data["ResponsibleSteel Certification"]
        ? data["ResponsibleSteel Certification"] == "yes"
          ? true
          : data["ResponsibleSteel Certification"] == "no"
            ? false
            : "N/A"
        : null;
    this.main_production_process =
      data && data["Main production process"]
        ? data["Main production process"]
        : null;
    this.main_production_equipment =
      data && data["Main production equipment"]
        ? data["Main production equipment"]
        : null;
    this.detailed_production_equipment =
      data && data["Detailed production equipment"]
        ? data["Detailed production equipment"]
        : null;
    this.power_source =
      data && data["Power source"] ? data["Power source"] : null;
    this.iron_ore_source =
      data && data["Iron ore source"] ? data["Iron ore source"] : null;
    this.met_coal_source =
      data && data["Met coal source"] ? data["Met coal source"] : null;
  }
}

export class GlobalSteelPlantsProductionDB {
  plant_id: string;
  plant_name: string;
  crude_steel_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };
  BOF_steel_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };
  EAF_steel_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };
  OHF_steel_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };
  iron_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };
  BF_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };
  DRI_production: {
    _2019: number | string;
    _2020: number | string;
    _2021: number | string;
  };

  constructor(data?) {
    this.plant_id = data && data["Plant ID"] ? data["Plant ID"] : null;
    this.plant_name =
      data && data["Plant name (English)"]
        ? data["Plant name (English)"]
        : null;
    this.crude_steel_production = {_2019: null, _2020: null, _2021: null};
    this.crude_steel_production._2019 =
      data && data["Crude steel production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["Crude steel production 2019 (ttpa)"]))
          ? toNumber(data["Crude steel production 2019 (ttpa)"])
          : data["Crude steel production 2019 (ttpa)"]
        : null;
    this.BOF_steel_production = {_2019: null, _2020: null, _2021: null};
    this.BOF_steel_production._2019 =
      data && data["BOF steel production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["BOF steel production 2019 (ttpa)"]))
          ? toNumber(data["BOF steel production 2019 (ttpa)"])
          : data["BOF steel production 2019 (ttpa)"]
        : null;
    this.EAF_steel_production = {_2019: null, _2020: null, _2021: null};
    this.EAF_steel_production._2019 =
      data && data["EAF steel production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["EAF steel production 2019 (ttpa)"]))
          ? toNumber(data["EAF steel production 2019 (ttpa)"])
          : data["EAF steel production 2019 (ttpa)"]
        : null;
    this.OHF_steel_production = {_2019: null, _2020: null, _2021: null};
    this.OHF_steel_production._2019 =
      data && data["OHF steel production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["OHF steel production 2019 (ttpa)"]))
          ? toNumber(data["OHF steel production 2019 (ttpa)"])
          : data["OHF steel production 2019 (ttpa)"]
        : null;
    this.iron_production = {_2019: null, _2020: null, _2021: null};
    this.iron_production._2019 =
      data && data["Iron production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["Iron production 2019 (ttpa)"]))
          ? toNumber(data["Iron production 2019 (ttpa)"])
          : data["Iron production 2019 (ttpa)"]
        : null;
    this.BF_production = {_2019: null, _2020: null, _2021: null};
    this.BF_production._2019 =
      data && data["BF production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["BF production 2019 (ttpa)"]))
          ? toNumber(data["BF production 2019 (ttpa)"])
          : data["BF production 2019 (ttpa)"]
        : null;
    this.DRI_production = {_2019: null, _2020: null, _2021: null};
    this.DRI_production._2019 =
      data && data["DRI production 2019 (ttpa)"]
        ? !isNaN(toNumber(data["DRI production 2019 (ttpa)"]))
          ? toNumber(data["DRI production 2019 (ttpa)"])
          : data["DRI production 2019 (ttpa)"]
        : null;
    this.crude_steel_production._2020 =
      data && data["Crude steel production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["Crude steel production 2020 (ttpa)"]))
          ? toNumber(data["Crude steel production 2020 (ttpa)"])
          : data["Crude steel production 2020 (ttpa)"]
        : null;
    this.BOF_steel_production._2020 =
      data && data["BOF steel production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["BOF steel production 2020 (ttpa)"]))
          ? toNumber(data["BOF steel production 2020 (ttpa)"])
          : data["BOF steel production 2020 (ttpa)"]
        : null;
    this.EAF_steel_production._2020 =
      data && data["EAF steel production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["EAF steel production 2020 (ttpa)"]))
          ? toNumber(data["EAF steel production 2020 (ttpa)"])
          : data["EAF steel production 2020 (ttpa)"]
        : null;
    this.OHF_steel_production._2020 =
      data && data["OHF steel production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["OHF steel production 2020 (ttpa)"]))
          ? toNumber(data["OHF steel production 2020 (ttpa)"])
          : data["OHF steel production 2020 (ttpa)"]
        : null;
    this.iron_production._2020 =
      data && data["Iron production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["Iron production 2020 (ttpa)"]))
          ? toNumber(data["Iron production 2020 (ttpa)"])
          : data["Iron production 2020 (ttpa)"]
        : null;
    this.BF_production._2020 =
      data && data["BF production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["BF production 2020 (ttpa)"]))
          ? toNumber(data["BF production 2020 (ttpa)"])
          : data["BF production 2020 (ttpa)"]
        : null;
    this.DRI_production._2020 =
      data && data["DRI production 2020 (ttpa)"]
        ? !isNaN(toNumber(data["DRI production 2020 (ttpa)"]))
          ? toNumber(data["DRI production 2020 (ttpa)"])
          : data["DRI production 2020 (ttpa)"]
        : null;
    this.crude_steel_production._2021 =
      data && data["Crude steel production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["Crude steel production 2021 (ttpa)"]))
          ? toNumber(data["Crude steel production 2021 (ttpa)"])
          : data["Crude steel production 2021 (ttpa)"]
        : null;
    this.BOF_steel_production._2021 =
      data && data["BOF steel production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["BOF steel production 2021 (ttpa)"]))
          ? toNumber(data["BOF steel production 2021 (ttpa)"])
          : data["BOF steel production 2021 (ttpa)"]
        : null;
    this.EAF_steel_production._2021 =
      data && data["EAF steel production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["EAF steel production 2021 (ttpa)"]))
          ? toNumber(data["EAF steel production 2021 (ttpa)"])
          : data["EAF steel production 2021 (ttpa)"]
        : null;
    this.OHF_steel_production._2021 =
      data && data["OHF steel production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["OHF steel production 2021 (ttpa)"]))
          ? toNumber(data["OHF steel production 2021 (ttpa)"])
          : data["OHF steel production 2021 (ttpa)"]
        : null;
    this.iron_production._2021 =
      data && data["Iron production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["Iron production 2021 (ttpa)"]))
          ? toNumber(data["Iron production 2021 (ttpa)"])
          : data["Iron production 2021 (ttpa)"]
        : null;
    this.BF_production._2021 =
      data && data["BF production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["BF production 2021 (ttpa)"]))
          ? toNumber(data["BF production 2021 (ttpa)"])
          : data["BF production 2021 (ttpa)"]
        : null;
    this.DRI_production._2021 =
      data && data["DRI production 2021 (ttpa)"]
        ? !isNaN(toNumber(data["DRI production 2021 (ttpa)"]))
          ? toNumber(data["DRI production 2021 (ttpa)"])
          : data["DRI production 2021 (ttpa)"]
        : null;
  }
}

export class ElectrodesDataDB {
  plant: string;
  country: string;
  area: string;
  application: string;
  dia_in_mm: number;
  length_in_mm: number;
  dia_in_inches: number;
  length_in_inches: number;
  grade: string;
  pin_nominal_dia_in_mm: number;
  pin_nominal_dia_in_inches: number;
  TPI: number;
  pin_length_type_code: string;
  pin_length: string;
  pin_size_in_mm: string;
  pin_size_in_inches: string;
  dust_groove: boolean;
  pitch_plug: boolean;
  preset: boolean;
  constructor(data?) {
    this.plant = data && data["Plant"] ? data["Plant"] : null;
    this.country = data && data["Country"] ? data["Country"] : null;
    this.area = data && data["Area"] ? data["Area"] : null;
    this.application = data && data["Application"] ? data["Application"] : null;
    this.dia_in_mm =
      data && data["Dia in mm"]
        ? !isNaN(toNumber(data["Dia in mm"]))
          ? toNumber(data["Dia in mm"])
          : data["Dia in mm"]
        : null;
    this.length_in_mm =
      data && data["Length in mm"]
        ? !isNaN(toNumber(data["Length in mm"]))
          ? toNumber(data["Length in mm"])
          : data["Length in mm"]
        : null;
    this.dia_in_inches =
      data && data["Dia in inches"]
        ? !isNaN(toNumber(data["Dia in inches"]))
          ? toNumber(data["Dia in inches"])
          : data["Dia in inches"]
        : null;
    this.length_in_inches =
      data && data["Length in inches"]
        ? !isNaN(toNumber(data["Length in inches"]))
          ? toNumber(data["Length in inches"])
          : data["Length in inches"]
        : null;
    this.grade = data && data["Grade"] ? data["Grade"] : null;
    this.pin_nominal_dia_in_mm =
      data && data["Pin Nominal Dia in mm"]
        ? !isNaN(toNumber(data["Pin Nominal Dia in mm"]))
          ? toNumber(data["Pin Nominal Dia in mm"])
          : data["Pin Nominal Dia in mm"]
        : null;
    this.pin_nominal_dia_in_inches =
      data && data["Pin Nominal Dia in inches"]
        ? !isNaN(toNumber(data["Pin Nominal Dia in inches"]))
          ? toNumber(data["Pin Nominal Dia in inches"])
          : data["Pin Nominal Dia in inches"]
        : null;
    this.TPI = data && data["TPI"] ? toNumber(data["TPI"]) : null;
    this.pin_length_type_code =
      data && data["Pin Length Type Code"]
        ? data["Pin Length Type Code"]
        : null;
    this.pin_length = data && data["Pin Length"] ? data["Pin Length"] : null;
    this.pin_size_in_mm =
      data && data["Pin Size (mm)"] ? data["Pin Size (mm)"] : null;
    this.pin_size_in_inches =
      data && data['Pin Size(")'] ? data['Pin Size(")'] : null;
    this.dust_groove =
      data && data["Dust Groove?"]
        ? data["Dust Groove?"] == "Y"
          ? true
          : data["Dust Groove?"] == "N"
            ? false
            : null
        : null;
    this.pitch_plug =
      data && data["Pitch Plug?"]
        ? data["Pitch Plug?"] == "Y"
          ? true
          : data["Pitch Plug?"] == "N"
            ? false
            : null
        : null;
    this.preset =
      data && data["Preset?"]
        ? data["Preset?"] == "Y"
          ? true
          : data["Preset?"] == "N"
            ? false
            : null
        : null;
  }
}

export class Customer {
  plantID: string;
  fullName: string;
  fullNameOther: string;
  shortName: string;
  otherPlantName: string;
  otherPlantNameOther: string;
  photoURL: string;
  coverURL: string;
  locations: CustomerLocation[];
  conditions: CustomerConditions;
  productionData: CustomerProductionData;
  group: CustomerGroup[];
  owner: CustomerGroup;
  typeId: string;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.plantID =
      data && data.plantID
        ? data.plantID
        : data && data.plant_ID
          ? data.plant_ID
          : null;
    this.fullName =
      data && data.fullName
        ? data.fullName
        : data && data.plant_name_en
          ? data.plant_name_en
          : null;
    this.fullNameOther =
      data && data.fullNameOther
        ? data.fullNameOther
        : data && data.plant_name_other
          ? data.plant_name_other
          : null;
    this.shortName = data && data.shortName ? data.shortName : null;
    this.otherPlantName =
      data && data.otherPlantName
        ? data.otherPlantName
        : data && data.other_plant_name_en
          ? data.other_plant_name_en
          : null;
    this.otherPlantNameOther =
      data && data.otherPlantNameOther
        ? data.otherPlantNameOther
        : data && data.other_plant_name_other
          ? data.other_plant_name_other
          : null;
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    this.typeId = data && data.typeId ? data.typeId : null;
    this.locations = [];
    data && data.locations
      ? data.locations.forEach((location) => {
          this.locations.push(new CustomerLocation(location));
        })
      : undefined;
    this.conditions =
      data && data.conditions
        ? new CustomerConditions(data.conditions)
        : {EAF: [], LF: [], CCM: []};
    this.productionData =
      data && data.productionData
        ? new CustomerProductionData(data.productionData)
        : new CustomerProductionData();
    this.group = [];
    if (data && data.group) {
      data.group.forEach((group) => {
        const info = {
          groupId: group.groupId ? group.groupId : null,
          groupName: group.groupName ? group.groupName : null,
          groupOwnershipPerc: group.groupOwnershipPerc
            ? toNumber(group.groupOwnershipPerc)
            : null,
        };
        this.group.push(info);
      });
    }
    this.owner = {
      groupId:
        data && data.owner && data.owner.groupId ? data.owner.groupId : null,
      groupName:
        data && data.owner && data.owner.groupName
          ? data.owner.groupName
          : null,
      groupOwnershipPerc: null,
    };
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}

//eventual group owner of the customer
export class CustomerGroup {
  groupId: string;
  groupName: string; //English
  groupOwnershipPerc: number;
  constructor(data?: CustomerGroup) {
    this.groupId = data && data.groupId ? data.groupId : null;
    this.groupName = data && data.groupName ? data.groupName : null;
    this.groupOwnershipPerc =
      data && data.groupOwnershipPerc
        ? toNumber(data.groupOwnershipPerc)
        : null;
  }
}

export class CustomerType {
  typeId: string;
  typeName: string; //English
  constructor(data?: CustomerType) {
    this.typeId = data && data.typeId ? data.typeId : null;
    this.typeName = data && data.typeName ? data.typeName : null;
  }
}

export class CustomerLocationType {
  locationId: string;
  locationName: string; //English
  constructor(data?: CustomerLocationType) {
    this.locationId = data && data.locationId ? data.locationId : null;
    this.locationName = data && data.locationName ? data.locationName : null;
  }
}

export class CustomerSettings {
  customerGroups: CustomerGroup[];
  customerTypes: CustomerType[];
  customerLocationTypes: CustomerLocationType[];
  oldCustomersIds: any;
  constructor(data?) {
    this.customerGroups =
      data && data.customerGroups ? data.customerGroups : [];
    this.customerTypes = data && data.customerTypes ? data.customerTypes : [];
    this.customerLocationTypes =
      data && data.customerLocationTypes ? data.customerLocationTypes : [];
    this.oldCustomersIds =
      data && data.oldCustomersIds ? data.oldCustomersIds : [];
  }
}

//each customer information
/*export class Customer {
  fullName: string;
  shortName: string;
  groupId: string;
  photoURL: string;
  coverURL: string;
  locations: CustomerLocation[];
  typeId: string;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.fullName = data && data.fullName ? data.fullName : null;
    this.shortName = data && data.shortName ? data.shortName : null;
    this.groupId = data && data.groupId ? data.groupId : null;
    this.photoURL = data && data.photoURL ? data.photoURL : null;
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    this.typeId = data && data.typeId ? data.typeId : null;
    this.locations = [];
    data && data.locations
      ? data.locations.forEach((location) => {
          if (location.location.lat && location.location.lon)
            this.locations.push(new CustomerLocation(location));
        })
      : undefined;

    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}*/

//Used to fill essential data of the customers into the map
export class MapDataCustomer {
  id: string;
  fullName: string;
  photoURL: string;
  coverURL: string;
  locations: CustomerLocation[] = [];
  type: CustomerType;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (key == "location") {
          this.locations = [];
          if (this[key].lat && this[key].lon)
            this.locations.push(new CustomerLocation(this[key]));
        } else {
          this[key] = data[key];
        }
      });
    }
  }

  getLngLat(): LngLatLike[] {
    const pos = [];
    this.locations.map((location) => {
      if (location.position && location.position.geopoint)
        pos.push(
          new LngLat(
            location.position.geopoint.longitude,
            location.position.geopoint.latitude
          )
        );
    });
    return pos;
  }
}
