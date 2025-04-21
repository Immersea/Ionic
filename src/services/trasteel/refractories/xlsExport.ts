import { Workbook, Worksheet } from "exceljs";
import * as fs from "file-saver";
import { Project } from "../../../interfaces/trasteel/refractories/projects";
import {
  AreaShape,
  Shape,
} from "../../../interfaces/trasteel/refractories/shapes";
import { FileSystemService } from "../../common/fileSystem";
import { DatasheetsService } from "./datasheets";
import {
  cloneDeep,
  find,
  isNumber,
  max,
  min,
  orderBy,
  replace,
  toNumber,
  upperCase,
  upperFirst,
} from "lodash";
import { CustomersService } from "../crm/customers";
import {
  convertCurrency,
  replaceAll,
  roundDecimals,
  slugify,
} from "../../../helpers/utils";
import { DatasheetProperty } from "../../../interfaces/trasteel/refractories/datasheets";
import { Environment } from "../../../global/env";
import { StorageService } from "../../common/storage";
import { SystemService } from "../../common/system";
import { ProjectsService } from "./projects";
import { UserService } from "../../common/user";
import { TranslationService } from "../../common/translations";
import { actionSheetController, alertController } from "@ionic/core";
//documentation
//https://github.com/exceljs/exceljs

const pcsFmt = "#,##0";
const mtFmt = "#,##0.0";

export class XLSXExportController {
  mergedCellsErrors = [];

  async selectLanguage(): Promise<string> {
    return new Promise(async (resolve) => {
      const buttons = [];
      SystemService.getLanguages().forEach((lang) => {
        buttons.push({
          text: lang.label,
          handler: () => {
            resolve(lang.value);
          },
        });
      });
      const action = await actionSheetController.create({
        header: TranslationService.getTransl("language", "Language"),
        buttons: buttons,
      });
      action.present();
    });
  }

