import { DivePlanModel } from "../planner/dive-plan";
import { Organiser } from "../dive-trip/diveTrip";
import { LocationIQ } from "../../../components";
import { orderBy } from "lodash";

export interface Agency {
  id: string;
  name: string;
  website: string;
  photoURL: string;
  coverURL: string;
  certifications: {
    [certId: string]: Certification;
  };
}

export interface Certification {
  id: string;
  name: string;
  website: string;
  maxDepth: number;
  photoURL: string;
  coverURL: string;
  order: number;
  group: string;
  numberOfStudents: number;
  activities: Activity[];
}

export interface Course {
  agencyId: string;
  certificationId: string;
}

export interface ClassSummary {
  [tripId: string]: {
    date: Date;
    end: Date;
    dives: {
      start: Date;
      runtime: number;
    }[];
    organiser: Organiser;
  };
}

export interface Evaluation {
  activityId: number;
  evaluation: number; // 0 - 10
  comment: string;
}

export interface Student {
  uid: string;
  status: string; //applied, removed, registered, denied
  evaluations: Evaluation[];
}

export class Activity {
  type: string; //theory, dry, in-water, dive
  title: string;
  date: string;
  completed: boolean;
  divePlan: DivePlanModel;
  constructor(data?) {
    this.type = data && data.type ? data.type : null;
    this.title = data && data.title ? data.title : null;
    this.date = data && data.date ? data.date : new Date().toISOString();
    this.completed = data && data.completed ? true : false;
    this.divePlan = data && data.divePlan ? data.divePlan : null;
  }
}

export class DivingClass {
  organiser: Organiser;
  name: string;
  course: Course;
  schedule: { [day: number]: Date };
  location: LocationIQ;
  activities: Activity[];
  students: Student[];
  numberOfStudents: number;
  comments: string;
  status: string; //active, closed, cancelled
  users: {
    [id: string]: string[]; //["owner", "editor", "instructor","divemaster"]
  };

  constructor(data?) {
    this.organiser =
      data && data.organiser
        ? {
            collectionId: data.organiser.collectionId,
            id: data.organiser.id,
          }
        : null;
    this.name = data && data.name ? data.name : null;

    this.course = data && data.course ? data.course : null;
    this.schedule = {};
    if (data && data.schedule) {
      Object.keys(data.schedule).map((day) => {
        this.schedule[day] = new Date(data.schedule[day]);
      });
    }
    this.location = data && data.location ? data.location : [];
    const activities = [];
    if (data && data.activities && data.activities.length > 0) {
      data.activities.map((item) => {
        if (item.divePlan) {
          const plan = new DivePlanModel(item.divePlan);
          item.divePlan = plan;
        }
        activities.push(new Activity(item));
      });
    }
    this.activities = orderBy(activities, "date");
    this.students = [];
    if (data && data.students && data.students.length > 0) {
      data.students.map((item) => {
        this.students.push(item);
      });
    }
    this.numberOfStudents =
      data && data.numberOfStudents ? data.numberOfStudents : 3;
    this.comments = data && data.comments ? data.comments : "";
    this.status = data && data.status ? data.status : "active";

    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}
