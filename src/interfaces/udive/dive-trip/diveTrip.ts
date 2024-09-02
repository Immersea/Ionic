import {DivePlanModel} from "../planner/dive-plan";
export interface TripSummary {
  [tripId: string]: {
    displayName: string;
    date: Date;
    end: Date;
    dives: {
      start: Date;
      runtime: number;
    }[];
    organiser: Organiser;
  };
}

export interface TeamMember {
  role: string; //"diver", "instructor", "dive master"
  team: number;
  uid: string;
  confirmedUser: boolean;
  confirmedOrganiser: boolean;
}

export interface TripDive {
  divePlan: DivePlanModel;
  bookings: TeamMember[];
  numberOfParticipants: number;
}

export interface Organiser {
  collectionId: string;
  id: string;
}

export class DiveTrip {
  displayName: string;
  organiser: Organiser;
  chatId: string;
  tripDives: TripDive[];
  users: {
    [id: string]: string[]; //["owner", "editor", "instructor","divemaster"]
  };

  constructor(data?) {
    this.displayName = data && data.displayName ? data.displayName : null;
    this.organiser =
      data && data.organiser
        ? {
            collectionId: data.organiser.collectionId,
            id: data.organiser.id,
          }
        : null;

    let tripDives = [];
    if (data && data.tripDives && data.tripDives.length > 0) {
      data.tripDives.map((tripDive) => {
        let bookings = [];
        if (tripDive.bookings && tripDive.bookings.length > 0) {
          tripDive.bookings.map((booking) => {
            const book: TeamMember = {
              role: booking.role,
              team: booking.team ? booking.team : 0,
              uid: booking.uid,
              confirmedUser: booking.confirmedUser,
              confirmedOrganiser: booking.confirmedOrganiser,
            };
            bookings.push(book);
          });
        }
        tripDives.push({
          divePlan: new DivePlanModel(tripDive.divePlan),
          bookings: bookings,
          numberOfParticipants: tripDive.numberOfParticipants
            ? tripDive.numberOfParticipants
            : 0,
        });
      });
    }
    this.tripDives = tripDives;
    this.chatId = data && data.chatId ? data.chatId : null;

    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}
