import {differenceInDays} from "date-fns";
import {toNumber} from "lodash";

export class ARPCModel {
  //Model fields
  cellDate: Array<string> = [
    new Date().toISOString(),
    new Date().toISOString(),
    new Date().toISOString(),
  ];
  airmVRange: Array<number> = [0, 0, 0];
  battHUD: boolean = false;
  battINT: number;
  battEXT: number;
  settingsDone: boolean = false;
  scrubberTime: number;
  lidCheck: boolean = false;
  loopCheck: boolean = false;
  negativePressCheck: boolean = false;
  o2LeakTest: boolean = false;
  positivePressCheck: boolean = false;
  diluentLeakTest: boolean = false;
  openO2Valve: boolean = false;
  loopInCC: boolean = false;
  hudOn: boolean = false;
  calController: boolean = false;
  calHUD: boolean = false;
  o2mVRange: Array<number> = [0, 0, 0];
  o2IP: number;
  dilIP: number;
  bailout: number;
  approved: boolean = false;

  constructor(doc?: any) {
    if (doc) {
      if (doc.cellDate) {
        this.cellDate = [];
        doc.cellDate.forEach((date) => {
          this.cellDate.push(new Date(date).toISOString());
        });
      }
      if (doc.airmVRange) {
        this.airmVRange = [];
        doc.airmVRange.forEach((data) => {
          this.airmVRange.push(toNumber(data));
        });
      }
      if (doc.battHUD) {
        this.battHUD = doc.battHUD;
      }
      if (doc.battINT) {
        this.battINT = toNumber(doc.battINT);
      }
      if (doc.battEXT) {
        this.battEXT = toNumber(doc.battEXT);
      }
      if (doc.settingsDone) {
        this.settingsDone = doc.settingsDone;
      }
      if (doc.scrubberTime) {
        this.scrubberTime = toNumber(doc.scrubberTime);
      }
      if (doc.loopCheck) {
        this.loopCheck = doc.loopCheck;
      }
      if (doc.lidCheck) {
        this.lidCheck = doc.lidCheck;
      }
      if (doc.negativePressCheck) {
        this.negativePressCheck = doc.negativePressCheck;
      }
      if (doc.o2LeakTest) {
        this.o2LeakTest = doc.o2LeakTest;
      }
      if (doc.positivePressCheck) {
        this.positivePressCheck = doc.positivePressCheck;
      }
      if (doc.diluentLeakTest) {
        this.diluentLeakTest = doc.diluentLeakTest;
      }
      if (doc.openO2Valve) {
        this.openO2Valve = doc.openO2Valve;
      }
      if (doc.loopInCC) {
        this.loopInCC = doc.loopInCC;
      }
      if (doc.hudOn) {
        this.hudOn = doc.hudOn;
      }
      if (doc.calController) {
        this.calController = doc.calController;
      }
      if (doc.calHUD) {
        this.calHUD = doc.calHUD;
      }
      if (doc.airmVRange) {
        this.o2mVRange = [];
        doc.o2mVRange.forEach((data) => {
          this.o2mVRange.push(toNumber(data));
        });
      }
      if (doc.o2IP) {
        this.o2IP = toNumber(doc.o2IP);
      }
      if (doc.dilIP) {
        this.dilIP = toNumber(doc.dilIP);
      }
      if (doc.bailout) {
        this.bailout = toNumber(doc.bailout);
      }
      if (doc.approved) {
        this.approved = doc.approved;
      }
    }
  }

  checkCellDate(cellNumber: number) {
    if (this.cellDate[cellNumber]) {
      /*let a = moment(this.cellDate[cellNumber]);
      let b = moment(new Date());
      let diff = a.diff(b, "years", true);*/
      // Calculate the difference in days
      const daysDiff = differenceInDays(this.cellDate[cellNumber], new Date());

      // Convert days to years
      const yearsDiff = daysDiff / 365.25;

      return yearsDiff < -1 ? true : false;
    } else {
      return false;
    }
  }

  checkAirMvRange(cellNumber: number) {
    if (this.airmVRange[cellNumber]) {
      return this.airmVRange[cellNumber] < 9 || this.airmVRange[cellNumber] > 13
        ? true
        : false;
    } else {
      return false;
    }
  }

  checkO2MvRange(cellNumber: number) {
    if (this.o2mVRange[cellNumber]) {
      //return Math.abs(this.o2mVRange[cellNumber] / (this.airmVRange[cellNumber] * 4.76)) < 0.9 ? true : false
      return Math.abs(
        this.airmVRange[cellNumber] * 4.76 - this.o2mVRange[cellNumber]
      ) > 2
        ? true
        : false;
    } else {
      return false;
    }
  }

  checkApproved() {
    this.approved =
      this.airmVRange[0] > 0 &&
      this.airmVRange[1] > 0 &&
      this.airmVRange[2] > 0 &&
      this.bailout > 0 &&
      this.battEXT > 0 &&
      this.battHUD &&
      this.battINT > 0 &&
      this.calController &&
      this.calHUD &&
      this.diluentLeakTest &&
      this.hudOn &&
      this.lidCheck &&
      this.loopCheck &&
      this.loopInCC &&
      this.negativePressCheck &&
      this.o2LeakTest &&
      this.o2mVRange[0] > 0 &&
      this.o2mVRange[1] > 0 &&
      this.o2mVRange[2] > 0 &&
      this.openO2Valve &&
      this.positivePressCheck &&
      this.scrubberTime > 0 &&
      this.settingsDone;
  }
}