  getColumnLetter(colNum: number): string {
    let letter = "";
    while (colNum > 0) {
      const remainder = (colNum - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      colNum = Math.floor((colNum - 1) / 26);
    }
    return letter;
  }

  async exportSummary(
    project: Project,
    areaShapes,
    basicSet,
    repairSet,
    masses,
    lang?
  ) {
    const tabColor = "FFCC00";
    const workbook = new Workbook();
    //check language
    if (!lang) {
      lang = await this.selectLanguage();
    }
    const quantityWorksheet = await this.exportQuantity(
      project,
      areaShapes,
      basicSet,
      repairSet,
      masses,
      lang
    );
    this.cloneWorksheet(workbook, quantityWorksheet.worksheet, "Summary", {
      properties: { tabColor: { argb: tabColor } },
    });

    this.saveWorkbook(
      workbook,
      "summary-" + slugify(project.projectLocalId) + ".xlsx"
    );
  }

  async exportQuantityAssembly(project: Project, areaShapes, lang?) {
    // Check language
    if (!lang) {
      lang = await this.selectLanguage();
    }
    const tabColor = "FFCC00";
    const workbook = new Workbook();

    // Create quantity sheet (QT)
    const quantityWorksheet = await this.exportQuantity(
      project,
      areaShapes,
      true,
      true,
      true,
      lang
    );

    // Create assembly sheet (AT)
    const assemblyWorksheet = await this.exportAssembly(
      project,
      areaShapes,
      lang
    );
    this.cloneWorksheet(
      workbook,
      this.remapQuantityAssembly(
        quantityWorksheet.worksheet,
        quantityWorksheet.mapping,
        assemblyWorksheet.mapping
      ),
      "QT",
      {
        properties: { tabColor: { argb: tabColor } },
      }
    );

    this.cloneWorksheet(workbook, assemblyWorksheet.worksheet, "AT", {
      properties: { tabColor: { argb: tabColor } },
    });
    // Save workbook
    this.saveWorkbook(
      workbook,
      "qty-assembly-" + slugify(project.projectLocalId) + ".xlsx"
    );
  }

  async exportQuantity(
    project: Project,
    areaShapes,
    basicSet = true,
    repairSet = true,
    masses = true,
    lang?
  ): Promise<{ worksheet: Worksheet; mapping: any }> {
    //check language
    if (!lang) {
      lang = await this.selectLanguage();
    }
    const currency = await this.selectCurrency();
    const currencyFmt =
      currency == "USD"
        ? '"$"#,##0.00;[Red]-"$"#,##0.00'
        : '"€"#,##0.00;[Red]-"€"#,##0.00';

    const projectSummary = ProjectsService.createProjectSummary(
      project,
      areaShapes,
      project.setsAmount && project.setsAmount > 0 ? project.setsAmount : 1,
      basicSet,
      repairSet,
      masses
    ).projectSummary;
    await SystemService.replaceLoadingMessage("Calculating quantity table...");
    const template = await this.importTemplate();
    //get  worksheet
    const qtyWorksheet = template.getWorksheet("quantity");
    const worksheet = cloneDeep(qtyWorksheet);
    //fill translated values
    const translated_cells = [
      "B3",
      "B4",
      "B7",
      "D7",
      "E7",
      "F7",
      "G7",
      "H7",
      "K7",
      "N7",
      "D34",
      "D37",
      "D38",
      "H38",
    ];
    translated_cells.map((cell) => {
      const cellValue = worksheet.getCell(cell).value;
      const translated = TranslationService.getTransl(
        slugify(cellValue),
        cellValue.toString(),
        null,
        lang
      );
      worksheet.getCell(cell).value = upperFirst(translated);
    });
    const translated_cells_Upper = ["B10", "B20", "B18", "B28", "B31"];
    translated_cells_Upper.map((cell) => {
      const cellValue = worksheet.getCell(cell).value;
      const translated = TranslationService.getTransl(
        slugify(cellValue),
        cellValue.toString(),
        null,
        lang
      );
      worksheet.getCell(cell).value = upperCase(translated);
    });

    worksheet.getCell("B4").value =
      TranslationService.getTransl("drawing", "Drawing", null, lang) +
      " " +
      project.projectLocalId +
      " " +
      TranslationService.getTransl("dated", "dated", null, lang) +
      " " +
      new Date(project.drawingDate).toLocaleDateString();
    worksheet.getCell("N1").value = project.setsAmount;
    worksheet.getCell("N2").value = currency;
    //bricks
    let bricksAreaRow = 12;
    let bricksSampleArea = 1000;
    let massesRow = bricksAreaRow;
    let totalBricks = 18;
    let totalMasses = 28;
    const groupedByArea = {};
    //group summary by area for bricks only
    projectSummary.forEach((summary) => {
      const index = summary.areaId;
      if (!groupedByArea[index]) {
        groupedByArea[index] = [];
      }
      if (!summary.mass) groupedByArea[index].push(summary);
    });
    const groupedByAreaArray = [];
    Object.keys(groupedByArea).forEach((key) => {
      if (groupedByArea[key].length > 0)
        groupedByAreaArray.push(groupedByArea[key]);
    });

    const mapping = {};

    groupedByAreaArray.map((groupArea, groupAreaIndex) => {
      let firstRow = bricksAreaRow + 1;
      let totalRow = bricksAreaRow + 3;
      let mapArea = null;
      groupArea.map((area, areaIndex) => {
        //copy first header
        if (areaIndex == 0 && groupAreaIndex > 0) {
          //insert rows for titles after first group
          bricksAreaRow = bricksAreaRow + 5;
          bricksSampleArea = bricksSampleArea + 5;
          totalRow = totalRow + 5;
          firstRow = firstRow + 5;
          worksheet.insertRows(bricksAreaRow, [[], [], [], [], []]);
        }
        if (areaIndex == 0) {
          //write title
          //set row height
          worksheet.getRow(bricksAreaRow).height = 19;
          worksheet.getRow(bricksAreaRow + 1).height = 19;
          worksheet.getRow(bricksAreaRow + 2).height = 5;
          worksheet.getRow(bricksAreaRow + 3).height = 19;
          worksheet.getRow(bricksAreaRow + 4).height = 5;
          //copy styles
          this.cloneRows(worksheet, 5, 17, bricksSampleArea, bricksAreaRow);
          //fill the first row title
          //remove _*repair*_
          mapArea = area.areaId;
          const areaId = replace(area.areaId, "_*repair*_", "");
          worksheet.getCell(bricksAreaRow, 2).value =
            SystemService.getValueForLanguage(
              ProjectsService.getBricksAllocationAreas(areaId)[0]
                .bricksAllocationAreaName,
              lang
            ) +
            (area.onlyForRepair
              ? " (" +
                TranslationService.getTransl("repair", "Repair", null, lang) +
                ")"
              : "");
        }
        const row = worksheet.getRow(bricksAreaRow + 1);
        row.getCell(2).value = area.position;
        row.getCell(4).value = area.quality;
        row.getCell(5).value = area.shape;
        row.getCell(6).value = area.weightPerPiece_num;
        row.getCell(7).value = area.includeSafety / 100;
        row.getCell(7).numFmt = "0%";
        row.getCell(8).value = area.qtyPerSetPcs_num;
        row.getCell(9).value = area.qtyPerSetMT_num;
        row.getCell(11).value = { formula: "$N$1*H" + (bricksAreaRow + 1) };
        row.getCell(12).value = { formula: "$N$1*I" + (bricksAreaRow + 1) };
        row.getCell(14).value = 1000;
        row.getCell(15).value = {
          formula: "P" + (bricksAreaRow + 1) + "/K" + (bricksAreaRow + 1),
        };
        row.getCell(16).value = {
          formula: "N" + (bricksAreaRow + 1) + "*L" + (bricksAreaRow + 1),
        };
        //add map
        mapping[mapArea + "-" + area.position + "-" + area.datasheetId] =
          row.number;

        if (areaIndex < groupArea.length - 1) {
          //add new row
          worksheet.insertRow(bricksAreaRow + 2, [], "i");
          worksheet.getRow(bricksAreaRow + 2).height = 19;
          bricksAreaRow++;
          bricksSampleArea++;
          totalRow++;
        } else {
          //write totals
          let formulaB = worksheet.getCell(bricksSampleArea + 3, 2).formula;
          do {
            formulaB = formulaB
              .replace("B1000", "B" + firstRow)
              .replace("B1002", "B" + (totalRow - 1));
          } while (formulaB.indexOf("B1000") >= 0);
          let formulaH = worksheet.getCell(bricksSampleArea + 3, 8).formula;
          do {
            formulaH = formulaH
              .replace("H1000", "H" + firstRow)
              .replace("H1002", "H" + (totalRow - 1));
          } while (formulaH.indexOf("H1000") >= 0);
          let formulaI = worksheet.getCell(bricksSampleArea + 3, 9).formula;
          do {
            formulaI = formulaI
              .replace("I1000", "I" + firstRow)
              .replace("I1002", "I" + (totalRow - 1));
          } while (formulaI.indexOf("I1000") >= 0);
          let formulaK = worksheet.getCell(bricksSampleArea + 3, 11).formula;
          do {
            formulaK = formulaK
              .replace("K1000", "K" + firstRow)
              .replace("K1002", "K" + (totalRow - 1));
          } while (formulaK.indexOf("K1000") >= 0);
          let formulaL = worksheet.getCell(bricksSampleArea + 3, 12).formula;
          do {
            formulaL = formulaL
              .replace("L1000", "L" + firstRow)
              .replace("L1002", "L" + (totalRow - 1));
          } while (formulaL.indexOf("L1000") >= 0);
          let formulaP = worksheet.getCell(bricksSampleArea + 3, 16).formula;
          do {
            formulaP = formulaP
              .replace("P1000", "P" + firstRow)
              .replace("P1002", "P" + (totalRow - 1));
          } while (formulaP.indexOf("P1000") >= 0);
          const row = worksheet.getRow(totalRow);
          row.getCell(2).value = {
            formula: formulaB,
          };
          row.getCell(8).value = {
            formula: formulaH,
          };
          row.getCell(9).value = {
            formula: formulaI,
          };
          row.getCell(11).value = {
            formula: formulaK,
          };
          row.getCell(12).value = {
            formula: formulaL,
          };
          row.getCell(16).value = {
            formula: formulaP,
          };

          //update formula Bricks total
          totalBricks = totalRow + 3;
          const totRow = worksheet.getRow(totalBricks);
          const sampleRow = worksheet.getRow(bricksSampleArea + 5);
          let totH = sampleRow.getCell(8).formula;
          totH = totH
            .replace("$F$17", "$F$" + (totalRow + 2))
            .replace("H17", "H" + (totalRow + 2));
          let totI = sampleRow.getCell(9).formula;
          totI = totI
            .replace("$F$17", "$F$" + (totalRow + 2))
            .replace("I17", "I" + (totalRow + 2));
          let totK = sampleRow.getCell(11).formula;
          totK = totK
            .replace("$F$17", "$F$" + (totalRow + 2))
            .replace("K17", "K" + (totalRow + 2));
          let totL = sampleRow.getCell(12).formula;
          totL = totL
            .replace("$F$17", "$F$" + (totalRow + 2))
            .replace("L17", "L" + (totalRow + 2));
          let totP = sampleRow.getCell(16).formula;
          totP = totP
            .replace("$F$17", "$F$" + (totalRow + 2))
            .replace("P17", "P" + (totalRow + 2));
          totRow.getCell(8).value = {
            formula: totH,
          };
          totRow.getCell(9).value = {
            formula: totI,
          };
          totRow.getCell(11).value = {
            formula: totK,
          };
          totRow.getCell(12).value = {
            formula: totL,
          };
          totRow.getCell(16).value = {
            formula: totP,
          };
        }
      });
    });
    //no Bricks
    if (project.projectAreaQuality.length == 0) {
      //delete area
      worksheet.spliceRows(10, 10);
      bricksSampleArea = bricksSampleArea - 10;
    } else {
      massesRow = bricksAreaRow + 10;
    }

    //masses
    //group by area
    if (masses) {
      SystemService.replaceLoadingMessage("Calculating masses table...");
      let massGrouped = {};
      for (
        let massIndex = 0;
        massIndex < project.projectMass.length;
        massIndex++
      ) {
        const mass = project.projectMass[massIndex];
        if (!massGrouped[mass.bricksAllocationAreaId])
          massGrouped[mass.bricksAllocationAreaId] = [];
        massGrouped[mass.bricksAllocationAreaId].push(mass);
      }
      const startMasses = massesRow - 1;
      for (
        let massIndex = 0;
        massIndex < Object.keys(massGrouped).length;
        massIndex++
      ) {
        const massArea = massGrouped[Object.keys(massGrouped)[massIndex]];
        //copy first header
        if (massIndex > 0) {
          //insert rows
          massesRow = massesRow + 5;
          bricksSampleArea = bricksSampleArea + 5;
          worksheet.insertRows(massesRow, [[], [], [], [], []]);
        }
        //set row height
        worksheet.getRow(massesRow).height = 19;
        worksheet.getRow(massesRow + 1).height = 19;
        worksheet.getRow(massesRow + 2).height = 5;
        worksheet.getRow(massesRow + 3).height = 19;
        worksheet.getRow(massesRow + 4).height = 5;
        //copy styles
        this.cloneRows(worksheet, 5, 17, bricksSampleArea, massesRow);

        worksheet.getCell(massesRow, 2).value =
          SystemService.getValueForLanguage(
            ProjectsService.getBricksAllocationAreas(
              massArea[0].bricksAllocationAreaId
            )[0].bricksAllocationAreaName,
            lang
          );
        const firstRow = massesRow;
        let totalMassesRow = massesRow + 3;
        for (
          let positionIndex = 0;
          positionIndex < massArea.length;
          positionIndex++
        ) {
          const summary = projectSummary.find(
            (x) => x.position == massArea[positionIndex].position
          );
          if (summary.mass) {
            const row = worksheet.getRow(massesRow + 1);
            row.getCell(2).value = summary.position;
            row.getCell(4).value = summary.quality;
            row.getCell(5).value = summary.shape;
            row.getCell(6).value = summary.weightPerPiece_num;
            row.getCell(8).value = summary.qtyPerSetPcs_num;
            row.getCell(9).value = summary.qtyPerSetMT_num;
            row.getCell(11).value = { formula: "$N$1*H" + (massesRow + 1) };
            row.getCell(12).value = { formula: "$N$1*I" + (massesRow + 1) };
            row.getCell(14).value = 1000;
            row.getCell(15).value = {
              formula: "P" + (bricksAreaRow + 1) + "/K" + (massesRow + 1),
            };
            row.getCell(16).value = {
              formula: "N" + +(massesRow + 1) + "*L" + (massesRow + 1),
            };
            if (positionIndex < massArea.length - 1) {
              worksheet.insertRow(massesRow + 2, [], "i");
              worksheet.getRow(massesRow + 2).height = 19;
              massesRow++;
              bricksSampleArea++;
              totalMassesRow++;
            }
          }
        }
        let formulaB = worksheet.getCell(bricksSampleArea + 3, 2).formula;
        do {
          formulaB = formulaB
            .replace("B1000", "B" + firstRow)
            .replace("B1002", "B" + (totalMassesRow - 1));
        } while (formulaB.indexOf("B1000") >= 0);
        let formulaH = worksheet.getCell(bricksSampleArea + 3, 8).formula;
        do {
          formulaH = formulaH
            .replace("H1000", "H" + firstRow)
            .replace("H1002", "H" + (totalMassesRow - 1));
        } while (formulaH.indexOf("H1000") >= 0);
        let formulaI = worksheet.getCell(bricksSampleArea + 3, 9).formula;
        do {
          formulaI = formulaI
            .replace("I1000", "I" + firstRow)
            .replace("I1002", "I" + (totalMassesRow - 1));
        } while (formulaI.indexOf("I1000") >= 0);
        let formulaK = worksheet.getCell(bricksSampleArea + 3, 11).formula;
        do {
          formulaK = formulaK
            .replace("K1000", "K" + firstRow)
            .replace("K1002", "K" + (totalMassesRow - 1));
        } while (formulaK.indexOf("K1000") >= 0);
        let formulaL = worksheet.getCell(bricksSampleArea + 3, 12).formula;
        do {
          formulaL = formulaL
            .replace("L1000", "L" + firstRow)
            .replace("L1002", "L" + (totalMassesRow - 1));
        } while (formulaL.indexOf("L1000") >= 0);
        let formulaP = worksheet.getCell(bricksSampleArea + 3, 16).formula;
        do {
          formulaP = formulaP
            .replace("P1000", "P" + firstRow)
            .replace("P1002", "P" + (totalMassesRow - 1));
        } while (formulaP.indexOf("P1000") >= 0);
        const row = worksheet.getRow(totalMassesRow);
        row.getCell(2).value = {
          formula: formulaB,
        };
        row.getCell(8).value = {
          formula: formulaH,
        };
        row.getCell(9).value = {
          formula: formulaI,
        };
        row.getCell(11).value = {
          formula: formulaK,
        };
        row.getCell(12).value = {
          formula: formulaL,
        };
        row.getCell(16).value = {
          formula: formulaP,
        };
        //update formula Bricks total
        totalMasses = totalMassesRow + 3;
        const totRow = worksheet.getRow(totalMasses);
        const sampleRow = worksheet.getRow(bricksSampleArea + 5);
        let totH = sampleRow.getCell(8).formula;
        totH = totH
          .replace("$F$10", "$F$" + startMasses)
          .replace("$F$17", "$F$" + (totalMassesRow + 2))
          .replace("H10", "H" + startMasses)
          .replace("H17", "H" + (totalMassesRow + 2));
        let totI = sampleRow.getCell(9).formula;
        totI = totI
          .replace("$F$10", "$F$" + startMasses)
          .replace("$F$17", "$F$" + (totalMassesRow + 2))
          .replace("I10", "I" + startMasses)
          .replace("I17", "I" + (totalMassesRow + 2));
        let totK = sampleRow.getCell(11).formula;
        totK = totK
          .replace("$F$10", "$F$" + startMasses)
          .replace("$F$17", "$F$" + (totalMassesRow + 2))
          .replace("K10", "K" + startMasses)
          .replace("K17", "K" + (totalMassesRow + 2));
        let totL = sampleRow.getCell(12).formula;
        totL = totL
          .replace("$F$10", "$F$" + startMasses)
          .replace("$F$17", "$F$" + (totalMassesRow + 2))
          .replace("L10", "L" + startMasses)
          .replace("L17", "L" + (totalMassesRow + 2));

        let totP = sampleRow.getCell(16).formula;
        totP = totP
          .replace("$F$10", "$F$" + startMasses)
          .replace("$F$17", "$F$" + (totalMassesRow + 2))
          .replace("P10", "P" + startMasses)
          .replace("P17", "P" + (totalMassesRow + 2));
        totRow.getCell(8).value = {
          formula: totH,
        };
        totRow.getCell(9).value = {
          formula: totI,
        };
        totRow.getCell(11).value = {
          formula: totK,
        };
        totRow.getCell(12).value = {
          formula: totL,
        };
        totRow.getCell(16).value = {
          formula: totP,
        };
      }
      //no Masses
      if (project.projectMass.length == 0) {
        //delete masses
        worksheet.spliceRows(totalBricks + 1, 10);
        totalMasses = 0;
      }
    } else {
      //delete masses
      worksheet.spliceRows(totalBricks + 1, 10);
      totalMasses = 0;
    }

    //add totals
    SystemService.replaceLoadingMessage("Calculating totals...");
    let totRow = (totalMasses > totalBricks ? totalMasses : totalBricks) + 3;
    if (
      project.projectAreaQuality.length > 0 &&
      project.projectMass.length > 0 &&
      masses
    ) {
      const row = worksheet.getRow(totRow);
      row.getCell(8).value = {
        formula: "H" + totalBricks + "+H" + totalMasses,
      };
      row.getCell(9).value = {
        formula: "I" + totalBricks + "+I" + totalMasses,
      };
      row.getCell(12).value = {
        formula: "L" + totalBricks + "+L" + totalMasses,
      };
      row.getCell(16).value = {
        formula: "P" + totalBricks + "+P" + totalMasses,
      };
    } else {
      //delete grand total
      worksheet.spliceRows(totRow - 1, 3);
      totRow = totRow - 3;
    }

    //remove sample
    worksheet.spliceRows(bricksSampleArea, 5);

    //set currency formats
    worksheet.getColumn(14).numFmt = currencyFmt;
    worksheet.getColumn(15).numFmt = currencyFmt;
    worksheet.getColumn(16).numFmt = currencyFmt;
    worksheet.getColumn(6).numFmt = mtFmt;
    worksheet.getColumn(8).numFmt = pcsFmt;
    worksheet.getColumn(9).numFmt = mtFmt;
    worksheet.getColumn(11).numFmt = pcsFmt;
    worksheet.getColumn(12).numFmt = mtFmt;
    worksheet.getCell(1, 14).numFmt = "0";

    //insert final summary table
    const summaryQualities = {};
    projectSummary.forEach((position) => {
      if (!summaryQualities[position.quality]) {
        summaryQualities[position.quality] = {
          pcs: 0,
          mt: 0,
        };
      }
      summaryQualities[position.quality].pcs += position.qtyPerSetPcs_num;
      summaryQualities[position.quality].mt += position.qtyPerSetMT_num;
    });

    let firstSummaryRow = totRow + 8;
    let summaryRow = firstSummaryRow;
    Object.keys(summaryQualities).forEach((quality) => {
      const row = worksheet.getRow(summaryRow);
      const smplRow = worksheet.getRow(firstSummaryRow);
      for (let k = 1; k < 9; k++) {
        row.getCell(k).style = cloneDeep(smplRow.getCell(k).style);
      }
      row.getCell(8).value = 1000;
      row.getCell(8).numFmt = currencyFmt;
      row.getCell(4).value = quality;
      row.getCell(5).value = summaryQualities[quality].pcs;
      row.getCell(5).numFmt = pcsFmt;
      row.getCell(6).value = summaryQualities[quality].mt;
      row.getCell(6).numFmt = mtFmt;
      //insert price reference in table
      for (let row = 12; row < totRow; row++) {
        const rowEl = worksheet.getRow(row);
        if (rowEl.getCell(4).value == quality) {
          //fill price reference
          rowEl.getCell(14).value = { formula: "$H$" + summaryRow };
        }
      }
      summaryRow++;
    });
    //add summary row total
    const smplRow = worksheet.getRow(firstSummaryRow);
    const row = worksheet.getRow(summaryRow);
    for (let k = 1; k < 9; k++) {
      row.getCell(k).style = cloneDeep(smplRow.getCell(k).style);
    }
    row.getCell(4).value = TranslationService.getTransl(
      "total",
      "Total",
      null,
      lang
    ).toUpperCase();
    row.getCell(5).value = {
      formula: "SUM(E" + firstSummaryRow + ":E" + (summaryRow - 1) + ")",
    };
    row.getCell(5).numFmt = pcsFmt;
    row.getCell(6).value = {
      formula: "SUM(F" + firstSummaryRow + ":F" + (summaryRow - 1) + ")",
    };
    row.getCell(6).numFmt = mtFmt;
    //fix border errors
    this.setBorder(worksheet, "medium", false, true, false, true, 6, 13, 7, 13);
    this.setBorder(
      worksheet,
      "medium",
      false,
      true,
      false,
      false,
      7,
      17,
      7,
      17
    );

    SystemService.dismissLoading();
    return { worksheet: worksheet, mapping: mapping };
  }

  async exportAssembly(
    project: Project,
    areaShapes,
    lang?
  ): Promise<{ worksheet: Worksheet; mapping: any }> {
    //check language
    if (!lang) {
      lang = await this.selectLanguage();
    }
    await SystemService.replaceLoadingMessage("Calculating Assembly table...");
    const template = await this.importTemplate();
    const rep = "_*repair*_";
    //get  worksheet
    const qtyWorksheet = template.getWorksheet("assembly");
    const worksheet = cloneDeep(qtyWorksheet);
    //fill translated values
    const translated_cells = [
      "B7",
      "B10",
      "B11",
      "B12",
      "B13",
      "B18",
      "B20",
      "B26",
      "B27",
    ];
    translated_cells.map((cell) => {
      const cellValue = worksheet.getCell(cell).value;
      const translated = TranslationService.getTransl(
        slugify(cellValue),
        cellValue.toString(),
        null,
        lang
      );
      worksheet.getCell(cell).value = upperFirst(translated);
    });
    const startBricksAreaColumn = 5;
    const mergeRows = [7, 9, 11, 12, 13, 15, 16, 17, 18, 19, 25, 26];
    let bricksAreaColumn = startBricksAreaColumn;
    //create course summary and group by similar area, quality and position
    const projectAreaQuality = {};
    const mapping = {};
    project.projectAreaQuality.forEach((areaQuality, areaIndex) => {
      const positions = [];
      areaQuality.shapes.forEach((shape, shapeIndex) => {
        positions.push(shape.position);
        const index =
          areaQuality.bricksAllocationAreaId + "-" + areaQuality.datasheetId;
        if (!projectAreaQuality[index]) {
          projectAreaQuality[index] = cloneDeep(areaQuality);
          //remove quantities and shapes
          projectAreaQuality[index].courses = [];
          projectAreaQuality[index].shapes = [];
        }
        //check if shape is present or add
        let shapeOK = projectAreaQuality[index].shapes.find(
          (x) => x.shapeId == shape.shapeId
        );

        if (!shapeOK) {
          shape["shape"] = areaShapes[areaIndex].shapes[shapeIndex];
          projectAreaQuality[index].shapes.push(shape);
          //also also to repair set if existing
          if (projectAreaQuality[index + rep]) {
            projectAreaQuality[index + rep].shapes.push(shape);
          }
        }
        //sum to previous
        areaQuality.courses.forEach((course) => {
          let found = false;
          for (let i = 0; i < projectAreaQuality[index].courses.length; i++) {
            let oldCourse = projectAreaQuality[index].courses[i];
            let oldCourseRep = null;
            //also add to repair set if existing
            if (projectAreaQuality[index + rep]) {
              oldCourseRep = projectAreaQuality[index + rep].courses[i];
            }
            if (course.courseNumber == oldCourse.courseNumber) {
              found = true;
              //find shape
              let oldQtyShape = oldCourse.quantityShapes.find(
                (x) => x.shapeId == shape.shapeId
              );
              const courseQtyShape = course.quantityShapes.find(
                (x) => x.shapeId == shape.shapeId
              );
              if (!oldQtyShape) {
                oldQtyShape = cloneDeep(courseQtyShape);
                oldCourse.quantityShapes.push(oldQtyShape);
              } else {
                oldQtyShape.quantity += courseQtyShape.quantity;
              }
              //again for repair
              if (oldCourseRep) {
                //find shape
                let oldQtyShapeRep = oldCourseRep.quantityShapes.find(
                  (x) => x.shapeId == shape.shapeId
                );
                const courseQtyShapeRep = course.quantityShapes.find(
                  (x) => x.shapeId == shape.shapeId
                );
                if (!oldQtyShapeRep) {
                  oldQtyShapeRep = cloneDeep(courseQtyShapeRep);
                  oldCourseRep.quantityShapes.push(oldQtyShapeRep);
                } else {
                  oldQtyShapeRep.quantity += courseQtyShapeRep.quantity;
                }
              }
              break;
            }
          }
          if (!found) {
            //add new course only for present shape
            const addCourse = cloneDeep(course);
            const find = addCourse.quantityShapes.find(
              (x) => x.shapeId == shape.shapeId
            );
            const qtyShape = cloneDeep(find);
            addCourse.quantityShapes = [];
            addCourse.quantityShapes.push(qtyShape);
            if (course.repairSets > 0) {
              //create new area with new index
              if (!projectAreaQuality[index + rep]) {
                projectAreaQuality[index + rep] = cloneDeep(
                  projectAreaQuality[index]
                );
              }
              projectAreaQuality[index + rep].courses.push(
                cloneDeep(addCourse)
              );
            }
            projectAreaQuality[index].courses.push(cloneDeep(addCourse));
          }
        });
      });
    });
    for (
      let areaIndex = 0;
      areaIndex < Object.keys(projectAreaQuality).length;
      areaIndex++
    ) {
      const key = Object.keys(projectAreaQuality)[areaIndex];
      let isRepair = false;
      if (key.includes(rep)) isRepair = true;
      const area = projectAreaQuality[key];
      //order shapes by position
      area.shapes = orderBy(area.shapes, "position");
      const firstColumn = bricksAreaColumn;
      let lastColumn = bricksAreaColumn + 1;
      let mapArea = null;
      for (let posIndex = 0; posIndex < area.shapes.length; posIndex++) {
        const shape = area.shapes[posIndex];
        mergeRows.forEach((row) => {
          this.mergeCells(worksheet, row, bricksAreaColumn, row, lastColumn);
        });
        this.copyCellsStylesandValues(
          worksheet,
          1,
          bricksAreaColumn,
          27,
          lastColumn,
          false,
          startBricksAreaColumn
        );
        mapArea = area.bricksAllocationAreaId;
        worksheet.getCell(7, bricksAreaColumn).value =
          SystemService.getValueForLanguage(
            ProjectsService.getBricksAllocationAreas(
              area.bricksAllocationAreaId
            )[0].bricksAllocationAreaName,
            lang
          ) +
          (area.onlyForRepair || isRepair
            ? " (" +
              TranslationService.getTransl("repair", "Repair", null, lang) +
              ")"
            : "");
        worksheet.getCell(8, bricksAreaColumn).value = shape.position;
        //merge header
        this.mergeCells(worksheet, 8, bricksAreaColumn, 8, lastColumn);
        worksheet.getCell(10, bricksAreaColumn).value =
          DatasheetsService.getDatasheetsById(area.datasheetId).productName;
        worksheet.getCell(10, lastColumn).value =
          shape["shape"].getDimensions();
        worksheet.getCell(11, bricksAreaColumn).value =
          shape["shape"].shapeName;
        //get special shape weight
        let unitWeight = 0;
        if (shape.specialShapeVolume > 0) {
          unitWeight = shape["shape"].getWeightForVolume(
            shape.specialShapeVolume,
            area.density
          );
        } else {
          unitWeight = shape["shape"].getWeight(area.density);
        }
        worksheet.getCell(12, bricksAreaColumn).value = unitWeight;
        worksheet.getCell(13, bricksAreaColumn).value = "Pc";
        mapping[
          mapArea +
            (isRepair ? rep : "") +
            "-" +
            shape.position +
            "-" +
            area.datasheetId
        ] = bricksAreaColumn;
        bricksAreaColumn = bricksAreaColumn + 2;
        lastColumn = lastColumn + 2;
      }
      //merge header
      this.mergeCells(worksheet, 7, firstColumn, 7, lastColumn - 2);
    }
    //add totals column
    this.copyCellsStylesandValues(
      worksheet,
      1,
      bricksAreaColumn,
      27,
      bricksAreaColumn + 1,
      false,
      startBricksAreaColumn - 3
    );
    mergeRows.forEach((row) => {
      this.mergeCells(
        worksheet,
        row,
        bricksAreaColumn,
        row,
        bricksAreaColumn + 1
      );
    });
    this.setBorder(
      worksheet,
      "medium",
      false,
      true,
      false,
      false,
      7,
      bricksAreaColumn + 2,
      20,
      bricksAreaColumn + 2
    );
    this.setBorder(
      worksheet,
      "medium",
      false,
      true,
      false,
      false,
      26,
      bricksAreaColumn + 2,
      27,
      bricksAreaColumn + 2
    );
    this.mergeCells(worksheet, 7, bricksAreaColumn, 8, bricksAreaColumn + 1);

    //merge and fill headers
    this.mergeCells(worksheet, 3, 2, 3, bricksAreaColumn + 1);
    this.mergeCells(worksheet, 4, 2, 4, bricksAreaColumn + 1);
    worksheet.getCell("B3").value = TranslationService.getTransl(
      "assembly_table",
      "Assembly Table",
      null,
      lang
    );
    worksheet.getCell("B4").value =
      TranslationService.getTransl("drawing", "Drawing", null, lang) +
      " " +
      project.projectLocalId +
      " " +
      TranslationService.getTransl("dated", "dated", null, lang) +
      " " +
      new Date(project.drawingDate).toLocaleDateString();

    //fill courses totals
    const cell = worksheet.getCell(7, bricksAreaColumn);
    cell.value = TranslationService.getTransl("total", "Total", null, lang);
    cell.alignment = { vertical: "middle", horizontal: "center" };
    const cell1 = worksheet.getCell(13, bricksAreaColumn);
    cell1.value = "Pc";
    cell1.alignment = { vertical: "middle", horizontal: "center" };

    //count total courses
    const courses = [];
    Object.keys(projectAreaQuality).forEach((key) => {
      const area = projectAreaQuality[key];
      area.courses.forEach((course) => {
        courses.push(course.courseNumber);
      });
    });
    const minVal = min(courses);
    const maxVal = max(courses);
    let firstCourseRow = 15;
    let courseRow = firstCourseRow;
    //add courses rows
    for (let courseIndex = maxVal; courseIndex >= minVal; courseIndex--) {
      //add row
      if (courseIndex < maxVal) {
        worksheet.insertRow(courseRow, [], "i");
      }
      const row = worksheet.getRow(courseRow);
      this.copyCellsStylesandValues(
        worksheet,
        courseRow,
        1,
        courseRow,
        bricksAreaColumn + 2,
        false,
        null,
        15
      );
      row.height = 18;
      row.hidden = false;
      row.getCell("B").value = courseIndex;
      //merge cells
      let prevCol = null;
      for (let index = 5; index < bricksAreaColumn + 2; index = index + 2) {
        this.mergeCells(worksheet, courseRow, index, courseRow, index + 1);
        if (courseIndex == minVal) {
          //merge total cells and add formula
          this.mergeCells(
            worksheet,
            courseRow + 2,
            index,
            courseRow + 2,
            index + 1
          );
          this.mergeCells(
            worksheet,
            courseRow + 3,
            index,
            courseRow + 3,
            index + 1
          );
          this.mergeCells(
            worksheet,
            courseRow + 4,
            index,
            courseRow + 4,
            index + 1
          );
          this.mergeCells(
            worksheet,
            courseRow + 5,
            index,
            courseRow + 5,
            index + 1
          );
          this.mergeCells(
            worksheet,
            courseRow + 11,
            index,
            courseRow + 11,
            index + 1
          );
          this.mergeCells(
            worksheet,
            courseRow + 12,
            index,
            courseRow + 12,
            index + 1
          );
          //update formula for total
          const totRow = worksheet.getRow(courseRow + 2);
          const totCell = totRow.getCell(index);
          const refCell = totRow.getCell("E");
          const actualCol = totCell.address.replace(
            (courseRow + 2).toString(),
            ""
          );
          let formula = refCell.formula;
          formula = replaceAll(formula, "E14", actualCol + "14");
          formula = replaceAll(
            formula,
            "E15",
            actualCol + courseRow.toString()
          );
          formula = replaceAll(
            formula,
            "E" + courseRow.toString(),
            actualCol + courseRow.toString()
          );
          totCell.value = { formula };
          //update formula for safety
          const safetyRow = worksheet.getRow(courseRow + 4);
          const safetyCell = safetyRow.getCell(index);
          const refSafCell = safetyRow.getCell("E");
          let formulaSafety = refSafCell.formula;
          formulaSafety = replaceAll(
            formulaSafety,
            "E17",
            actualCol + (courseRow + 2).toString()
          );
          formulaSafety = replaceAll(
            formulaSafety,
            "E18",
            actualCol + (courseRow + 3).toString()
          );
          formulaSafety = replaceAll(
            formulaSafety,
            "E" + (courseRow + 2).toString(),
            actualCol + (courseRow + 2).toString()
          );
          formulaSafety = replaceAll(
            formulaSafety,
            "E" + (courseRow + 3).toString(),
            actualCol + (courseRow + 3).toString()
          );

          safetyCell.value = { formula: formulaSafety };

          //update formula for weight
          mapping["weightRow"] = courseRow + 5;
          const weightRow = worksheet.getRow(courseRow + 5);
          const weightCell = weightRow.getCell(index);
          const refWeightCell = weightRow.getCell("E");
          let formulaWeight = refWeightCell.formula;
          formulaWeight = replaceAll(formulaWeight, "E12", actualCol + "12");
          formulaWeight = replaceAll(
            formulaWeight,
            "E19",
            actualCol + (courseRow + 4).toString()
          );
          formulaWeight = replaceAll(
            formulaWeight,
            "E" + (courseRow + 4).toString(),
            actualCol + (courseRow + 4).toString()
          );
          weightCell.value = { formula: formulaWeight };

          //update rings count
          const countRow = worksheet.getRow(courseRow + 11);
          const countCell = countRow.getCell(index);
          const refCountCell = countRow.getCell("E");
          let formulaCount = refCountCell.formula;
          formulaCount = replaceAll(formulaCount, "E14", actualCol + "14");
          formulaCount = replaceAll(
            formulaCount,
            "E15",
            actualCol + courseRow.toString()
          );
          formulaCount = replaceAll(
            formulaCount,
            "E" + courseRow.toString(),
            actualCol + courseRow.toString()
          );
          countCell.value = { formula: formulaCount };

          //update rings formula
          const ringsRow = worksheet.getRow(courseRow + 12);
          const ringsCell = ringsRow.getCell(index);
          ringsCell.value = {
            formula:
              actualCol + (courseRow + 2) + "/" + actualCol + (courseRow + 11),
          };

          //update totals
          if (index >= bricksAreaColumn) {
            //totals column
            let formulaTot = worksheet.getCell(
              actualCol + (courseRow + 2)
            ).formula;
            formulaTot = formulaTot.replace(
              actualCol + "14",
              "E" + (courseRow + 4)
            );
            formulaTot = formulaTot.replace(
              actualCol + courseRow,
              prevCol + (courseRow + 4)
            );
            worksheet.getCell(actualCol + (courseRow + 4)).value = {
              formula: formulaTot,
            };
            worksheet.getCell(actualCol + (courseRow + 4)).numFmt = "0";

            //add weight totals
            formulaTot = formulaTot.replace(
              (courseRow + 4).toString(),
              (courseRow + 5).toString()
            );
            formulaTot = formulaTot.replace(
              (courseRow + 4).toString(),
              (courseRow + 5).toString()
            );
            worksheet.getCell(actualCol + (courseRow + 5)).value = {
              formula: formulaTot,
            };
            worksheet.getCell(actualCol + (courseRow + 5)).alignment = {
              vertical: "middle",
              horizontal: "center",
            };
            worksheet.getCell(actualCol + (courseRow + 11)).value = "";
            worksheet.getCell(actualCol + (courseRow + 12)).value = "";
          } else {
            prevCol = actualCol;
          }
        }
      }
      this.mergeCells(worksheet, courseRow, 2, courseRow, 3);
      if (courseIndex == minVal) {
        //merge total cells
        this.mergeCells(worksheet, courseRow + 2, 2, courseRow + 2, 3);
        this.mergeCells(worksheet, courseRow + 3, 2, courseRow + 3, 3);
        this.mergeCells(worksheet, courseRow + 4, 2, courseRow + 4, 3);
        this.mergeCells(worksheet, courseRow + 5, 2, courseRow + 5, 3);
        this.mergeCells(worksheet, courseRow + 11, 2, courseRow + 11, 3);
        this.mergeCells(worksheet, courseRow + 12, 2, courseRow + 12, 3);
      }

      worksheet.getCell(courseRow, 2).border = {
        top: { style: "thin" },
        left: { style: "medium" },
        bottom: { style: "thin" },
        right: { style: "medium" },
      };

      //formula total course
      const totalCell = worksheet.getCell(courseRow, bricksAreaColumn);
      const lastCol = worksheet
        .getCell(courseRow, bricksAreaColumn - 1)
        .address.replace(courseRow.toString(), "");
      let refCellFormula = worksheet.getCell(courseRow + 2, 5).formula; //E17
      refCellFormula = refCellFormula.replace("E14", "E" + courseRow);
      refCellFormula = refCellFormula.replace(
        courseIndex == minVal ? "E" + courseRow : "E15",
        lastCol + courseRow
      );
      totalCell.value = { formula: refCellFormula };
      totalCell.alignment = { vertical: "middle", horizontal: "center" };
      totalCell.numFmt = "0";

      courseRow++;
    }
    //hide last row
    worksheet.getRow(courseRow).height = 0.0001;
    worksheet.getRow(courseRow).hidden = true;

    //fill courses columns
    bricksAreaColumn = startBricksAreaColumn;
    for (
      let areaIndex = 0;
      areaIndex < Object.keys(projectAreaQuality).length;
      areaIndex++
    ) {
      const key = Object.keys(projectAreaQuality)[areaIndex];
      let isRepair = false;
      if (key.includes(rep)) isRepair = true;
      const area = projectAreaQuality[key];
      for (let posIndex = 0; posIndex < area.shapes.length; posIndex++) {
        const shape = area.shapes[posIndex];
        for (
          let courseIndex = 0;
          courseIndex < area.courses.length;
          courseIndex++
        ) {
          const course = area.courses[courseIndex];
          const courseNumber = course.courseNumber;
          const rowNumberForCourse = firstCourseRow + maxVal - courseNumber;
          const quantityObj = course.quantityShapes.find(
            (x) => x.shapeId == shape.shapeId
          );
          let quantity = quantityObj
            ? quantityObj.quantity * (isRepair ? course.repairSets : 1)
            : null;
          //sum previous value in case of multiple rows with same course number
          if (worksheet.getCell(rowNumberForCourse, bricksAreaColumn).value) {
            quantity += toNumber(
              worksheet.getCell(rowNumberForCourse, bricksAreaColumn).value
            );
          }
          worksheet.getCell(rowNumberForCourse, bricksAreaColumn).value =
            quantity > 0 ? quantity : "";
        }
        //update safety
        worksheet.getCell(courseRow + 2, bricksAreaColumn).value =
          area.includeSafety / 100;
        bricksAreaColumn = bricksAreaColumn + 2;
      }
    }

    //set formats
    worksheet.getRow(courseRow + 4).numFmt = mtFmt;
    worksheet.getRow(courseRow + 10).numFmt = pcsFmt;
    worksheet.getRow(courseRow + 11).numFmt = pcsFmt;
    SystemService.dismissLoading();
    return { worksheet, mapping };
  }

  remapQuantityAssembly(quantityWorksheet, qtMapping, atMapping): Worksheet {
    const atMapWeightRow = atMapping["weightRow"];
    Object.keys(qtMapping).map((areaKey) => {
      const qtRow = qtMapping[areaKey];
      //find same area in atMapping
      const atColumn = atMapping[areaKey];
      //write link to AT cell
      const columnString = this.getColumnLetter(atColumn);
      quantityWorksheet.getCell("H" + qtRow).value = {
        formula: "=AT!" + columnString + (atMapWeightRow - 1).toString(),
      };
      quantityWorksheet.getCell("I" + qtRow).value = {
        formula: "=AT!" + columnString + atMapWeightRow.toString(),
      };
    });
    return quantityWorksheet;
  }

  async exportShapes(project: Project, shapeAreas: AreaShape[], lang) {
    await SystemService.replaceLoadingMessage("Exporting shapes...");
    const tabColor = "FF99CC";
    const workbook = new Workbook();
    const template = await this.importTemplate();
    //get shapes worksheet
    const shapesWorksheet = template.getWorksheet("shape");
    //group all shapes by drawing id and then datasheet id
    const shapeGroups = {};
    shapeAreas.forEach((shapeArea) => {
      shapeArea.shapes.forEach((shape) => {
        const dwgId = shape.dwg && shape.dwg.id ? shape.dwg.id : null;
        if (dwgId) {
          if (!shapeGroups[dwgId]) shapeGroups[dwgId] = {};
          const projectArea = project.projectAreaQuality[shapeArea.areaIndex];

          const dataSheetId = projectArea.datasheetId;
          if (!shapeGroups[dwgId][dataSheetId])
            shapeGroups[dwgId][dataSheetId] = [];
          //check if same position and shape are already added
          const projectShape = projectArea.shapes.find(
            (x) => x.shapeId == shape["shapeId"]
          );
          const position = projectShape.position;
          const specialShapeVolume = projectShape.specialShapeVolume;
          if (specialShapeVolume > 0) {
            shape["specialShapeVolume"] = specialShapeVolume;
          }
          const group = shapeGroups[dwgId][dataSheetId];
          if (!find(group, { position, shape })) {
            shapeGroups[dwgId][dataSheetId].push({
              shape,
              density: projectArea.density,
              position,
            });
          }
          shapeGroups[dwgId][dataSheetId] = orderBy(
            shapeGroups[dwgId][dataSheetId],
            "position"
          );
        }
      });
    });
    for (
      let groupIndex = 0;
      groupIndex < Object.keys(shapeGroups).length;
      groupIndex++
    ) {
      let headerRowNumber = 17;
      let densityRowNumber = 19;
      let followingDensityRowNumber = 19;
      let firstRowNumber = 20;
      let startRowNumber = 20;
      let maxRowNumber = 42;
      let deltaBottomRows = 0;

      const dwgId = Object.keys(shapeGroups)[groupIndex];
      const group = shapeGroups[dwgId];
      const worksheet = cloneDeep(shapesWorksheet);
      //fill translated values
      const translated_cells = [
        "E17",
        "G17",
        "BA17",
        "BF17",
        "AT44",
        "C47",
        "BA47",
        "BG47",
        "AT48",
        "AT49",
        "AT50",
        "C51",
        "E51",
        "AH51",
        "AN51",
        "BA51",
        "BG51",
      ];
      translated_cells.map((cell) => {
        const cellValue = worksheet.getCell(cell).value;
        const translated = TranslationService.getTransl(
          slugify(cellValue),
          cellValue.toString(),
          null,
          lang
        );
        worksheet.getCell(cell).value = upperFirst(translated);
      });
      let dwg = null;
      for (
        let datasheetIndex = 0;
        datasheetIndex < Object.keys(group).length;
        datasheetIndex++
      ) {
        const datasheetId = Object.keys(group)[datasheetIndex];
        if (datasheetIndex > 0) {
          //copy style of datasheet row
          const prevRow = worksheet.getRow(densityRowNumber);
          followingDensityRowNumber++;
          startRowNumber++;
          const row = worksheet.getRow(followingDensityRowNumber);
          for (let index = 5; index < 63; index++) {
            row.getCell(index).style = cloneDeep(prevRow.getCell(index).style);
          }
          this.mergeCells(
            worksheet,
            followingDensityRowNumber,
            5,
            followingDensityRowNumber,
            17,
            "thin"
          );
          this.mergeCells(
            worksheet,
            followingDensityRowNumber,
            18,
            followingDensityRowNumber,
            22,
            "thin"
          );
          this.mergeCells(
            worksheet,
            followingDensityRowNumber,
            23,
            followingDensityRowNumber,
            52,
            "thin"
          );
          this.setBorder(
            worksheet,
            "thin",
            false,
            false,
            false,
            false,
            followingDensityRowNumber,
            18,
            followingDensityRowNumber,
            22
          );
        }
        const shapes = group[datasheetId];
        for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
          if (startRowNumber >= maxRowNumber) {
            //add row to bottom of the page
            deltaBottomRows++;
            worksheet.insertRow(startRowNumber, [], "i");
            this.copyCellsStylesandValues(
              worksheet,
              startRowNumber,
              1,
              startRowNumber,
              70,
              false,
              null,
              shapeIndex == 0 ? densityRowNumber : firstRowNumber
            );
          }
          const shapeGroup = shapes[shapeIndex];
          const shape = shapeGroup.shape as Shape;
          SystemService.replaceLoadingMessage(
            "Exporting shape " + shape.shapeName + "..."
          );
          const row = worksheet.getRow(startRowNumber);
          const density = shapeGroup.density;
          const position = shapeGroup.position;
          if (shapeIndex == 0) {
            //insert density and datasheet in main line
            const densityRow = worksheet.getRow(followingDensityRowNumber);
            this.mergeCells(
              worksheet,
              followingDensityRowNumber,
              5,
              followingDensityRowNumber,
              17
            );
            this.setBorder(
              worksheet,
              "thin",
              true,
              true,
              true,
              false,
              followingDensityRowNumber,
              5,
              followingDensityRowNumber,
              17
            );
            this.mergeCells(
              worksheet,
              followingDensityRowNumber,
              18,
              followingDensityRowNumber,
              22
            );
            this.setBorder(
              worksheet,
              "thin",
              true,
              false,
              true,
              false,
              followingDensityRowNumber,
              18,
              followingDensityRowNumber,
              22
            );
            this.mergeCells(
              worksheet,
              followingDensityRowNumber,
              23,
              followingDensityRowNumber,
              62
            );
            this.setBorder(
              worksheet,
              "thin",
              true,
              false,
              true,
              true,
              followingDensityRowNumber,
              23,
              followingDensityRowNumber,
              62
            );
            if (datasheetId) {
              const datasheet =
                await DatasheetsService.getDatasheet(datasheetId);
              densityRow.getCell(5).value = datasheet.productName;
              densityRow.getCell(18).value = density;
              densityRow.getCell(23).value = "g/cm³";
            }
          }
          //get all headers
          const numberOfColumns = 38;
          const headerRow = worksheet.getRow(headerRowNumber);
          const headerRow1 = worksheet.getRow(headerRowNumber + 1);
          const headers = {
            H: null,
            H1: null,
            H2: null,
            A: null,
            A1: null,
            B: null,
            B1: null,
            L: null,
            L1: null,
            La: null,
            Lb: null,
            ANG: null,
            ANG1: null,
            D: null,
            Di: null,
            De: null,
            D1: null,
            D2: null,
            D3: null,
            D4: null,
            N: null,
            specialShapeVolume: null,
          };
          //insert values and headers
          let headerCount = 0;
          for (let index = 0; index < Object.keys(headers).length; index++) {
            const header = Object.keys(headers)[index];
            if (shape[header] > 0) {
              headers[header] = shape[header];
              headerCount++;
            }
          }
          const colEachHeader = Math.ceil(numberOfColumns / headerCount);
          const colLastHeader =
            numberOfColumns - colEachHeader * (headerCount - 1);
          let headerColNumber = 15;
          let numberOfHeaders = 1;
          for (let index = 0; index < Object.keys(headers).length; index++) {
            const header = Object.keys(headers)[index];
            if (headers[header] > 0) {
              const numColumns =
                numberOfHeaders == headerCount ? colLastHeader : colEachHeader;
              if (shapeIndex == 0) {
                //insert headers
                this.mergeCells(
                  worksheet,
                  headerRowNumber,
                  headerColNumber,
                  headerRowNumber,
                  headerColNumber + numColumns - 1,
                  "thin"
                );
                this.mergeCells(
                  worksheet,
                  headerRowNumber + 1,
                  headerColNumber,
                  headerRowNumber + 1,
                  headerColNumber + numColumns - 1,
                  "thin"
                );
                headerRow.getCell(headerColNumber).value = header;
                headerRow1.getCell(headerColNumber).value =
                  header == "ANG" || header == "ANG1" ? "°" : "mm";
              }
              //insert values
              this.mergeCells(
                worksheet,
                startRowNumber,
                headerColNumber,
                startRowNumber,
                headerColNumber + numColumns - 1,
                "thin"
              );
              this.mergeCells(
                worksheet,
                startRowNumber,
                5,
                startRowNumber,
                6,
                "thin"
              );
              this.mergeCells(
                worksheet,
                startRowNumber,
                7,
                startRowNumber,
                14,
                "thin"
              );
              this.mergeCells(
                worksheet,
                startRowNumber,
                53,
                startRowNumber,
                57,
                "thin"
              );
              this.mergeCells(
                worksheet,
                startRowNumber,
                58,
                startRowNumber,
                62,
                "thin"
              );
              row.getCell(headerColNumber).value =
                header != "specialShapeVolume" ? headers[header] : "-";
              row.getCell("E").value = position;
              row.getCell("G").value = shape.shapeName;
              let unitWeight = 0;
              let unitVolume = 0;
              if (shape["specialShapeVolume"]) {
                unitVolume = shape["specialShapeVolume"];
                unitWeight = shape.getWeightForVolume(
                  shape["specialShapeVolume"],
                  density
                );
              } else {
                unitVolume = shape.volume;
                unitWeight = shape.getWeight(density);
              }
              row.getCell("BA").value = unitVolume;
              row.getCell("BF").value = unitWeight;
              headerColNumber += numColumns;
              numberOfHeaders++;
            }
          }
          //copy style
          const prevRow = worksheet.getRow(firstRowNumber);
          for (let index = 5; index < 63; index++) {
            row.getCell(index).style = cloneDeep(prevRow.getCell(index).style);
          }
          startRowNumber++;
          followingDensityRowNumber++;
        }
        if (datasheetIndex == 0) {
          dwg = shapes[0].shape.dwg;
        }
      }
      //fill remaining fields
      const customer = CustomersService.getCustomersDetails(project.customerId);
      worksheet.getCell("C" + (48 + deltaBottomRows)).value = customer
        ? customer.fullName
        : null;
      worksheet.getCell("C" + (49 + deltaBottomRows)).value =
        project.docsCaption;
      worksheet.getCell("AT" + (45 + deltaBottomRows)).value =
        project.projectLocalId;
      worksheet.getCell("BA" + (48 + deltaBottomRows)).value =
        UserService.userProfile.displayName;
      worksheet.getCell("BA" + (49 + deltaBottomRows)).value =
        UserService.userProfile.displayName;
      worksheet.getCell("BA" + (50 + deltaBottomRows)).value =
        UserService.userProfile.displayName;
      worksheet.getCell("BG" + (48 + deltaBottomRows)).value = new Date(
        project.drawingDate
      ).toLocaleDateString();
      worksheet.getCell("BG" + (49 + deltaBottomRows)).value = new Date(
        project.drawingDate
      ).toLocaleDateString();
      worksheet.getCell("BG" + (50 + deltaBottomRows)).value = new Date(
        project.drawingDate
      ).toLocaleDateString();

      //merge cells
      this.mergeCells(
        worksheet,
        44 + deltaBottomRows,
        3,
        46 + deltaBottomRows,
        23,
        "thick"
      );
      this.mergeCells(
        worksheet,
        44 + deltaBottomRows,
        24,
        46 + deltaBottomRows,
        45,
        "thick"
      );
      this.mergeCells(
        worksheet,
        44 + deltaBottomRows,
        46,
        44 + deltaBottomRows,
        64,
        "thick"
      );
      this.mergeCells(
        worksheet,
        45 + deltaBottomRows,
        46,
        46 + deltaBottomRows,
        64,
        "thick"
      );
      this.mergeCells(
        worksheet,
        47 + deltaBottomRows,
        3,
        47 + deltaBottomRows,
        45,
        "thick"
      );
      this.mergeCells(
        worksheet,
        48 + deltaBottomRows,
        3,
        48 + deltaBottomRows,
        45
      );
      this.setBorder(
        worksheet,
        "thick",
        true,
        true,
        false,
        true,
        48 + deltaBottomRows,
        3,
        48 + deltaBottomRows,
        45
      );
      this.mergeCells(
        worksheet,
        49 + deltaBottomRows,
        3,
        50 + deltaBottomRows,
        45
      );
      this.setBorder(
        worksheet,
        "thick",
        false,
        true,
        true,
        true,
        49 + deltaBottomRows,
        3,
        50 + deltaBottomRows,
        45
      );

      for (let index = 47; index <= 51; index++) {
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          46,
          index + deltaBottomRows,
          52,
          "thick"
        );
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          53,
          index + deltaBottomRows,
          58,
          "thick"
        );
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          59,
          index + deltaBottomRows,
          64,
          "thick"
        );
      }
      this.mergeCells(
        worksheet,
        52 + deltaBottomRows,
        46,
        53 + deltaBottomRows,
        52,
        "thick"
      );
      this.mergeCells(
        worksheet,
        52 + deltaBottomRows,
        53,
        53 + deltaBottomRows,
        58,
        "thick"
      );
      this.mergeCells(
        worksheet,
        52 + deltaBottomRows,
        59,
        53 + deltaBottomRows,
        64,
        "thick"
      );
      this.mergeCells(
        worksheet,
        54 + deltaBottomRows,
        46,
        55 + deltaBottomRows,
        64,
        "thick"
      );
      for (let index = 51; index <= 55; index++) {
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          3,
          index + deltaBottomRows,
          4,
          "thick"
        );
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          5,
          index + deltaBottomRows,
          10,
          "thick"
        );
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          11,
          index + deltaBottomRows,
          33,
          "thick"
        );
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          34,
          index + deltaBottomRows,
          39,
          "thick"
        );
        this.mergeCells(
          worksheet,
          index + deltaBottomRows,
          40,
          index + deltaBottomRows,
          45,
          "thick"
        );
      }
      //set borders of last rows
      this.setBorder(
        worksheet,
        "thin",
        true,
        false,
        false,
        false,
        startRowNumber,
        5,
        startRowNumber,
        62
      );
      this.setBorder(
        worksheet,
        "thick",
        false,
        false,
        true,
        false,
        maxRowNumber + deltaBottomRows + 1,
        5,
        maxRowNumber + deltaBottomRows + 1,
        62
      );
      for (
        let index = startRowNumber + 1;
        index <= maxRowNumber + deltaBottomRows;
        index++
      ) {
        this.setBorder(
          worksheet,
          "thin",
          false,
          false,
          false,
          false,
          index,
          5,
          index,
          62
        );
      }

      //fix merge errors
      //this.mergeAllErrors();
      //add worksheet to workbook
      const clonedWorksheet = this.cloneWorksheet(workbook, worksheet, dwgId, {
        properties: { tabColor: { argb: tabColor } },
        pageSetup: {
          fitToPage: true,
          fitToHeight: 1,
          fitToWidth: 1,
        },
      });
      clonedWorksheet.pageSetup.printArea = "B2:BM" + (56 + deltaBottomRows);

      //add refra logo
      await this.addRefraLogo(
        workbook,
        clonedWorksheet,
        3,
        43.2 + deltaBottomRows,
        255,
        53 + deltaBottomRows
      );
      //add image
      if (dwg) {
        const image = await FileSystemService.storeAndLoadImage(dwg.url, true);
        const imageId2 = workbook.addImage({
          base64: image.src,
          extension:
            image.ext == "png" ? "png" : image.ext == "gif" ? "gif" : "jpeg",
        });
        clonedWorksheet.addImage(imageId2, "D4:BK15");
      }
      //fix border errors
      this.setBorder(
        clonedWorksheet,
        "thin",
        false,
        false,
        false,
        true,
        18,
        62,
        18,
        62
      );
    }

    this.saveWorkbook(
      workbook,
      "shapes-" + slugify(project.projectLocalId) + ".xlsx"
    );
    SystemService.dismissLoading();
  }

  async exportDatasheets(project: Project, lang?) {
    //check language
    if (!lang) {
      lang = await this.selectLanguage();
    }
    const tabColor = "993300";
    await DatasheetsService.downloadDatasheetSettings(true);
    await SystemService.replaceLoadingMessage("Exporting Datasheets...");
    const workbook = new Workbook();
    const template = await this.importTemplate();
    //get shapes worksheet
    const datasheetsWorksheet = template.getWorksheet("datasheet");
    //group all datasheet id
    const datasheetIDs = {};
    project.projectAreaQuality.forEach((area) => {
      datasheetIDs[area.datasheetId] = null;
    });
    project.projectMass.forEach((mass) => {
      datasheetIDs[mass.datasheetId] = null;
    });
    let mainAnalysisRowNumber = 16;
    for (
      let datasheetIndex = 0;
      datasheetIndex < Object.keys(datasheetIDs).length;
      datasheetIndex++
    ) {
      let lastRowHeight = 450;
      let analysisRowNumber = 16;
      let startRowNumber = 19;
      const datasheetId = Object.keys(datasheetIDs)[datasheetIndex];
      SystemService.replaceLoadingMessage(
        "Exporting datasheet " + datasheetId + "..."
      );
      const datasheet = await DatasheetsService.getDatasheet(datasheetId);
      const worksheet = cloneDeep(datasheetsWorksheet);
      //fill translated values
      const translated_cells = [
        "C5",
        "C7",
        "C11",
        "C13",
        "C22",
        "H22",
        "M22",
        "C28",
      ];
      translated_cells.map((cell) => {
        const cellValue = worksheet.getCell(cell).value;
        const translated = TranslationService.getTransl(
          slugify(cellValue),
          cellValue.toString(),
          null,
          lang
        );
        worksheet.getCell(cell).value = translated.toUpperCase();
      });

      //fill main fields
      worksheet.getCell("J7").value = datasheet.productName;
      worksheet.getCell("I11").value = SystemService.getValueForLanguage(
        datasheet.classification,
        lang
      );
      worksheet.getCell("I13").value = SystemService.getValueForLanguage(
        datasheet.application,
        lang
      );
      worksheet.getCell("C24").value = datasheet.revisionNo;
      worksheet.getCell("H24").value = new Date(
        datasheet.issuedOnDate
      ).toLocaleDateString();
      worksheet.getCell("M24").value = datasheet.techNo;
      //group properties
      const properties = {};
      const orderedProperties = datasheet.orderPropertiesForExport();
      orderedProperties.forEach((property) => {
        if (!properties[property.type]) properties[property.type] = [];
        if (property.show) {
          properties[property.type].push(property);
        }
      });
      for (
        let typeIndex = 0;
        typeIndex < Object.keys(properties).length;
        typeIndex++
      ) {
        const type = Object.keys(properties)[typeIndex];
        for (
          let propertyIndex = 0;
          propertyIndex < properties[type].length;
          propertyIndex++
        ) {
          const property = properties[type][propertyIndex] as DatasheetProperty;
          //insert headers
          if (propertyIndex == 0) {
            if (typeIndex > 0) {
              //add 4 new rows for new header
              worksheet.insertRows(
                analysisRowNumber,
                [[], [], [], [], []],
                "n"
              );
              worksheet.getRow(analysisRowNumber).height = 15;
              worksheet.getRow(analysisRowNumber + 1).height = 15;
              worksheet.getRow(analysisRowNumber + 2).height = 15;
              worksheet.getRow(analysisRowNumber + 3).height = 15;
              lastRowHeight = lastRowHeight - 15 * 4;
              //leave one line free
              analysisRowNumber++;
            }
            //copy styles of analysys rows
            const prevRow = worksheet.getRow(mainAnalysisRowNumber);
            const row = worksheet.getRow(analysisRowNumber);
            for (let index = 3; index < 16; index++) {
              row.getCell(index).style = cloneDeep(
                prevRow.getCell(index).style
              );
            }
            row.height = 17;
            const prevRow1 = worksheet.getRow(mainAnalysisRowNumber + 1);
            const row1 = worksheet.getRow(analysisRowNumber + 1);
            for (let index = 3; index < 16; index++) {
              row1.getCell(index).style = cloneDeep(
                prevRow1.getCell(index).style
              );
            }
            row1.height = 1;
            this.mergeCells(
              worksheet,
              analysisRowNumber,
              3,
              analysisRowNumber,
              6
            );
            this.mergeCells(
              worksheet,
              analysisRowNumber,
              14,
              analysisRowNumber,
              15
            );

            let title = DatasheetsService.getDatasheetPropertyTypes(
              property.type
            )[0].typeName.toUpperCase();
            const raw = title.includes("RAW");
            if (raw) {
              title = title.replace("RAW", "");
            }
            title = title.trim().toLowerCase();
            //translate title
            title = TranslationService.getTransl(
              slugify(title + "_analysis"),
              title + " Analysis",
              null,
              lang
            ).toUpperCase();
            row.getCell("C").value = title;
            let limitValues = false;
            let lowerValues = false;
            properties[type].map((prop) => {
              lowerValues = lowerValues || prop.lower > 0 || prop.higher > 0;
              limitValues =
                limitValues || (isNumber(prop.typical) && lowerValues);
            });
            row.getCell("N").value = limitValues
              ? TranslationService.getTransl(
                  "limit_values",
                  "Limit Values",
                  null,
                  lang
                )
              : "";

            const column = limitValues ? "J" : "M";
            row.getCell(column).value = raw
              ? TranslationService.getTransl(
                  "typical_raw",
                  "Typical for the raw material",
                  null,
                  lang
                )
              : TranslationService.getTransl(
                  "typical_prod",
                  "Typical for the product",
                  null,
                  lang
                );
            if (!limitValues) {
              //merge cells for typical
              this.mergeCells(
                worksheet,
                analysisRowNumber,
                13,
                analysisRowNumber,
                15
              );
            }
            if (typeIndex > 0) {
              startRowNumber = analysisRowNumber + 3;
            }
          }
          //insert new rows for properties after first one
          if (propertyIndex > 0) {
            worksheet.insertRows(startRowNumber, [[], []], "n");
            lastRowHeight = lastRowHeight - 18;
          }
          const row = worksheet.getRow(startRowNumber);
          row.height = 17;
          row.alignment = { vertical: "top", horizontal: "right" };
          this.mergeCells(worksheet, startRowNumber, 10, startRowNumber, 12);
          this.mergeCells(worksheet, startRowNumber, 13, startRowNumber, 14);
          worksheet.getRow(startRowNumber + 1).height = 1;
          const dataSheetProperty = DatasheetsService.getDatasheetPropertyNames(
            "id",
            property.name
          )[0];
          const propertyDescLeft = SystemService.getValueForLanguage(
            dataSheetProperty.nameDescLeft,
            lang
          );
          const propertyDescRight = SystemService.getValueForLanguage(
            dataSheetProperty.nameDescRight,
            lang
          );
          const comments = SystemService.getValueForLanguage(
            dataSheetProperty.comments,
            lang
          );
          const propertyDimension = SystemService.getValueForLanguage(
            dataSheetProperty.dimension,
            lang
          );
          const propertyDecimals = toNumber(dataSheetProperty.decimals);
          row.getCell("C").value = propertyDescLeft;
          row.getCell("C").alignment = { vertical: "top", horizontal: "left" };
          row.getCell("H").value = propertyDescRight ? propertyDescRight : "";
          row.getCell("H").alignment = { vertical: "top", horizontal: "left" };
          if (comments) {
            row.getCell("I").value = comments;
            row.getCell("I").alignment = {
              vertical: "top",
              horizontal: "left",
            };
            //merge cells
            this.mergeCells(
              worksheet,
              startRowNumber,
              "I",
              startRowNumber,
              "J"
            );
          }

          row.getCell("O").value = propertyDimension;
          row.getCell("O").alignment = { horizontal: "left", vertical: "top" };
          //cell format
          let numFmt;
          switch (propertyDecimals) {
            case 1:
              numFmt = "0.0";
              break;
            case 2:
              numFmt = "0.00";
              break;
            case 3:
              numFmt = "0.000";
              break;
            default:
              numFmt = "0";
              break;
          }
          const cellValue =
            (property.prefix ? property.prefix + " " : "") +
            (property.lower >= 0 && property.higher > 0
              ? roundDecimals(property.lower, propertyDecimals) +
                " - " +
                roundDecimals(property.higher, propertyDecimals)
              : property.lower > 0
                ? roundDecimals(property.lower, propertyDecimals)
                : property.higher > 0
                  ? roundDecimals(property.higher, propertyDecimals)
                  : "");
          if (cellValue != "") {
            row.getCell("N").value = cellValue;
            row.getCell("N").numFmt = numFmt;
          }

          if (property.typical > 0) {
            const column = cellValue != "" ? "J" : "N";
            row.getCell(column).value = roundDecimals(
              property.typical,
              propertyDecimals
            );
            row.getCell(column).numFmt = numFmt;
          }
          //set bottom line
          [
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
          ].forEach((columnLetter) => {
            row.getCell(columnLetter).border = {
              bottom: { style: "hair", color: { argb: "FF000000" } },
            };
          });
          startRowNumber = startRowNumber + 2;
          analysisRowNumber = startRowNumber;
        }
        //add 1 new rows after property
        if (Object.keys(properties).length > 1) {
          worksheet.insertRows(startRowNumber, [[]], "n");
          worksheet.getRow(startRowNumber).height = 15;
          lastRowHeight = lastRowHeight - 15;
        }
      }
      //fix last row height
      worksheet.getRow(startRowNumber).height =
        lastRowHeight > 0 ? lastRowHeight : 1;
      //merge revision
      startRowNumber++;
      this.mergeCells(worksheet, startRowNumber + 1, 3, startRowNumber + 1, 6);
      this.mergeCells(worksheet, startRowNumber + 1, 8, startRowNumber + 1, 11);
      this.mergeCells(
        worksheet,
        startRowNumber + 1,
        13,
        startRowNumber + 1,
        15
      );
      this.mergeCells(worksheet, startRowNumber + 3, 3, startRowNumber + 3, 6);
      this.mergeCells(worksheet, startRowNumber + 3, 8, startRowNumber + 3, 11);
      this.mergeCells(
        worksheet,
        startRowNumber + 3,
        13,
        startRowNumber + 3,
        15
      );
      this.mergeCells(worksheet, startRowNumber + 7, 3, startRowNumber + 7, 15);
      worksheet.getCell(startRowNumber + 7, 3).border = {
        top: {},
        left: { style: "thin" },
        bottom: {},
        right: { style: "thin" },
      };
      //add worksheet to workbook
      const clonedWorksheet = this.cloneWorksheet(
        workbook,
        worksheet,
        datasheet.productName,
        {
          pageSetup: {
            fitToPage: true,
            fitToHeight: 1,
            fitToWidth: 1,
          },
          properties: { tabColor: { argb: tabColor } },
        }
      );
      clonedWorksheet.pageSetup.printArea = "A1:Q" + (startRowNumber + 10);
      //add refra logo
      await this.addRefraLogo(workbook, clonedWorksheet, 2, 2, 290, 60);
    }
    this.saveWorkbook(
      workbook,
      "datasheets-" + slugify(project.projectLocalId) + ".xlsx"
    );
    await SystemService.dismissLoading();
  }

  async exportBudget(project: Project, areaShapes) {
    const projectSummary = ProjectsService.createProjectSummary(
      project,
      areaShapes,
      project.setsAmount && project.setsAmount > 0 ? project.setsAmount : 1,
      true,
      true,
      true,
      "brickQuality"
    ).projectSummary;
    await SystemService.presentLoading("please-wait", true);
    const template = await this.importTemplate();
    const tabColor = "B7DEE8";
    const workbook = new Workbook();

    //get budget worksheet
    const budgetWorksheet = template.getWorksheet("budget");

    const worksheet = cloneDeep(budgetWorksheet);
    // Definisci la validazione dei dati per un range di celle
    const deliveryTerms = ["'Master Codes'!C3:C30"];
    worksheet.getCell("G12").dataValidation = {
      type: "list",
      formulae: deliveryTerms,
      showErrorMessage: true,
      showInputMessage: true,
    };
    worksheet.getCell("G17").dataValidation = {
      type: "list",
      formulae: deliveryTerms,
      showErrorMessage: true,
      showInputMessage: true,
    };
    const paymentTerms = ["'Master Codes'!F3:F100"];
    worksheet.getCell("G13").dataValidation = {
      type: "list",
      formulae: paymentTerms,
      showErrorMessage: true,
      showInputMessage: true,
    };
    worksheet.getCell("G25").dataValidation = {
      type: "list",
      formulae: paymentTerms,
      showErrorMessage: true,
      showInputMessage: true,
    };
    const customerPayments = ["'Master Codes'!P3:P16"];
    worksheet.getCell("G14").dataValidation = {
      type: "list",
      formulae: customerPayments,
      showErrorMessage: true,
      showInputMessage: true,
    };
    const supplierPayments = ["'Master Codes'!S3:S16"];
    worksheet.getCell("H25").dataValidation = {
      type: "list",
      formulae: supplierPayments,
      showErrorMessage: true,
      showInputMessage: true,
    };

    worksheet.getCell("G4").value = new Date().toLocaleDateString();
    worksheet.getCell("G6").value = UserService.userProfile.displayName;
    worksheet.getCell("G7").value = project.projectLocalId;
    worksheet.getCell("G11").value = CustomersService.getCustomersDetails(
      project.customerId
    ).fullName;
    worksheet.getCell("G19").value = project.setsAmount;
    let currencies = null;
    try {
      currencies = await convertCurrency();
    } catch (err) {
      currencies = { rates: { USD: 1, CHF: 1 } };
      Environment.log("convertCurrency err", err);
    }
    if (currencies && currencies["rates"]) {
      worksheet.getCell("AI15").value = currencies["rates"]["USD"];
      worksheet.getCell("AI16").value = currencies["rates"]["CHF"];
    }
    const firstRow = 26;
    let itemRow = 26;
    for (let index = 0; index < projectSummary.length; index++) {
      const item = projectSummary[index];
      //copy row and style
      if (index > 0) {
        worksheet.insertRow(itemRow, [], "i");
      }
      this.copyCellsStylesandValues(
        worksheet,
        itemRow,
        3,
        itemRow,
        56,
        false,
        null,
        firstRow
      );
      //set formulas
      for (let col = 15; col <= 55; col++) {
        const firstCellFormula = worksheet.getCell(firstRow, col).formula;
        const firstCellValue = worksheet.getCell(firstRow, col).value;
        const actualCell = worksheet.getCell(itemRow, col);
        if (firstCellFormula) {
          const newFormula = replaceAll(firstCellFormula, firstRow, itemRow);
          actualCell.value = { formula: newFormula };
        } else {
          actualCell.value = firstCellValue;
        }
      }
      const row = worksheet.getRow(itemRow);
      row.getCell("I").value = item.position + " - " + item.area;
      row.getCell("J").value = project.projectAreaQuality[item.areaIndex]
        .datasheetId
        ? DatasheetsService.getDatasheetsById(
            project.projectAreaQuality[item.areaIndex].datasheetId
          ).techNo
        : null;
      row.getCell("K").value = item.shape;
      row.getCell("L").value = item.quality;
      row.getCell("M").value = item.qtyPerSetPcs_num;
      const cell = row.getCell("N");
      if (item.weightPerPiece_num > 0) {
        cell.value = {
          formula: "M" + itemRow + "*" + item.weightPerPiece_num / 1000,
        };
      } else {
        cell.value = item.qtyPerSetMT_num;
      }
      //const units = ["'Master Codes'!$V3:$V5"];
      const units = ['"MT,Pc.,Day"'];
      row.getCell("Q").dataValidation = {
        type: "list",
        formulae: units,
        allowBlank: false,
        showErrorMessage: true,
        showInputMessage: true,
      };
      row.getCell("AJ").dataValidation = {
        type: "list",
        formulae: units,
        allowBlank: false,
        showErrorMessage: true,
        showInputMessage: true,
      };
      if (item.qtyPerSetMT_num > 0) {
        row.getCell("Q").value = "MT";
        row.getCell("AJ").value = "MT";
      } else {
        row.getCell("Q").value = "Pc.";
        row.getCell("AJ").value = "Pc.";
      }
      itemRow++;
    }

    //update formulas
    for (let row = firstRow; row <= itemRow; row++) {
      let cols = ["W", "X", "Z", "AA"];
      cols.forEach((col) => {
        //replace $N$30
        const cell = worksheet.getCell(col + row);
        const cellFormula = cell.formula;
        if (cellFormula) {
          let newFormula = replaceAll(cellFormula, "30", itemRow + 3);
          cell.value = { formula: newFormula };
        }
      });
    }
    let updateCells = ["Y12", "AA12", "W19", "X19", "Y19", "Z19", "AA19"];
    updateCells.forEach((cellId) => {
      //replace N30
      const cell = worksheet.getCell(cellId);
      const cellFormula = cell.formula;
      if (cellFormula) {
        let newFormula = replaceAll(cellFormula, "30", itemRow + 3);
        cell.value = { formula: newFormula };
      }
    });
    const cell = worksheet.getCell("AC19");
    const cellFormula = cell.formula;
    if (cellFormula) {
      let newFormula = replaceAll(cellFormula, "28", itemRow + 1);
      cell.value = { formula: newFormula };
    }

    //merge split cells
    for (let index = itemRow + 1; index <= itemRow + 3; index++) {
      //fix totals
      const cols = [
        "M",
        "N",
        "P",
        "S",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "AA",
        "AC",
        "AD",
        "AE",
        "AF",
        "AG",
        "AI",
        "AN",
        "AO",
        "AP",
        "AQ",
        "AR",
        "AT",
        "AV",
        "AW",
        "BB",
      ];
      cols.forEach((col) => {
        //last row replace totals
        const totalCell = worksheet.getCell(col + index);
        let totalCellFormula;
        try {
          totalCellFormula = totalCell.formula;
        } catch (error) {
          console.log("error", error, col + index);
        }
        if (totalCellFormula) {
          let newFormula = replaceAll(totalCellFormula, "27", itemRow);
          newFormula = replaceAll(newFormula, "29", itemRow + 2);
          totalCell.value = { formula: newFormula };
        }
      });

      this.mergeCells(worksheet, index, "P", index, "Q");
      this.mergeCells(worksheet, index, "AT", index, "AU");
      this.mergeCells(worksheet, index, "AW", index, "AX");
      this.mergeCells(worksheet, index, "BB", index, "BC");
    }

    //fix totals
    const cols = ["AE", "AI", "AP", "AT", "AV", "AW", "BB"];
    cols.forEach((col) => {
      //last row replace totals
      const totalCell = worksheet.getCell(col + (itemRow + 5));
      const totalCellFormula = totalCell.formula;
      if (totalCellFormula) {
        let newFormula = replaceAll(totalCellFormula, "30", itemRow + 3);
        totalCell.value = { formula: newFormula };
      }
    });
    let cells = ["M6", "M7", "M9", "M15", "M16"];
    cells.forEach((cell) => {
      //last row replace totals
      const totalCell = worksheet.getCell(cell);
      const totalCellFormula = totalCell.formula;
      if (totalCellFormula) {
        let newFormula = replaceAll(totalCellFormula, "30", itemRow + 3);
        totalCell.value = { formula: newFormula };
      }
    });
    cells = ["M8"];
    cells.forEach((cell) => {
      //last row replace totals
      const totalCell = worksheet.getCell(cell);
      const totalCellFormula = totalCell.formula;
      if (totalCellFormula) {
        let newFormula = replaceAll(totalCellFormula, "34", itemRow + 7);
        totalCell.value = { formula: newFormula };
      }
    });
    cells = ["M14"];
    cells.forEach((cell) => {
      //last row replace totals
      const totalCell = worksheet.getCell(cell);
      const totalCellFormula = totalCell.formula;
      if (totalCellFormula) {
        let newFormula = replaceAll(totalCellFormula, "32", itemRow + 5);
        totalCell.value = { formula: newFormula };
      }
    });

    const totalCell32 = worksheet.getCell("S" + (itemRow + 5));
    const totalCellFormula32 = totalCell32.formula;
    let newFormula32 = replaceAll(totalCellFormula32, "30", itemRow + 3);
    totalCell32.value = { formula: newFormula32 };
    const totalCell33 = worksheet.getCell("S" + (itemRow + 6));
    const totalCellFormula33 = totalCell33.formula;
    let newFormula33 = replaceAll(totalCellFormula33, "30", itemRow + 3);
    newFormula33 = replaceAll(newFormula33, "32", itemRow + 5);
    totalCell33.value = { formula: newFormula33 };
    const totalCell34 = worksheet.getCell("S" + (itemRow + 7));
    const totalCellFormula34 = totalCell34.formula;
    let newFormula34 = replaceAll(totalCellFormula34, "30", itemRow + 3);
    newFormula34 = replaceAll(newFormula34, "33", itemRow + 6);
    totalCell34.value = { formula: newFormula34 };

    this.mergeCells(worksheet, itemRow + 5, "S", itemRow + 5, "W");
    this.mergeCells(worksheet, itemRow + 6, "S", itemRow + 6, "Z");
    this.mergeCells(worksheet, itemRow + 7, "S", itemRow + 7, "AC");
    this.mergeCells(worksheet, itemRow + 5, "AE", itemRow + 7, "AG");
    this.mergeCells(worksheet, itemRow + 5, "AN", itemRow + 7, "AO");
    this.mergeCells(worksheet, itemRow + 5, "AP", itemRow + 7, "AS");
    this.mergeCells(worksheet, itemRow + 5, "AT", itemRow + 7, "AU");
    this.mergeCells(worksheet, itemRow + 5, "AV", itemRow + 7, "AV");
    this.mergeCells(worksheet, itemRow + 5, "AW", itemRow + 7, "AX");
    this.mergeCells(worksheet, itemRow + 5, "BB", itemRow + 7, "BC");
    this.cloneWorksheet(workbook, worksheet, "Budget", {
      properties: { tabColor: { argb: tabColor } },
    });

    //get master codes
    const mcWorksheet = cloneDeep(template.getWorksheet("Master Codes"));
    this.cloneWorksheet(workbook, mcWorksheet, "Master Codes", {
      properties: { tabColor: { argb: tabColor } },
    });

    this.saveWorkbook(
      workbook,
      "budget-" + slugify(project.projectLocalId) + ".xlsx"
    );

    SystemService.dismissLoading();
  }

  async exportPO(project: Project, areaShapes, language = "en") {
    await SystemService.presentLoading("please-wait", true);
    const template = await this.importTemplate();
    const tabColor = "FF6600";
    const workbook = new Workbook();

    //get PO worksheet
    const poWorksheet = template.getWorksheet("po");
    const worksheet = cloneDeep(poWorksheet);
    worksheet.getCell("L7").value = new Date().toLocaleDateString();
    worksheet.getCell("F10").value = CustomersService.getCustomersDetails(
      project.customerId
    ).fullName;
    worksheet.getCell("F12").value = project.projectLocalId;
    worksheet.getCell("E29").value = UserService.user.displayName;

    const firstRow = 17;
    let itemRow = 17;
    for (
      let areaIndex = 0;
      areaIndex < project.projectAreaQuality.length;
      areaIndex++
    ) {
      const area = project.projectAreaQuality[areaIndex];
      for (let posIndex = 0; posIndex < area.shapes.length; posIndex++) {
        //copy row and style
        if (itemRow > firstRow) {
          worksheet.insertRow(itemRow, [], "i");
        }
        this.copyCellsStylesandValues(
          worksheet,
          itemRow,
          3,
          itemRow,
          17,
          false,
          null,
          firstRow
        );
        const row = worksheet.getRow(itemRow);
        const shape = areaShapes[areaIndex].shapes[posIndex] as Shape;
        const unitWeight = shape.getWeight(area.density);
        let totalQuantity = 0;
        area.courses.forEach((course) => {
          totalQuantity += course.quantityShapes[posIndex]
            ? course.quantityShapes[posIndex].quantity
            : 0;
        });
        row.getCell("D").value = area.datasheetId
          ? DatasheetsService.getDatasheetsById(area.datasheetId).productName
          : null;
        row.getCell("E").value = shape.shapeName;
        row.getCell("F").value = area.bricksAllocationAreaId
          ? ProjectsService.getBricksAllocationAreas(
              area.bricksAllocationAreaId
            )[0].bricksAllocationAreaName[language]
          : null;
        row.getCell("G").value = unitWeight;
        row.getCell("H").value = totalQuantity;
        row.getCell("I").value = project.setsAmount;
        //udate formulas
        const formula1 = worksheet.getCell("J" + firstRow).formula;
        row.getCell("J").value = {
          formula: replaceAll(formula1, firstRow, itemRow),
        };
        const formula2 = worksheet.getCell("K" + firstRow).formula;
        row.getCell("K").value = {
          formula: replaceAll(formula2, firstRow, itemRow),
        };
        row.height = 21;
        itemRow++;
      }
      const formula1 = worksheet.getCell("J" + (itemRow + 1)).formula;
      worksheet.getCell("J" + (itemRow + 1)).value = {
        formula: replaceAll(formula1, 18, itemRow),
      };
      const formula2 = worksheet.getCell("K" + (itemRow + 1)).formula;
      worksheet.getCell("K" + (itemRow + 1)).value = {
        formula: replaceAll(formula2, 18, itemRow),
      };

      for (let index = itemRow + 4; index <= itemRow + 8; index++) {
        this.mergeCells(worksheet, index, "E", index, "H");
      }
      this.setBorder(
        worksheet,
        "thin",
        false,
        false,
        false,
        true,
        itemRow + 4,
        8,
        itemRow + 8,
        8
      );
      this.mergeCells(worksheet, itemRow + 18, "D", itemRow + 18, "H");
      for (let index = itemRow + 19; index <= itemRow + 30; index++) {
        this.mergeCells(worksheet, index, "G", index, "H");
      }
      this.setBorder(
        worksheet,
        "thin",
        true,
        true,
        true,
        true,
        itemRow + 18,
        8,
        itemRow + 30,
        8
      );
    }

    this.cloneWorksheet(workbook, worksheet, "PO", {
      properties: { tabColor: { argb: tabColor } },
    });

    this.saveWorkbook(
      workbook,
      "po-" + slugify(project.projectLocalId) + ".xlsx"
    );

    SystemService.dismissLoading();
  }

  /* 
  UTILITIES
  **/

  async selectCurrency(): Promise<string> {
    return new Promise(async (resolve) => {
      const alert = await alertController.create({
        header: TranslationService.getTransl("currency", "Currency"),
        buttons: [
          {
            text: "USD",
            handler: async () => {
              resolve("USD");
            },
          },
          {
            text: "EUR",
            handler: async () => {
              resolve("EUR");
            },
          },
        ],
      });
      alert.present();
    });
  }

  checkSharedFormula(worksheet: Worksheet, endCol, endRow) {
    for (let row = 1; row <= endRow; row++) {
      for (let col = 1; col <= endCol; col++) {
        const cell = worksheet.getCell(row, col);
        if (cell.value && cell.value["sharedFormula"]) {
          console.log("sharedFormula", cell.address);
        }
        if (cell.value && cell.value["shareType"]) {
          console.log("shareType", cell.address);
        }
      }
    }
  }

  cloneRows(worksheet, numRows, numCols, sampleRow, copyToRow) {
    //copy styles and values
    for (let i = 0; i < numRows; i++) {
      const tmplRow = worksheet.getRow(sampleRow + i);
      const row = worksheet.getRow(copyToRow + i);
      for (let k = 1; k < numCols; k++) {
        row.getCell(k).style = cloneDeep(tmplRow.getCell(k).style);
        row.getCell(k).value = cloneDeep(tmplRow.getCell(k).value);
      }
    }
  }
  // Utility function to convert column letters to numbers
  columnToNumber(col) {
    if (typeof col === "number") {
      return col;
    }
    let column = 0,
      length = col.length;
    for (let i = 0; i < length; i++) {
      column += (col.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
  }

  // Utility function to convert column numbers to letters
  numberToColumn(number) {
    let column = "";
    while (number > 0) {
      let remainder = (number - 1) % 26;
      column = String.fromCharCode(65 + remainder) + column;
      number = Math.floor((number - 1) / 26);
    }
    return column;
  }

  // Function to check if a specific cell range is merged
  isRangeMerged(worksheet, row1, col1, row2, col2) {
    for (let row = row1; row <= row2; row++) {
      for (let col = col1; col <= col2; col++) {
        const cell = worksheet.getCell(row, col);
        if (cell.isMerged) {
          return true;
        }
      }
    }
    return false;
  }

  // Function to unmerge cells within a specific range
  unmergeCellsInRange(worksheet, row1, col1, row2, col2) {
    for (let row = row1; row <= row2; row++) {
      for (let col = col1; col <= col2; col++) {
        const cell = worksheet.getCell(row, col);
        worksheet.unMergeCells(cell.master.address);
      }
    }
  }

  // Function to copy styles from one cell to another
  copyCellStyles(sourceCell, targetCell) {
    targetCell.style = {
      font: sourceCell.font,
      alignment: sourceCell.alignment,
      border: sourceCell.border,
      fill: sourceCell.fill,
      numFmt: sourceCell.numFmt,
    };
  }

  // Function to copy a row with styles
  copyRowWithStyles(
    worksheet,
    sourceRowNumber,
    targetRowNumber,
    withValues = false
  ) {
    const sourceRow = worksheet.getRow(sourceRowNumber);
    const targetRow = worksheet.insertRow(targetRowNumber, []);

    sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const targetCell = targetRow.getCell(colNumber);
      if (withValues) targetCell.value = cell.value; // Copy the value
      this.copyCellStyles(cell, targetCell); // Copy the style
    });

    // Adjust the height of the target row to match the source row
    targetRow.height = sourceRow.height;
  }

  mergeCells(
    worksheet: Worksheet,
    row1: number,
    col1: string | number,
    row2: number,
    col2: string | number,
    border?: "thin" | "medium" | "thick"
  ) {
    this.unmergeCellsInRange(
      worksheet,
      row1,
      this.columnToNumber(col1),
      row2,
      this.columnToNumber(col2)
    );
    try {
      worksheet.mergeCells(
        row1,
        this.columnToNumber(col1),
        row2,
        this.columnToNumber(col2)
      );
      if (border)
        this.setBorder(
          worksheet,
          border,
          true,
          true,
          true,
          true,
          row1,
          col1,
          row2,
          col2
        );
    } catch (error) {
      this.mergedCellsErrors.push({
        worksheet,
        row1,
        col1,
        row2,
        col2,
        border,
      });
      Environment.log("mergeCells error", [
        worksheet,
        this.numberToColumn(this.columnToNumber(col1)) +
          row1 +
          ":" +
          this.numberToColumn(this.columnToNumber(col2)) +
          row2,
        this.isRangeMerged(
          worksheet,
          row1,
          this.columnToNumber(col1),
          row2,
          this.columnToNumber(col2)
        ),
        error,
      ]);
    }
  }

  mergeAllErrors() {
    const mergedCellsErrors = cloneDeep(this.mergedCellsErrors);
    this.mergedCellsErrors = [];
    mergedCellsErrors.forEach((cell) => {
      this.mergeCells(
        cell.worksheet,
        cell.row1,
        cell.col1,
        cell.row2,
        cell.col2,
        cell.border
      );
    });
  }

  copyCellsStylesandValues(
    worksheet: Worksheet,
    startRow,
    startCol,
    endRow,
    endCol,
    values: false,
    refCol?,
    refRow?
  ) {
    //copy cell styles
    for (let row = startRow; row <= endRow; row++) {
      let refCol1 = refCol;
      for (let col = startCol; col <= endCol; col++) {
        if (refCol) {
          worksheet.getCell(row, col).style = cloneDeep(
            worksheet.getCell(row, refCol1).style
          );
          if (values) {
            worksheet.getCell(row, col).value = cloneDeep(
              worksheet.getCell(row, refCol1).value
            );
          }
          refCol1++;
        } else if (refRow) {
          worksheet.getCell(row, col).style = cloneDeep(
            worksheet.getCell(refRow, col).style
          );
          if (values) {
            worksheet.getCell(row, col).value = cloneDeep(
              worksheet.getCell(refRow, col).value
            );
          }
        }
      }
    }
  }

  setBorder(
    worksheet: Worksheet,
    style: "thin" | "medium" | "thick",
    top: boolean,
    left: boolean,
    bottom: boolean,
    right: boolean,
    startRow,
    startCol,
    endRow,
    endCol,
    color = "000000"
  ) {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const border = {
          top: top ? { style, color: { argb: color } } : null,
          left: left ? { style, color: { argb: color } } : null,
          bottom: bottom ? { style, color: { argb: color } } : null,
          right: right ? { style, color: { argb: color } } : null,
        };
        worksheet.getCell(row, col).border = border;
      }
    }
  }

  cloneWorksheet(
    workbook: Workbook,
    templateWorksheet: Worksheet,
    name: string,
    options
  ): Worksheet {
    // Create a new worksheet in the workbook
    const worksheet = workbook.addWorksheet(name, options);

    // Copy basic worksheet properties
    const propertiesToClone = [
      "views",
      "pageSetup",
      "headerFooter",
      "rowBreaks",
      "autoFilter",
      "conditionalFormattings",
      "dataValidations",
      "sheetProtection",
      "tables",
    ];
    propertiesToClone.forEach((property) => {
      if (templateWorksheet[property]) {
        worksheet[property] = cloneDeep(templateWorksheet[property]);
      }
    });

    // Clone columns
    templateWorksheet.columns.forEach((col, colIndex) => {
      const targetCol = worksheet.getColumn(colIndex + 1);
      Object.assign(targetCol, col);
    });

    // Clone rows and cells
    templateWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const targetRow = worksheet.getRow(rowNumber);
      targetRow.height = row.height;
      row.eachCell({ includeEmpty: true }, (cell, cellNumber) => {
        const targetCell = targetRow.getCell(cellNumber);
        targetCell.value = cloneDeep(cell.value); // Clone cell value
        targetCell.style = cloneDeep(cell.style); // Clone cell styles
        targetCell.border = cloneDeep(cell.border);
        targetCell.fill = cloneDeep(cell.fill);
        targetCell.font = cloneDeep(cell.font);
        targetCell.alignment = cloneDeep(cell.alignment);
      });
      targetRow.commit();
    });

    // Clone merged cells using model.merges
    const mergedCells = templateWorksheet.model.merges || [];
    mergedCells.forEach((mergeRange) => {
      worksheet.mergeCells(mergeRange);
    });

    return worksheet;
  }
  /*

  cloneWorksheet(
    workbook: Workbook,
    templateWorksheet: Worksheet,
    name: string,
    options
  ): Worksheet {
    // create a sheet with red tab colour and shapeType
    const worksheet = workbook.addWorksheet(name, options);
    
    const values = [
      "_columns",
      "_keys",
      "_merges",
      "_rows",
      "autoFilter",
      "conditionalFormattings",
      "dataValidations",
      "headerFooter",
      "pageSetup",
      "rowBreaks",
      "sheetProtection",
      "tables",
      "views",
    ];
    const template = cloneDeep(templateWorksheet);
    values.forEach((value) => {
      worksheet[value] = cloneDeep(template[value]);
    });

    return worksheet;
  }*/

  async addRefraLogo(
    workbook: Workbook,
    worksheet: Worksheet,
    col,
    row,
    width,
    height
  ): Promise<null> {
    return new Promise(async (resolve, reject) => {
      try {
        const url = await StorageService.getUrl(
          "system/LOGO_Refractory_Solutions.jpg"
        );
        const image = await FileSystemService.storeAndLoadImage(url);
        const imageId = workbook.addImage({
          base64: image.src,
          extension: "jpeg",
        });
        worksheet.addImage(imageId, {
          tl: { col: col + 0.1, row: row + 0.1 },
          ext: { width: width, height: height },
        });
        resolve(null);
      } catch (error) {
        Environment.log("addRefraLogo error", error);
        reject(error);
      }
    });
  }

  async importTemplate(): Promise<Workbook> {
    const template = new Workbook();
    const file = await (
      await fetch(`${window.location.origin}/assets/trasteel/template.xlsx`)
    ).arrayBuffer();
    await template.xlsx.load(file);
    return template;
  }

  saveWorkbook(workbook: Workbook, name: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fs.saveAs(blob, name);
    });
  }
}
export const XLSXExportService = new XLSXExportController();
