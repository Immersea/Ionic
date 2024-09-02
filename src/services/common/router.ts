import {SystemService} from "./system";
import {modalController, popoverController} from "@ionic/core";
import {BehaviorSubject} from "rxjs";

export const ADMINROUTE = "admin";

class RouterController {
  router: HTMLIonRouterElement;
  routerSub$: BehaviorSubject<any> = new BehaviorSubject(<any>{});
  pageFrom: string;
  pageTo: string[] = [];

  init(router: HTMLIonRouterElement) {
    this.router = router;
  }

  routerChanged(ev) {
    this.pageFrom = ev.detail.from;
    this.pageTo = ev.detail.to.split("/");
    this.routerSub$.next(this.pageTo);
  }

  async push(url, source) {
    if (this.pageTo.join("/") !== url) {
      await SystemService.presentLoading("loading", false);
      const router = this.router.push(url, source);
      router.then(() => {
        SystemService.dismissLoading();
      });
    }
  }

  pushToActualUrl(addToUrl, source) {
    this.push(window.location.pathname + "/" + addToUrl, source);
  }

  goHome() {
    this.push("/", "root");
  }

  goBack() {
    if (this.pageFrom != null) {
      this.router.back();
    } else {
      this.goHome();
    }
  }

  async openModal(
    component: string,
    componentProps: any = null,
    backdropDismiss = false,
    resizeModal = true
  ) {
    await SystemService.presentLoading("loading", false);
    const modal = await modalController.create({
      component: component,
      componentProps: componentProps,
      backdropDismiss: backdropDismiss,
      cssClass: resizeModal ? "resize-modal" : null,
    });
    await modal.present();
    SystemService.dismissLoading();
    return modal;
  }

  async openPopover(
    component: string,
    componentProps: any = null,
    backdropDismiss = false,
    cssClass = ""
  ) {
    const popover = await popoverController.create({
      component: component,
      componentProps: componentProps,
      backdropDismiss: backdropDismiss,
      cssClass: cssClass,
      translucent: true,
    });
    await popover.present();
    return popover;
  }
}

export const RouterService = new RouterController();
