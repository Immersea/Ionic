import { Component, h, State } from "@stencil/core";
import {
  Dive,
  XmlImporterService,
} from "../../../../../services/udive/subsurface/parse-xml";

@Component({
  tag: "page-subsurface-import",
  styleUrl: "page-subsurface-import.scss",
})
export class PageSubsurfaceImport {
  @State() dives: Dive[] = [];
  @State() message = "";
  importer = new XmlImporterService();

  async handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files![0];
    const text = await file.text();
    try {
      this.dives = await this.importer.parseXmlBuffer(text);
      this.message = `Trovate ${this.dives.length} immersioni.`;
    } catch (err) {
      this.message = `Errore: ${err.message}`;
    }
  }

  render() {
    return (
      <div>
        <input
          type='file'
          accept='.xml,.ssrf,.uddf'
          onChange={(e) => this.handleFile(e)}
        />
        <p>{this.message}</p>
        <ul>
          {this.dives.map((d) => (
            <li>
              {d.when?.toISOString()} – {d.maxDepth} m in {d.duration}s
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
