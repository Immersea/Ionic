import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';

const appCustomerPlantProductionCss = "app-customer-plant-production{}";

const AppLocation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.startYear = 2019;
        this.endYear = new Date().getFullYear();
        this.customer = undefined;
        this.editable = false;
        this.productionData = [];
        this.capacityData = [];
    }
    componentWillLoad() {
        if (this.editable) {
            this.startYear = this.endYear - 1;
        }
        const production = [
            { tag: "DRI_production", text: "DRI/HBI Production" },
            { tag: "BF_production", text: "Blast Furnace Production" },
            { tag: "iron_production", text: "Iron Production" },
            { tag: "BOF_production", text: "BOF/Converter Production" },
            { tag: "crude_steel_production", text: "Crude Steel Production" },
            { tag: "EAF_steel_production", text: "EAF Steel Production" },
            { tag: "OHF_steel_production", text: "OHF Steel Production" },
        ];
        const capacity = [
            { tag: "coking_plant_capacity", text: "Coking Plant Capacity" },
            { tag: "ferronickel_capacity", text: "Ferronickel Capacity" },
            { tag: "pelletizing_plant_capacity", text: "Pelletizing Plant Capacity" },
            { tag: "sinter_plant_capacity", text: "Sinter Plant Capacity" },
        ];
        production.forEach((prod) => {
            if (this.customer.productionData[prod.tag] &&
                this.customer.productionData[prod.tag].nominal != "N/A" &&
                this.customer.productionData[prod.tag].nominal != "unknown") {
                const byYear = [];
                if (Object.keys(this.customer.productionData[prod.tag].byYear).length > 0) {
                    for (let year = this.startYear; year <= this.endYear; year++) {
                        if (this.customer.productionData[prod.tag].byYear[year] &&
                            this.customer.productionData[prod.tag].byYear[year] != "N/A" &&
                            this.customer.productionData[prod.tag].byYear[year] != "unknown") {
                            byYear.push({
                                year: year,
                                value: this.customer.productionData[prod.tag].byYear[year],
                            });
                        }
                        else if (this.editable) {
                            byYear.push({
                                year: year,
                                value: null,
                            });
                        }
                    }
                }
                else if (this.editable) {
                    for (let year = this.startYear; year <= this.endYear; year++) {
                        byYear.push({
                            year: year,
                            value: null,
                        });
                    }
                }
                this.productionData.push({
                    item: prod,
                    value: this.customer.productionData[prod.tag].nominal,
                    byYear: byYear,
                });
            }
            else if (this.editable) {
                const byYear = [];
                for (let year = this.startYear; year <= this.endYear; year++) {
                    byYear.push({
                        year: year,
                        value: null,
                    });
                }
                this.productionData.push({
                    item: prod,
                    value: null,
                    byYear: byYear,
                });
            }
        });
        capacity.forEach((cap) => {
            if (this.customer.productionData[cap.tag] &&
                this.customer.productionData[cap.tag] != "N/A" &&
                this.customer.productionData[cap.tag] != "unknown") {
                this.capacityData.push({
                    item: cap,
                    value: this.customer.productionData[cap.tag],
                });
            }
            else if (this.editable) {
                this.capacityData.push({
                    item: cap,
                    value: null,
                });
            }
        });
    }
    handleChange(ev) {
        const item = ev.detail.name.split("^^");
        if (item[0] == "production") {
            if (!this.customer.productionData[item[1]] ||
                !this.customer.productionData[item[1]].nominal)
                this.customer.productionData[item[1]] = { nominal: null, byYear: {} };
            if (item.length < 3) {
                this.customer.productionData[item[1]].nominal = ev.detail.value;
            }
            else {
                this.customer.productionData[item[1]].byYear[item[2]] = ev.detail.value;
            }
        }
        else {
            //capacity
            this.customer.productionData[item[1]] = ev.detail.value;
        }
    }
    render() {
        return (h(Host, { key: '6cd88fc6261477541759689dd61defc61e4733d7' }, this.productionData.length > 0
            ? [
                h("ion-item-divider", null, h("my-transl", { tag: "production_data", text: "Production Data", appendText: " (kTon/year)" })),
                this.productionData.map((prod) => [
                    h("app-form-item", { showItem: true, labelTag: prod.item.tag, labelText: prod.item.text, value: prod.value, name: "production^^" + prod.item.tag, "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }),
                    this.editable ? (prod.byYear.map((year) => (h("app-form-item", { showItem: true, labelText: year.year, value: year.value, name: "production^^" + prod.item.tag + "^^" + year.year, "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev) })))) : prod.byYear && prod.byYear.length > 0 ? (h("ion-item", null, h("ion-label", null, prod.byYear.map((year, index) => year.year +
                        ": " +
                        year.value +
                        (index < prod.byYear.length - 1 ? ", " : ""))))) : undefined,
                ]),
            ]
            : undefined, this.capacityData.length > 0
            ? [
                h("ion-item-divider", null, h("my-transl", { tag: "capacity_data", text: "Capacity Data", appendText: " (kTon/year)" })),
                this.capacityData.map((cap) => [
                    h("app-form-item", { showItem: true, lines: "none", labelTag: cap.item.tag, labelText: cap.item.text, value: cap.value, name: "capacity^^" + cap.item.tag, "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }),
                ]),
            ]
            : undefined));
    }
    get el() { return getElement(this); }
};
AppLocation.style = appCustomerPlantProductionCss;

export { AppLocation as app_customer_plant_production };

//# sourceMappingURL=app-customer-plant-production.entry.js.map