import { r as registerInstance, l as createEvent, h, j as Host, k as getElement } from './index-d515af00.js';
import { T as TranslationService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import './env-9be68260.js';
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
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const appSearchbarCss = "app-searchbar {\n  @import url(\"https://fonts.googleapis.com/css?family=Inconsolata:700\");\n}\napp-searchbar .container {\n  position: absolute;\n  top: 80px;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 80px;\n  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);\n}\napp-searchbar .container .search {\n  position: absolute;\n  margin: auto;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  transition: all 1s;\n  z-index: 4;\n  box-shadow: 0 0 25px 0 rgba(0, 0, 0, 0.4);\n}\napp-searchbar .container .search:hover {\n  cursor: pointer;\n}\napp-searchbar .container .search::before {\n  content: \"\";\n  position: absolute;\n  margin: auto;\n  top: 19px;\n  right: 0;\n  bottom: 0;\n  left: 19px;\n  width: 14px;\n  height: 2px;\n  background: white;\n  transform: rotate(45deg);\n  transition: all 0.5s;\n}\napp-searchbar .container .search::after {\n  content: \"\";\n  position: absolute;\n  margin: auto;\n  top: -3px;\n  right: 0;\n  bottom: 0;\n  left: -3px;\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  border: 2px solid white;\n  transition: all 0.5s;\n}\napp-searchbar .container input {\n  font-family: \"Inconsolata\", monospace;\n  position: absolute;\n  margin: auto;\n  top: 0;\n  right: 0px;\n  bottom: 0;\n  left: 0;\n  width: 50px;\n  height: 50px;\n  outline: none;\n  border: none;\n  background: white;\n  color: black;\n  padding: 0 80px 0 20px;\n  border-radius: 30px;\n  transition: all 1s;\n  opacity: 0;\n  z-index: 5;\n  font-weight: bolder;\n  letter-spacing: 0.1em;\n}\napp-searchbar .container input:hover {\n  cursor: pointer;\n}\napp-searchbar .container input:focus {\n  width: 300px;\n  opacity: 1;\n  cursor: text;\n}\napp-searchbar .container input:focus ~ .search {\n  right: -250px;\n  background: #151515;\n  z-index: 6;\n}\napp-searchbar .container input:focus ~ .search::before {\n  top: 0;\n  left: 0;\n  width: 25px;\n}\napp-searchbar .container input:focus ~ .search::after {\n  top: 0;\n  left: 0;\n  width: 25px;\n  height: 2px;\n  border: none;\n  background: white;\n  border-radius: 0%;\n  transform: rotate(-45deg);\n}\napp-searchbar .container input::placeholder {\n  color: grey;\n  opacity: 0.5;\n  font-weight: bolder;\n}";

const AppSearchbar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.inputChanged = createEvent(this, "inputChanged", 7);
        this.inputBlur = createEvent(this, "inputBlur", 7);
        this.timeoutId = null;
        // Create a debounced method using lodash's debounce
        this.debouncedUpdate = lodash.exports.debounce((value) => {
            this.value = value;
            this.inputChanged.emit(this.value);
            this.inputElement.blur();
        }, 800); // Delay in milliseconds
        this.floating = false;
    }
    componentWillLoad() {
        this.placeholder = TranslationService.getTransl("search", "Search");
    }
    componentDidLoad() {
        this.inputElement = this.el.querySelector("#input-search");
    }
    handleChange(event) {
        // Event handler that calls the debounced method
        const value = event.target.value;
        this.debouncedUpdate(value);
    }
    handleBlur(ev) {
        //change focus
        //this.inputChanged.emit(this.value);
        ev.target.value = "";
    }
    handleKey(key) {
        //blur on Enter key
        if (key.code === "Enter") {
            key.preventDefault();
            this.inputElement.blur();
        }
    }
    render() {
        return (h(Host, { key: 'a508bb859e58367ec55491932cac2509b515e383' }, this.floating ? (h("div", { class: "container" }, h("input", { id: "input-search", type: "text", value: this.value, placeholder: this.placeholder + "...", onInput: (ev) => this.handleChange(ev), onChange: (ev) => this.handleBlur(ev), onKeyUp: (ev) => this.handleKey(ev) }), h("div", { class: "search" }))) : (h("div", null))));
    }
    get el() { return getElement(this); }
};
AppSearchbar.style = appSearchbarCss;

export { AppSearchbar as app_searchbar };

//# sourceMappingURL=app-searchbar.entry.js.map