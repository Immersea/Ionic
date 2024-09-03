import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { Project } from "../../../interfaces/trasteel/refractories/projects";
import { CustomersService } from "../crm/customers";
import { isNaN, toNumber, upperCase } from "lodash";
import { formatDate } from "date-fns";
import { TranslationService } from "../../common/translations";
import { ProjectsService } from "./projects";
import { slugify } from "../../../helpers/utils";

export class DOCExportController {
  async loadTemplate(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  }

  async generateDocument(project: Project, lang = "en") {
    try {
      const arrayBuffer = await this.loadTemplate(
        "assets/trasteel/template.docx"
      );
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      const customer = CustomersService.getCustomersDetails(project.customerId);
      const localId = project.projectLocalId.split("-");
      let revision = 0;
      for (let index = 0; index < localId.length; index++) {
        const element = toNumber(localId[index]);
        if (!isNaN(element)) {
          revision = element;
          break;
        }
      }
      const areas = [];
      project.projectAreaQuality.map((area) => {
        const allocationArea = ProjectsService.getBricksAllocationAreas(
          area.bricksAllocationAreaId
        )[0];
        areas.push({
          area: TranslationService.getTextMultiLanguageValue(
            allocationArea.bricksAllocationAreaName,
            lang
          ),
        });
      });
      // Set the template variables
      const data = {
        customer: upperCase(customer.fullName),
        technical_project_n: TranslationService.getTransl(
          "technical_project_n",
          "Technical Project n°.",
          null,
          lang
        ),
        ref_lining: TranslationService.getTransl(
          "ref_lining",
          "Refractory Lining for",
          null,
          lang
        ),
        project_id: project.projectLocalId,
        steel_amount: project.steelAmount,
        application: TranslationService.getTextMultiLanguageValue(
          ProjectsService.getApplicationUnits(project.applicationId)[0]
            .applicationName,
          lang
        ),
        revision_title: TranslationService.getTransl(
          "revision",
          "Revision",
          null,
          lang
        ),
        revision: revision,
        date_title: TranslationService.getTransl("date", "Date", null, lang),
        date: formatDate(project.drawingDate, "PP"),
        index: TranslationService.getTransl("index", "Index", null, lang),
        layout_description: TranslationService.getTransl(
          "layout_description",
          "Layout Description",
          null,
          lang
        ),
        areas: areas,
        ref_layout: TranslationService.getTransl(
          "ref_layout",
          "Refractory Layout",
          null,
          lang
        ),
        bricks_shapes: TranslationService.getTransl(
          "bricks_shapes",
          "Bricks Shapes",
          null,
          lang
        ),
        ass_table: TranslationService.getTransl(
          "ass_table",
          "Assembling Table",
          null,
          lang
        ),
        qty_table: TranslationService.getTransl(
          "qty_table",
          "Quantity Table",
          null,
          lang
        ),
        datasheets: TranslationService.getTransl(
          "datasheets",
          "Datasheets",
          null,
          lang
        ),
      };
      console.log("data", data);
      doc.setData(data);
      // Render the document (replace all occurrences of {name}, {date}, {info})
      doc.render();

      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Save the generated document
      saveAs(out, slugify(project.projectLocalId) + "-offer.docx");
    } catch (error) {
      console.error("Error generating document:", error);
    }
  }
}
export const DOCExportService = new DOCExportController();
