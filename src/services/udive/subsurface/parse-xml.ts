export interface Dive {
  when?: Date;
  maxDepth?: number;
  duration?: number;
  notes?: string;
  siteId?: number;
  location?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
  };
  surfacePressure?: number;
  airTemperature?: number;
  waterTemperature?: number;
  cylinderStartPressure?: number;
  cylinderEndPressure?: number;
  workPressure?: number;
  cylinderUse?: string;
  cylinderDepth?: number;
  weight?: number;
  gasMixO2?: number;
  gasMixHe?: number;
  // … aggiungere tutti gli altri campi necessari …
}

interface ParserState {
  dives: Dive[];
  currentDive?: Dive;
  curTm: Date;
  xmlParsingUnits: {
    length: "m" | "ft";
    pressure: "bar" | "psi" | "pa";
    temperature: "C" | "F" | "K";
  };
  importSource: "UDDF" | "DIVINGLOG" | "UNKNOWN";
  // … eventuali altri campi di stato …
}

export class XmlImporterService {
  private xsltFiles = [
    { root: "uddf", file: "/assets/xslt/uddf.xslt" },
    { root: "csv", file: "/assets/xslt/csv2xml.xslt" },
    { root: "Divinglog", file: "/assets/xslt/DivingLog.xslt" },
    // … aggiungere tutte le regole di test_xslt_transforms …
  ];

  constructor() {
    // inizializzazioni eventuali
  }

  /** Analizza un buffer XML (come parse_xml_buffer in C++) */
  async parseXmlBuffer(xmlText: string): Promise<Dive[]> {
    // 1) Preprocess Divelogs.de se serve (omesso qui)
    // 2) Carica il DOM
    const parser = new DOMParser();
    let doc = parser.parseFromString(xmlText, "application/xml");
    // 3) Applica XSLT se il root matcha
    doc = await this.testXsltTransforms(doc);
    // 4) Crea lo state iniziale
    const state: ParserState = {
      dives: [],
      currentDive: undefined,
      curTm: new Date(),
      xmlParsingUnits: {
        length: "m",
        pressure: "bar",
        temperature: "C",
      },
      importSource: "UNKNOWN",
    };
    // 5) Avvia parsing
    this.traverse(doc.documentElement, state);
    return state.dives;
  }

  /** Applica il primo XSLT matching sul root element */
  private async testXsltTransforms(doc: Document): Promise<Document> {
    const rootName = doc.documentElement.nodeName;
    const rule = this.xsltFiles.find((r) => r.root === rootName);
    if (!rule) {
      return doc;
    }
    const xsltText = await fetch(rule.file).then((r) => r.text());
    const xslDom = new DOMParser().parseFromString(xsltText, "application/xml");
    // Perform XSLT transformation using the browser's XSLTProcessor API
    const processor = new XSLTProcessor();
    processor.importStylesheet(xslDom);
    const outDom = processor.transformToDocument(doc);
    return outDom;
  }

  /** Visita ricorsivamente ogni nodo */
  private traverse(node: Element | ChildNode | null, state: ParserState) {
    if (!node) return;
    // se è un TEXT_NODE
    if (node.nodeType === 3 && node.textContent && node.textContent.trim()) {
      const name = this.computeName(node as any);
      this.entry(name, node.textContent!, state);
    }
    // properties (attributi) – qui omesso per brevità
    // figli
    node.childNodes.forEach((child) => this.traverse(child, state));
  }

