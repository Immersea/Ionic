import { popoverController } from "@ionic/core";

export class ImmerseaServicesController {
  async presentInfoPopover(details) {
    const page = "popover-info-preview";
    const data = { details: details };
    var cssClass = "immersea-info-popover";
    const popover = await popoverController.create({
      component: page,
      translucent: true,
      backdropDismiss: true,
      cssClass: cssClass,
      componentProps: data,
    });
    popover.present();
    popover.onDidDismiss().then((updatedData) => {
      console.log("updatedData", updatedData);
    });
  }
}
export const ImmerseaService = new ImmerseaServicesController();
