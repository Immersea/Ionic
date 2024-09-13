//import { GeoFire } from "./firebase";
import {
  cloneDeep,
  forOwn,
  isEqual,
  isNumber,
  isString,
  orderBy,
  reduce,
  round,
  toNumber,
} from "lodash";
import { CURRENCY_API, LOCATIONIQ_GEOCODE } from "../global/env";
import { SystemService } from "../services/common/system";
import { LocationIQ } from "../services/common/map";
import { differenceInMilliseconds, format, parseISO } from "date-fns";

export function compareDates(a, b) {
  /*const date1 = moment(a);
  var date2 = null;
  if (b.seconds) {
    date2 = moment(b.seconds * 1000);
  } else {
    date2 = moment(b);
  }
  const dateDiff = moment.duration(date1.diff(date2)).asMilliseconds();
  return dateDiff;*/

  // Create date objects from input `a` and `b`
  const date1 =
    typeof a === "string" || a instanceof String
      ? parseISO(a.toString())
      : new Date(a);
  let date2 = null;

  // Check if `b` is an object with a 'seconds' property or a standard date input
  if (b && typeof b.seconds === "number") {
    date2 = new Date(b.seconds * 1000); // Convert Unix seconds to JavaScript date
  } else {
    date2 =
      typeof b === "string" || b instanceof String
        ? parseISO(b.toString())
        : new Date(b);
  }

  // Calculate the difference in milliseconds between the two dates
  const dateDiff = differenceInMilliseconds(date1, date2);

  return dateDiff;
}

export function distance(lat1, lon1, lat2, lon2, returnNumber = false) {
  const R = 6371; // km (change this constant to get miles)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (!returnNumber) {
    if (d > 1) return Math.round(d) + "km";
    else if (d <= 1) return Math.round(d * 1000) + "m";
  } else {
    if (d > 1) return Math.round(d);
    else if (d <= 1) return Math.round(d * 1000);
  }

  return d;
}

export async function forwardGeocode(address): Promise<LocationIQ[]> {
  return new Promise(async (resolve, reject) => {
    const req =
      "https://eu1.locationiq.com/v1/search?addressdetails=1&key=" +
      LOCATIONIQ_GEOCODE +
      "&q=" +
      slugify(address, true) +
      "&format=json&accept-language=en";
    const response = await fetch(req);
    if (response.ok) {
      resolve(response.json());
    } else {
      reject(response.text());
    }
  });
}

export async function reverseGeocode(lat, lon): Promise<LocationIQ> {
  return new Promise(async (resolve, reject) => {
    const req =
      "https://eu1.locationiq.com/v1/reverse.php?addressdetails=1&key=" +
      LOCATIONIQ_GEOCODE +
      "&lat=" +
      lat +
      "&lon=" +
      lon +
      "&format=json&accept-language=en";
    const response = await fetch(req);
    if (response.ok) {
      resolve(response.json());
    } else {
      reject(response.text);
    }
  });
}

export function formatNumber(value: number, currency?: "EUR" | "USD"): string {
  if (!isNumber(toNumber(value))) value = 0;
  const options = { style: "decimal", currency: null };
  if (currency) {
    options.style = "currency";
    options.currency = currency;
  }
  return new Intl.NumberFormat().format(value);
}

export function slugify(string, url = false) {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");
  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, url ? "+" : "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(!url ? /[^\w\-]+/g : "", "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function replaceAll(str, value, repl): string {
  let newString = null;
  if (str) {
    var regex = new RegExp(value, "g");
    newString = str.replace(regex, repl);
  }
  return newString;
}

export function convertCurrency(symbols = "USD,EUR,CHF") {
  return new Promise(async (resolve, reject) => {
    const url =
      "https://corsproxy.io/?http://api.exchangeratesapi.io/v1/latest?access_key=" +
      CURRENCY_API +
      "&symbols=" +
      symbols +
      "&format=1";
    try {
      const response = await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "omit", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      });

      if (response.ok) {
        resolve(response.json());
      } else {
        reject(response.text);
      }
    } catch (error) {
      reject(error);
    }
  });
}

