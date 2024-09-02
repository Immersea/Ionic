import { Component, h, Prop, Element, State } from "@stencil/core";
import { isDate, isString } from "lodash";
import { Card } from "../../../../../interfaces/udive/user/user-cards";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "modal-dive-card",
  styleUrl: "modal-dive-card.scss",
})
export class ModalDiveCard {
  @Element() el: HTMLElement;
  @Prop() card: Card;
  @State() updateCard: Card;
  @State() agencies: any;
  @State() validCard = false;

  componentWillLoad() {
    this.updateViewParams();
  }

  componentDidLoad() {
    this.validateCard();
  }

  async updateViewParams() {
    this.updateCard = new Card(this.card);
    this.validateCard();
  }

  save() {
    this.el.closest("ion-modal").dismiss(this.updateCard);
  }

  close() {
    this.el.closest("ion-modal").dismiss();
  }

  inputHandler(event: any) {
    this.updateCard[event.detail.name] = event.detail.value;
    this.validateCard();
  }

  updateCourse(ev) {
    this.updateCard.course = ev.detail;
    this.validateCard();
  }

  validateCard() {
    this.validCard =
      isString(this.updateCard.course.agencyName) &&
      isString(this.updateCard.course.certificationId) &&
      isDate(new Date(this.updateCard.certified)) &&
      isString(this.updateCard.number);
  }

  render() {
    return [
      <app-navbar
        tag='dive-card'
        text='Dive Card'
        color={Environment.getAppColor()}
        modal={true}
      ></app-navbar>,

      <ion-content>
        <ion-list>
          <popover-search-diving-course
            item={this.updateCard.course}
            onCertSelected={(ev) => this.updateCourse(ev)}
          />
          <app-form-item
            label-tag='number'
            label-text='Number'
            lines='inset'
            value={this.updateCard.number}
            name='number'
            input-type='text'
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-tag='certified'
            label-text='Certified'
            lines='inset'
            value={this.updateCard.certified}
            name='certified'
            input-type='date'
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-tag='expiry'
            label-text='Expiry'
            lines='inset'
            value={this.updateCard.expiry}
            name='expiry'
            input-type='date'
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[]}
          ></app-form-item>
          <app-form-item
            label-tag='instructor'
            label-text='Instructor'
            lines='inset'
            value={this.updateCard.instructor}
            name='instructor'
            input-type='text'
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[]}
          ></app-form-item>
          <app-form-item
            label-tag='comments'
            label-text='Comments'
            lines='inset'
            value={this.updateCard.comments}
            name='comments'
            textRows={4}
            input-type='text'
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[]}
          ></app-form-item>
        </ion-list>
      </ion-content>,
      <app-modal-footer
        disableSave={!this.validCard}
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
      />,
    ];
  }
}