  /** Simula il nodename() + entry() dispatch di parse-xml.cpp */
  private entry(name: string, buf: string, state: ParserState) {
    // Riconosci import source
    if (name === "Divinglog") {
      state.importSource = "DIVINGLOG";
      return;
    }
    if (name === "uddf") {
      state.importSource = "UDDF";
      return;
    }
    // Dive start/end
    if (name === "dive.start") {
      const d: Dive = {};
      state.currentDive = d;
      state.dives.push(d);
      return;
    }
    if (name === "dive.end") {
      state.currentDive = undefined;
      return;
    }
    // Se non siamo dentro a un dive, skip
    const dive = state.currentDive;
    if (!dive) return;

    // Alcuni esempi di match
    switch (name) {
      // Match-state patterns from original parse-xml.cpp
      case "divesiteid":
        dive.siteId = this.parseIndex(buf);
        break;
      case "date":
      case "time":
      case "datetime":
        dive.when = this.parseDate(buf, state);
        break;
      case "location":
      case "name.dive":
        dive.location = buf;
        break;
      case "gps":
        if (!dive.gps) dive.gps = {};
        break;
      case "latitude":
      case "sitelat":
      case "lat":
        if (!dive.gps) dive.gps = {};
        dive.gps!.latitude = parseFloat(buf);
        break;
      case "longitude":
      case "sitelon":
      case "lon":
        if (!dive.gps) dive.gps = {};
        dive.gps!.longitude = parseFloat(buf);
        break;
      case "airpressure.dive":
        dive.surfacePressure = parseFloat(buf);
        break;
      case "air.divetemperature":
        dive.airTemperature = this.parseDuration(buf); // using duration parser for minutes if needed
        break;
      case "water.divetemperature":
        dive.waterTemperature = this.parseDuration(buf);
        break;
      case "cylinderstartpressure":
      case "start.cylinder":
        dive.cylinderStartPressure = parseFloat(buf);
        break;
      case "cylinderendpressure":
      case "end.cylinder":
        dive.cylinderEndPressure = parseFloat(buf);
        break;
      case "workpressure.cylinder":
        dive.workPressure = parseFloat(buf);
        break;
      case "use.cylinder":
        dive.cylinderUse = buf;
        break;
      case "depth.cylinder":
        dive.cylinderDepth = parseFloat(buf);
        break;
      case "weight.weightsystem":
      case "weight":
        dive.weight = parseFloat(buf);
        break;
      case "o2":
      case "o2percent":
        dive.gasMixO2 = parseFloat(buf);
        break;
      case "he":
        dive.gasMixHe = parseFloat(buf);
        break;
      case "date":
        dive.when = this.parseDate(buf, state);
        break;
      case "maxdepth":
      case "depth":
        dive.maxDepth = this.parseDepth(buf, state);
        break;
      case "duration":
      case "divetime":
        dive.duration = this.parseDuration(buf);
        break;
      case "notes":
        dive.notes = buf;
        break;
      default:
        break;
    }
  }

  /** Calcola la “nome.qualifier” come in nodename() */
  private computeName(node: ChildNode): string {
    const parts: string[] = [];
    let cur: Node | null = node;
    let levels = 2;
    while (cur && levels--) {
      if (cur.nodeType === 1) {
        parts.unshift(cur.nodeName.toLowerCase());
      }
      cur = cur.parentNode;
    }
    return parts.join(".");
  }

  /** Esempio di parseDate (dive date/time) */
  private parseDate(buffer: string, state: ParserState): Date {
    // accetta “YYYY-MM-DD hh:mm:ss” o “DD.MM.YYYY …”
    const iso = buffer.replace(".", "-").replace(".", "-");
    const d = new Date(iso);
    state.curTm = d;
    return d;
  }

  /** Esempio di parseDepth */
  private parseDepth(buffer: string, state: ParserState): number {
    const v = parseFloat(buffer);
    if (state.xmlParsingUnits.length === "m") {
      return v;
    } else {
      return v * 0.3048;
    }
  }

  /** Esempio di parseDuration (“hh:mm:ss” o “mm:ss”) */
  private parseDuration(buffer: string): number {
    const parts = buffer.split(/[:.]/).map((p) => parseInt(p, 10));
    let sec = 0;
    if (parts.length === 3) {
      sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      sec = parts[0] * 60 + parts[1];
    } else {
      sec = Math.round(parseFloat(buffer) * 60);
    }
    return sec;
  }

  /** Parse integer indices */
  private parseIndex(buffer: string): number {
    return parseInt(buffer, 10);
  }
}
