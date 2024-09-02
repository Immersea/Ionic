import {Component, h, Event, EventEmitter, Prop} from "@stencil/core";

@Component({
  tag: "app-modal-footer",
  styleUrl: "app-modal-footer.css",
})
export class AppModalFooter {
  @Event() cancelEmit: EventEmitter;
  @Event() saveEmit: EventEmitter;
  @Prop() showSave = true;
  @Prop({mutable: true}) disableSave = false;
  @Prop() color = null;
  @Prop() saveTag = {
    tag: "save",
    text: "Save",
  };
  @Prop() cancelTag = {
    tag: "cancel",
    text: "Cancel",
  };
  componentWillLoad() {
    !this.showSave
      ? (this.cancelTag = {tag: "close", text: "Close"})
      : undefined;
  }
  render() {
    return (
      <ion-footer class="ion-no-border">
        <ion-toolbar color={this.color}>
          <ion-grid>
            <ion-row>
              {this.showSave ? (
                <ion-col>
                  <ion-button
                    expand="block"
                    fill={this.color ? "solid" : "outline"}
                    size="small"
                    color="success"
                    disabled={this.disableSave}
                    onClick={() => this.saveEmit.emit()}
                  >
                    <my-transl
                      tag={this.saveTag.tag}
                      text={this.saveTag.text}
                    />
                  </ion-button>
                </ion-col>
              ) : undefined}
              <ion-col>
                <ion-button
                  expand="block"
                  fill={this.color ? "solid" : "outline"}
                  size="small"
                  color="danger"
                  onClick={() => this.cancelEmit.emit()}
                >
                  <my-transl
                    tag={this.cancelTag.tag}
                    text={this.cancelTag.text}
                  />
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-toolbar>
      </ion-footer>
    );
  }
}
