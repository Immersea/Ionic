import {StorageService} from "../../common/storage";
import {alertController} from "@ionic/core";
import {DatabaseService, SETTINGSCOLLECTIONNAME} from "../../common/database";
import {TranslationService} from "../../common/translations";
import {TrasteelFilterService} from "../common/trs-db-filter";
import {orderBy} from "lodash";
import {RouterService} from "../../common/router";
import {BehaviorSubject} from "rxjs";
import {
  Customer,
  CustomerGroup,
  CustomerLocationType,
  CustomerSettings,
  CustomerType,
  MapDataCustomer,
} from "../../../interfaces/trasteel/customer/customer";

export const CUSTOMERSCOLLECTION = "customers";

export class CustomersController {
  customersList: MapDataCustomer[] = [];
  customersList$: BehaviorSubject<MapDataCustomer[]> = new BehaviorSubject([]);
  customerGroups: CustomerGroup[] = [];
  customerTypes: CustomerType[] = [];
  customerLocationTypes: CustomerLocationType[] = [];
  serviceInit = true;
  customersIndex = 0;

  //initialise this service inside app-root at the start of the app
  init() {
    //init only once
    if (this.serviceInit) {
      this.serviceInit = false;
      TrasteelFilterService.mapDataSub$.subscribe(() => {
        const collection =
          TrasteelFilterService.getCollectionArray(CUSTOMERSCOLLECTION);
        if (collection && collection.length > 0) {
          this.customersList = collection;
          this.customersList$.next(this.customersList);
        } else {
          this.customersList$.next([]);
        }
      });
      this.downloadCustomerSettings();
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection)) {
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataCustomer(collection[item]);
      });
    }
    return result;
  }

  async presentCustomerUpdate(id?) {
    return await RouterService.openModal("modal-customer-update", {
      customerId: id,
    });
  }

  async presentCustomerDetails(id) {
    RouterService.push("/" + CUSTOMERSCOLLECTION + "/" + id, "forward");
  }

  async getCustomer(id): Promise<Customer> {
    const customer = new Customer(
      await DatabaseService.getDocument(CUSTOMERSCOLLECTION, id)
    );
    return customer;
  }

  async updateCustomer(id, customer, userId) {
    return DatabaseService.saveItem(id, customer, userId, CUSTOMERSCOLLECTION);
  }

  async deleteCustomer(id): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-customer-header",
          "Delete Customer?"
        ),
        message: TranslationService.getTransl(
          "delete-customer-message",
          "This customer will be deleted! Are you sure?"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
            handler: () => {
              reject();
            },
          },
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              DatabaseService.deleteItem(CUSTOMERSCOLLECTION, id);
              RouterService.goBack();
              resolve(null);
            },
          },
        ],
      });
      confirm.present();
    });
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(CUSTOMERSCOLLECTION, type, uid, file);
  }

  getCustomersDetails(customerId): MapDataCustomer {
    if (this.customersList.length > 0) {
      return this.customersList.find((customer) => customer.id == customerId);
    } else {
      return null;
    }
  }

  createMapData(id, customer: Customer) {
    const locations: any[] = [];
    customer.locations.forEach((location: any) => {
      locations.push({
        type: location.type,
        position: location.position,
      });
    });
    return new MapDataCustomer({
      id: id,
      fullName: customer.fullName,
      photoURL: customer.photoURL,
      coverURL: customer.coverURL,
      locations: locations,
    });
  }

  /* 
  CUSTOMERS SETTINGS
  */

  getCustomerGroups(id?): CustomerGroup[] {
    if (id) {
      return [this.customerGroups.find((x) => x.groupId == id)];
    } else {
      return orderBy(this.customerGroups, ["groupName"], "asc");
    }
  }

  getLocationsTypes(id?): CustomerLocationType[] {
    if (id) {
      return [this.customerLocationTypes.find((x) => x.locationId == id)];
    } else {
      return this.customerLocationTypes;
    }
  }

  getCustomerTypes(id?): {typeId: string; typeName: string}[] {
    if (id) {
      return [this.customerTypes.find((x) => x.typeId == id)];
    } else {
      return this.customerTypes;
    }
  }

  async editCustomerGroups() {
    return await RouterService.openModal("modal-customer-group");
  }
  async editCustomerTypes() {
    return await RouterService.openModal("modal-customer-type");
  }
  async editCustomerLocationTypes() {
    return await RouterService.openModal("modal-customer-location-type");
  }

  async openSelectCustomer(selectedCustomer): Promise<MapDataCustomer> {
    return new Promise(async (resolve) => {
      const modal = await RouterService.openModal("modal-search-list", {
        list: this.customersList,
        item: selectedCustomer,
        searchTitle: {tag: "customer", text: "Customer"},
        showField: "fullName",
        filterBy: ["fullName"],
        orderBy: ["fullName"],
        placeholder: "Search by customer name",
      });
      modal.onDidDismiss().then(async (ev) => {
        if (ev) {
          resolve(ev.data);
        }
      });
      modal.present();
    });
  }

  async downloadCustomerSettings(): Promise<CustomerSettings> {
    let settings = new CustomerSettings();
    try {
      settings = await DatabaseService.getDocument(
        CUSTOMERSCOLLECTION,
        SETTINGSCOLLECTIONNAME
      );
    } catch (error) {}
    const groups = [];
    settings.customerGroups.forEach((group) => {
      groups.push(new CustomerGroup(group));
    });
    this.customerGroups = orderBy(groups, ["groupName"]);
    const types = [];
    settings.customerTypes.forEach((type) => {
      types.push(new CustomerType(type));
    });
    this.customerTypes = orderBy(types, ["typeName"]);
    const locationTypes = [];
    settings.customerLocationTypes.forEach((type) => {
      locationTypes.push(new CustomerLocationType(type));
    });
    this.customerLocationTypes = orderBy(locationTypes, ["locationName"]);
    return settings;
  }

  async uploadCustomerSettings() {
    await DatabaseService.updateDocument(
      CUSTOMERSCOLLECTION,
      SETTINGSCOLLECTIONNAME,
      {
        customerGroups: this.customerGroups,
        customerTypes: this.customerTypes,
        customerLocationTypes: this.customerLocationTypes,
      }
    );
  }

  async uploadCustomerSettingsDoc(doc, item) {
    await DatabaseService.updateDocument(CUSTOMERSCOLLECTION, doc, item);
  }

  async uploadCustomerGroups(customerGroups: CustomerGroup[]) {
    this.customerGroups = customerGroups;
    await this.uploadCustomerSettings();
  }
  async uploadCustomerTypes(customerTypes: CustomerType[]) {
    this.customerTypes = customerTypes;
    await this.uploadCustomerSettings();
  }
  async uploadCustomerLocationTypes(
    customerLocationTypes: CustomerLocationType[]
  ) {
    this.customerLocationTypes = customerLocationTypes;
    await this.uploadCustomerSettings();
  }
}
export const CustomersService = new CustomersController();

