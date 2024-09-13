import { DiveConfiguration } from "../../udive/planner/dive-configuration";
import { Licences } from "../../udive/planner/licences";

export class UserRoles {
  uid: string;
  email: string;
  roles: string[] = []; //["registered","translator","superAdmin"]
  licences: Licences = new Licences();
  editorOf: {
    [id: string]: {
      //item id
      collection: string;
      roles: string[]; //["owner","editor"]
    };
  };

  constructor(doc?) {
    if (doc && doc.uid) {
      this.uid = doc.uid;
      this.email = doc.email;
      this.roles = doc.roles ? doc.roles : ["guest"];

      this.editorOf = {};
      if (doc.editorOf) {
        Object.keys(doc.editorOf).forEach((key) => {
          this.editorOf[key] = doc.editorOf[key];
        });
      }
      if (doc.licences) {
        this.licences = new Licences(doc.licences);
      }
    }
  }

  resetDP2licences() {
    this.licences.resetDP2licences();
  }

  purchaseLicence(licence) {
    this.licences[licence] = true;
  }

  isSuperAdmin() {
    return this.roles.indexOf("superAdmin") != -1;
  }

  isAdmin() {
    return this.roles.indexOf("Admin") != -1 || this.isSuperAdmin();
  }

  isUserAdmin() {
    return this.roles.indexOf("userAdmin") != -1 || this.isSuperAdmin();
  }

  isEditor() {
    return (
      this.roles.indexOf("editor") != -1 ||
      this.isSuperAdmin() ||
      this.isUserAdmin()
    );
  }

  isTranslator() {
    return this.roles.indexOf("translator") != -1 || this.isSuperAdmin();
  }

  isAgencyAdmin() {
    return this.roles.indexOf("gue-admin") != -1 || this.isSuperAdmin();
  }

  isRegistered() {
    return this.roles.indexOf("registered") != -1;
  }

  isGuest() {
    return this.roles.indexOf("guest") != -1;
  }

  hasLicence(licence, withTrial = true) {
    return this.licences.hasLicence(licence, withTrial);
  }

  check(licence) {
    return this.licences.check(licence);
  }

  //check licences for user
  checkUserlicencesForConfigs(configurations): Array<DiveConfiguration> {
    return this.licences.checkUserlicencesForConfigs(configurations);
  }
}
