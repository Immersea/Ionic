import { r as registerInstance, h } from './index-d515af00.js';

const appSkeletonsCss = "app-skeletons{width:100%;height:100%}";

const AppSkeletons = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.skeleton = undefined;
    }
    createSkeleton() {
        switch (this.skeleton) {
            case "chat":
                return (h("ion-item", null, h("ion-avatar", { slot: 'start' }, h("ion-skeleton-text", { animated: true })), h("ion-label", null, h("h1", null, h("ion-skeleton-text", { animated: true, style: { width: "50%" } })), h("p", null, h("ion-skeleton-text", { animated: true, style: { width: "70%" } }))), h("ion-note", null, h("ion-skeleton-text", { animated: true }))));
            case "diveTrip":
                return (h("ion-item", null, h("ion-avatar", { slot: 'start' }, h("ion-skeleton-text", { animated: true })), h("ion-label", null, h("h2", null, h("ion-skeleton-text", { animated: true, style: { width: "50%" } })), h("h4", null, h("ion-skeleton-text", { animated: true, style: { width: "60%" } })), h("p", null, h("ion-skeleton-text", { animated: true, style: { width: "70%" } })))));
            case "diveTripBooking":
                return (h("ion-item", null, h("ion-avatar", { slot: 'start' }, h("ion-skeleton-text", { animated: true })), h("ion-label", null, h("ion-skeleton-text", { animated: true, style: { width: "80%" } }))));
            case "userDivePlan":
                return (h("ion-card", null, h("ion-item", null, h("ion-label", null, h("h2", null, h("ion-skeleton-text", { animated: true, style: { width: "40%" } })), h("p", null, h("ion-skeleton-text", { animated: true, style: { width: "60%" } })))), h("ion-item", { detail: true }, h("ion-thumbnail", { slot: 'start' }, h("ion-skeleton-text", { animated: true })), h("ion-label", null, h("h3", null, h("ion-skeleton-text", { animated: true, style: { width: "50%" } })), h("h4", null, h("ion-skeleton-text", { animated: true, style: { width: "60%" } })), h("p", null, h("ion-skeleton-text", { animated: true, style: { width: "80%" } }))))));
        }
    }
    render() {
        return this.createSkeleton();
    }
};
AppSkeletons.style = appSkeletonsCss;

export { AppSkeletons as app_skeletons };

//# sourceMappingURL=app-skeletons.entry.js.map