import {Component, h, Element, Method, Prop} from "@stencil/core";
import {CalendarService} from "../../../../../services/common/calendar";
import {Calendar} from "@fullcalendar/core";

@Component({
  tag: "app-calendar",
  styleUrl: "app-calendar.scss",
})
export class AppCalendar {
  @Element() el: HTMLElement;
  @Prop() calendarId: string = "calendar";
  @Prop({mutable: true}) addEvents: any;
  calendar: Calendar;

  componentDidLoad() {
    this.initializeCalendar();
  }

  initializeCalendar() {
    const calendarEl = this.el.querySelector(
      "." + this.calendarId
    ) as HTMLElement;
    this.calendar = CalendarService.createCalendar(calendarEl);
    Object.keys(this.addEvents).forEach((type) => {
      CalendarService.addEventsToCalendar(
        this.calendar,
        type,
        this.addEvents[type]
      );
    });
  }
  @Method()
  async addEvent() {
    //this.calendar.addEvent(event);
  }

  render() {
    return <div class={"app-calendar " + this.calendarId}></div>;
  }
}
