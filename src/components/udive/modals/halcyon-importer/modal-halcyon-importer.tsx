import { Component, h, State } from "@stencil/core";
import { HalcyonImporterService } from "../../../../services/udive/halcyonImporter";
import { UdxfImportController } from "../../../../services/udive/uddfImporter";

@Component({
  tag: "modal-halcyon-importer",
  styleUrl: "modal-halcyon-importer.scss",
  shadow: true,
})
export class ModalHalcyonImporter {
  // ────────────────────────────────────────────────
  //  🔄 STATE
  // ────────────────────────────────────────────────
  @State() status: string = "";
  @State() uploading = false;
  @State() uddfXsd: string | null = null;
  @State() importedTXTJson: any = null;
  @State() importedCSVJson: any = null;
  @State() importedUDDFJson: any = null;

  async componentWillLoad() {
    try {
      await UdxfImportController.init();
      this.status = "Schema e validator caricati.";
    } catch (err) {
      console.warn("Init error:", err);
      this.status = "⚠️ Inizializzazione fallita; parsing senza validazione.";
    }
  }

  // ────────────────────────────────────────────────
  //  📥 importUddfFile
  // ────────────────────────────────────────────────
  private async importUddfFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploading = true;
    this.status = `⏳ Elaborazione ${file.name}...`;

    try {
      const xmlText = await file.text();

      await UdxfImportController.validate(xmlText);

      const jsonDoc = UdxfImportController.parseUddfToJson(xmlText);
      this.importedUDDFJson = jsonDoc;
      /*
            const jsonStr = JSON.stringify(jsonDoc, null, 2);

            UdxfImportController.downloadJson(
        file.name.replace(/\.(uddf|xml)$/i, "") + ".json",
        jsonStr
      );*/

      this.status = `✅ ${file.name} validato e scaricato!`;
    } catch (err) {
      console.error(err);
      this.status = `❌ Errore: ${err.message || err}`;
    } finally {
      this.uploading = false;
      input.value = "";
    }
  }

  private async handleTXTFileSelected(event: Event) {
    this.importedTXTJson =
      await HalcyonImporterService.handleFilesSelected(event);
  }
  private async handleCSVFileSelected(event: Event) {
    this.importedCSVJson =
      await HalcyonImporterService.handleFilesSelected(event);
    //convert to uddf
    const xmlText = await UdxfImportController.halcyonJsonToUddf(
      this.importedCSVJson
    );
    await UdxfImportController.validate(xmlText);
    const jsonDoc = UdxfImportController.parseUddfToJson(xmlText);
    this.importedUDDFJson = jsonDoc;
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color='primary'>
          <ion-title>Importa Dive Logs</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class='ion-padding'>
        <ion-card class='p-4 flex flex-col gap-4 items-start'>
          <h2 class='text-xl font-semibold'>Converti e scarica un file UDDF</h2>
          <p class='text-xs italic'>{this.uddfXsd ? "" : this.status}</p>

          <input
            type='file'
            accept='.uddf'
            disabled={this.uploading}
            onChange={(ev) => this.importUddfFile(ev)}
            class='file:bg-blue-600 file:text-white file:p-2 file:rounded-lg'
          />

          {this.uploading && <ion-spinner name='dots' />}
          {this.status && !this.uploading && (
            <p class='text-sm'>{this.status}</p>
          )}
        </ion-card>
        <p>Seleziona il file Logbook.TXT:</p>
        <input
          type='file'
          accept='Logbook.txt'
          multiple={false}
          onChange={(e) => this.handleTXTFileSelected(e)}
        />
        <p>Seleziona il file CSV:</p>
        <input
          type='file'
          accept='.csv'
          multiple
          onChange={(e) => this.handleCSVFileSelected(e)}
        />

        {/*this.importedTXTJson && (
          <ion-card>
            <ion-card-header>
              <ion-card-title>Dati importati</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(this.importedTXTJson, null, 2)}
              </pre>
            </ion-card-content>
          </ion-card>
        )*/}
        {/*this.importedCSVJson && (
          <ion-card>
            <ion-card-header>
              <ion-card-title>Dati importati</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(this.importedCSVJson, null, 2)}
              </pre>
            </ion-card-content>
          </ion-card>
        )*/}
        {this.importedUDDFJson && (
          <ion-card>
            <ion-card-header>
              <ion-card-title>Dati importati</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(this.importedUDDFJson, null, 2)}
              </pre>
            </ion-card-content>
          </ion-card>
        )}
      </ion-content>,
    ];
  }
}
