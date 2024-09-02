export interface Clients {
  [id: string]: ClientData;
}

export interface ClientData {
  trips: {
    [tripId: string]: boolean; //true
  };
  classes: {
    [classId: string]: string; //student status in the class
  };
  invoices: {
    [invoiceId: string]: string; //paid-updaid
  };
}