const TOOLBAR_HEIGHT = 56;
const IOS_TOOLBAR_HEIGHT = 44;

export function setCoverHeight() {
  document.documentElement.style.setProperty(
    "--coverHeight",
    getCoverHeight() + "px"
  );
  document.documentElement.style.setProperty(
    "--coverHeightModal",
    getCoverHeight() - 25 + "px"
  );
}

function getCoverHeight() {
  return (document.documentElement.clientHeight * 25) / 100;
}

export function mapHeight(item, modal = false) {
  let mapHeight = 0;
  if (SystemService.deviceInfo.operatingSystem !== "ios") {
    mapHeight =
      window.innerHeight -
      (modal
        ? getCoverHeight()
        : item && item.coverURL
          ? getCoverHeight()
          : 0) -
      TOOLBAR_HEIGHT * 2;
  } else {
    mapHeight =
      window.innerHeight -
      (modal
        ? getCoverHeight()
        : item && item.coverURL
          ? getCoverHeight()
          : 0) -
      IOS_TOOLBAR_HEIGHT +
      TOOLBAR_HEIGHT;
  }
  document.documentElement.style.setProperty("--mapHeight", mapHeight + "px");
  return mapHeight - 20; //20 for the border of avatar
}

export function slideHeight(item?, toolbars = 2, modal = false) {
  const modalUpperSpace = 0;
  if (SystemService.deviceInfo.operatingSystem !== "ios") {
    return (
      window.innerHeight -
      (item && item.coverURL ? getCoverHeight() : 0) -
      TOOLBAR_HEIGHT * toolbars -
      (modal
        ? (document.documentElement.clientHeight * modalUpperSpace) / 100
        : 0)
    );
  } else {
    return (
      window.innerHeight -
      (item && item.coverURL ? getCoverHeight() : 0) -
      IOS_TOOLBAR_HEIGHT +
      TOOLBAR_HEIGHT * (toolbars - 1) -
      (modal
        ? (document.documentElement.clientHeight * modalUpperSpace) / 100
        : 0)
    );
  }
}

export function fabButtonTopMargin(toolbars) {
  if (SystemService.deviceInfo.operatingSystem !== "ios") {
    return toolbars * TOOLBAR_HEIGHT + getCoverHeight();
  } else {
    if (toolbars == 2) {
      return IOS_TOOLBAR_HEIGHT + TOOLBAR_HEIGHT + getCoverHeight();
    } else {
      return TOOLBAR_HEIGHT + getCoverHeight();
    }
  }
}

export function fabButtonTopMarginString(toolbars) {
  return -fabButtonTopMargin(toolbars) + "px";
  /*return (
    "calc(" +
    -fabButtonTopMargin(toolbars) +
    "px + var(--ion-safe-area-top, 0))"
  );*/
}

export async function getUserIp() {
  const req = "https://api.ipify.org/?format=json";
  let response = await fetch(req);
  return await response.json();
}

export async function getUserTime(server = false) {
  if (server) {
    const ip = await getUserIp();
    const req = "https://worldtimeapi.org/api/ip/" + ip.ip + ".json";
    const response = await fetch(req);
    try {
      const res = await response.json();
      return new Date(res.datetime);
    } catch (error) {
      return new Date();
    }
  } else {
    return new Date();
  }
}

export function calculateColumns(items) {
  let columns = null;
  switch (items) {
    case 1:
      columns = {
        sm: 12,
        md: 12,
        lg: 12,
      };
      break;
    case 2:
      columns = {
        sm: 12,
        md: 6,
        lg: 6,
      };
      break;
    default:
      columns = {
        sm: 12,
        md: 6,
        lg: 4,
      };
      break;
  }
  return columns;
}

export function getRandomId() {
  return "_" + Math.random().toString(36).slice(2, 9);
}

