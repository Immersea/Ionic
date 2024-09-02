export interface Translation {
  id?: string;
  input: string;
  translated?: {
    de: string;
    en: string;
    es: string;
    fr: string;
    it: string;
    ko: string;
    zh: string;
    pt: string;
    sv: string;
    ru: string;
  };
  isTranslated: {
    de: boolean;
    en: boolean;
    es: boolean;
    fr: boolean;
    it: boolean;
    ko: boolean;
    zh: boolean;
    pt: boolean;
    sv: boolean;
    ru: boolean;
  };
}
export class CreateTranslation implements Translation {
  input: string;
  isTranslated = {
    de: false,
    en: true,
    es: false,
    fr: false,
    it: false,
    ko: false,
    zh: false,
    pt: false,
    sv: false,
    ru: false,
  };
  constructor(text: string) {
    this.input = text;
  }
}

export interface TranslateText {
  tag: string;
  text: string;
  replace?: any;
}

export interface UserTranslation {
  lang: string;
  text: string;
}

export interface UserTranslationDoc {
  [langId: string]: UserTranslation;
}
