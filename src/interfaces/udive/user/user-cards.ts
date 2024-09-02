import {DivingCourse} from "../diving-school/divingSchool";
export class Card {
  imgFront: string;
  imgBack: string;
  course: DivingCourse;
  number: string;
  certified: string;
  expiry: string;
  instructor: string;
  insructorId: string;
  comments: string;

  constructor(card?) {
    if (card) {
      this.imgFront = card.imgFront ? card.imgFront : null;
      this.imgBack = card.imgBack ? card.imgBack : null;
      this.course = card.course
        ? card.course
        : {agencyId: null, certificationId: null};
      this.number = card.number ? card.number : null;
      this.certified = card.certified
        ? new Date(card.certified).toISOString()
        : new Date().toISOString();
      this.expiry = card.expiry
        ? new Date(card.expiry).toISOString()
        : new Date().toISOString();
      this.instructor = card.instructor ? card.instructor : null;
      this.insructorId = card.insructorId ? card.insructorId : null;
      this.comments = card.comments ? card.comments : null;
    }
  }
}

export class UserCards {
  uid: string;
  email: string;
  cards: Card[] = [];

  constructor(doc?) {
    if (doc) {
      this.uid = doc.uid;
      this.email = doc.email;
      if (doc.cards && doc.cards.length > 0) {
        doc.cards.forEach((card) => {
          this.cards.push(new Card(card));
        });
      }
    }
  }
}
