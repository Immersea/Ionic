import { Element } from "@stencil/core";
import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Host,
  State,
  Watch,
} from "@stencil/core";
import { orderBy } from "lodash";

@Component({
  tag: "app-infinite-scroll",
  styleUrl: "app-infinite-scroll.scss",
})
export class AppInfiniteScroll {
  @Element() el: HTMLElement;
  private listElement: HTMLIonListElement;
  @Event() listChanged: EventEmitter<any>;
  @Prop({ mutable: true }) list: any[] = [];
  @Prop({ mutable: true }) loading: boolean = false;
  @Prop() groupBy: string[] = [];
  @Prop() orderBy: string[] = [];
  @Prop() returnField: string;
  @Prop() showFields: string[] = [];
  @Prop() showFieldsDivider: string = " ";
  @Prop() showNotes: string[] = [];
  @Prop() icon: string;
  @Prop() options: {
    tag: string;
    text: string;
    icon: string;
    color: string;
    func: any;
  }[];
  @State() setItems: any[];
  @State() groupedItems;
  @State() updateView = false;
  start: number;
  listLength: number;

  @Watch("list")
  reset() {
    this.start = 0;
    this.listLength = 50;
    this.setItems = [];
    this.groupedItems = {};
    this.generateItems();
  }

  @Event() itemClicked: EventEmitter<any>;

  componentWillLoad() {
    this.reset();
  }

  generateItems(ev?) {
    const newItems = [];
    for (let i = this.start; i < this.start + this.listLength; i++) {
      if (this.list[i]) newItems.push(this.list[i]);
    }
    this.setItems = [...this.setItems, ...newItems];
    this.setItems = this.orderBy
      ? orderBy(this.setItems, this.orderBy)
      : this.setItems;
    this.start += this.listLength;
    if (this.groupBy.length > 0) {
      const groupedItems = [];
      this.setItems.forEach((item) => {
        const value = item[this.groupBy[0]];
        !groupedItems[value] ? (groupedItems[value] = []) : undefined;
        groupedItems[value].push(item);
      });
      this.groupedItems = groupedItems;
    }
    ev ? ev.target.complete() : null;
    this.listChanged.emit();
  }

  showItem(item) {
    return (
      <ion-item-sliding class='no-select'>
        <ion-item
          button
          detail
          onClick={() =>
            this.itemClicked.emit(
              this.returnField ? item[this.returnField] : item
            )
          }
          class='fix-label'
        >
          {item.photoURL ? (
            <ion-avatar slot='start'>
              <img src={item.photoURL} />
            </ion-avatar>
          ) : this.icon ? (
            <ion-icon slot='start' name={this.icon}></ion-icon>
          ) : undefined}
          <ion-label>
            <h2>
              {this.showFields.map((field, index) => {
                return item[field]
                  ? item[field] +
                      (index < this.showFields.length - 1
                        ? this.showFieldsDivider
                        : "")
                  : "";
              })}
            </h2>
            {this.showNotes.length > 0 ? (
              <p>
                {this.showNotes.map((field, index) => {
                  return item[field]
                    ? item[field] +
                        (index < this.showNotes.length - 1
                          ? index < this.showNotes.length - 1
                            ? this.showFieldsDivider
                            : ""
                          : "")
                    : "";
                })}
              </p>
            ) : undefined}
          </ion-label>
        </ion-item>
        {this.options ? (
          <ion-item-options>
            {this.options.map((option) => (
              <ion-item-option
                color={option.color}
                onClick={() => this.executeOptionFc(option, item)}
              >
                {option.icon ? (
                  <ion-icon name={option.icon}></ion-icon>
                ) : undefined}
                <my-transl tag={option.tag} text={option.text}></my-transl>
              </ion-item-option>
            ))}
          </ion-item-options>
        ) : undefined}
      </ion-item-sliding>
    );
  }

  executeOptionFc(option, item) {
    this.listElement = this.el.querySelector("#infinite-scroll-list");
    this.listElement.closeSlidingItems();
    option.func(item[this.returnField]);
  }

  render() {
    return (
      <Host>
        {this.list.length == 0 ? (
          <div>
            {this.loading ? (
              <ion-item>
                <ion-thumbnail slot='start'>
                  <ion-skeleton-text></ion-skeleton-text>
                </ion-thumbnail>
                <ion-label>
                  <h2>
                    <ion-skeleton-text
                      animated
                      style={{ width: "80%" }}
                    ></ion-skeleton-text>
                  </h2>
                  <p>
                    <ion-skeleton-text
                      animated
                      style={{ width: "60%" }}
                    ></ion-skeleton-text>
                  </p>
                </ion-label>
              </ion-item>
            ) : (
              <ion-item>
                <ion-label>
                  <h2>No data available</h2>
                </ion-label>
              </ion-item>
            )}
          </div>
        ) : (
          [
            <ion-list id='infinite-scroll-list'>
              {this.groupBy.length > 0
                ? Object.keys(this.groupedItems).map((key) => (
                    <ion-item-group>
                      <ion-item-divider>
                        <ion-label>{key}</ion-label>
                      </ion-item-divider>
                      {this.groupedItems[key].map((item) =>
                        this.showItem(item)
                      )}
                    </ion-item-group>
                  ))
                : this.setItems.map((item) => this.showItem(item))}
            </ion-list>,
            <ion-infinite-scroll
              onIonInfinite={(ev) => {
                this.generateItems(ev);
              }}
            >
              <ion-infinite-scroll-content></ion-infinite-scroll-content>
            </ion-infinite-scroll>,
          ]
        )}
      </Host>
    );
  }
}
