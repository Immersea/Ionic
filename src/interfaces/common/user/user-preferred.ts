export interface UserPreferred {
  uid: string;
  preferred: {
    [preferredId: string]: {
      collectionId: string;
      id: string;
    };
  };
}
