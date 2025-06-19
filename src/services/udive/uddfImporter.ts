/**
 * UdxfImportService
 * --------------------------------------------------
 * Servizio che gestisce:
 * - caricamento dello schema UDDF
 * - inizializzazione di xmllint-wasm per validazione XSD
 * - validazione XML vs XSD
 * - conversione ricorsiva XML ➔ JSON
 * - download client-side del JSON
 */
export class UdxfImportController {
  private static schema: string | null = null;
  private static xmllint: any = null;

  /**
   * Inizializza schema e validator.
   * @param schemaUrl percorso dello XSD
   */
  static async init(
    schemaUrl: string = "/assets/uddf/uddf.xsd"
  ): Promise<void> {
    // Caricamento XSD
    this.schema = await fetch(schemaUrl).then((res) => res.text());
    // Inizializza xmllint-wasm
    try {
      const lib: any = await import("xmllint-wasm");
      const factory: any = lib.default ?? lib;
      this.xmllint = await factory();
    } catch (err) {
      console.warn("xmllint-wasm init failed:", err);
      this.xmllint = null;
    }
  }

  /**
   * Validazione del testo XML contro lo schema XSD.
   * Lancia un errore in caso di violation.
   */
  static async validate(xmlText: string): Promise<void> {
    if (!this.xmllint || !this.schema) return;
    const result = this.xmllint.validateXML({
      xml: xmlText,
      schema: this.schema,
    });
    if (result.errors && result.errors.length) {
      throw new Error("Errori validazione XSD:\n" + result.errors.join("\n"));
    }
  }

  /**
   * Converte un XML string in oggetto JSON (schema-agnostic).
   */
  static parseUddfToJson(xmlString: string): Record<string, unknown> {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError)
      throw new Error(parserError.textContent || "XML non valido");

    const root = xmlDoc.querySelector("uddf") || xmlDoc.documentElement;
    return { [root.nodeName]: this.nodeToObj(root) };
  }

  /**
   * Ricorsione helper: Element ➔ Object
   */
  private static nodeToObj(node: Element): any {
    const obj: Record<string, any> = {};

    // Attributi (senza prefisso @, validi UDDF) con conversione numerica
    for (const attr of Array.from(node.attributes)) {
      const rawVal = attr.value.trim();
      // se rawVal è un numero valido, lo convertiamo, altrimenti rimane stringa
      const val =
        rawVal !== "" && !isNaN(Number(rawVal)) ? Number(rawVal) : rawVal;
      obj[attr.name] = val;
    }

    const children = Array.from(node.children);
    if (!children.length) {
      const rawText = (node.textContent || "").trim();
      // conversione numerica in line con gli attributi
      const parsedText =
        rawText !== "" && !isNaN(Number(rawText)) ? Number(rawText) : rawText;
      return Object.keys(obj).length
        ? { ...obj, "#text": parsedText || undefined }
        : parsedText;
    }

    // Elementi figli
    for (const child of children) {
      const key = child.nodeName;
      const childObj = this.nodeToObj(child as Element);
      if (key in obj) {
        obj[key] = Array.isArray(obj[key])
          ? [...obj[key], childObj]
          : [obj[key], childObj];
      } else {
        if (key === "repetitiongroup" || key === "dive") {
          obj[key] = [childObj];
        } else {
          obj[key] = childObj;
        }
      }
    }
    return obj;
  }

  /**
   * Avvia il download client-side di un file JSON.
   */
  static downloadJson(filename: string, content: string): void {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Converte dati JSON del computer Halcyon in stringa XML conforme a UDDF.
   */
  static halcyonJsonToUddf(jsonData: any): string {
    const s = jsonData.settings;
    if (!s["dive-number"] || !s["dive-start-date"] || !s["dive-start-time"]) {
      throw new Error("Mancano dive-number o dive-start-date/time");
    }
    const NS = "http://www.streit.cc/uddf/3.2/";
    const doc = document.implementation.createDocument(NS, "uddf", null);
    const uddf = doc.documentElement;
    uddf.setAttribute("version", "3.2.1");

    // informationbeforedive
    const ib = doc.createElement("informationbeforedive");
    const dn = doc.createElement("divenumber");
    dn.textContent = s["dive-number"];
    const dt = doc.createElement("datetime");
    dt.textContent = `${s["dive-start-date"]}T${s["dive-start-time"]}`;
    ib.appendChild(dn);
    ib.appendChild(dt);
    uddf.appendChild(ib);

    // profiledata → repetitiongroup → dive
    const pd = doc.createElement("profiledata");
    const rg = doc.createElement("repetitiongroup");
    rg.setAttribute("id", "rg1");
    const dive = doc.createElement("dive");
    dive.setAttribute("id", "d1");

    // append info
    dive.appendChild(ib);

    // Mappa dei nomi originali alle nomenclature UDDF
    const fieldNameMap: Record<string, string> = {
      depth: "depth",
      ndl: "ndl",
      tts: "tts",
      stop: "stop",
      ceiling: "ceiling",
      current: "current",
      "housing-pressure": "housing-pressure",
      errorbits: "errorbits",
      latitude: "latitude",
      longitude: "longitude",
      temperature: "temperature",
      "gf-now": "gf-now",
      "dc-mode": "dc-mode",
      "po2-1-controller": "po2-1-controller",
    };

    // samples
    const samples = doc.createElement("samples");
    for (const rec of jsonData.data || []) {
      const wp = doc.createElement("waypoint");
      for (const [rawKey, rawVal] of Object.entries(rec)) {
        if (rawVal == null || rawVal === "") continue;
        // Converti snake_case in dash-case, rimuovi suffissi di unità e applica mappa standard
        let dashKey = rawKey
          .replace(/_/g, "-")
          // elimina unità comuni: -m, -min, -bar, -hpa, -c, -ma
          .replace(/-(m|min|bar|hpa|c|ma)$/, "");
        const attrName = fieldNameMap[dashKey] || dashKey;
        wp.setAttribute(attrName, String(rawVal));
      }
      samples.appendChild(wp);
    }
    dive.appendChild(samples);

    rg.appendChild(dive);
    pd.appendChild(rg);
    uddf.appendChild(pd);

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      new XMLSerializer().serializeToString(doc)
    );
  }
  /**
   * Avvia il download client-side di un file XML.
   */
  static downloadXml(filename: string, content: string): void {
    const blob = new Blob([content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
