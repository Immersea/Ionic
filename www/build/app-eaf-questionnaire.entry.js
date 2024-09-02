import { r as registerInstance, l as createEvent, h, j as Host, k as getElement } from './index-d515af00.js';
import { c as CustomerConditionEAF } from './customerLocation-bbe1e349.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
import './env-0a7fccce.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';

const appEafQuestionnaireCss = "app-eaf-questionnaire{}";

const AppEafQuestionnaire = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.updateEmit = createEvent(this, "updateEmit", 7);
        this.conditions = new CustomerConditionEAF();
        this.editable = false;
    }
    handleChange(ev) {
        this.conditions[ev.detail.name] = ev.detail.value;
        this.updateEmit.emit(this.conditions);
    }
    render() {
        return (h(Host, { key: '898fb7c41d166d27490d8dcf84974d6d4b1aaf05' }, h("ion-list", { key: 'c123a4dbd5919eb0a6619d7df9461de68e8c2938' }, h("ion-item-divider", { key: '9663a42c4163af2bf28c9c456bc669e5e83461a3' }, h("my-transl", { key: '3621d0f4519cffcbb15e324acbcfb86c93404feb', tag: "working_conditions", text: "Basic Working Conditions" })), h("app-form-item", { key: 'cd44c02389a3d34760a26b40626e7e327df7426a', labelTag: "date", labelText: "Date", lines: "inset", value: this.conditions.date, name: "date", "input-type": "date", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '3fb47acd4a6ea825d4ef6d6b2dcffb0371a314b1', labelTag: "capacity", labelText: "Capacity", appendText: " (MT)", lines: "inset", value: this.conditions.capacity, name: "capacity", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '07ce477eedf3480fc411b0d35df8d34b3f231c68', labelTag: "n_shells", labelText: "N\u00B0 of shells", appendText: " (No.)", value: this.conditions.n_shells, lines: "inset", name: "n_shells", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '8b6fd44ed3f05df6016c4eae69524fab2ad3e3f5', labelTag: "shell_diam", labelText: "Shell Diameter", appendText: " (mm)", lines: "inset", value: this.conditions.shell_diam, name: "shell_diam", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '41b91d4812b1196db84a7b6b6aba3cb89a3202a5', labelTag: "tap_system", labelText: "Shell Diameter", appendText: " (EBT/SPOUT)", lines: "inset", value: this.conditions.tap_system, name: "tap_system", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '0cf45ab21d38fe07d7c5fa26d8958cb3106ac95b', labelTag: "n_heats_day", labelText: "N\u00B0 Heats/Day", appendText: " (No.)", lines: "inset", value: this.conditions.n_heats_day, name: "n_heats_day", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'a905c0c1f6830f39407fa0a7a3173d3092da97a6', labelTag: "ttt", labelText: "Tap to Tap Time", appendText: " (min)", lines: "inset", value: this.conditions.ttt, name: "ttt", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'f28978eaabcf6ee9416ff56bd0aa35079ac2f3f5', labelTag: "tap_temp", labelText: "Tapping temperature", appendText: " (\u00B0C)", lines: "inset", value: this.conditions.tap_temp, name: "tap_temp", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '27d372308e8111ce3093b896af533afe1e4cf378', labelTag: "carbon_cons", labelText: "Carbon Consumption", appendText: " (Kg/MTon)", lines: "inset", value: this.conditions.carbon_cons, name: "carbon_cons", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '6cc0fb4464424c9047e5caefd2367746e3da4815', labelTag: "o2_cons", labelText: "Oxygen Consumption", appendText: " (Nm3/MTon)", lines: "inset", value: this.conditions.o2_cons, name: "o2_cons", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '0835bbb9d75bbb617ddd3ad1570935abddeab96a', labelTag: "n_burners", labelText: "Number of Burners", appendText: " (N\u00B0)", lines: "inset", value: this.conditions.n_burners, name: "n_burners", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'b3f0b35fe0d44e708569c62bf92c58724bc03ef1', labelTag: "foaming_slag", labelText: "Foaming Slag", appendText: " (YES/NO)", lines: "inset", value: this.conditions.foaming_slag, name: "foaming_slag", "input-type": "boolean", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '76e9c6b69590b6aeaa48d2caf06bed7ce497a754', labelTag: "porous_plugs", labelText: "Number of Porous Plugs", appendText: " (N\u00B0)", lines: "inset", value: this.conditions.porous_plugs, name: "porous_plugs", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'd6a6938955d8cc03d171dd48a1e7c131dd5f3e29', labelTag: "stirring_gas", labelText: "Stirring Gas", appendText: "", lines: "inset", value: this.conditions.stirring_gas, name: "stirring_gas", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '003c999757f32b9206ddafd158775ed2a4ac811f', labelTag: "alloys_addition", labelText: "Alloys Addition", appendText: " (Type & Quantity)", lines: "inset", value: this.conditions.alloys, name: "alloys", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: '0e821a32bef8c89f8bdbd662552aaedf9e26601a', labelTag: "current_lifetime", labelText: "Refractory Current Lifetime", appendText: " (N\u00B0 Heats)", lines: "inset", value: this.conditions.current_lifetime, name: "current_lifetime", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'ba6d1ffd678512f681da173cc7e4b17eccbcc2cc', labelTag: "target_lifetime", labelText: "Refractory Target Lifetime", appendText: " (N\u00B0 Heats)", lines: "inset", value: this.conditions.target_lifetime, name: "target_lifetime", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'c17106ac3f627f3181dac37d280caf617c5c0731', labelTag: "working_lining_weight", labelText: "Working Lining Weight", appendText: " (MTon)", lines: "inset", value: this.conditions.working_lining_weight, name: "working_lining_weight", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("app-form-item", { key: 'c011c332ab23c8c349395d3aaab45f53050ea3bf', labelTag: "weak_area", labelText: "Typical Lining Weak Area", appendText: "", lines: "inset", value: this.conditions.weak_area, name: "weak_area", "input-type": "text", textRows: 2, onFormItemChanged: (ev) => this.handleChange(ev), readonly: !this.editable }), h("ion-item-divider", { key: 'dad21868332697c9ea378fff3bab91e2757ac719' }, h("my-transl", { key: 'aeeee2f823b2d406c05f74c0aaeb7038b4c802e7', tag: "slag_composition", text: "Slag Composition" })), h("ion-item-divider", { key: '187ec5158d44431aacc4f3eff75119eaf229a2f1' }, h("my-transl", { key: '3e16e54bddfd9c8f028390595d8c7aaf4bb883bb', tag: "working_lining_parameters", text: "Working Lining Parameters" })), h("ion-item-divider", { key: 'ad817f3e246e92279dccae2b12c2358afe7891c8' }, h("my-transl", { key: '2b289e070636afcc1fcca226e5d318cdae69bcb6', tag: "safety_lining_parameters", text: "Safety Lining Parameters" })))));
    }
    get el() { return getElement(this); }
};
AppEafQuestionnaire.style = appEafQuestionnaireCss;

export { AppEafQuestionnaire as app_eaf_questionnaire };

//# sourceMappingURL=app-eaf-questionnaire.entry.js.map