class Card {
    constructor(card) {
        if (card) {
            this.imgFront = card.imgFront ? card.imgFront : null;
            this.imgBack = card.imgBack ? card.imgBack : null;
            this.course = card.course
                ? card.course
                : { agencyId: null, certificationId: null };
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
class UserCards {
    constructor(doc) {
        this.cards = [];
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

export { Card as C, UserCards as U };

//# sourceMappingURL=user-cards-f5f720bb.js.map