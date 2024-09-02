import {Calendar, EventInput} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import momentPlugin from "@fullcalendar/moment";
import interactionPlugin from "@fullcalendar/interaction";

import {TranslationService} from "./translations";
import {DiveTripsService} from "../udive/diveTrips";
import {DivingClassesService} from "../udive/divingClasses";
import {DivePlansService} from "../udive/divePlans";
import {UserDivePlans} from "../../interfaces/udive/user/user-dive-plans";
import {ClassSummary} from "../../interfaces/udive/diving-class/divingClass";
import {TripSummary} from "../../interfaces/udive/dive-trip/diveTrip";
import {addDays, addMinutes, format} from "date-fns";

class CalendarController {
  editable = true;
  //calendarRender$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  createCalendar(
    calendarEl: HTMLElement,
    showMonth = true,
    showWeek = true,
    showDay = true
  ) {
    const calendar = new Calendar(calendarEl, {
      headerToolbar: {
        start: "prev,next today",
        center: "title",
        end:
          (showMonth ? "dayGridMonth," : "") +
          (showWeek ? "timeGridWeek,listWeek," : "") +
          (showDay ? "timeGridDay" : ""),
      },
      initialView: showMonth
        ? "dayGridMonth"
        : showWeek
          ? "timeGridWeek"
          : showDay
            ? "timeGridDay"
            : "dayGridMonth",
      plugins: [
        momentPlugin,
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
        interactionPlugin,
      ],
      //datesSet: (info) => this.calendarRender$.next(info),
      eventClick: this.clickEvent,
    });
    calendar.render();
    return calendar;
  }

  //UDIVE
  addEventsToCalendar(
    calendar: Calendar,
    type: string,
    eventsObject: any,
    editable = true
  ) {
    if (eventsObject && Object.keys(eventsObject).length > 0) {
      this.editable = editable;
      let color = "";
      if (type == "trips") {
        color = "divetrip";
        eventsObject = eventsObject as TripSummary;
      } else if (type == "classes") {
        color = "divingclass";
        eventsObject = eventsObject as ClassSummary;
      } else if (type == "dives") {
        color = "planner";
        eventsObject = eventsObject as UserDivePlans;
      }
      const eventColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--ion-color-" + color);
      const textColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--ion-color-" + color + "-contrast");
      const diveEventColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--ion-color-planner");
      const diveTextColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--ion-color-planner-contrast");
      const events = [];
      if (eventsObject) {
        Object.keys(eventsObject).map((eventId) => {
          const event = eventsObject[eventId];
          if (event) {
            //push event
            if (event.displayName) {
              events.push(
                this.getCalendarEvent(
                  type,
                  event.displayName,
                  eventId,
                  format(event.date, "yyyy-MM-dd"),
                  format(addDays(event.end, 1), "yyyy-MM-dd"), //moment(event.end).add(1, "day").format("YYYY-MM-DD"), //add one day to show correct calendar event
                  eventColor,
                  textColor
                )
              );
            }
            //push dives
            if (event.dives) {
              event.dives.map((dive) => {
                const runtime = dive.runtime ? dive.runtime : 60;
                const start = dive.start ? dive.start : dive.date.toISOString();
                events.push(
                  this.getCalendarEvent(
                    type,
                    TranslationService.getTransl("dive", "Dive"),
                    eventId,
                    start,
                    addMinutes(start, runtime), //moment(start).add(runtime, "minute").toDate(),
                    diveEventColor,
                    diveTextColor
                  )
                );
              });
            }
          }
        });
      }
      this.addToCalendar(calendar, type, events);
    }
  }

  addToCalendar(calendar: Calendar, id: string, events: EventInput[]) {
    //replace event source
    if (calendar) {
      const source = calendar.getEventSourceById(id);
      if (source) {
        source.remove();
      }
      calendar.addEventSource({id: id, events: events});
    }
  }

  getCalendarEvent(type, title, id, start, end, bgcolor, textColor) {
    return {
      extendedProps: {
        type: type,
      },
      title: title,
      id: id,
      start: start,
      end: end,
      textColor: textColor,
      backgroundColor: bgcolor,
    };
  }

  clickEvent(info) {
    console.log("clickEvent", info);
    switch (info.event.extendedProps.type) {
      case "trips":
        this.editable
          ? DiveTripsService.presentDiveTripUpdate(null, null, info.event.id)
          : DiveTripsService.presentDiveTripDetails(info.event.id);
        break;
      case "classes":
        this.editable
          ? DivingClassesService.presentDivingClassUpdate(
              null,
              null,
              info.event.id
            )
          : DivingClassesService.presentDivingClassDetails(info.event.id);
        break;
      case "dives":
        this.editable
          ? DivePlansService.presentDivePlanUpdate(info.event.id, 0)
          : DivePlansService.presentDivePlanDetails(info.event.id, 0);
        break;
    }
  }
}
export const CalendarService = new CalendarController();
