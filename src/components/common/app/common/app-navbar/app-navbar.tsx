import {Component, h, Prop, Host} from "@stencil/core";
import {RouterService} from "../../../../../services/common/router";

@Component({
  tag: "app-navbar",
  styleUrl: "app-navbar.scss",
})
export class AppNavbar {
  @Prop() tag?: string;
  @Prop() text?: string;
  @Prop() extraTitle?: string;
  @Prop() color?: string = "primary";
  @Prop() iconColor?: string = "primary";

  @Prop() modal?: boolean = false;
  @Prop() backButton?: boolean = false;

  @Prop() rightButtonText?: {
    icon: string;
    tag: string;
    text: string;
    fill: "clear" | "outline" | "solid" | "default";
  };
  @Prop() rightButtonFc?: any;

  componentDidLoad() {}

  render() {
    return (
      <Host>
        {this.color == "transparent" ? (
          [
            <div>
              {!this.modal ? (
                <ion-fab vertical="top" horizontal="start" slot="fixed">
                  <slot name="start" />
                  <ion-fab-button color="transparent">
                    <ion-menu-button color={this.iconColor} />
                  </ion-fab-button>
                </ion-fab>
              ) : undefined}
            </div>,
            <slot name="end" />,
          ]
        ) : (
          <ion-header>
            <ion-toolbar color={this.color}>
              <ion-buttons slot="start">
                {!this.modal ? <ion-menu-button /> : undefined}
                {this.backButton ? (
                  <ion-button onClick={() => RouterService.goBack()}>
                    <ion-icon name="chevron-back-outline" slot="start" />
                  </ion-button>
                ) : undefined}
                <slot name="start" />
              </ion-buttons>
              <ion-title>
                {this.tag ? (
                  <my-transl tag={this.tag} text={this.text}></my-transl>
                ) : (
                  this.text
                )}
                {this.extraTitle ? " - " + this.extraTitle : undefined}
              </ion-title>
              <ion-buttons slot="end">
                {this.rightButtonText ? (
                  <ion-button
                    fill={this.rightButtonText.fill}
                    onClick={() => this.rightButtonFc()}
                  >
                    {this.rightButtonText.icon ? (
                      <ion-icon name={this.rightButtonText.icon} slot="start" />
                    ) : undefined}
                    {this.rightButtonText.tag ? (
                      <ion-label>
                        <my-transl
                          tag={this.rightButtonText.tag}
                          text={this.rightButtonText.text}
                        ></my-transl>
                      </ion-label>
                    ) : undefined}
                  </ion-button>
                ) : undefined}
                <slot name="end" />
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
        )}
      </Host>
    );
  }
}