export function reorderItems(items, reorder) {
  const itemsBackup = cloneDeep(items);
  const itemMove = itemsBackup.splice(reorder.detail.from, 1)[0];
  itemsBackup.splice(reorder.detail.to, 0, itemMove);
  itemsBackup.forEach((x, order) => {
    x.order = order;
  });
  reorder.detail.complete();
  return orderBy(itemsBackup, "order");
}

export function roundDecimals(N: number, n: number): number {
  n = toNumber(n);
  return toNumber(round(N, n).toFixed(n));
}

export function roundDecimalsToString(N: number, n: number): string {
  n = toNumber(n);
  return round(N, n).toFixed(n);
}

export function convertTextMultiLanguage(obj) {
  const multiLanguageObj = {};
  Object.keys(obj).map((key) => {
    multiLanguageObj[key.toLowerCase()] = obj[key];
  });
  return multiLanguageObj;
}

export function listDifferences(object1, object2) {
  const differences = reduce(
    object1,
    (result, value, key) => {
      if (!isEqual(value, object2[key])) {
        result[key] = {
          object1: value,
          object2: object2[key],
        };
      }
      return result;
    },
    {}
  );

  forOwn(object2, (value, key) => {
    if (!(key in object1)) {
      differences[key] = {
        object1: undefined,
        object2: value,
      };
    }
  });

  return differences;
}

export function sanitizeForJSON(obj) {
  if (typeof obj !== "object" || obj === null) {
    // Base case: if it's not an object or array, return it as is
    return obj;
  }
  if (Array.isArray(obj)) {
    // Process each item in the array
    return obj
      .map(this.sanitizeForJSON)
      .filter(
        (item) =>
          item !== undefined &&
          !Number.isNaN(item) &&
          item !== Infinity &&
          item !== -Infinity
      );
  }
  // Process each key in the object
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (
      typeof value !== "function" &&
      value !== undefined &&
      !Number.isNaN(value) &&
      value !== Infinity &&
      value !== -Infinity
    ) {
      acc[key] = this.sanitizeForJSON(value);
    } else {
      console.log("error value", obj, key, value);
    }
    return acc;
  }, {});
}

export function showDate(
  value,
  datePresentation:
    | "date"
    | "date-time"
    | "month"
    | "month-year"
    | "time"
    | "time-date"
    | "year",
  short = false
) {
  if (isString(value)) {
    const date = parseISO(value);
    let formattedDate, formatString;
    switch (datePresentation) {
      case "date":
        formatString = short ? "dd/MM/yyyy" : "PP";
        formattedDate = format(date, formatString); // Locale-specific date
        break;
      case "date-time":
        formatString = short ? "dd/MM/yyyy HH:mm" : "PPp";
        formattedDate = format(date, formatString); // Locale-specific date and time
        break;
      case "time-date":
        formatString = short ? "HH:mm dd/MM/yyyy" : "PPp";
        formattedDate = format(date, formatString); // Locale-specific date and time
        break;
      case "month":
        formattedDate = format(date, "MMM"); // Month number (not locale-specific usually)
        break;
      case "month-year":
        formattedDate = format(date, "MMM/yyyy"); // Locale-specific month and year
        break;
      case "time":
        formatString = short ? "HH:mm:ss" : "pp";
        formattedDate = format(date, formatString); // Locale-specific time
        break;
      case "year":
        formattedDate = format(date, "yyyy"); // Year (not locale-specific)
        break;
      default:
        formattedDate = date.toString(); // Default to ISO string if no match
    }
    return formattedDate;
  } else {
    return value;
  }
}

export function isValidDate(dateString: string) {
  return !isNaN(new Date(dateString).getTime());
}

export function downloadJson(data: object, filename: string) {
  const jsonStr = JSON.stringify(data);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function isElectron() {
  // Check if the electronAPI is available
  return (
    typeof window !== "undefined" &&
    window["electronAPI"] &&
    window["electronAPI"].isElectron
  );
}

export function isLocalhost(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Check if the hostname is one of the localhost addresses
    return (
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
    );
  } catch (error) {
    console.error("Invalid URL:", error);
    return false;
  }
}
