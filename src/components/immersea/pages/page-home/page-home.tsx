import { Component, h, State } from "@stencil/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { SystemService } from "../../../../services/common/system";

@Component({
  tag: "page-home",
  styleUrl: "page-home.scss",
})
export class PageHome {
  @State() tabSelected = "tab-news";
  tabChanged(ev) {
    this.tabSelected = ev.detail.tab;
  }

  async takePicture() {
    const permissions = await Camera.checkPermissions();
    console.log("permissions", permissions);
    if (permissions.camera == "denied") {
      // no permissions
      return;
    } else if (permissions.camera.includes("prompt")) {
      //request permissions
      try {
        await Camera.requestPermissions();
      } catch (error) {
        SystemService.presentAlertError(error);
        return;
      }
    }
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
    });

    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;

    console.log("imageUrl", imageUrl);
  }

  render() {
    return [
      <ion-tabs
        color='immersea'
        onIonTabsWillChange={(ev) => this.tabChanged(ev)}
      >
        <ion-tab tab='tab-news'>
          <ion-nav></ion-nav>
        </ion-tab>

        <ion-tab tab='tab-sea'>
          <ion-nav></ion-nav>
        </ion-tab>

        <ion-tab tab='tab-culture'>
          <ion-nav></ion-nav>
        </ion-tab>

        <ion-tab tab='tab-community'>
          <ion-nav></ion-nav>
        </ion-tab>

        <ion-tab-bar slot='bottom'>
          <ion-tab-button tab='tab-news' class='left'>
            <ion-icon
              name={this.tabSelected === "tab-news" ? "home" : "home-outline"}
            ></ion-icon>
          </ion-tab-button>

          <ion-tab-button tab='tab-sea' class='right'>
            <ion-icon
              name={this.tabSelected === "tab-sea" ? "fish" : "fish-outline"}
            ></ion-icon>
          </ion-tab-button>

          <svg
            height='50'
            viewBox='0 0 100 50'
            width='100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 0v50H0V0c.543 27.153 22.72 49 50 49S99.457 27.153 99.99 0h.01z'
              fill='red'
              fill-rule='evenodd'
            ></path>
          </svg>

          <ion-tab-button tab='tab-culture' class='left'>
            <ion-icon class='map-icon map-icon-museum'></ion-icon>
          </ion-tab-button>

          <ion-tab-button tab='tab-community' class='right'>
            <ion-icon
              name={
                this.tabSelected === "tab-community"
                  ? "people"
                  : "people-outline"
              }
            ></ion-icon>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>,
      <ion-fab vertical='bottom' horizontal='center' slot='fixed'>
        <ion-fab-button color='transparent' onClick={() => this.takePicture()}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='57'
            height='57'
            viewBox='0 0 57 57'
          >
            <g id='Raggruppa_44' data-name='Raggruppa 44'>
              <circle
                id='occhio-1'
                data-name='occhio-1'
                cx='28.5'
                cy='28.5'
                r='28.5'
                fill='#fff'
              />

              <g transform='translate(20 20)'>
                <circle
                  id='occhio-2'
                  cx='19.213'
                  cy='19.213'
                  r='19.213'
                  fill='#008bcf'
                  transform='translate(-11 -11)'
                />
                <g>
                  <circle
                    id='occhio-3'
                    cx='9.944'
                    cy='9.944'
                    r='9.944'
                    fill='#005589'
                    transform='translate(0 -3)'
                  />
                  <circle
                    id='occhio-4'
                    cx='2.943'
                    cy='2.943'
                    r='2.943'
                    fill='#fff'
                    transform='translate(10 0)'
                  />
                </g>
              </g>
            </g>
          </svg>
        </ion-fab-button>
      </ion-fab>,
    ];
  }
}
