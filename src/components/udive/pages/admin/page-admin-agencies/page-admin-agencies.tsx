import {Component, h, State} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {
  SystemService,
  SYSTEMCOLLECTION,
} from "../../../../../services/common/system";
import {Subscription} from "rxjs";
import {
  Agency,
  Certification,
} from "../../../../../interfaces/udive/diving-class/divingClass";
import {cloneDeep, orderBy} from "lodash";
import {RouterService} from "../../../../../services/common/router";
import {fabButtonTopMarginString} from "../../../../../helpers/utils";
import {CallableFunctionsUdiveService} from "../../../../../services/udive/callableFunctions";

@Component({
  tag: "page-admin-agencies",
  styleUrl: "page-admin-agencies.scss",
})
export class PageAdminAgencies {
  systemSub: Subscription;
  userRoles: UserRoles;
  @State() selectedAgency: Agency;
  @State() selectedAgencyCertifications: Certification[] = [];
  agencies: Agency[];
  @State() isUpdated = false;
  @State() updateView = true;

  componentWillLoad() {
    this.userRoles = UserService.userRoles;
    this.systemSub = SystemService.systemPreferences$.subscribe((prefs) => {
      this.agencies = [];
      Object.keys(prefs.divingAgencies).forEach((agencyId) => {
        //set only agencies allowed to this user
        if (
          this.userRoles.isSuperAdmin() ||
          this.userRoles.roles.includes(agencyId.toLowerCase() + "-admin")
        ) {
          const agency = prefs.divingAgencies[agencyId];
          agency.id = agencyId;
          this.agencies.push(agency);
        }
      });
      if (!this.selectedAgency)
        this.selectedAgency = cloneDeep(this.agencies[0]);
      this.createCertificationsArray();
    });
  }

  createCertificationsArray() {
    this.selectedAgencyCertifications = [];
    const certs = [];
    Object.keys(this.selectedAgency.certifications).map((key) => {
      let cert = this.selectedAgency.certifications[key];
      cert.id = key;
      certs.push(cert);
    });
    this.selectedAgencyCertifications = orderBy(certs, "order");
  }

  disconnectedCallback() {
    this.systemSub.unsubscribe();
  }

  updateAgency(agencyId) {
    this.isUpdated = false;
    this.selectedAgency = cloneDeep(
      this.agencies.find((agency) => agency.id == agencyId)
    );
    this.createCertificationsArray();
  }

  handleChange(ev) {
    this.isUpdated = true;
    this.selectedAgency[ev.detail.name] = ev.detail.value;
  }

  async reorderCertifications(reorder) {
    this.isUpdated = true;
    const certs = cloneDeep(this.selectedAgencyCertifications);
    const itemMove = certs.splice(reorder.detail.from, 1)[0];
    certs.splice(reorder.detail.to, 0, itemMove);
    certs.forEach((cert, order) => {
      cert.order = order;
    });
    reorder.detail.complete(certs);
    this.selectedAgencyCertifications = orderBy(certs, "order");
  }

  async editCertification(key?) {
    this.isUpdated = true;
    let cert = null;
    if (key === undefined) {
      cert = {
        id: null,
        maxDepth: 20,
        name: "",
        order: this.selectedAgencyCertifications
          ? this.selectedAgencyCertifications.length
          : 0,
        group: "",
      };
    } else {
      cert = cloneDeep(this.selectedAgencyCertifications[key]);
    }

    const modal = await RouterService.openModal(
      "modal-dive-certification-update",
      {
        agencyId: this.selectedAgency.id,
        diveCertification: cert,
      }
    );
    modal.onDidDismiss().then((updatedCert) => {
      const cert = updatedCert.data as Certification;
      if (cert) {
        if (key === undefined) {
          this.selectedAgencyCertifications.push(cert);
        } else {
          this.selectedAgencyCertifications[key] = cert;
        }
        this.updateView = !this.updateView;
      }
    });
  }

  updateImageUrls(ev) {
    this.isUpdated = true;
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.selectedAgency.photoURL = url;
    } else {
      this.selectedAgency.coverURL = url;
    }
  }

  async save() {
    //update certifications
    this.selectedAgency.certifications = {};
    this.selectedAgencyCertifications.map((cert) => {
      this.selectedAgency.certifications[cert.id] = cert;
    });
    const res = await CallableFunctionsUdiveService.updateDivingAgency(
      this.selectedAgency.id,
      this.selectedAgency
    );
    if (res) {
      this.isUpdated = false;
    }
  }

  cancel() {
    this.isUpdated = false;
    this.updateAgency(this.selectedAgency.id);
  }

  render() {
    return [
      <ion-header class="cover">
        <app-upload-cover
          item={{
            collection: SYSTEMCOLLECTION,
            id: this.selectedAgency.id,
            photoURL: this.selectedAgency.photoURL,
            coverURL: this.selectedAgency.coverURL,
          }}
          onCoverUploaded={(ev) => this.updateImageUrls(ev)}
        ></app-upload-cover>
      </ion-header>,
      <ion-content>
        <ion-fab
          vertical="top"
          horizontal="start"
          slot="fixed"
          style={{marginTop: fabButtonTopMarginString(0)}}
        >
          <ion-menu-button class="fab-icon" />
        </ion-fab>
        <ion-list>
          {this.agencies.length > 0 ? (
            <ion-item>
              <ion-label>Select Diving Agency</ion-label>
              <ion-select
                value={this.selectedAgency.id}
                onIonChange={(ev) => this.updateAgency(ev.detail.value)}
                interface="popover"
              >
                {this.agencies.map((agency) => (
                  <ion-select-option value={agency.id}>
                    {agency.name}
                  </ion-select-option>
                ))}
              </ion-select>
            </ion-item>
          ) : undefined}
          <app-form-item
            label-tag="name"
            label-text="Name"
            value={this.selectedAgency.name}
            name="name"
            input-type="text"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-tag="website"
            label-text="Website"
            value={this.selectedAgency.website}
            name="website"
            input-type="text"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            validator={["required"]}
          ></app-form-item>
        </ion-list>
        <ion-list>
          <ion-list-header>
            <ion-label>
              <my-transl tag="certifications" text="Certifications" />
            </ion-label>
            <ion-button icon-only onClick={() => this.editCertification()}>
              <ion-icon name="add-circle-outline"></ion-icon>
            </ion-button>
          </ion-list-header>
          <ion-reorder-group
            disabled={false}
            onIonItemReorder={(ev) => this.reorderCertifications(ev)}
          >
            {this.selectedAgencyCertifications.map((cert, i) => (
              <ion-item>
                {cert.photoURL ? (
                  <ion-avatar slot="start">
                    <img src={cert.photoURL} />
                  </ion-avatar>
                ) : undefined}
                <ion-reorder slot="end"></ion-reorder>
                <ion-label>
                  {cert.order + 1}. {cert.name}
                </ion-label>
                <ion-button
                  icon-only
                  fill="clear"
                  onClick={() => this.editCertification(i)}
                >
                  <ion-icon name="create-outline"></ion-icon>
                </ion-button>
              </ion-item>
            ))}
          </ion-reorder-group>
        </ion-list>
      </ion-content>,
      this.isUpdated ? (
        <app-modal-footer
          onSaveEmit={() => this.save()}
          onCancelEmit={() => this.cancel()}
        />
      ) : undefined,
    ];
  }
}
