import {DatabaseService} from "./database";
import {DocumentData} from "firebase/firestore";
import {BehaviorSubject} from "rxjs";
import {compareDates, replaceAll} from "../../helpers/utils";
import {SystemService, SYSTEMCOLLECTION} from "./system";
import {
  CreateTranslation,
  Translation,
} from "../../interfaces/common/translations/translations";
import {Environment} from "../../global/env";
import {upperFirst} from "lodash";
import {TextMultilanguage} from "../../components";

export const TRANSLATIONSCOLLECTION = "translations";

class TranslationController {
  en: DocumentData;
  currentSetLang: string = "en";
  translations: DocumentData = {};
  updatedTranslation = new BehaviorSubject({});
  missingTranslationsList = {};
  translationsLoaded = false;

  async init(language?: string) {
    language = language ? language : this.currentSetLang;
    const trans = await DatabaseService.getLocalDocument(
      TRANSLATIONSCOLLECTION
    );
    if (trans && Object.keys(trans).length > 0) {
      this.translations = trans;
      this.translationsLoaded = true;
      this.updateTranslations();
    } else {
      this.downloadData();
    }

    this.setLanguage(language);
    SystemService.systemPreferences$.subscribe(async (preferences) => {
      const translationsUpdated = await DatabaseService.getLocalDocument(
        "translationsUpdated"
      );
      if (!translationsUpdated) {
        this.downloadData();
      } else if (
        preferences.collectionsUpdate &&
        preferences.collectionsUpdate.translations
      ) {
        if (
          compareDates(
            translationsUpdated,
            preferences.collectionsUpdate.translations
          ) < 0
        ) {
          this.downloadData();
        }
      }
    });
  }

  async downloadData() {
    const transations = await DatabaseService.getFirebaseDocument(
      SYSTEMCOLLECTION,
      TRANSLATIONSCOLLECTION
    );
    if (transations) {
      this.translations = transations;
      this.saveLocalTranslations();
    }
  }

  saveLocalTranslations() {
    DatabaseService.saveLocalDocument(
      TRANSLATIONSCOLLECTION,
      this.translations
    );
    DatabaseService.saveLocalDocument("translationsUpdated", new Date());
    //send update to the translation component
    this.translationsLoaded = true;
    this.updateTranslations();
  }

  setLanguage(language) {
    this.currentSetLang = language;
    DatabaseService.saveLocalDocument("language", language);
    //send update to the translation component
    this.updateTranslations();
  }

  async updateTranslations() {
    if (this.translations) this.updatedTranslation.next(this.translations);
  }

  getTransl(
    tag: string,
    text?: string,
    replace?: any,
    language?: string
  ): string {
    if (!language) language = this.currentSetLang;
    var ret = null;
    if (!text) {
      text = upperFirst(replaceAll(tag, "-", " "));
    }
    if (this.translations && this.translations[tag]) {
      if (
        this.translations[tag].translated &&
        this.translations[tag].translated[language]
      ) {
        ret = this.translations[tag].translated[language];
      } else if (
        this.translations[tag].translated &&
        this.translations[tag].translated.en
      ) {
        ret = this.translations[tag].translated.en;
      } else {
        this.missingTranslation(tag, text);
        ret = text;
      }
    } else {
      this.missingTranslation(tag, text);
      ret = text;
    }
    if (replace && Object.keys(replace).length > 0) {
      Object.keys(replace).map((key) => {
        ret = ret.replace(key, replace[key]);
      });
    }

    return ret;
  }

  getTextMultiLanguageValue(value: TextMultilanguage, language: string) {
    if (value[language]) {
      return value[language];
    } else if (value.en) {
      return value.en;
    } else {
      return value[Object.keys(value)[0]];
    }
  }

  async missingTranslation(tag: string, text: string) {
    if (this.translationsLoaded && tag && !this.missingTranslationsList[tag]) {
      this.missingTranslationsList[tag] = true;
      const translation = new CreateTranslation(text) as Translation;
      Environment.log("missingTranslation", [tag, translation]);
      try {
        await DatabaseService.mergeWithDocument(
          TRANSLATIONSCOLLECTION,
          tag,
          translation
        );
      } catch (error) {
        Environment.log("missingTranslation error", [error]);
      }
    }
  }

  async makeTranslation(text) {
    return new Promise(async (resolve, reject) => {
      SystemService.presentLoading("please-wait");
      const docName = "tempTranslation";
      const translation = new CreateTranslation(text) as Translation;
      try {
        await DatabaseService.mergeWithDocument(
          TRANSLATIONSCOLLECTION,
          docName,
          translation
        );
        DatabaseService.getDocumentObservable(
          TRANSLATIONSCOLLECTION,
          docName
        ).then(
          (obs) => {
            const sub = obs.subscribe((translation) => {
              if (translation.translated) {
                //translation done
                sub.unsubscribe();
                DatabaseService.deleteDocument(
                  TRANSLATIONSCOLLECTION,
                  docName,
                  false
                );
                SystemService.dismissLoading();
                resolve(translation.translated);
              }
            });
          },
          (error) => {
            SystemService.dismissLoading();
            reject("Translation error:" + error);
          }
        );
      } catch (error) {
        SystemService.dismissLoading();
        reject("Translation error:" + error);
      }
    });
  }
}

export const TranslationService = new TranslationController();
