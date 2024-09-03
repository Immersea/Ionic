import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const itemGroupIosCss = "ion-item-group{display:block}";

const itemGroupMdCss = "ion-item-group{display:block}";

const ItemGroup = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '24ff047b7c45f963f0dad072c65d38a230c2bc97', role: "group", class: {
                [mode]: true,
                // Used internally for styling
                [`item-group-${mode}`]: true,
                item: true,
            } }));
    }
};
ItemGroup.style = {
    ios: itemGroupIosCss,
    md: itemGroupMdCss
};

export { ItemGroup as ion_item_group };

//# sourceMappingURL=ion-item-group.entry.js.map