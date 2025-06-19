import { slugify } from "../../helpers/utils";
import { RouterService } from "../common/router";

export class HalcyonImporterController {
  async presentHalcyonImporter() {
    await RouterService.openModal("modal-halcyon-importer");
  }

  async handleFilesSelected(event: Event) {
    let importedJson = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const files = Array.from(input.files);
    try {
      const parsed = await Promise.all(
        files.map((f) => this.readAndParseFile(f))
      );
      const logbook = parsed.find((p) => p.type === "logbook")?.entries || [];
      const diveCsv = parsed.find((p) => p.type === "dive") || {
        settings: {},
        data: [],
        summary: {},
      };
      let result = null;
      if (logbook.length === 0) {
        result = diveCsv;
      } else {
        result = logbook;
      }

      importedJson = result;
      this.downloadJson(
        result,
        (logbook.length === 0 ? "dives" : "logbook") + ".json"
      );
    } catch (err) {
      console.error("Errore nel parsing dei file:", err);
    }
    return importedJson;
  }

  private readAndParseFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (file.name.toLowerCase().endsWith(".txt")) {
          resolve({ type: "logbook", entries: this.parseLogbookTxt(text) });
        } else if (file.name.toLowerCase().endsWith(".csv")) {
          resolve({ type: "dive", ...this.parseDiveCsv(text) });
        } else {
          resolve({ type: "unknown", content: text });
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  private parseLogbookTxt(txt: string) {
    const lines = txt
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith("//"));

    return lines.map((line) => {
      const [
        diveNr,
        tsStart,
        tsEnd,
        localDate,
        localTime,
        maxDepth,
        avgDepth,
        minTemp,
        diveTime,
        dcMode,
      ] = line.split(";").map((s) => s.trim());
      return {
        dive_nr: parseInt(diveNr, 10),
        timestamp_start: parseInt(tsStart, 10),
        timestamp_end: parseInt(tsEnd, 10),
        local_date: localDate,
        local_time: localTime,
        max_depth: parseFloat(maxDepth),
        avg_depth: parseFloat(avgDepth),
        min_temp: parseFloat(minTemp),
        dive_time: parseInt(diveTime, 10),
        dc_mode: parseInt(dcMode, 10),
      };
    });
  }

  private parseDiveCsv(txt: string) {
    const lines = txt.split(/\r?\n/);
    const settings: { [k: string]: string } = {};
    const summary: { [k: string]: string | string[] } = {};
    let headerFound = false;
    let headerCols: string[] = [];
    const dataRows: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].trim();
      if (!raw) continue;

      if (!headerFound) {
        if (raw.startsWith("//DEPTH")) {
          headerCols = raw
            .substring(2)
            .split(";")
            .map((h) => slugify(h.trim(), "field"));
          headerFound = true;
        } else if (raw.startsWith("//")) {
          const [key, ...rest] = raw.substring(2).split(";");
          const field = slugify(key.trim(), "field");
          settings[field] = rest.join(";").trim();
        }
      } else if (headerFound && !raw.startsWith("//CNS")) {
        if (raw.startsWith("//")) continue;
        const vals = raw.split(";").map((v) => v.trim());
        const row: any = {};
        headerCols.forEach((col, idx) => {
          const val = vals[idx] ?? "";
          row[slugify(col, "field")] = isNaN(Number(val)) ? val : Number(val);
        });
        dataRows.push(row);
      } else if (raw.startsWith("//CNS")) {
        for (let j = i + 1; j < lines.length; j++) {
          const line = lines[j].trim();
          if (!line || !line.startsWith("//")) continue;
          const [key, ...rest] = line.substring(2).split(";");
          const field = slugify(key.trim(), "field");
          const value = rest.join(";").trim();
          if (summary.hasOwnProperty(field)) {
            if (Array.isArray(summary[field])) {
              (summary[field] as string[]).push(value);
            } else {
              summary[field] = [summary[field] as string, value];
            }
          } else {
            summary[field] = value;
          }
        }
        break;
      }
    }
    const json = { settings, data: dataRows, summary };
    return json;
  }

  private downloadJson(obj: any, filename: string) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
export const HalcyonImporterService = new HalcyonImporterController();
