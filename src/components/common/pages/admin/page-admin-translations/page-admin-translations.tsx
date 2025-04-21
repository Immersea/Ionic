import { Component, h, State, Element } from "@stencil/core";
import { UserService } from "../../../../../services/common/user";
import { SystemService } from "../../../../../services/common/system";
import {
  TRANSLATIONSCOLLECTION,
  TranslationService,
} from "../../../../../services/common/translations";
import { Translation } from "../../../../../interfaces/common/translations/translations";
import { DatabaseService } from "../../../../../services/common/database";
import { slideHeight } from "../../../../../helpers/utils";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore } from "../../../../../helpers/firebase";
import Swiper from "swiper";
import { cloneDeep } from "lodash";
import { CallableFunctionsService } from "../../../../../services/common/callableFunctions";

@Component({
  tag: "page-admin-translations",
  styleUrl: "page-admin-translations.scss",
})
export class PageAdminTranslations {
  @Element() el: HTMLElement;
  @State() segment: string = "translations";
  @State() slider: Swiper;
  languages: any;
  @State() translations: Translation[] = [];
  @State() filteredTranslations: Translation[] = [];
  @State() filter: string = "";
  @State() translationsBackup: Translation[] = [];
  translationsSub: any;
  @State() translationsChanged: any = {};
  selectedLanguage: any;
  @State() updateView = false;

  componentWillLoad() {
    this.languages = SystemService.getLanguages();
    this.selectedLanguage = this.languages[0];

    this.translationsSub = onSnapshot(
      query(collection(firestore, TRANSLATIONSCOLLECTION), orderBy("input")),
      (translations) => {
        this.translations = [];
        translations.forEach((doc) => {
          const trans = doc.data() as Translation;
          trans["id"] = doc.id;
          this.translations.push(trans);
        });
        this.translationsBackup = cloneDeep(this.translations);
        this.filterTranslations();
      }
    );
  }

  componentDidLoad() {
    this.setSliderHeight();
  }

  setSliderHeight() {
    this.slider = new Swiper(".slider-translations", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
          this.slider.updateSize();
        },
      },
    });
    //reset sliders height inside slider
    const slideContainers = Array.from(
      this.el.getElementsByClassName("slide-container")
    );
    slideContainers.map((container) => {
      container.setAttribute("style", "height: " + slideHeight(null, 4) + "px");
    });
    this.slider.updateSize();
    this.updateView = !this.updateView;
  }

  disconnectedCallback() {
    this.translationsSub();
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = ev.detail.value;
      if (ev.detail.value == "admin") {
        this.slider.slideTo(1);
      } else if (ev.detail.value == "translations") {
        this.slider.slideTo(0);
      }
      this.updateView = !this.updateView;
    }
  }

  selectLanguage(ev) {
    this.selectedLanguage = ev.target.value;
    this.updateView = !this.updateView;
  }

  async runTranslationsScript() {
    try {
      await CallableFunctionsService.updateTranslations();
      SystemService.presentAlert("Done", "Translations saved!");
    } catch (error) {
      console.log("error runTranslationsScript", error);
    }
  }

  translationChanged(ev) {
    if (ev && ev.detail) {
      const updated = ev.detail;
      this.translationsChanged[updated.id] = updated;
      let index = this.translations.findIndex((x) => x.id === updated.id);
      this.translations[index] = updated;
      this.translations = [...this.translations];
      index = this.filteredTranslations.findIndex((x) => x.id === updated.id);
      this.filteredTranslations[index] = updated;
      this.filteredTranslations = [...this.filteredTranslations];
      this.updateView = !this.updateView;
    }
  }

  filterTranslations(ev?) {
    if (ev && ev.target.value) {
      this.filter = ev.target.value;
    }
    if (this.filter && this.filter !== "") {
      this.filteredTranslations = this.translations.filter((trans) =>
        trans.input.toLowerCase().includes(this.filter.toLowerCase())
      );
    } else {
      this.filteredTranslations = cloneDeep(this.translations);
    }
    this.updateView = !this.updateView;
  }

  close() {
    this.translations = cloneDeep(this.translationsBackup);
    this.filterTranslations();
  }

  async save() {
    const promises = [];
    Object.keys(this.translationsChanged).map((transId) => {
      const translation = this.translationsChanged[transId];
      //remove id written by query
      delete translation.id;
      promises.push(
        DatabaseService.updateDocument(
          TRANSLATIONSCOLLECTION,
          transId,
          translation
        )
      );
    });
    //execute writes
    await Promise.all(promises);
    this.translationsChanged = [];
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          color='udive'
          tag='translations'
          text='Translations'
        ></app-navbar>
      </ion-header>,
      UserService.userRoles && UserService.userRoles.isSuperAdmin()
        ? [
            <ion-header>
              <ion-toolbar color='udive' class='no-safe-padding'>
                <ion-segment
                  mode='md'
                  onIonChange={(ev) => this.segmentChanged(ev)}
                  value={this.segment}
                >
                  <ion-segment-button value='translations' layout='icon-start'>
                    <ion-label>TRANSLATIONS</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value='admin' layout='icon-start'>
                    <ion-label>ADMIN</ion-label>
                  </ion-segment-button>
                </ion-segment>
              </ion-toolbar>
            </ion-header>,
            this.segment == "translations" ? (
              <ion-header>
                <ion-toolbar color='udive'>
                  <ion-searchbar
                    animated
                    placeholder={TranslationService.getTransl(
                      "search",
                      "Search"
                    )}
                    value={this.filter}
                    debounce={250}
                    onIonInput={(ev) => this.filterTranslations(ev)}
                  ></ion-searchbar>
                </ion-toolbar>
                <ion-toolbar color='udive'>
                  <ion-item>
                    <ion-select
                      label={TranslationService.getTransl(
                        "language",
                        "Language"
                      )}
                      labelPlacement='floating'
                      interface='action-sheet'
                      value={this.selectedLanguage}
                      onIonChange={(ev) => this.selectLanguage(ev)}
                    >
                      {this.languages.map((language) => (
                        <ion-select-option value={language}>
                          {language.label}
                        </ion-select-option>
                      ))}
                    </ion-select>
                    <ion-icon
                      slot='end'
                      class={
                        "flag-icon flag-icon-" +
                        (this.selectedLanguage.countryCode == "en"
                          ? "gb"
                          : this.selectedLanguage.countryCode)
                      }
                    ></ion-icon>
                  </ion-item>
                </ion-toolbar>
              </ion-header>
            ) : undefined,
          ]
        : undefined,
      <ion-content>
        <swiper-container class='slider-translations swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              <ion-content class='slide-container'>
                <ion-grid>
                  <ion-row>
                    <ion-col>
                      <app-admin-translations
                        translations={this.filteredTranslations}
                        language={this.selectedLanguage.value}
                        onTranslationChanged={(ev) =>
                          this.translationChanged(ev)
                        }
                      />
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-content>
            </swiper-slide>
            {UserService.userRoles && UserService.userRoles.isSuperAdmin() ? (
              <swiper-slide class='swiper-slide'>
                <ion-content class='slide-container'>
                  <ion-button
                    size='large'
                    onClick={() => this.runTranslationsScript()}
                  >
                    Run Translations Script
                  </ion-button>
                </ion-content>
              </swiper-slide>
            ) : undefined}
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
      Object.keys(this.translationsChanged).length > 0 ? (
        <app-modal-footer
          onCancelEmit={() => this.close()}
          onSaveEmit={() => this.save()}
        />
      ) : undefined,
    ];
  }
}
