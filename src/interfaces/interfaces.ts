export interface InputValidator {
  name: string;
  value: any; //string | TextMulti;
  valid: boolean;
}

export interface SearchTag {
  type: string;
  name: string;
}

export interface CollectionGroup {
  [name: string]: {
    name: string;
    icon: {
      type: string;
      name: string;
      color: string;
    };
    collection: any;
    collectionSub$: any;
    createMapData: any;
    filteredCollection: any;
    fieldsToQuery: string[];
    query: boolean;
  };
}

export interface Marker {
  collection?: string;
  id?: string;
  name?: string;
  clickFn?: any;
  icon: {
    type: string; //"ionicon" | "mapicon" | "avatar";
    name: string; //"location",etc
    url?: string; //"avatar"
    color: string; //"danger","primary",etc
    size: string; //"large" | "small"; //"large","small"
  };
  latitude: number;
  longitude: number;
}

export interface UploadProgressData {
  state: string;
  progress: number;
  error: {
    code: string;
    message: string;
  };
  url: string;
}

export interface TextMultilanguage {
  [lang: string]: string;
}

export interface ArticleMultilanguage {
  [lang: string]: any;
}
