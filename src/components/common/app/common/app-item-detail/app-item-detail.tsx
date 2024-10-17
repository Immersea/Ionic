import { Component, Prop, Watch, h } from "@stencil/core";
import { TranslationService } from "../../../../../services/common/translations";
import { TextMultilanguage } from "../../../../../interfaces/interfaces";
import { isBoolean, isNull, isNumber, isObject, isString } from "lodash";

@Component({
  tag: "app-item-detail",
  styleUrl: "app-item-detail.scss",
  shadow: true,
})
export class AppItemDetail {
  @Prop() labelTag?: string; //optional to get translation
  @Prop() labelText?: string;
  @Prop() detailTag?: string; //optional to get translation
  @Prop({ mutable: true }) detailText?:
    | string
    | number
    | boolean
    | TextMultilanguage;
  @Prop() appendText?: string;
  @Prop() showItem?: boolean = true;
  @Prop() lines?: "none" | "full" | "inset" = "none";
  @Prop() isDate? = false;
  @Prop() alignRight? = false;
  @Prop() labelPosition?;
  show = false;

  componentWillLoad() {
    this.show =
      (isBoolean(this.detailText) ||
        isString(this.detailText) ||
        isNumber(this.detailText) ||
        isObject(this.detailText)) &&
      !isNull(this.detailText);
  }

  @Watch("detailText")
  inset() {
    return (
      <ion-label position={this.labelPosition}>
        {this.labelText ? (
          <p
            style={
              isNumber(this.detailText) || this.detailText == "-"
                ? {
                    "font-size": "0.75rem",
                    color: "black",
                  }
                : {
                    "font-size": "0.75rem",
                    color: "black",
                  }
            }
          >
            {this.labelTag
              ? TranslationService.getTransl(this.labelTag, this.labelText)
              : this.labelText}
            {this.appendText ? this.appendText : undefined}
          </p>
        ) : undefined}
        <h2
          style={
            this.alignRight
              ? {
                  "text-align": "right",
                }
              : null
          }
        >
          {typeof this.detailText === "object" && !isNull(this.detailText) ? (
            <app-multilanguage-text
              text={this.detailText}
            ></app-multilanguage-text>
          ) : isBoolean(this.detailText) ? (
            this.detailText === true ? (
              TranslationService.getTransl("yes", "Yes")
            ) : (
              TranslationService.getTransl("no", "No")
            )
          ) : this.detailTag && isString(this.detailText) ? (
            TranslationService.getTransl(this.detailTag, this.detailText)
          ) : this.isDate ? (
            new Date(this.detailText).toLocaleDateString()
          ) : (
            this.detailText
          )}
        </h2>
      </ion-label>
    );
  }

  render() {
    return [
      this.show ? (
        this.showItem ? (
          <ion-item lines={this.lines}>{this.inset()}</ion-item>
        ) : (
          <div>{this.inset()}</div>
        )
      ) : undefined,
    ];
  }
}
