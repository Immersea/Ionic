import { Component, h, Prop, Host } from "@stencil/core";

@Component({
  tag: "app-item-cover",
  styleUrl: "app-item-cover.scss",
})
export class AppItemCover {
  @Prop() item: any;
  @Prop() tmbPosition?: string;

  render() {
    return (
      <Host>
        {this.item
          ? [
              <div
                class='item-cover'
                style={
                  this.item.coverURL
                    ? {
                        backgroundImage: "url(" + this.item.coverURL + ")",
                      }
                    : undefined
                }
              ></div>,
              this.item.photoURL ? (
                <ion-thumbnail
                  style={{
                    marginLeft: this.tmbPosition == "left" ? "10%" : "auto",
                    marginRight: this.tmbPosition == "right" ? "10%" : "auto",
                  }}
                >
                  <img
                    src={
                      this.item.photoURL
                        ? this.item.photoURL
                        : "/assets/images/avatar.png"
                    }
                    alt={this.item.displayName}
                  />
                </ion-thumbnail>
              ) : undefined,
            ]
          : undefined}
      </Host>
    );
  }
}