/*


  async checkPositionMapData() {
    const missing = [];
    this.customersList.forEach((customer) => {
      if (
        !customer.locations ||
        !customer.locations[0].position ||
        !customer.locations[0].position.geopoint.latitude
      ) {
        missing.push(customer);
      }
    });
    console.log("missing", missing.length, missing);
    const cust = missing[this.customersIndex];
    const customer = await this.getCustomer(cust.id);
    console.log("customer", customer);
    if (!customer.locations[0].position) {
      const locationIq = await forwardGeocode(customer.locations[0].country);
      this.updateLocationIQ(cust.id, customer, 0, locationIq[0], true);
    } else {
      const modal = await this.presentCustomerUpdate(cust.id);
      //update customer data after modal dismiss
      modal.onDidDismiss().then((ev) => {
        console.log("ev", ev);
        if (!ev.data) {
          this.customersIndex++;
          this.checkPositionMapData();
        } else {
          this.checkPositionMapData();
        }
      });
    }
  }

  async updateLocationIQ(id, customer, loc: number, locationIq, showAlert) {
    console.log("locationIq", locationIq);
    customer.locations[loc].location = new LocationIQ(locationIq);
    if (!customer.locations[loc].position) {
      customer.locations[loc].position = MapService.getPosition(
        customer.locations[loc].location.lat,
        customer.locations[loc].location.lon
      );
    }
    //Capitalise names
    const fullname = customer.fullName;
    const fullnameArray = fullname.split(" ");
    let fullNameCapitalise = [];
    for (let index = 0; index < fullnameArray.length; index++) {
      const n = fullnameArray[index];
      if (n == "AM" || n.toLowerCase() == "arcelormittal") {
        fullNameCapitalise.push("ArcelorMittal");
      } else if (
        n.toLowerCase() == "arcelor" &&
        fullnameArray[index + 1].toLowerCase() == "mittal"
      ) {
        fullNameCapitalise.push("ArcelorMittal");
        index++;
      } else if (n.length > 3 || index > 0) {
        fullNameCapitalise.push(capitalize(lowerCase(n)));
      } else {
        //sigla 1-3 lettere
        fullNameCapitalise.push(n);
      }
    }
    customer.fullName = fullNameCapitalise.join(" ");
    if (showAlert) {
      const alert = await alertController.create({
        header: "Check address",
        message:
          customer.fullName +
          "<br>" +
          customer.locations[loc].country +
          "<br>" +
          locationIq.display_name,
        buttons: [
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
            handler: async () => {},
          },
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              await this.updateCustomer(
                id,
                customer,
                UserService.userProfile.uid
              );
            },
          },
        ],
      });
      alert.present();
    } else {
      await this.updateCustomer(id, customer, UserService.userProfile.uid);
    }
  }

  async loadAllCustomers() {
    //read customers collection
    const customers =
      await DatabaseService.getCollectionDocuments(CUSTOMERSCOLLECTION);
    this.fixAddress(customers);
  }

  async fixAddress(customers) {
    const doc = customers.docs[this.customersIndex];
    let customerOK = false;
    if (doc.id !== "oldDB" && doc.id !== "OldDB" && doc.id !== "settings") {
      const customer = doc.data() as Customer;
      for (let loc = 0; loc < customer.locations.length; loc++) {
        const location = customer.locations[loc];
        if (
          !location.location.place_id &&
          location.position &&
          location.position.geopoint
        ) {
          try {
            const locationIq = await reverseGeocode(
              location.position.geopoint.latitude,
              location.position.geopoint.longitude
            );
            try {
              await this.updateLocationIQ(customers, loc, locationIq, false);
            } catch (error) {
              console.log("error3", customer, error);
              await SystemService.presentAlertError(error);
              this.customersIndex++;
              this.fixAddress(customers);
            }
          } catch (error) {
            console.log("error4", customer, error);
            await SystemService.presentAlertError(error);
            this.customersIndex++;
            this.fixAddress(customers);
          }
        } else if (!location.position && location.country) {
          location.country = location.country
            .replace("Phillipinnes", "Philippines")
            .replace("Republik", "Republic")
            .replace("Algery", "Algeria");
          try {
            const locationIq = await forwardGeocode(
              (location.address ? location.address + ", " : "") +
                (location.municipality ? location.municipality + ", " : "") +
                (location.province ? location.province + ", " : "") +
                (location.region ? location.region + ", " : "") +
                location.country
            );
            try {
              await this.updateLocationIQ(customers, loc, locationIq[0], true);
            } catch (error) {
              console.log("error1", customer, error);
              await SystemService.presentAlertError(error);
              this.customersIndex++;
              this.fixAddress(customers);
            }
          } catch (error) {
            console.log("error2", customer, error);
            await SystemService.presentAlertError(error);
            this.customersIndex++;
            this.fixAddress(customers);
          }
        } else {
          customerOK = true;
        }
      }
    } else {
      customerOK = true;
    }
    if (customerOK) {
      this.customersIndex++;
      this.fixAddress(customers);
    }
  }

  

    async findCustomersFromOldDB() {
    const excludeNames = [
      "steel",
      "plant",
      "acciaierie",
      "industry",
      "industries",
      "industrial",
      "steels",
      "mill",
      "company",
      "arcelor",
      "aceria",
      "sider",
      "liberty",
      "stahl",
      "simec",
      "metal",
      "trade",
      "mittal",
      "metal",
      "alloy",
      "aperam",
      "riva",
      "compania",
      "siderurgica",
      "outokumpu",
      "celsa",
      "metallurgical",
      "acero",
      "hutte",
      "gerdau",
      "nucor",
      "iron",
      "stainless",
      "work",
      "works",
      "corp",
      "group",
      "casting",
      "manufacturing",
      "thyssen",
      "krupp",
      "aceros",
      "global",
      "feralpi",
      "egyptian",
      "ispat",
      "iran",
      "beltrame",
      "venete",
      "bertoli",
      "acciai",
      "nippon",
      "azar",
      "melting",
      "casting",
      "nlmk",
      "ssab",
      "essar",
      "green",
      "celik",
      "limited",
      "cleveland",
      "wire",
      "gulf",
      "speciali",
      "alfa",
      "voest",
      "alpine",
      "marc",
      "duferco",
      "brasil",
      "pinda",
      "barra",
      "evraz",
      "tinto",
      "xing",
      "maanshan",
      "special",
      "fuxin",
      "sichuan",
      "fujian",
      "cheng",
      "united",
      "heavy",
      "valin",
      "paulo",
      "stahlwerk",
      "american",
      "sponge",
      "flat",
      "gallardo",
      "france",
      "sheffield",
      "south",
      "gunung",
      "india",
      "sail",
      "tata",
      "jindal",
      "orissa",
      "yazd",
      "verona",
      "pittini",
      "ferriere",
      "japan",
      "tokyo",
      "osaka",
      "kyoei",
      "dongkuk",
      "hyundai",
      "inch",
      "posco",
      "inch",
      "deacero",
      "tata",
      "asia",
      "huta",
      "mechel",
      "sever",
      "metals",
      "nacional",
      "hadeed",
      "cliff",
    ];
    const excludeDoubleNames = [
      "iron steel",
      "steel plant",
      "steel mill",
      "arcelor mittal",
      "steel industry",
      "steel company",
      "steel industries",
      "alloy steel",
      "metal manufacturing",
      "metallurgical plant",
      "cleveland cliff",
    ];
    const tbl_customers = [];
    tbl_customersDB["default"][2].data.map((data) => {
      tbl_customers.push(data);
    });
    const foundCustomers = await DatabaseService.getFirebaseDocument(
      CUSTOMERSCOLLECTION,
      "OldDB"
    );
    this.findCustomer(
      foundCustomers,
      tbl_customers,
      excludeDoubleNames,
      excludeNames
    );
  }

  async findCustomer(
    foundCustomers,
    tbl_customers,
    excludeDoubleNames,
    excludeNames
  ) {
    const index = this.findOldCustomerCount;
    const tbl_customer = tbl_customers[index];
    //check if customer already found
    const alreadyFound = await DatabaseService.queryCollection(
      CUSTOMERSCOLLECTION,
      "shortName",
      tbl_customer.Customer_Acronym
    );
    console.log("alreadyFound", alreadyFound.docs);
    if (alreadyFound.docs.length == 0) {
      console.log("not found", tbl_customer, CustomersService.customersList);
      const mapDataCustomer = CustomersService.customersList.find((x) => {
        const plantName = lowerCase(tbl_customer.Full_Customer_Name);
        const mapDataPlantName = lowerCase(x.fullName);
        if (plantName.length > 0) {
          let sameName = mapDataPlantName.includes(plantName);
          if (!sameName) {
            //split name and search
            const names = plantName.split(" ");
            let found = false;
            for (let index = 0; index < names.length; index++) {
              const name1 = names[index];
              const name2 = names[index + 1];
              if (found) {
                break;
              }
              if (
                name1.length > 3 &&
                name2 &&
                name2.length > 3 &&
                !excludeDoubleNames.includes(name1 + " " + name2) &&
                mapDataPlantName.includes(name1 + " " + name2)
              ) {
                found = true;
                return true;
              }
              if (
                !excludeNames.includes(name1) &&
                name1.length > 3 &&
                mapDataPlantName.includes(name1)
              ) {
                found = true;
                return true;
              }
            }
          }
          if (sameName && plantName.length > 3) {
            return true;
          }
        }
        return false;
      });
      const popover = await popoverController.create({
        component: "popover-find-oldcustomer",
        translucent: true,
        componentProps: {
          customersList: CustomersService.customersList,
          newCustomer: mapDataCustomer,
          oldCustomer: tbl_customer,
        },
      });

      popover.onDidDismiss().then(async (ev) => {
        const res = ev.data;
        let ret = null;
        let id = null;
        let updateCustomer = new Customer();
        if (res && res == "new") {
          //new customer
          updateCustomer.fullName = tbl_customer.Full_Customer_Name;
        } else if (res) {
          //update customer
          id = res.id;
          updateCustomer = await CustomersService.getCustomer(id);
        }
        updateCustomer.shortName = tbl_customer.Customer_Acronym;
        if (res) {
          if (updateCustomer.locations.length == 0) {
            const location = new CustomerLocation();
            location.country = startCase(lowerCase(tbl_customer.Country));
            updateCustomer.locations.push(location);
          }
          ret = await CustomersService.updateCustomer(
            id,
            updateCustomer,
            UserService.userProfile.uid
          );
          this.findOldCustomerCount = this.findOldCustomerCount + 1;
          foundCustomers.db.push({
            old: tbl_customer.Customer_Acronym,
            new: ret.id,
          });
          const save = await DatabaseService.updateDocument(
            CUSTOMERSCOLLECTION,
            "OldDB",
            foundCustomers
          );
          console.log("foundCustomers", foundCustomers, save);
        } else {
          this.findOldCustomerCount = this.findOldCustomerCount + 1;
        }
        if (tbl_customers.length > this.findOldCustomerCount) {
          this.findCustomer(
            foundCustomers,
            tbl_customers,
            excludeDoubleNames,
            excludeNames
          );
        }
      });
      popover.present();
    } else {
      console.log("alreadyFound", tbl_customer.Full_Customer_Name);
      this.findOldCustomerCount = this.findOldCustomerCount + 1;
      this.findCustomer(
        foundCustomers,
        tbl_customers,
        excludeDoubleNames,
        excludeNames
      );
    }
  }

  async resetMapData() {
    //read customers collection
    const customers =
      await DatabaseService.getCollectionDocuments(CUSTOMERSCOLLECTION);
    const oldDbCustomers = [];
    //const customers = [await DatabaseService.getFirebaseDocument(CUSTOMERSCOLLECTION,"0lcyNkdoHgp0NQku8KGu")]
    for (let index = 0; index < customers.docs.length; index++) {
      const doc = customers.docs[index];
      const customer = doc.data() as Customer;
      //reset location type
      if (!customer.locations || !isArray(customer.locations)) {
        console.log("customer no location", doc.id, customer);
      } else {
        for (let index = 0; index < customer.locations.length; index++) {
          const location = customer.locations[index];
          if (!location.type) location.type = "steel_plant";
          location.country = startCase(lowerCase(location.country));
          if (location.country == "South Af Rica")
            location.country = "South Africa";
        }
        //Capitalise names
        const fullname = customer.fullName;
        const fullnameArray = fullname.split(" ");
        let fullNameCapitalise = [];
        fullnameArray.forEach((n) => {
          if (n.length > 3) {
            fullNameCapitalise.push(capitalize(lowerCase(n)));
          } else if (n == "AM") {
            fullNameCapitalise.push("ArcelorMittal");
          } else {
            fullNameCapitalise.push(n);
          }
        });
        customer.fullName = fullNameCapitalise.join(" ");
        if (customer.shortName) {
          oldDbCustomers.push({old: customer.shortName, new: doc.id});
        }
        customer.plantID = doc.id;
        //customer type
        let bof = false;
        if (
          customer.locations[0] &&
          customer.locations[0].detailed_production_equipment &&
          customer.locations[0].detailed_production_equipment.includes("BOF")
        ) {
          bof = true;
        }
        if (bof) {
          customer.typeId = "integrated";
        } else {
          customer.typeId = "steel_plant";
        }
        //console.log(doc.id, customer);
        //save
        await DatabaseService.updateDocument(
          CUSTOMERSCOLLECTION,
          doc.id,
          customer
        );
      }
    }
    //save
    console.log("oldDbCustomers", oldDbCustomers);
    await CustomersService.uploadCustomerSettingsDoc("oldDB", {
      db: oldDbCustomers,
    });
  }

 

  /*

SEARCH EXCEL DATABASE

*
*

  async createGlobalSteelPlantsDB() {
    const globalSteelPlantsDB = [];
    globalSteelPlants["default"].map((plant) => {
      globalSteelPlantsDB.push(new GlobalSteelPlantsDB(plant));
    });
    const globalSteelPlantsProductionDB = [];
    globalSteelPlantsProduction["default"].map((plant) => {
      globalSteelPlantsProductionDB.push(
        new GlobalSteelPlantsProductionDB(plant)
      );
    });
    const electrodesDataDB = [];
    electrodesDB["default"].map((data) => {
      electrodesDataDB.push(new ElectrodesDataDB(data));
    });
    const tbl_customers = [];
    tbl_customersDB["default"][2].data.map((data) => {
      tbl_customers.push(data);
    });

    //create customers
    const customers = {};
    const owners = {};

    for (let index = 0; index < globalSteelPlantsDB.length; index++) {
      let globalSteelPlant = globalSteelPlantsDB[index];
      let id = globalSteelPlant.plant_ID as string;
      const isExtraPlant = id.indexOf("-") !== -1;
      if (isExtraPlant) {
        const ids = globalSteelPlant.plant_ID.split("-");
        id = ids[0];
      }
      const location = new CustomerLocation(globalSteelPlant);
      if (customers[id]) {
        //add new location
        customers[id].locations.push(location);
      } else {
        //find production data
        const globalDbProduction = globalSteelPlantsProductionDB.find(
          (x) => x.plant_id == id
        );
        //merge with customer data
        if (globalDbProduction)
          globalSteelPlant = merge(globalSteelPlant, globalDbProduction);
        const productionData = new CustomerProductionData(globalSteelPlant);

        //insert new customer
        globalSteelPlant.locations = [location];
        globalSteelPlant.productionData = productionData;
        const cust = new Customer(globalSteelPlant);
        //save customer
        cust.users = {
          [UserService.userProfile.uid]: ["owner"],
        };
        //console.log("saved", cust.fullName, ret);
        customers[id] = cust;
        //create owners DB
        owners[cust.owner.groupId] = cust.owner;
        cust.group.forEach((owner) => {
          owners[owner.groupId] = {
            groupId: owner.groupId,
            groupName: owner.groupName,
          };
        });
      }
    }

    console.log("customers", customers);
    console.log("owners", owners);
    const ownersArray = [];
    Object.keys(owners).forEach((key) => {
      ownersArray.push(owners[key]);
    });
    this.uploadCustomerGroups(ownersArray);
    this.uploadCustomerTypes(this.getCustomerTypes());
    this.uploadCustomerLocationTypes(this.getLocationsTypes());
  }

  async findCustomersFromOldDB() {
    const excludeNames = [
      "steel",
      "plant",
      "acciaierie",
      "industry",
      "industries",
      "industrial",
      "steels",
      "mill",
      "company",
      "arcelor",
      "aceria",
      "sider",
      "liberty",
      "stahl",
      "simec",
      "metal",
      "trade",
      "mittal",
      "metal",
      "alloy",
      "aperam",
      "riva",
      "compania",
      "siderurgica",
      "outokumpu",
      "celsa",
      "metallurgical",
      "acero",
      "hutte",
      "gerdau",
      "nucor",
      "iron",
      "stainless",
      "work",
      "works",
      "corp",
      "group",
      "casting",
      "manufacturing",
      "thyssen",
      "krupp",
      "aceros",
      "global",
      "feralpi",
      "egyptian",
      "ispat",
      "iran",
      "beltrame",
      "venete",
      "bertoli",
      "acciai",
      "nippon",
      "azar",
      "melting",
      "casting",
      "nlmk",
      "ssab",
      "essar",
      "green",
      "celik",
      "limited",
      "cleveland",
      "wire",
      "gulf",
      "speciali",
      "alfa",
      "voest",
      "alpine",
      "marc",
      "duferco",
      "brasil",
      "pinda",
      "barra",
      "evraz",
      "tinto",
      "xing",
      "maanshan",
      "special",
      "fuxin",
      "sichuan",
      "fujian",
      "cheng",
      "united",
      "heavy",
      "valin",
      "paulo",
      "stahlwerk",
      "american",
      "sponge",
      "flat",
      "gallardo",
      "france",
      "sheffield",
      "south",
      "gunung",
      "india",
      "sail",
      "tata",
      "jindal",
      "orissa",
      "yazd",
      "verona",
      "pittini",
      "ferriere",
      "japan",
      "tokyo",
      "osaka",
      "kyoei",
      "dongkuk",
      "hyundai",
      "inch",
      "posco",
      "inch",
      "deacero",
      "tata",
      "asia",
      "huta",
      "mechel",
      "sever",
      "metals",
      "nacional",
      "hadeed",
      "cliff",
    ];
    const excludeDoubleNames = [
      "iron steel",
      "steel plant",
      "steel mill",
      "arcelor mittal",
      "steel industry",
      "steel company",
      "steel industries",
      "alloy steel",
      "metal manufacturing",
      "metallurgical plant",
      "cleveland cliff",
    ];
    let globalSteelPlantsDB = [];
    globalSteelPlants["default"].map((plant) => {
      globalSteelPlantsDB.push(new GlobalSteelPlantsDB(plant));
    });
    globalSteelPlantsDB = orderBy(globalSteelPlantsDB, "plant_name_en");
    const tbl_customers = [];
    tbl_customersDB["default"][2].data.map((data) => {
      tbl_customers.push(data);
    });
    this.findCustomer(
      globalSteelPlantsDB,
      tbl_customers,
      excludeDoubleNames,
      excludeNames
    );
  }

  async findCustomer(
    globalSteelPlantsDB,
    tbl_customers,
    excludeDoubleNames,
    excludeNames
  ) {
    const index = this.findOldCustomerCount;
    const tbl_customer = tbl_customers[index];
    const globalSteelPlantCustomer = globalSteelPlantsDB.find((x) => {
      const plantName = lowerCase(tbl_customer.Full_Customer_Name);
      const globalSteelPlantName = lowerCase(x.plant_name_en);
      if (plantName.length > 0) {
        let sameName = globalSteelPlantName.includes(plantName);
        if (!sameName) {
          //split name and search
          const names = plantName.split(" ");
          let found = false;
          for (let index = 0; index < names.length; index++) {
            const name1 = names[index];
            const name2 = names[index + 1];
            if (found) {
              break;
            }
            if (
              name1.length > 3 &&
              name2 &&
              name2.length > 3 &&
              !excludeDoubleNames.includes(name1 + " " + name2) &&
              globalSteelPlantName.includes(name1 + " " + name2)
            ) {
              found = true;
              return true;
            }
            if (
              !excludeNames.includes(name1) &&
              name1.length > 3 &&
              globalSteelPlantName.includes(name1)
            ) {
              found = true;
              return true;
            }
          }
        }
        if (sameName && plantName.length > 3) {
          return true;
        }
      }
      return false;
    });
    const popover = await popoverController.create({
      component: "popover-find-oldcustomer",
      translucent: true,
      componentProps: {
        customersList: globalSteelPlantsDB,
        newCustomer: globalSteelPlantCustomer,
        oldCustomer: tbl_customer,
      },
    });

    popover.onDidDismiss().then(async (ev) => {
      const selectedCustomer = ev.data;
      let id = null;
      if (selectedCustomer) {
        //update customer
        id = selectedCustomer.plant_ID;
        const cust = await CustomersService.getCustomer(id);
        cust.shortName = tbl_customer.Customer_Acronym;
        await CustomersService.updateCustomer(
          id,
          cust,
          UserService.userProfile.uid
        );
      }
      this.foundOldCustomersList.push({
        old: tbl_customer.Customer_Acronym,
        new: id,
      });

      if (tbl_customers.length > this.findOldCustomerCount) {
        this.findOldCustomerCount = this.findOldCustomerCount + 1;
        this.findCustomer(
          globalSteelPlantsDB,
          tbl_customers,
          excludeDoubleNames,
          excludeNames
        );
        this.uploadCustomerSettingsDoc(
          "OLDCUSTOMERS",
          this.foundOldCustomersList
        );
      }
    });
    popover.present();
  }

  async findElectrodesFromOldDB() {
    const excludeNames = [
      "steel",
      "plant",
      "acciaierie",
      "industry",
      "industries",
      "industrial",
      "steels",
      "mill",
      "company",
      "arcelor",
      "aceria",
      "sider",
      "liberty",
      "stahl",
      "simec",
      "metal",
      "trade",
      "mittal",
      "metal",
      "alloy",
      "aperam",
      "riva",
      "compania",
      "siderurgica",
      "outokumpu",
      "celsa",
      "metallurgical",
      "acero",
      "hutte",
      "gerdau",
      "nucor",
      "iron",
      "stainless",
      "work",
      "works",
      "corp",
      "group",
      "casting",
      "manufacturing",
      "thyssen",
      "krupp",
      "aceros",
      "global",
      "feralpi",
      "egyptian",
      "ispat",
      "iran",
      "beltrame",
      "venete",
      "bertoli",
      "acciai",
      "nippon",
      "azar",
      "melting",
      "casting",
      "nlmk",
      "ssab",
      "essar",
      "green",
      "celik",
      "limited",
      "cleveland",
      "wire",
      "gulf",
      "speciali",
      "alfa",
      "voest",
      "alpine",
      "marc",
      "duferco",
      "brasil",
      "pinda",
      "barra",
      "evraz",
      "tinto",
      "xing",
      "maanshan",
      "special",
      "fuxin",
      "sichuan",
      "fujian",
      "cheng",
      "united",
      "heavy",
      "valin",
      "paulo",
      "stahlwerk",
      "american",
      "sponge",
      "flat",
      "gallardo",
      "france",
      "sheffield",
      "south",
      "gunung",
      "india",
      "sail",
      "tata",
      "jindal",
      "orissa",
      "yazd",
      "verona",
      "pittini",
      "ferriere",
      "japan",
      "tokyo",
      "osaka",
      "kyoei",
      "dongkuk",
      "hyundai",
      "inch",
      "posco",
      "inch",
      "deacero",
      "tata",
      "asia",
      "huta",
      "mechel",
      "sever",
      "metals",
      "nacional",
      "hadeed",
      "cliff",
    ];
    const excludeDoubleNames = [
      "iron steel",
      "steel plant",
      "steel mill",
      "arcelor mittal",
      "steel industry",
      "steel company",
      "steel industries",
      "alloy steel",
      "metal manufacturing",
      "metallurgical plant",
      "cleveland cliff",
    ];
    let globalSteelPlantsDB = [];
    globalSteelPlants["default"].map((plant) => {
      globalSteelPlantsDB.push(new GlobalSteelPlantsDB(plant));
    });
    globalSteelPlantsDB = orderBy(globalSteelPlantsDB, "plant_name_en");
    let electrodesPlantsDB = [];
    electrodesDB["default"].map((electrode) => {
      electrodesPlantsDB.push(new ElectrodesDataDB(electrode));
    });
    electrodesPlantsDB = orderBy(electrodesPlantsDB, "Plant");
    this.findElectrodes(
      globalSteelPlantsDB,
      electrodesPlantsDB,
      excludeDoubleNames,
      excludeNames
    );
  }

  async findElectrodes(
    globalSteelPlantsDB,
    electrodesPlantsDB,
    excludeDoubleNames,
    excludeNames
  ) {
    const index = this.findElectrodesCount;
    const electrode = electrodesPlantsDB[index];
    const globalSteelPlantCustomer = globalSteelPlantsDB.find((x) => {
      const plantName = lowerCase(electrode.plant);
      const globalSteelPlantName = lowerCase(x.plant_name_en);
      if (plantName.length > 0) {
        let sameName = globalSteelPlantName.includes(plantName);
        if (!sameName) {
          //split name and search
          const names = plantName.split(" ");
          let found = false;
          for (let index = 0; index < names.length; index++) {
            const name1 = names[index];
            const name2 = names[index + 1];
            if (found) {
              break;
            }
            if (
              name1.length > 3 &&
              name2 &&
              name2.length > 3 &&
              !excludeDoubleNames.includes(name1 + " " + name2) &&
              globalSteelPlantName.includes(name1 + " " + name2)
            ) {
              found = true;
              return true;
            }
            if (
              !excludeNames.includes(name1) &&
              name1.length > 3 &&
              globalSteelPlantName.includes(name1)
            ) {
              found = true;
              return true;
            }
          }
        }
        if (sameName && plantName.length > 3) {
          return true;
        }
      }
      return false;
    });
    const popover = await popoverController.create({
      component: "popover-find-oldcustomer",
      translucent: true,
      componentProps: {
        customersList: globalSteelPlantsDB,
        newCustomer: globalSteelPlantCustomer,
        oldCustomer: electrode,
      },
    });

    popover.onDidDismiss().then(async (ev) => {
      const res = ev.data;
      let ret = null;
      let id = null;
      const electrodesFound = electrodesPlantsDB.filter(
        (x) => x.plant == electrode.plant && x.country == electrode.country
      );
      let step = 1;
      let updateCustomer = new Customer();
      if (res && res == "new") {
        //new customer
        updateCustomer.fullName = electrode.plant;
      } else if (res) {
        //find all electrodes of same customer
        //update customer
        id = res.plant_ID.split("-")[0];
        updateCustomer = await CustomersService.getCustomer(id);
      }

      if (res) {
        if (updateCustomer.locations.length == 0) {
          const location = new CustomerLocation();
          location.country = electrode.country;
          updateCustomer.locations.push(location);
        }
        electrodesFound.map((elec) => {
          updateCustomer.locations[0].electrodesData.push(
            new CustomerLocationElectrodesData(elec)
          );
        });
        step = electrodesFound.length;
        ret = await CustomersService.updateCustomer(
          id,
          updateCustomer,
          UserService.userProfile.uid
        );
        this.findElectrodesCount = this.findElectrodesCount + step;
        console.log(
          "this.foundElectrodesList",
          this.findElectrodesCount,
          this.foundElectrodesList
        );
        this.foundElectrodesList.push({
          count: this.findElectrodesCount,
          old: electrode.plant,
          new: ret.id,
        });
        this.uploadCustomerSettingsDoc("ELECTRODES", {
          list: this.foundElectrodesList,
        });
      } else {
        this.findElectrodesCount = this.findElectrodesCount + step;
      }
      if (electrodesPlantsDB.length > this.findElectrodesCount) {
        this.findElectrodes(
          globalSteelPlantsDB,
          electrodesPlantsDB,
          excludeDoubleNames,
          excludeNames
        );
      }
    });
    popover.present();
  }*/
