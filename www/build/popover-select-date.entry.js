import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { E as Environment } from './env-9be68260.js';
import { f as format$1, d as dateFns } from './index-9b61a50b.js';
import { aQ as showDate } from './utils-cbf49763.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './_commonjsHelpers-1a56c7bc.js';
import './lodash-68d560b6.js';
import './map-dae4acde.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

/**
 * Returns the formatted time zone name of the provided `timeZone` or the current
 * system time zone if omitted, accounting for DST according to the UTC value of
 * the date.
 */
function tzIntlTimeZoneName(length, date, options) {
    const dtf = getDTF(length, options.timeZone, options.locale);
    return 'formatToParts' in dtf ? partsTimeZone(dtf, date) : hackyTimeZone(dtf, date);
}
function partsTimeZone(dtf, date) {
    const formatted = dtf.formatToParts(date);
    for (let i = formatted.length - 1; i >= 0; --i) {
        if (formatted[i].type === 'timeZoneName') {
            return formatted[i].value;
        }
    }
    return undefined;
}
function hackyTimeZone(dtf, date) {
    const formatted = dtf.format(date).replace(/\u200E/g, '');
    const tzNameMatch = / [\w-+ ]+$/.exec(formatted);
    return tzNameMatch ? tzNameMatch[0].substr(1) : '';
}
// If a locale has been provided `en-US` is used as a fallback in case it is an
// invalid locale, otherwise the locale is left undefined to use the system locale.
function getDTF(length, timeZone, locale) {
    return new Intl.DateTimeFormat(locale ? [locale.code, 'en-US'] : undefined, {
        timeZone: timeZone,
        timeZoneName: length,
    });
}

/**
 * Returns the [year, month, day, hour, minute, seconds] tokens of the provided
 * `date` as it will be rendered in the `timeZone`.
 */
function tzTokenizeDate(date, timeZone) {
    const dtf = getDateTimeFormat(timeZone);
    return 'formatToParts' in dtf ? partsOffset(dtf, date) : hackyOffset(dtf, date);
}
const typeToPos = {
    year: 0,
    month: 1,
    day: 2,
    hour: 3,
    minute: 4,
    second: 5,
};
function partsOffset(dtf, date) {
    try {
        const formatted = dtf.formatToParts(date);
        const filled = [];
        for (let i = 0; i < formatted.length; i++) {
            const pos = typeToPos[formatted[i].type];
            if (pos !== undefined) {
                filled[pos] = parseInt(formatted[i].value, 10);
            }
        }
        return filled;
    }
    catch (error) {
        if (error instanceof RangeError) {
            return [NaN];
        }
        throw error;
    }
}
function hackyOffset(dtf, date) {
    const formatted = dtf.format(date);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted);
    // const [, fMonth, fDay, fYear, fHour, fMinute, fSecond] = parsed
    // return [fYear, fMonth, fDay, fHour, fMinute, fSecond]
    return [
        parseInt(parsed[3], 10),
        parseInt(parsed[1], 10),
        parseInt(parsed[2], 10),
        parseInt(parsed[4], 10),
        parseInt(parsed[5], 10),
        parseInt(parsed[6], 10),
    ];
}
// Get a cached Intl.DateTimeFormat instance for the IANA `timeZone`. This can be used
// to get deterministic local date/time output according to the `en-US` locale which
// can be used to extract local time parts as necessary.
const dtfCache = {};
function getDateTimeFormat(timeZone) {
    if (!dtfCache[timeZone]) {
        // New browsers use `hourCycle`, IE and Chrome <73 does not support it and uses `hour12`
        const testDateFormatted = new Intl.DateTimeFormat('en-US', {
            hourCycle: 'h23',
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date('2014-06-25T04:00:00.123Z'));
        const hourCycleSupported = testDateFormatted === '06/25/2014, 00:00:00' ||
            testDateFormatted === '‎06‎/‎25‎/‎2014‎ ‎00‎:‎00‎:‎00';
        dtfCache[timeZone] = hourCycleSupported
            ? new Intl.DateTimeFormat('en-US', {
                hourCycle: 'h23',
                timeZone: timeZone,
                year: 'numeric',
                month: 'numeric',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
            : new Intl.DateTimeFormat('en-US', {
                hour12: false,
                timeZone: timeZone,
                year: 'numeric',
                month: 'numeric',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
    }
    return dtfCache[timeZone];
}

/**
 * Use instead of `new Date(Date.UTC(...))` to support years below 100 which doesn't work
 * otherwise due to the nature of the
 * [`Date` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#interpretation_of_two-digit_years.
 *
 * For `Date.UTC(...)`, use `newDateUTC(...).getTime()`.
 */
function newDateUTC(fullYear, month, day, hour, minute, second, millisecond) {
    const utcDate = new Date(0);
    utcDate.setUTCFullYear(fullYear, month, day);
    utcDate.setUTCHours(hour, minute, second, millisecond);
    return utcDate;
}

const MILLISECONDS_IN_HOUR$1 = 3600000;
const MILLISECONDS_IN_MINUTE$2 = 60000;
const patterns$1 = {
    timezone: /([Z+-].*)$/,
    timezoneZ: /^(Z)$/,
    timezoneHH: /^([+-]\d{2})$/,
    timezoneHHMM: /^([+-])(\d{2}):?(\d{2})$/,
};
// Parse constious time zone offset formats to an offset in milliseconds
function tzParseTimezone(timezoneString, date, isUtcDate) {
    // Empty string
    if (!timezoneString) {
        return 0;
    }
    // Z
    let token = patterns$1.timezoneZ.exec(timezoneString);
    if (token) {
        return 0;
    }
    let hours;
    let absoluteOffset;
    // ±hh
    token = patterns$1.timezoneHH.exec(timezoneString);
    if (token) {
        hours = parseInt(token[1], 10);
        if (!validateTimezone(hours)) {
            return NaN;
        }
        return -(hours * MILLISECONDS_IN_HOUR$1);
    }
    // ±hh:mm or ±hhmm
    token = patterns$1.timezoneHHMM.exec(timezoneString);
    if (token) {
        hours = parseInt(token[2], 10);
        const minutes = parseInt(token[3], 10);
        if (!validateTimezone(hours, minutes)) {
            return NaN;
        }
        absoluteOffset = Math.abs(hours) * MILLISECONDS_IN_HOUR$1 + minutes * MILLISECONDS_IN_MINUTE$2;
        return token[1] === '+' ? -absoluteOffset : absoluteOffset;
    }
    // IANA time zone
    if (isValidTimezoneIANAString(timezoneString)) {
        date = new Date(date || Date.now());
        const utcDate = isUtcDate ? date : toUtcDate(date);
        const offset = calcOffset(utcDate, timezoneString);
        const fixedOffset = isUtcDate ? offset : fixOffset(date, offset, timezoneString);
        return -fixedOffset;
    }
    return NaN;
}
function toUtcDate(date) {
    return newDateUTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}
function calcOffset(date, timezoneString) {
    const tokens = tzTokenizeDate(date, timezoneString);
    // ms dropped because it's not provided by tzTokenizeDate
    const asUTC = newDateUTC(tokens[0], tokens[1] - 1, tokens[2], tokens[3] % 24, tokens[4], tokens[5], 0).getTime();
    let asTS = date.getTime();
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return asUTC - asTS;
}
function fixOffset(date, offset, timezoneString) {
    const localTS = date.getTime();
    // Our UTC time is just a guess because our offset is just a guess
    let utcGuess = localTS - offset;
    // Test whether the zone matches the offset for this ts
    const o2 = calcOffset(new Date(utcGuess), timezoneString);
    // If so, offset didn't change, and we're done
    if (offset === o2) {
        return offset;
    }
    // If not, change the ts by the difference in the offset
    utcGuess -= o2 - offset;
    // If that gives us the local time we want, we're done
    const o3 = calcOffset(new Date(utcGuess), timezoneString);
    if (o2 === o3) {
        return o2;
    }
    // If it's different, we're in a hole time. The offset has changed, but we don't adjust the time
    return Math.max(o2, o3);
}
function validateTimezone(hours, minutes) {
    return -23 <= hours && hours <= 23 && (minutes == null || (0 <= minutes && minutes <= 59));
}
const validIANATimezoneCache = {};
function isValidTimezoneIANAString(timeZoneString) {
    if (validIANATimezoneCache[timeZoneString])
        return true;
    try {
        new Intl.DateTimeFormat(undefined, { timeZone: timeZoneString });
        validIANATimezoneCache[timeZoneString] = true;
        return true;
    }
    catch (error) {
        return false;
    }
}

const MILLISECONDS_IN_MINUTE$1 = 60 * 1000;
const formatters = {
    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function (date, token, options) {
        const timezoneOffset = getTimeZoneOffset(options.timeZone, date);
        if (timezoneOffset === 0) {
            return 'Z';
        }
        switch (token) {
            // Hours and optional minutes
            case 'X':
                return formatTimezoneWithOptionalMinutes(timezoneOffset);
            // Hours, minutes and optional seconds without `:` delimeter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `XX`
            case 'XXXX':
            case 'XX': // Hours and minutes without `:` delimeter
                return formatTimezone(timezoneOffset);
            // Hours, minutes and optional seconds with `:` delimeter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `XXX`
            case 'XXXXX':
            case 'XXX': // Hours and minutes with `:` delimeter
            default:
                return formatTimezone(timezoneOffset, ':');
        }
    },
    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function (date, token, options) {
        const timezoneOffset = getTimeZoneOffset(options.timeZone, date);
        switch (token) {
            // Hours and optional minutes
            case 'x':
                return formatTimezoneWithOptionalMinutes(timezoneOffset);
            // Hours, minutes and optional seconds without `:` delimeter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `xx`
            case 'xxxx':
            case 'xx': // Hours and minutes without `:` delimeter
                return formatTimezone(timezoneOffset);
            // Hours, minutes and optional seconds with `:` delimeter
            // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
            // so this token always has the same output as `xxx`
            case 'xxxxx':
            case 'xxx': // Hours and minutes with `:` delimeter
            default:
                return formatTimezone(timezoneOffset, ':');
        }
    },
    // Timezone (GMT)
    O: function (date, token, options) {
        const timezoneOffset = getTimeZoneOffset(options.timeZone, date);
        switch (token) {
            // Short
            case 'O':
            case 'OO':
            case 'OOO':
                return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
            // Long
            case 'OOOO':
            default:
                return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
    },
    // Timezone (specific non-location)
    z: function (date, token, options) {
        switch (token) {
            // Short
            case 'z':
            case 'zz':
            case 'zzz':
                return tzIntlTimeZoneName('short', date, options);
            // Long
            case 'zzzz':
            default:
                return tzIntlTimeZoneName('long', date, options);
        }
    },
};
function getTimeZoneOffset(timeZone, originalDate) {
    const timeZoneOffset = timeZone
        ? tzParseTimezone(timeZone, originalDate, true) / MILLISECONDS_IN_MINUTE$1
        : originalDate?.getTimezoneOffset() ?? 0;
    if (Number.isNaN(timeZoneOffset)) {
        throw new RangeError('Invalid time zone specified: ' + timeZone);
    }
    return timeZoneOffset;
}
function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? '-' : '';
    let output = Math.abs(number).toString();
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return sign + output;
}
function formatTimezone(offset, delimiter = '') {
    const sign = offset > 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
    const minutes = addLeadingZeros(Math.floor(absOffset % 60), 2);
    return sign + hours + delimiter + minutes;
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
        const sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
}
function formatTimezoneShort(offset, delimiter = '') {
    const sign = offset > 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
        return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}

/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    utcDate.setUTCFullYear(date.getFullYear());
    return +date - +utcDate;
}

/** Regex to identify the presence of a time zone specifier in a date string */
const tzPattern = /(Z|[+-]\d{2}(?::?\d{2})?| UTC| [a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?)$/;

const MILLISECONDS_IN_HOUR = 3600000;
const MILLISECONDS_IN_MINUTE = 60000;
const DEFAULT_ADDITIONAL_DIGITS = 2;
const patterns = {
    dateTimePattern: /^([0-9W+-]+)(T| )(.*)/,
    datePattern: /^([0-9W+-]+)(.*)/,
    plainTime: /:/,
    // year tokens
    YY: /^(\d{2})$/,
    YYY: [
        /^([+-]\d{2})$/, // 0 additional digits
        /^([+-]\d{3})$/, // 1 additional digit
        /^([+-]\d{4})$/, // 2 additional digits
    ],
    YYYY: /^(\d{4})/,
    YYYYY: [
        /^([+-]\d{4})/, // 0 additional digits
        /^([+-]\d{5})/, // 1 additional digit
        /^([+-]\d{6})/, // 2 additional digits
    ],
    // date tokens
    MM: /^-(\d{2})$/,
    DDD: /^-?(\d{3})$/,
    MMDD: /^-?(\d{2})-?(\d{2})$/,
    Www: /^-?W(\d{2})$/,
    WwwD: /^-?W(\d{2})-?(\d{1})$/,
    HH: /^(\d{2}([.,]\d*)?)$/,
    HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
    HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
    // time zone tokens (to identify the presence of a tz)
    timeZone: tzPattern,
};
/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If an argument is a string, the function tries to parse it.
 * Function accepts complete ISO 8601 formats as well as partial implementations.
 * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
 * If the function cannot parse the string or the values are invalid, it returns Invalid Date.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 * All *date-fns* functions will throw `RangeError` if `options.additionalDigits` is not 0, 1, 2 or undefined.
 *
 * @param argument the value to convert
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 * @param {0|1|2} [options.additionalDigits=2] - the additional number of digits in the extended year format
 * @param {string} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
 *
 * @returns the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
 *
 * @example
 * // Convert string '2014-02-11T11:30:30' to date:
 * const result = toDate('2014-02-11T11:30:30')
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert string '+02014101' to date,
 * // if the additional number of digits in the extended year format is 1:
 * const result = toDate('+02014101', {additionalDigits: 1})
 * //=> Fri Apr 11 2014 00:00:00
 */
function toDate(argument, options = {}) {
    if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
    }
    if (argument === null) {
        return new Date(NaN);
    }
    const additionalDigits = options.additionalDigits == null ? DEFAULT_ADDITIONAL_DIGITS : Number(options.additionalDigits);
    if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
        throw new RangeError('additionalDigits must be 0, 1 or 2');
    }
    // Clone the date
    if (argument instanceof Date ||
        (typeof argument === 'object' && Object.prototype.toString.call(argument) === '[object Date]')) {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
    }
    else if (typeof argument === 'number' ||
        Object.prototype.toString.call(argument) === '[object Number]') {
        return new Date(argument);
    }
    else if (!(Object.prototype.toString.call(argument) === '[object String]')) {
        return new Date(NaN);
    }
    const dateStrings = splitDateString(argument);
    const { year, restDateString } = parseYear(dateStrings.date, additionalDigits);
    const date = parseDate(restDateString, year);
    if (date === null || isNaN(date.getTime())) {
        return new Date(NaN);
    }
    if (date) {
        const timestamp = date.getTime();
        let time = 0;
        let offset;
        if (dateStrings.time) {
            time = parseTime(dateStrings.time);
            if (time === null || isNaN(time)) {
                return new Date(NaN);
            }
        }
        if (dateStrings.timeZone || options.timeZone) {
            offset = tzParseTimezone(dateStrings.timeZone || options.timeZone, new Date(timestamp + time));
            if (isNaN(offset)) {
                return new Date(NaN);
            }
        }
        else {
            // get offset accurate to hour in time zones that change offset
            offset = getTimezoneOffsetInMilliseconds(new Date(timestamp + time));
            offset = getTimezoneOffsetInMilliseconds(new Date(timestamp + time + offset));
        }
        return new Date(timestamp + time + offset);
    }
    else {
        return new Date(NaN);
    }
}
function splitDateString(dateString) {
    const dateStrings = {};
    let parts = patterns.dateTimePattern.exec(dateString);
    let timeString;
    if (!parts) {
        parts = patterns.datePattern.exec(dateString);
        if (parts) {
            dateStrings.date = parts[1];
            timeString = parts[2];
        }
        else {
            dateStrings.date = null;
            timeString = dateString;
        }
    }
    else {
        dateStrings.date = parts[1];
        timeString = parts[3];
    }
    if (timeString) {
        const token = patterns.timeZone.exec(timeString);
        if (token) {
            dateStrings.time = timeString.replace(token[1], '');
            dateStrings.timeZone = token[1].trim();
        }
        else {
            dateStrings.time = timeString;
        }
    }
    return dateStrings;
}
function parseYear(dateString, additionalDigits) {
    if (dateString) {
        const patternYYY = patterns.YYY[additionalDigits];
        const patternYYYYY = patterns.YYYYY[additionalDigits];
        // YYYY or ±YYYYY
        let token = patterns.YYYY.exec(dateString) || patternYYYYY.exec(dateString);
        if (token) {
            const yearString = token[1];
            return {
                year: parseInt(yearString, 10),
                restDateString: dateString.slice(yearString.length),
            };
        }
        // YY or ±YYY
        token = patterns.YY.exec(dateString) || patternYYY.exec(dateString);
        if (token) {
            const centuryString = token[1];
            return {
                year: parseInt(centuryString, 10) * 100,
                restDateString: dateString.slice(centuryString.length),
            };
        }
    }
    // Invalid ISO-formatted year
    return {
        year: null,
    };
}
function parseDate(dateString, year) {
    // Invalid ISO-formatted year
    if (year === null) {
        return null;
    }
    let date;
    let month;
    let week;
    // YYYY
    if (!dateString || !dateString.length) {
        date = new Date(0);
        date.setUTCFullYear(year);
        return date;
    }
    // YYYY-MM
    let token = patterns.MM.exec(dateString);
    if (token) {
        date = new Date(0);
        month = parseInt(token[1], 10) - 1;
        if (!validateDate(year, month)) {
            return new Date(NaN);
        }
        date.setUTCFullYear(year, month);
        return date;
    }
    // YYYY-DDD or YYYYDDD
    token = patterns.DDD.exec(dateString);
    if (token) {
        date = new Date(0);
        const dayOfYear = parseInt(token[1], 10);
        if (!validateDayOfYearDate(year, dayOfYear)) {
            return new Date(NaN);
        }
        date.setUTCFullYear(year, 0, dayOfYear);
        return date;
    }
    // yyyy-MM-dd or YYYYMMDD
    token = patterns.MMDD.exec(dateString);
    if (token) {
        date = new Date(0);
        month = parseInt(token[1], 10) - 1;
        const day = parseInt(token[2], 10);
        if (!validateDate(year, month, day)) {
            return new Date(NaN);
        }
        date.setUTCFullYear(year, month, day);
        return date;
    }
    // YYYY-Www or YYYYWww
    token = patterns.Www.exec(dateString);
    if (token) {
        week = parseInt(token[1], 10) - 1;
        if (!validateWeekDate(week)) {
            return new Date(NaN);
        }
        return dayOfISOWeekYear(year, week);
    }
    // YYYY-Www-D or YYYYWwwD
    token = patterns.WwwD.exec(dateString);
    if (token) {
        week = parseInt(token[1], 10) - 1;
        const dayOfWeek = parseInt(token[2], 10) - 1;
        if (!validateWeekDate(week, dayOfWeek)) {
            return new Date(NaN);
        }
        return dayOfISOWeekYear(year, week, dayOfWeek);
    }
    // Invalid ISO-formatted date
    return null;
}
function parseTime(timeString) {
    let hours;
    let minutes;
    // hh
    let token = patterns.HH.exec(timeString);
    if (token) {
        hours = parseFloat(token[1].replace(',', '.'));
        if (!validateTime(hours)) {
            return NaN;
        }
        return (hours % 24) * MILLISECONDS_IN_HOUR;
    }
    // hh:mm or hhmm
    token = patterns.HHMM.exec(timeString);
    if (token) {
        hours = parseInt(token[1], 10);
        minutes = parseFloat(token[2].replace(',', '.'));
        if (!validateTime(hours, minutes)) {
            return NaN;
        }
        return (hours % 24) * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE;
    }
    // hh:mm:ss or hhmmss
    token = patterns.HHMMSS.exec(timeString);
    if (token) {
        hours = parseInt(token[1], 10);
        minutes = parseInt(token[2], 10);
        const seconds = parseFloat(token[3].replace(',', '.'));
        if (!validateTime(hours, minutes, seconds)) {
            return NaN;
        }
        return (hours % 24) * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE + seconds * 1000;
    }
    // Invalid ISO-formatted time
    return null;
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
    week = week || 0;
    day = day || 0;
    const date = new Date(0);
    date.setUTCFullYear(isoWeekYear, 0, 4);
    const fourthOfJanuaryDay = date.getUTCDay() || 7;
    const diff = week * 7 + day + 1 - fourthOfJanuaryDay;
    date.setUTCDate(date.getUTCDate() + diff);
    return date;
}
// Validation functions
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex(year) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}
function validateDate(year, month, date) {
    if (month < 0 || month > 11) {
        return false;
    }
    if (date != null) {
        if (date < 1) {
            return false;
        }
        const isLeapYear = isLeapYearIndex(year);
        if (isLeapYear && date > DAYS_IN_MONTH_LEAP_YEAR[month]) {
            return false;
        }
        if (!isLeapYear && date > DAYS_IN_MONTH[month]) {
            return false;
        }
    }
    return true;
}
function validateDayOfYearDate(year, dayOfYear) {
    if (dayOfYear < 1) {
        return false;
    }
    const isLeapYear = isLeapYearIndex(year);
    if (isLeapYear && dayOfYear > 366) {
        return false;
    }
    if (!isLeapYear && dayOfYear > 365) {
        return false;
    }
    return true;
}
function validateWeekDate(week, day) {
    if (week < 0 || week > 52) {
        return false;
    }
    if (day != null && (day < 0 || day > 6)) {
        return false;
    }
    return true;
}
function validateTime(hours, minutes, seconds) {
    if (hours < 0 || hours >= 25) {
        return false;
    }
    if (minutes != null && (minutes < 0 || minutes >= 60)) {
        return false;
    }
    if (seconds != null && (seconds < 0 || seconds >= 60)) {
        return false;
    }
    return true;
}

const tzFormattingTokensRegExp = /([xXOz]+)|''|'(''|[^'])+('|$)/g;
/**
 * @name format
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may consty by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://git.io/fxCyr
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 8     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 8     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Su            | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Su            |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Su            |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
 * | AM, PM                          | a..aaa  | AM, PM                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 1, 2, ..., 11, 0                  |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 0001, ..., 999               |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | PDT, EST, CEST                    | 6     |
 * |                                 | zzzz    | Pacific Daylight Time             | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 05/29/1453                        | 7     |
 * |                                 | PP      | May 29, 1453                      | 7     |
 * |                                 | PPP     | May 29th, 1453                    | 7     |
 * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
 * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
 *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
 *
 * 6. Specific non-location timezones are created using the Intl browser API. The output is determined by the
 *    preferred standard of the current locale (en-US by default) which may not always give the expected result.
 *    For this reason it is recommended to supply a `locale` in the format options when formatting a time zone name.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. These tokens are often confused with others. See: https://git.io/fxCyr
 *
 *
 * ### v2.0.0 breaking changes:
 *
 * - [Changes that are common for the whole
 *   library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
 *
 * - The second argument is now required for the sake of explicitness.
 *
 *   ```javascript
 *   // Before v2.0.0
 *   format(new Date(2016, 0, 1))
 *
 *   // v2.0.0 onward
 *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
 *   ```
 *
 * - New format string API for `format` function
 *   which is based on [Unicode Technical Standard
 *   #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). See [this
 *   post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
 *
 * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
 *
 * @param date the original date
 * @param formatStr the string of tokens
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link
 *   https://date-fns.org/docs/toDate}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See
 *   [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {Boolean} [options.awareOfUnicodeTokens=false] - if true, allows usage of Unicode tokens causes confusion:
 *   - Some of the day of year tokens (`D`, `DD`) that are confused with the day of month tokens (`d`, `dd`).
 *   - Some of the local week-numbering year tokens (`YY`, `YYYY`) that are confused with the calendar year tokens
 *   (`yy`, `yyyy`). See: https://git.io/fxCyr
 * @param {String} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
 * @param {Date|Number} [options.originalDate] - can be used to pass the original unmodified date to `format` to
 *   improve correctness of the replaced timezone token close to the DST threshold.
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
 * @throws {RangeError} `options.locale` must contain `localize` property
 * @throws {RangeError} `options.locale` must contain `formatLong` property
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
 * @throws {RangeError} `options.awareOfUnicodeTokens` must be set to `true` to use `XX` token; see:
 *   https://git.io/fxCyr
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */
function format(date, formatStr, options = {}) {
    formatStr = String(formatStr);
    const matches = formatStr.match(tzFormattingTokensRegExp);
    if (matches) {
        const d = toDate(options.originalDate || date, options);
        // Work through each match and replace the tz token in the format string with the quoted
        // formatted time zone so the remaining tokens can be filled in by date-fns#format.
        formatStr = matches.reduce(function (result, token) {
            if (token[0] === "'") {
                return result; // This is a quoted portion, matched only to ensure we don't match inside it
            }
            const pos = result.indexOf(token);
            const precededByQuotedSection = result[pos - 1] === "'";
            const replaced = result.replace(token, "'" + formatters[token[0]](d, token, options) + "'");
            // If the replacement results in two adjoining quoted strings, the back to back quotes
            // are removed, so it doesn't look like an escaped quote.
            return precededByQuotedSection
                ? replaced.substring(0, pos - 1) + replaced.substring(pos + 1)
                : replaced;
        }, formatStr);
    }
    return format$1.format(date, formatStr, options);
}

/**
 * @name toZonedTime
 * @category Time Zone Helpers
 * @summary Get a date/time representing local time in a given time zone from the UTC date
 *
 * @description
 * Returns a date instance with values representing the local time in the time zone
 * specified of the UTC time from the date provided. In other words, when the new date
 * is formatted it will show the equivalent hours in the target time zone regardless
 * of the current system time zone.
 *
 * @param date the date with the relevant UTC time
 * @param timeZone the time zone to get local time for, can be an offset or IANA time zone
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
 *
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
 *
 * @example
 * // In June 10am UTC is 6am in New York (-04:00)
 * const result = toZonedTime('2014-06-25T10:00:00.000Z', 'America/New_York')
 * //=> Jun 25 2014 06:00:00
 */
function toZonedTime(date, timeZone, options) {
    date = toDate(date, options);
    const offsetMilliseconds = tzParseTimezone(timeZone, date, true);
    const d = new Date(date.getTime() - offsetMilliseconds);
    const resultDate = new Date(0);
    resultDate.setFullYear(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    resultDate.setHours(d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
    return resultDate;
}

/**
 * @name formatInTimeZone
 * @category Time Zone Helpers
 * @summary Gets the offset in milliseconds between the time zone and Universal Coordinated Time (UTC)
 *
 * @param date the date representing the local time / real UTC time
 * @param timeZone the time zone this date should be formatted for; can be an offset or IANA time zone
 * @param formatStr the string of tokens
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link
 *   https://date-fns.org/docs/toDate}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See
 *   [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {Boolean} [options.awareOfUnicodeTokens=false] - if true, allows usage of Unicode tokens causes confusion:
 *   - Some of the day of year tokens (`D`, `DD`) that are confused with the day of month tokens (`d`, `dd`).
 *   - Some of the local week-numbering year tokens (`YY`, `YYYY`) that are confused with the calendar year tokens
 *   (`yy`, `yyyy`). See: https://git.io/fxCyr
 * @param {String} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
 */
function formatInTimeZone(date, timeZone, formatStr, options) {
    options = {
        ...options,
        timeZone,
        originalDate: date,
    };
    return format(toZonedTime(date, timeZone, { timeZone: options.timeZone }), formatStr, options);
}

/**
 * @name fromZonedTime
 * @category Time Zone Helpers
 * @summary Get the UTC date/time from a date representing local time in a given time zone
 *
 * @description
 * Returns a date instance with the UTC time of the provided date of which the values
 * represented the local time in the time zone specified. In other words, if the input
 * date represented local time in time zone, the timestamp of the output date will
 * give the equivalent UTC of that local time regardless of the current system time zone.
 *
 * @param date the date with values representing the local time
 * @param timeZone the time zone of this local time, can be an offset or IANA time zone
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
 *
 * @example
 * // In June 10am in Los Angeles is 5pm UTC
 * const result = fromZonedTime(new Date(2014, 5, 25, 10, 0, 0), 'America/Los_Angeles')
 * //=> 2014-06-25T17:00:00.000Z
 */
function fromZonedTime(date, timeZone, options) {
    if (typeof date === 'string' && !date.match(tzPattern)) {
        return toDate(date, { ...options, timeZone });
    }
    date = toDate(date, options);
    const utc = newDateUTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).getTime();
    const offsetMilliseconds = tzParseTimezone(timeZone, new Date(utc));
    return new Date(utc + offsetMilliseconds);
}

/**
 * @name getTimezoneOffset
 * @category Time Zone Helpers
 * @summary Gets the offset in milliseconds between the time zone and Universal Coordinated Time (UTC)
 *
 * @description
 * Returns the time zone offset from UTC time in milliseconds for IANA time zones as well
 * as other time zone offset string formats.
 *
 * For time zones where daylight savings time is applicable a `Date` should be passed on
 * the second parameter to ensure the offset correctly accounts for DST at that time of
 * year. When omitted, the current date is used.
 *
 * @param timeZone the time zone of this local time, can be an offset or IANA time zone
 * @param date the date with values representing the local time
 *
 * @example
 * const result = getTimezoneOffset('-07:00')
 *   //=> -18000000 (-7 * 60 * 60 * 1000)
 * const result = getTimezoneOffset('Africa/Johannesburg')
 *   //=> 7200000 (2 * 60 * 60 * 1000)
 * const result = getTimezoneOffset('America/New_York', new Date(2016, 0, 1))
 *   //=> -18000000 (-5 * 60 * 60 * 1000)
 * const result = getTimezoneOffset('America/New_York', new Date(2016, 6, 1))
 *   //=> -14400000 (-4 * 60 * 60 * 1000)
 */
function getTimezoneOffset(timeZone, date) {
    return -tzParseTimezone(timeZone, date);
}

function getContentEditableSelection(element) {
    const { anchorOffset = 0, focusOffset = 0 } = element.ownerDocument.getSelection() || {};
    const from = Math.min(anchorOffset, focusOffset);
    const to = Math.max(anchorOffset, focusOffset);
    return [from, to];
}

function setContentEditableSelection(element, [from, to]) {
    var _a, _b;
    const document = element.ownerDocument;
    const range = document.createRange();
    range.setStart(element.firstChild || element, Math.min(from, ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0));
    range.setEnd(element.lastChild || element, Math.min(to, ((_b = element.textContent) === null || _b === void 0 ? void 0 : _b.length) || 0));
    const selection = document.getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

class ContentEditableAdapter {
    constructor(element) {
        this.element = element;
        this.maxLength = Infinity;
    }
    get value() {
        return this.element.innerText.replace(/\n\n$/, '\n');
    }
    set value(value) {
        // Setting into innerHTML of element with `white-space: pre;` style
        this.element.innerHTML = value.replace(/\n$/, '\n\n');
    }
    get selectionStart() {
        return getContentEditableSelection(this.element)[0];
    }
    get selectionEnd() {
        return getContentEditableSelection(this.element)[1];
    }
    setSelectionRange(from, to) {
        setContentEditableSelection(this.element, [from || 0, to || 0]);
    }
    select() {
        this.setSelectionRange(0, this.value.length);
    }
}
function maskitoAdaptContentEditable(element) {
    const adapter = new ContentEditableAdapter(element);
    return new Proxy(element, {
        get(target, prop) {
            if (prop in adapter) {
                return adapter[prop];
            }
            const nativeProperty = target[prop];
            return typeof nativeProperty === 'function'
                ? nativeProperty.bind(target)
                : nativeProperty;
        },
        set(target, prop, val, receiver) {
            return Reflect.set(prop in adapter ? adapter : target, prop, val, receiver);
        },
    });
}

const MASKITO_DEFAULT_ELEMENT_PREDICATE = (e) => e.isContentEditable
    ? maskitoAdaptContentEditable(e)
    : e.querySelector('input,textarea') ||
        e;

const MASKITO_DEFAULT_OPTIONS = {
    mask: /^.*$/,
    preprocessors: [],
    postprocessors: [],
    plugins: [],
    overwriteMode: 'shift',
};

class MaskHistory {
    constructor() {
        this.now = null;
        this.past = [];
        this.future = [];
    }
    undo() {
        const state = this.past.pop();
        if (state && this.now) {
            this.future.push(this.now);
            this.updateElement(state, 'historyUndo');
        }
    }
    redo() {
        const state = this.future.pop();
        if (state && this.now) {
            this.past.push(this.now);
            this.updateElement(state, 'historyRedo');
        }
    }
    updateHistory(state) {
        if (!this.now) {
            this.now = state;
            return;
        }
        const isValueChanged = this.now.value !== state.value;
        const isSelectionChanged = this.now.selection.some((item, index) => item !== state.selection[index]);
        if (!isValueChanged && !isSelectionChanged) {
            return;
        }
        if (isValueChanged) {
            this.past.push(this.now);
            this.future = [];
        }
        this.now = state;
    }
    updateElement(state, inputType) {
        this.now = state;
        this.updateElementState(state, { inputType, data: null });
    }
}

function areElementValuesEqual(sampleState, ...states) {
    return states.every(({ value }) => value === sampleState.value);
}
function areElementStatesEqual(sampleState, ...states) {
    return states.every(({ value, selection }) => value === sampleState.value &&
        selection[0] === sampleState.selection[0] &&
        selection[1] === sampleState.selection[1]);
}

function applyOverwriteMode({ value, selection }, newCharacters, mode) {
    const [from, to] = selection;
    const computedMode = typeof mode === 'function' ? mode({ value, selection }) : mode;
    return {
        value,
        selection: computedMode === 'replace' ? [from, from + newCharacters.length] : [from, to],
    };
}

function isFixedCharacter(char) {
    return typeof char === 'string';
}

function getLeadingFixedCharacters(mask, validatedValuePart, newCharacter, initialElementState) {
    let leadingFixedCharacters = '';
    for (let i = validatedValuePart.length; i < mask.length; i++) {
        const charConstraint = mask[i] || '';
        const isInitiallyExisted = (initialElementState === null || initialElementState === void 0 ? void 0 : initialElementState.value[i]) === charConstraint;
        if (!isFixedCharacter(charConstraint) ||
            (charConstraint === newCharacter && !isInitiallyExisted)) {
            return leadingFixedCharacters;
        }
        leadingFixedCharacters += charConstraint;
    }
    return leadingFixedCharacters;
}

function validateValueWithMask(value, maskExpression) {
    if (Array.isArray(maskExpression)) {
        return (value.length === maskExpression.length &&
            Array.from(value).every((char, i) => {
                const charConstraint = maskExpression[i] || '';
                return isFixedCharacter(charConstraint)
                    ? char === charConstraint
                    : char.match(charConstraint);
            }));
    }
    return maskExpression.test(value);
}

function guessValidValueByPattern(elementState, mask, initialElementState) {
    let maskedFrom = null;
    let maskedTo = null;
    const maskedValue = Array.from(elementState.value).reduce((validatedCharacters, char, charIndex) => {
        const leadingCharacters = getLeadingFixedCharacters(mask, validatedCharacters, char, initialElementState);
        const newValidatedChars = validatedCharacters + leadingCharacters;
        const charConstraint = mask[newValidatedChars.length] || '';
        if (isFixedCharacter(charConstraint)) {
            return newValidatedChars + charConstraint;
        }
        if (!char.match(charConstraint)) {
            return newValidatedChars;
        }
        if (maskedFrom === null && charIndex >= elementState.selection[0]) {
            maskedFrom = newValidatedChars.length;
        }
        if (maskedTo === null && charIndex >= elementState.selection[1]) {
            maskedTo = newValidatedChars.length;
        }
        return newValidatedChars + char;
    }, '');
    const trailingFixedCharacters = getLeadingFixedCharacters(mask, maskedValue, '', initialElementState);
    return {
        value: validateValueWithMask(maskedValue + trailingFixedCharacters, mask)
            ? maskedValue + trailingFixedCharacters
            : maskedValue,
        selection: [maskedFrom !== null && maskedFrom !== void 0 ? maskedFrom : maskedValue.length, maskedTo !== null && maskedTo !== void 0 ? maskedTo : maskedValue.length],
    };
}

function guessValidValueByRegExp({ value, selection }, maskRegExp) {
    const [from, to] = selection;
    let newFrom = from;
    let newTo = to;
    const validatedValue = Array.from(value).reduce((validatedValuePart, char, i) => {
        const newPossibleValue = validatedValuePart + char;
        if (from === i) {
            newFrom = validatedValuePart.length;
        }
        if (to === i) {
            newTo = validatedValuePart.length;
        }
        return newPossibleValue.match(maskRegExp) ? newPossibleValue : validatedValuePart;
    }, '');
    return { value: validatedValue, selection: [newFrom, newTo] };
}

function calibrateValueByMask(elementState, mask, initialElementState = null) {
    if (validateValueWithMask(elementState.value, mask)) {
        return elementState;
    }
    const { value, selection } = Array.isArray(mask)
        ? guessValidValueByPattern(elementState, mask, initialElementState)
        : guessValidValueByRegExp(elementState, mask);
    return {
        selection,
        value: Array.isArray(mask) ? value.slice(0, mask.length) : value,
    };
}

function removeFixedMaskCharacters(initialElementState, mask) {
    if (!Array.isArray(mask)) {
        return initialElementState;
    }
    const [from, to] = initialElementState.selection;
    const selection = [];
    const unmaskedValue = Array.from(initialElementState.value).reduce((rawValue, char, i) => {
        const charConstraint = mask[i] || '';
        if (i === from) {
            selection.push(rawValue.length);
        }
        if (i === to) {
            selection.push(rawValue.length);
        }
        return isFixedCharacter(charConstraint) && charConstraint === char
            ? rawValue
            : rawValue + char;
    }, '');
    if (selection.length < 2) {
        selection.push(...new Array(2 - selection.length).fill(unmaskedValue.length));
    }
    return {
        value: unmaskedValue,
        selection: [selection[0], selection[1]],
    };
}

class MaskModel {
    constructor(initialElementState, maskOptions) {
        this.initialElementState = initialElementState;
        this.maskOptions = maskOptions;
        this.value = '';
        this.selection = [0, 0];
        const { value, selection } = calibrateValueByMask(this.initialElementState, this.getMaskExpression(this.initialElementState));
        this.value = value;
        this.selection = selection;
    }
    addCharacters([from, to], newCharacters) {
        const { value, maskOptions } = this;
        const maskExpression = this.getMaskExpression({
            value: value.slice(0, from) + newCharacters + value.slice(to),
            selection: [from + newCharacters.length, from + newCharacters.length],
        });
        const initialElementState = { value, selection: [from, to] };
        const unmaskedElementState = removeFixedMaskCharacters(initialElementState, maskExpression);
        const [unmaskedFrom, unmaskedTo] = applyOverwriteMode(unmaskedElementState, newCharacters, maskOptions.overwriteMode).selection;
        const newUnmaskedLeadingValuePart = unmaskedElementState.value.slice(0, unmaskedFrom) + newCharacters;
        const newCaretIndex = newUnmaskedLeadingValuePart.length;
        const maskedElementState = calibrateValueByMask({
            value: newUnmaskedLeadingValuePart +
                unmaskedElementState.value.slice(unmaskedTo),
            selection: [newCaretIndex, newCaretIndex],
        }, maskExpression, initialElementState);
        const isInvalidCharsInsertion = 
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        value.slice(0, unmaskedFrom) ===
            calibrateValueByMask({
                value: newUnmaskedLeadingValuePart,
                selection: [newCaretIndex, newCaretIndex],
            }, maskExpression, initialElementState).value;
        if (isInvalidCharsInsertion ||
            areElementStatesEqual(this, maskedElementState) // If typing new characters does not change value
        ) {
            throw new Error('Invalid mask value');
        }
        this.value = maskedElementState.value;
        this.selection = maskedElementState.selection;
    }
    deleteCharacters([from, to]) {
        if (from === to || !to) {
            return;
        }
        const { value } = this;
        const maskExpression = this.getMaskExpression({
            value: value.slice(0, from) + value.slice(to),
            selection: [from, from],
        });
        const initialElementState = { value, selection: [from, to] };
        const unmaskedElementState = removeFixedMaskCharacters(initialElementState, maskExpression);
        const [unmaskedFrom, unmaskedTo] = unmaskedElementState.selection;
        const newUnmaskedValue = unmaskedElementState.value.slice(0, unmaskedFrom) +
            unmaskedElementState.value.slice(unmaskedTo);
        const maskedElementState = calibrateValueByMask({ value: newUnmaskedValue, selection: [unmaskedFrom, unmaskedFrom] }, maskExpression, initialElementState);
        this.value = maskedElementState.value;
        this.selection = maskedElementState.selection;
    }
    getMaskExpression(elementState) {
        const { mask } = this.maskOptions;
        return typeof mask === 'function' ? mask(elementState) : mask;
    }
}

class EventListener {
    constructor(element) {
        this.element = element;
        this.listeners = [];
    }
    listen(eventType, fn, options) {
        const untypedFn = fn;
        this.element.addEventListener(eventType, untypedFn, options);
        this.listeners.push(() => this.element.removeEventListener(eventType, untypedFn));
    }
    destroy() {
        this.listeners.forEach((stopListen) => stopListen());
    }
}

const HotkeyModifier = {
    CTRL: 1 << 0,
    ALT: 1 << 1,
    SHIFT: 1 << 2,
    META: 1 << 3,
};
// TODO add variants that can be processed correctly
const HotkeyCode = {
    Y: 89,
    Z: 90,
};
/**
 * Checks if the passed keyboard event match the required hotkey.
 *
 * @example
 * input.addEventListener('keydown', (event) => {
 *     if (isHotkey(event, HotkeyModifier.CTRL | HotkeyModifier.SHIFT, HotkeyCode.Z)) {
 *         // redo hotkey pressed
 *     }
 * })
 *
 * @return will return `true` only if the {@link HotkeyCode} matches and only the necessary
 * {@link HotkeyModifier modifiers} have been pressed
 */
function isHotkey(event, modifiers, hotkeyCode) {
    return (event.ctrlKey === !!(modifiers & HotkeyModifier.CTRL) &&
        event.altKey === !!(modifiers & HotkeyModifier.ALT) &&
        event.shiftKey === !!(modifiers & HotkeyModifier.SHIFT) &&
        event.metaKey === !!(modifiers & HotkeyModifier.META) &&
        /**
         * We intentionally use legacy {@link KeyboardEvent#keyCode `keyCode`} property. It is more
         * "keyboard-layout"-independent than {@link KeyboardEvent#key `key`} or {@link KeyboardEvent#code `code`} properties.
         * @see {@link https://github.com/taiga-family/maskito/issues/315 `KeyboardEvent#code` issue}
         */
        event.keyCode === hotkeyCode);
}

function isRedo(event) {
    return (isHotkey(event, HotkeyModifier.CTRL, HotkeyCode.Y) || // Windows
        isHotkey(event, HotkeyModifier.CTRL | HotkeyModifier.SHIFT, HotkeyCode.Z) || // Windows & Android
        isHotkey(event, HotkeyModifier.META | HotkeyModifier.SHIFT, HotkeyCode.Z) // macOS & iOS
    );
}
function isUndo(event) {
    return (isHotkey(event, HotkeyModifier.CTRL, HotkeyCode.Z) || // Windows & Android
        isHotkey(event, HotkeyModifier.META, HotkeyCode.Z) // macOS & iOS
    );
}

/**
 * Sets value to element, and dispatches input event
 * if you passed ELementState, it also sets selection range
 *
 * @example
 * maskitoUpdateElement(input, newValue);
 * maskitoUpdateElement(input, elementState);
 *
 * @see {@link https://github.com/taiga-family/maskito/issues/804 issue}
 *
 * @return void
 */
function maskitoUpdateElement(element, valueOrElementState) {
    var _a;
    const initialValue = element.value;
    if (typeof valueOrElementState === 'string') {
        element.value = valueOrElementState;
    }
    else {
        const [from, to] = valueOrElementState.selection;
        element.value = valueOrElementState.value;
        if (element.matches(':focus')) {
            (_a = element.setSelectionRange) === null || _a === void 0 ? void 0 : _a.call(element, from, to);
        }
    }
    if (element.value !== initialValue) {
        element.dispatchEvent(new Event('input', 
        /**
         * React handles this event only on bubbling phase
         *
         * here is the list of events that are processed in the capture stage, others are processed in the bubbling stage
         * https://github.com/facebook/react/blob/cb2439624f43c510007f65aea5c50a8bb97917e4/packages/react-dom-bindings/src/events/DOMPluginEventSystem.js#L222
         */
        { bubbles: true }));
    }
}

function getLineSelection({ value, selection }, isForward) {
    const [from, to] = selection;
    if (from !== to) {
        return [from, to];
    }
    const nearestBreak = isForward
        ? value.slice(from).indexOf('\n') + 1 || value.length
        : value.slice(0, to).lastIndexOf('\n') + 1;
    const selectFrom = isForward ? from : nearestBreak;
    const selectTo = isForward ? nearestBreak : to;
    return [selectFrom, selectTo];
}

function getNotEmptySelection({ value, selection }, isForward) {
    const [from, to] = selection;
    if (from !== to) {
        return [from, to];
    }
    const notEmptySelection = isForward ? [from, to + 1] : [from - 1, to];
    return notEmptySelection.map((x) => Math.min(Math.max(x, 0), value.length));
}

const TRAILING_SPACES_REG = /\s+$/g;
const LEADING_SPACES_REG = /^\s+/g;
const SPACE_REG = /\s/;
function getWordSelection({ value, selection }, isForward) {
    const [from, to] = selection;
    if (from !== to) {
        return [from, to];
    }
    if (isForward) {
        const valueAfterSelectionStart = value.slice(from);
        const [leadingSpaces] = valueAfterSelectionStart.match(LEADING_SPACES_REG) || [
            '',
        ];
        const nearestWordEndIndex = valueAfterSelectionStart
            .trimStart()
            .search(SPACE_REG);
        return [
            from,
            nearestWordEndIndex !== -1
                ? from + leadingSpaces.length + nearestWordEndIndex
                : value.length,
        ];
    }
    const valueBeforeSelectionEnd = value.slice(0, to);
    const [trailingSpaces] = valueBeforeSelectionEnd.match(TRAILING_SPACES_REG) || [''];
    const selectedWordLength = valueBeforeSelectionEnd
        .trimEnd()
        .split('')
        .reverse()
        .findIndex((char) => char.match(SPACE_REG));
    return [
        selectedWordLength !== -1 ? to - trailingSpaces.length - selectedWordLength : 0,
        to,
    ];
}

/* eslint-disable @typescript-eslint/ban-types */
/**
 * @internal
 */
function maskitoPipe(processors = []) {
    return (initialData, ...readonlyArgs) => processors.reduce((data, fn) => (Object.assign(Object.assign({}, data), fn(data, ...readonlyArgs))), initialData);
}

function maskitoTransform(valueOrState, maskitoOptions) {
    const options = Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), maskitoOptions);
    const preprocessor = maskitoPipe(options.preprocessors);
    const postprocessor = maskitoPipe(options.postprocessors);
    const initialElementState = typeof valueOrState === 'string'
        ? { value: valueOrState, selection: [0, 0] }
        : valueOrState;
    const { elementState } = preprocessor({ elementState: initialElementState, data: '' }, 'validation');
    const maskModel = new MaskModel(elementState, options);
    const { value, selection } = postprocessor(maskModel, initialElementState);
    return typeof valueOrState === 'string' ? value : { value, selection };
}

class Maskito extends MaskHistory {
    constructor(element, maskitoOptions) {
        super();
        this.element = element;
        this.maskitoOptions = maskitoOptions;
        this.isTextArea = this.element.nodeName === 'TEXTAREA';
        this.eventListener = new EventListener(this.element);
        this.options = Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), this.maskitoOptions);
        this.preprocessor = maskitoPipe(this.options.preprocessors);
        this.postprocessor = maskitoPipe(this.options.postprocessors);
        this.teardowns = this.options.plugins.map((plugin) => plugin(this.element, this.options));
        this.updateHistory(this.elementState);
        this.eventListener.listen('keydown', (event) => {
            if (isRedo(event)) {
                event.preventDefault();
                return this.redo();
            }
            if (isUndo(event)) {
                event.preventDefault();
                return this.undo();
            }
        });
        this.eventListener.listen('beforeinput', (event) => {
            var _a;
            const isForward = event.inputType.includes('Forward');
            this.updateHistory(this.elementState);
            switch (event.inputType) {
                // historyUndo/historyRedo will not be triggered if value was modified programmatically
                case 'historyUndo':
                    event.preventDefault();
                    return this.undo();
                case 'historyRedo':
                    event.preventDefault();
                    return this.redo();
                case 'deleteByCut':
                case 'deleteContentBackward':
                case 'deleteContentForward':
                    return this.handleDelete({
                        event,
                        isForward,
                        selection: getNotEmptySelection(this.elementState, isForward),
                    });
                case 'deleteWordForward':
                case 'deleteWordBackward':
                    return this.handleDelete({
                        event,
                        isForward,
                        selection: getWordSelection(this.elementState, isForward),
                        force: true,
                    });
                case 'deleteSoftLineBackward':
                case 'deleteSoftLineForward':
                case 'deleteHardLineBackward':
                case 'deleteHardLineForward':
                    return this.handleDelete({
                        event,
                        isForward,
                        selection: getLineSelection(this.elementState, isForward),
                        force: true,
                    });
                case 'insertCompositionText':
                    return; // will be handled inside `compositionend` event
                case 'insertReplacementText':
                    /**
                     * According {@link https://www.w3.org/TR/input-events-2 W3C specification}:
                     * > `insertReplacementText` – insert or replace existing text by means of a spell checker,
                     * > auto-correct, writing suggestions or similar.
                     * ___
                     * Firefox emits `insertReplacementText` event for its suggestion/autofill and for spell checker.
                     * However, it is impossible to detect which part of the textfield value is going to be replaced
                     * (`selectionStart` and `selectionEnd` just equal to the last caret position).
                     * ___
                     * Chrome does not fire `beforeinput` event for its suggestion/autofill.
                     * It emits only `input` event with `inputType` and `data` set to `undefined`.
                     * ___
                     * All these browser limitations make us to validate the result value later in `input` event.
                     */
                    return;
                case 'insertLineBreak':
                case 'insertParagraph':
                    return this.handleEnter(event);
                case 'insertFromPaste':
                case 'insertText':
                case 'insertFromDrop':
                default:
                    return this.handleInsert(event, event.data ||
                        (
                        // `event.data` for `contentEditable` is always `null` for paste/drop events
                        (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain')) ||
                        '');
            }
        });
        this.eventListener.listen('input', ({ inputType }) => {
            if (inputType === 'insertCompositionText') {
                return; // will be handled inside `compositionend` event
            }
            this.ensureValueFitsMask();
            this.updateHistory(this.elementState);
        });
        this.eventListener.listen('compositionend', () => {
            this.ensureValueFitsMask();
            this.updateHistory(this.elementState);
        });
    }
    get elementState() {
        const { value, selectionStart, selectionEnd } = this.element;
        return {
            value,
            selection: [selectionStart || 0, selectionEnd || 0],
        };
    }
    get maxLength() {
        const { maxLength } = this.element;
        return maxLength === -1 ? Infinity : maxLength;
    }
    destroy() {
        this.eventListener.destroy();
        this.teardowns.forEach((teardown) => teardown === null || teardown === void 0 ? void 0 : teardown());
    }
    updateElementState({ value, selection }, eventInit = {
        inputType: 'insertText',
        data: null,
    }) {
        const initialValue = this.elementState.value;
        this.updateValue(value);
        this.updateSelectionRange(selection);
        if (initialValue !== value) {
            this.dispatchInputEvent(eventInit);
        }
    }
    updateSelectionRange([from, to]) {
        var _a;
        const { element } = this;
        if (element.matches(':focus') &&
            (element.selectionStart !== from || element.selectionEnd !== to)) {
            (_a = element.setSelectionRange) === null || _a === void 0 ? void 0 : _a.call(element, from, to);
        }
    }
    updateValue(value) {
        this.element.value = value;
    }
    ensureValueFitsMask() {
        this.updateElementState(maskitoTransform(this.elementState, this.options));
    }
    dispatchInputEvent(eventInit = {
        inputType: 'insertText',
        data: null,
    }) {
        if (globalThis.InputEvent) {
            this.element.dispatchEvent(new InputEvent('input', Object.assign(Object.assign({}, eventInit), { bubbles: true, cancelable: false })));
        }
    }
    handleDelete({ event, selection, isForward, force = false, }) {
        const initialState = {
            value: this.elementState.value,
            selection,
        };
        const [initialFrom, initialTo] = initialState.selection;
        const { elementState } = this.preprocessor({
            elementState: initialState,
            data: '',
        }, isForward ? 'deleteForward' : 'deleteBackward');
        const maskModel = new MaskModel(elementState, this.options);
        const [from, to] = elementState.selection;
        maskModel.deleteCharacters([from, to]);
        const newElementState = this.postprocessor(maskModel, initialState);
        const newPossibleValue = initialState.value.slice(0, initialFrom) +
            initialState.value.slice(initialTo);
        if (newPossibleValue === newElementState.value &&
            !force &&
            !this.element.isContentEditable) {
            return;
        }
        event.preventDefault();
        if (areElementValuesEqual(initialState, elementState, maskModel, newElementState)) {
            // User presses Backspace/Delete for the fixed value
            return this.updateSelectionRange(isForward ? [to, to] : [from, from]);
        }
        this.updateElementState(newElementState, {
            inputType: event.inputType,
            data: null,
        });
        this.updateHistory(newElementState);
    }
    handleInsert(event, data) {
        const initialElementState = this.elementState;
        const { elementState, data: insertedText = data } = this.preprocessor({
            data,
            elementState: initialElementState,
        }, 'insert');
        const maskModel = new MaskModel(elementState, this.options);
        try {
            maskModel.addCharacters(elementState.selection, insertedText);
        }
        catch (_a) {
            return event.preventDefault();
        }
        const [from, to] = elementState.selection;
        const newPossibleValue = initialElementState.value.slice(0, from) +
            data +
            initialElementState.value.slice(to);
        const newElementState = this.postprocessor(maskModel, initialElementState);
        if (newElementState.value.length > this.maxLength) {
            return event.preventDefault();
        }
        if (newPossibleValue !== newElementState.value ||
            this.element.isContentEditable) {
            event.preventDefault();
            this.updateElementState(newElementState, {
                data,
                inputType: event.inputType,
            });
            this.updateHistory(newElementState);
        }
    }
    handleEnter(event) {
        if (this.isTextArea || this.element.isContentEditable) {
            this.handleInsert(event, '\n');
        }
    }
}

function maskitoChangeEventPlugin() {
    return (element) => {
        if (element.isContentEditable) {
            return;
        }
        let value = element.value;
        const valueListener = () => {
            value = element.value;
        };
        const blurListener = () => {
            if (element.value !== value) {
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        element.addEventListener('focus', valueListener);
        element.addEventListener('change', valueListener);
        element.addEventListener('blur', blurListener);
        return () => {
            element.removeEventListener('focus', valueListener);
            element.removeEventListener('change', valueListener);
            element.removeEventListener('blur', blurListener);
        };
    };
}

function maskitoInitialCalibrationPlugin(customOptions) {
    return (element, options) => {
        const from = element.selectionStart || 0;
        const to = element.selectionEnd || 0;
        maskitoUpdateElement(element, {
            value: maskitoTransform(element.value, customOptions || options),
            selection: [from, to],
        });
    };
}

function maskitoStrictCompositionPlugin() {
    return (element, maskitoOptions) => {
        const listener = (event) => {
            if (event.inputType !== 'insertCompositionText') {
                return;
            }
            const selection = [
                element.selectionStart || 0,
                element.selectionEnd || 0,
            ];
            const elementState = {
                selection,
                value: element.value,
            };
            const validatedState = maskitoTransform(elementState, maskitoOptions);
            if (!areElementStatesEqual(elementState, validatedState)) {
                event.preventDefault();
                maskitoUpdateElement(element, validatedState);
            }
        };
        element.addEventListener('input', listener);
        return () => element.removeEventListener('input', listener);
    };
}

/**
 * Clamps a value between two inclusive limits
 *
 * @param value
 * @param min lower limit
 * @param max upper limit
 */
function clamp(value, min, max) {
    const clampedValue = Math.min(Number(max), Math.max(Number(min), Number(value)));
    return (value instanceof Date ? new Date(clampedValue) : clampedValue);
}

function countDigits(str) {
    return str.replaceAll(/\W/g, '').length;
}

function appendDate(initialDate, { day, month, year } = {}) {
    const date = new Date(initialDate);
    if (day) {
        date.setDate(date.getDate() + day);
    }
    if (month) {
        date.setMonth(date.getMonth() + month);
    }
    if (year) {
        date.setFullYear(date.getFullYear() + year);
    }
    return date;
}

const getDateSegmentValueLength = (dateString) => {
    var _a, _b, _c;
    return ({
        day: ((_a = dateString.match(/d/g)) === null || _a === void 0 ? void 0 : _a.length) || 0,
        month: ((_b = dateString.match(/m/g)) === null || _b === void 0 ? void 0 : _b.length) || 0,
        year: ((_c = dateString.match(/y/g)) === null || _c === void 0 ? void 0 : _c.length) || 0,
    });
};

function dateToSegments(date) {
    return {
        day: String(date.getDate()).padStart(2, '0'),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        year: String(date.getFullYear()).padStart(4, '0'),
        hours: String(date.getHours()).padStart(2, '0'),
        minutes: String(date.getMinutes()).padStart(2, '0'),
        seconds: String(date.getSeconds()).padStart(2, '0'),
        milliseconds: String(date.getMilliseconds()).padStart(3, '0'),
    };
}

function getFirstCompleteDate(dateString, dateModeTemplate) {
    const digitsInDate = countDigits(dateModeTemplate);
    const [completeDate = ''] = dateString.match(new RegExp(`(\\D*\\d){${digitsInDate}}`)) || [];
    return completeDate;
}

function isDateStringComplete(dateString, dateModeTemplate) {
    if (dateString.length < dateModeTemplate.length) {
        return false;
    }
    return dateString.split(/\D/).every((segment) => !segment.match(/^0+$/));
}

function parseDateRangeString(dateRange, dateModeTemplate, rangeSeparator) {
    const digitsInDate = countDigits(dateModeTemplate);
    return (dateRange
        .replace(rangeSeparator, '')
        .match(new RegExp(`(\\D*\\d[^\\d\\s]*){1,${digitsInDate}}`, 'g')) || []);
}

function parseDateString(dateString, fullMode) {
    const cleanMode = fullMode.replaceAll(/[^dmy]/g, '');
    const onlyDigitsDate = dateString.replaceAll(/\D+/g, '');
    const dateSegments = {
        day: onlyDigitsDate.slice(cleanMode.indexOf('d'), cleanMode.lastIndexOf('d') + 1),
        month: onlyDigitsDate.slice(cleanMode.indexOf('m'), cleanMode.lastIndexOf('m') + 1),
        year: onlyDigitsDate.slice(cleanMode.indexOf('y'), cleanMode.lastIndexOf('y') + 1),
    };
    return Object.fromEntries(Object.entries(dateSegments)
        .filter(([_, value]) => Boolean(value))
        .sort(([a], [b]) => fullMode.toLowerCase().indexOf(a.slice(0, 1)) >
        fullMode.toLowerCase().indexOf(b.slice(0, 1))
        ? 1
        : -1));
}

function segmentsToDate(parsedDate, parsedTime) {
    var _a, _b, _c, _d, _e, _f, _g;
    const year = ((_a = parsedDate.year) === null || _a === void 0 ? void 0 : _a.length) === 2 ? `20${parsedDate.year}` : parsedDate.year;
    const date = new Date(Number(year !== null && year !== void 0 ? year : '0'), Number((_b = parsedDate.month) !== null && _b !== void 0 ? _b : '1') - 1, Number((_c = parsedDate.day) !== null && _c !== void 0 ? _c : '1'), Number((_d = parsedTime === null || parsedTime === void 0 ? void 0 : parsedTime.hours) !== null && _d !== void 0 ? _d : '0'), Number((_e = parsedTime === null || parsedTime === void 0 ? void 0 : parsedTime.minutes) !== null && _e !== void 0 ? _e : '0'), Number((_f = parsedTime === null || parsedTime === void 0 ? void 0 : parsedTime.seconds) !== null && _f !== void 0 ? _f : '0'), Number((_g = parsedTime === null || parsedTime === void 0 ? void 0 : parsedTime.milliseconds) !== null && _g !== void 0 ? _g : '0'));
    // needed for years less than 1900
    date.setFullYear(Number(year !== null && year !== void 0 ? year : '0'));
    return date;
}

const DATE_TIME_SEPARATOR = ', ';

function toDateString({ day, month, year, hours, minutes, seconds, milliseconds, }, { dateMode, dateTimeSeparator = DATE_TIME_SEPARATOR, timeMode, }) {
    var _a;
    const safeYear = ((_a = dateMode.match(/y/g)) === null || _a === void 0 ? void 0 : _a.length) === 2 ? year === null || year === void 0 ? void 0 : year.slice(-2) : year;
    const fullMode = dateMode + (timeMode ? dateTimeSeparator + timeMode : '');
    return fullMode
        .replaceAll(/d+/g, day !== null && day !== void 0 ? day : '')
        .replaceAll(/m+/g, month !== null && month !== void 0 ? month : '')
        .replaceAll(/y+/g, safeYear !== null && safeYear !== void 0 ? safeYear : '')
        .replaceAll(/H+/g, hours !== null && hours !== void 0 ? hours : '')
        .replaceAll('MSS', milliseconds !== null && milliseconds !== void 0 ? milliseconds : '')
        .replaceAll(/M+/g, minutes !== null && minutes !== void 0 ? minutes : '')
        .replaceAll(/S+/g, seconds !== null && seconds !== void 0 ? seconds : '')
        .replaceAll(/^\D+/g, '')
        .replaceAll(/\D+$/g, '');
}

const DATE_SEGMENTS_MAX_VALUES = {
    day: 31,
    month: 12,
    year: 9999,
};

const DEFAULT_DECIMAL_PSEUDO_SEPARATORS = ['.', ',', 'б', 'ю'];

const DEFAULT_MIN_DATE = new Date('0001-01-01');
const DEFAULT_MAX_DATE = new Date('9999-12-31');

const DEFAULT_TIME_SEGMENT_MAX_VALUES = {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999,
};

const TIME_FIXED_CHARACTERS = [':', '.'];

const TIME_SEGMENT_VALUE_LENGTHS = {
    hours: 2,
    minutes: 2,
    seconds: 2,
    milliseconds: 3,
};

/**
 * {@link https://unicode-table.com/en/00A0/ Non-breaking space}.
 */
const CHAR_NO_BREAK_SPACE = '\u00A0';
/**
 * {@link https://symbl.cc/en/200B/ Zero width space}.
 */
const CHAR_ZERO_WIDTH_SPACE = '\u200B';
/**
 * {@link https://unicode-table.com/en/2013/ EN dash}
 * is used to indicate a range of numbers or a span of time.
 * @example 2006–2022
 */
const CHAR_EN_DASH = '\u2013';
/**
 * {@link https://unicode-table.com/en/2014/ EM dash}
 * is used to mark a break in a sentence.
 * @example Taiga UI — powerful set of open source components for Angular
 * ___
 * Don't confuse with {@link CHAR_EN_DASH} or {@link CHAR_HYPHEN}!
 */
const CHAR_EM_DASH = '\u2014';
/**
 * {@link https://unicode-table.com/en/002D/ Hyphen (minus sign)}
 * is used to combine words.
 * @example well-behaved
 * ___
 * Don't confuse with {@link CHAR_EN_DASH} or {@link CHAR_EM_DASH}!
 */
const CHAR_HYPHEN = '\u002D';
/**
 * {@link https://unicode-table.com/en/2212/ Minus}
 * is used as math operator symbol or before negative digits.
 * ---
 * Can be used as `&minus;`. Don't confuse with {@link CHAR_HYPHEN}
 */
const CHAR_MINUS = '\u2212';
/**
 * {@link https://symbl.cc/en/30FC/ Katakana-Hiragana Prolonged Sound Mark}
 * is used as prolonged sounds in Japanese.
 */
const CHAR_JP_HYPHEN = '\u30FC';
/**
 * {@link https://symbl.cc/en/003A/ Colon}
 * is a punctuation mark that connects parts of a text logically.
 * ---
 * is also used as separator in time.
 */
const CHAR_COLON = '\u003A';
/**
 * {@link https://symbl.cc/en/FF1A/ Full-width colon}
 * is a full-width punctuation mark used to separate parts of a text commonly in Japanese.
 */
const CHAR_JP_COLON = '\uFF1A';

function validateDateString({ dateString, dateModeTemplate, dateSegmentsSeparator, offset, selection: [from, to], }) {
    const parsedDate = parseDateString(dateString, dateModeTemplate);
    const dateSegments = Object.entries(parsedDate);
    const validatedDateSegments = {};
    for (const [segmentName, segmentValue] of dateSegments) {
        const validatedDate = toDateString(validatedDateSegments, {
            dateMode: dateModeTemplate,
        });
        const maxSegmentValue = DATE_SEGMENTS_MAX_VALUES[segmentName];
        const fantomSeparator = validatedDate.length && dateSegmentsSeparator.length;
        const lastSegmentDigitIndex = offset +
            validatedDate.length +
            fantomSeparator +
            getDateSegmentValueLength(dateModeTemplate)[segmentName];
        const isLastSegmentDigitAdded = lastSegmentDigitIndex >= from && lastSegmentDigitIndex === to;
        if (isLastSegmentDigitAdded && Number(segmentValue) > Number(maxSegmentValue)) {
            // 3|1.10.2010 => Type 9 => 3|1.10.2010
            return { validatedDateString: '', updatedSelection: [from, to] }; // prevent changes
        }
        if (isLastSegmentDigitAdded && Number(segmentValue) < 1) {
            // 31.0|1.2010 => Type 0 => 31.0|1.2010
            return { validatedDateString: '', updatedSelection: [from, to] }; // prevent changes
        }
        validatedDateSegments[segmentName] = segmentValue;
    }
    const validatedDateString = toDateString(validatedDateSegments, {
        dateMode: dateModeTemplate,
    });
    const addedDateSegmentSeparators = validatedDateString.length - dateString.length;
    return {
        validatedDateString,
        updatedSelection: [
            from + addedDateSegmentSeparators,
            to + addedDateSegmentSeparators,
        ],
    };
}

/**
 * Copy-pasted solution from lodash
 * @see https://lodash.com/docs/4.17.15#escapeRegExp
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = new RegExp(reRegExpChar.source);
function escapeRegExp(str) {
    return str && reHasRegExpChar.test(str)
        ? str.replaceAll(reRegExpChar, String.raw `\$&`)
        : str;
}

function extractAffixes(value, { prefix, postfix }) {
    var _a, _b;
    const prefixRegExp = new RegExp(`^${escapeRegExp(prefix)}`);
    const postfixRegExp = new RegExp(`${escapeRegExp(postfix)}$`);
    const [extractedPrefix = ''] = (_a = value.match(prefixRegExp)) !== null && _a !== void 0 ? _a : [];
    const [extractedPostfix = ''] = (_b = value.match(postfixRegExp)) !== null && _b !== void 0 ? _b : [];
    const cleanValue = value.replace(prefixRegExp, '').replace(postfixRegExp, '');
    return { extractedPrefix, extractedPostfix, cleanValue };
}

function findCommonBeginningSubstr(a, b) {
    let res = '';
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return res;
        }
        res += a[i];
    }
    return res;
}

function identity(x) {
    return x;
}

function isEmpty(entity) {
    return !entity || (typeof entity === 'object' && Object.keys(entity).length === 0);
}

const ALL_ZEROES_RE = /^0+$/;
function padWithZeroesUntilValid(segmentValue, paddedMaxValue, prefixedZeroesCount = 0) {
    const paddedSegmentValue = segmentValue.padEnd(paddedMaxValue.length, '0');
    if (Number(paddedSegmentValue) <= Number(paddedMaxValue)) {
        return { validatedSegmentValue: segmentValue, prefixedZeroesCount };
    }
    if (paddedSegmentValue.endsWith('0')) {
        // 00:|00 => Type 9 => 00:09|
        return padWithZeroesUntilValid(`0${segmentValue.slice(0, paddedMaxValue.length - 1)}`, paddedMaxValue, prefixedZeroesCount + 1);
    }
    const valueWithoutLastChar = segmentValue.slice(0, paddedMaxValue.length - 1);
    if (valueWithoutLastChar.match(ALL_ZEROES_RE)) {
        return { validatedSegmentValue: '', prefixedZeroesCount };
    }
    // |19:00 => Type 2 => 2|0:00
    return padWithZeroesUntilValid(`${valueWithoutLastChar}0`, paddedMaxValue, prefixedZeroesCount);
}

/**
 * Replace fullwidth colon with half width colon
 * @param fullWidthColon full width colon
 * @returns processed half width colon
 */
function toHalfWidthColon(fullWidthColon) {
    return fullWidthColon.replaceAll(new RegExp(CHAR_JP_COLON, 'g'), CHAR_COLON);
}

/**
 * Replace fullwidth numbers with half width number
 * @param fullWidthNumber full width number
 * @returns processed half width number
 */
function toHalfWidthNumber(fullWidthNumber) {
    return fullWidthNumber.replaceAll(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

/**
 * Convert full width colon (：) to half width one (:)
 */
function createColonConvertPreprocessor() {
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        return {
            elementState: {
                selection,
                value: toHalfWidthColon(value),
            },
            data: toHalfWidthColon(data),
        };
    };
}

function createDateSegmentsZeroPaddingPostprocessor({ dateModeTemplate, dateSegmentSeparator, splitFn, uniteFn, }) {
    return ({ value, selection }) => {
        var _a;
        const [from, to] = selection;
        const { dateStrings, restPart = '' } = splitFn(value);
        const validatedDateStrings = [];
        let caretShift = 0;
        dateStrings.forEach((dateString) => {
            const parsedDate = parseDateString(dateString, dateModeTemplate);
            const dateSegments = Object.entries(parsedDate);
            const validatedDateSegments = dateSegments.reduce((acc, [segmentName, segmentValue]) => {
                const { validatedSegmentValue, prefixedZeroesCount } = padWithZeroesUntilValid(segmentValue, `${DATE_SEGMENTS_MAX_VALUES[segmentName]}`);
                caretShift += prefixedZeroesCount;
                return Object.assign(Object.assign({}, acc), { [segmentName]: validatedSegmentValue });
            }, {});
            validatedDateStrings.push(toDateString(validatedDateSegments, { dateMode: dateModeTemplate }));
        });
        const validatedValue = uniteFn(validatedDateStrings, value) +
            (((_a = dateStrings[dateStrings.length - 1]) === null || _a === void 0 ? void 0 : _a.endsWith(dateSegmentSeparator))
                ? dateSegmentSeparator
                : '') +
            restPart;
        if (caretShift &&
            validatedValue.slice(to + caretShift, to + caretShift + dateSegmentSeparator.length) === dateSegmentSeparator) {
            /**
             * If `caretShift` > 0, it means that time segment was padded with zero.
             * It is only possible if any character insertion happens.
             * If caret is before `dateSegmentSeparator` => it should be moved after `dateSegmentSeparator`.
             */
            caretShift += dateSegmentSeparator.length;
        }
        return {
            selection: [from + caretShift, to + caretShift],
            value: validatedValue,
        };
    };
}

/**
 * It replaces pseudo range separators with valid one.
 * @example '01.01.2000_11.11.2000' -> '01.01.2000 - 01.01.2000'
 * @example '01.01.2000_23:59' -> '01.01.2000, 23:59'
 */
function createFirstDateEndSeparatorPreprocessor({ dateModeTemplate, firstDateEndSeparator, dateSegmentSeparator, pseudoFirstDateEndSeparators, }) {
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        const firstCompleteDate = getFirstCompleteDate(value, dateModeTemplate);
        const pseudoSeparators = pseudoFirstDateEndSeparators.filter((x) => !firstDateEndSeparator.includes(x) && x !== dateSegmentSeparator);
        const pseudoSeparatorsRE = new RegExp(`[${pseudoSeparators.join('')}]`, 'gi');
        return {
            elementState: {
                selection,
                value: firstCompleteDate && value.length > firstCompleteDate.length
                    ? firstCompleteDate +
                        value
                            .slice(firstCompleteDate.length)
                            .replace(/^[\D\s]*/, firstDateEndSeparator)
                    : value,
            },
            data: data.replace(pseudoSeparatorsRE, firstDateEndSeparator),
        };
    };
}

/**
 * Convert full width numbers like １, ２ to half width numbers 1, 2
 */
function createFullWidthToHalfWidthPreprocessor() {
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        return {
            elementState: {
                selection,
                value: toHalfWidthNumber(value),
            },
            data: toHalfWidthNumber(data),
        };
    };
}

function raiseSegmentValueToMin(segments, fullMode) {
    const segmentsLength = getDateSegmentValueLength(fullMode);
    return Object.fromEntries(Object.entries(segments).map(([key, value]) => {
        const segmentLength = segmentsLength[key];
        return [
            key,
            value.length === segmentLength && value.match(/^0+$/)
                ? '1'.padStart(segmentLength, '0')
                : value,
        ];
    }));
}

function createMinMaxDatePostprocessor({ dateModeTemplate, min = DEFAULT_MIN_DATE, max = DEFAULT_MAX_DATE, rangeSeparator = '', dateSegmentSeparator = '.', }) {
    return ({ value, selection }) => {
        const endsWithRangeSeparator = rangeSeparator && value.endsWith(rangeSeparator);
        const dateStrings = parseDateRangeString(value, dateModeTemplate, rangeSeparator);
        let validatedValue = '';
        for (const dateString of dateStrings) {
            validatedValue += validatedValue ? rangeSeparator : '';
            const parsedDate = parseDateString(dateString, dateModeTemplate);
            if (!isDateStringComplete(dateString, dateModeTemplate)) {
                const fixedDate = raiseSegmentValueToMin(parsedDate, dateModeTemplate);
                const fixedValue = toDateString(fixedDate, { dateMode: dateModeTemplate });
                const tail = dateString.endsWith(dateSegmentSeparator)
                    ? dateSegmentSeparator
                    : '';
                validatedValue += fixedValue + tail;
                continue;
            }
            const date = segmentsToDate(parsedDate);
            const clampedDate = clamp(date, min, max);
            validatedValue += toDateString(dateToSegments(clampedDate), {
                dateMode: dateModeTemplate,
            });
        }
        return {
            selection,
            value: validatedValue + (endsWithRangeSeparator ? rangeSeparator : ''),
        };
    };
}

function normalizeDatePreprocessor({ dateModeTemplate, dateSegmentsSeparator, rangeSeparator = '', dateTimeSeparator = DATE_TIME_SEPARATOR, }) {
    return ({ elementState, data }) => {
        const separator = rangeSeparator
            ? new RegExp(`${rangeSeparator}|-`)
            : dateTimeSeparator;
        const possibleDates = data.split(separator);
        const dates = data.includes(dateTimeSeparator)
            ? [possibleDates[0] || '']
            : possibleDates;
        if (dates.every((date) => date.trim().split(/\D/).filter(Boolean).length ===
            dateModeTemplate.split(dateSegmentsSeparator).length)) {
            const newData = dates
                .map((date) => normalizeDateString(date, dateModeTemplate, dateSegmentsSeparator))
                .join(rangeSeparator);
            return {
                elementState,
                data: `${newData}${data.includes(dateTimeSeparator)
                    ? dateTimeSeparator + possibleDates[1] || ''
                    : ''}`,
            };
        }
        return { elementState, data };
    };
}
function normalizeDateString(dateString, template, separator) {
    const dateSegments = dateString.split(/\D/).filter(Boolean);
    const templateSegments = template.split(separator);
    const normalizedSegments = dateSegments.map((segment, index) => {
        var _a;
        return index === templateSegments.length - 1
            ? segment
            : segment.padStart(((_a = templateSegments[index]) === null || _a === void 0 ? void 0 : _a.length) || 0, '0');
    });
    return normalizedSegments.join(separator);
}

function maskitoPostfixPostprocessorGenerator(postfix) {
    const postfixRE = new RegExp(`${escapeRegExp(postfix)}$`);
    return postfix
        ? ({ value, selection }, initialElementState) => {
            if (!value && !initialElementState.value.endsWith(postfix)) {
                // cases when developer wants input to be empty (programmatically)
                return { value, selection };
            }
            if (!value.endsWith(postfix) &&
                !initialElementState.value.endsWith(postfix)) {
                return { selection, value: value + postfix };
            }
            const initialValueBeforePostfix = initialElementState.value.replace(postfixRE, '');
            const postfixWasModified = initialElementState.selection[1] >= initialValueBeforePostfix.length;
            const alreadyExistedValueBeforePostfix = findCommonBeginningSubstr(initialValueBeforePostfix, value);
            return {
                selection,
                value: Array.from(postfix)
                    .reverse()
                    .reduce((newValue, char, index) => {
                    const i = newValue.length - 1 - index;
                    const isInitiallyMirroredChar = alreadyExistedValueBeforePostfix[i] === char &&
                        postfixWasModified;
                    return newValue[i] !== char || isInitiallyMirroredChar
                        ? newValue.slice(0, i + 1) + char + newValue.slice(i + 1)
                        : newValue;
                }, value),
            };
        }
        : identity;
}

function maskitoPrefixPostprocessorGenerator(prefix) {
    return prefix
        ? ({ value, selection }, initialElementState) => {
            if (value.startsWith(prefix) || // already valid
                (!value && !initialElementState.value.startsWith(prefix)) // cases when developer wants input to be empty
            ) {
                return { value, selection };
            }
            const [from, to] = selection;
            const prefixedValue = Array.from(prefix).reduce((modifiedValue, char, i) => modifiedValue[i] === char
                ? modifiedValue
                : modifiedValue.slice(0, i) + char + modifiedValue.slice(i), value);
            const addedCharsCount = prefixedValue.length - value.length;
            return {
                selection: [from + addedCharsCount, to + addedCharsCount],
                value: prefixedValue,
            };
        }
        : identity;
}

function createValidDatePreprocessor({ dateModeTemplate, dateSegmentsSeparator, rangeSeparator = '', }) {
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        if (data === dateSegmentsSeparator) {
            return {
                elementState,
                data: selection[0] === value.length ? data : '',
            };
        }
        const newCharacters = data.replaceAll(new RegExp(`[^\\d${escapeRegExp(dateSegmentsSeparator)}${rangeSeparator}]`, 'g'), '');
        if (!newCharacters) {
            return { elementState, data: '' };
        }
        const [from, rawTo] = selection;
        let to = rawTo + data.length;
        const newPossibleValue = value.slice(0, from) + newCharacters + value.slice(to);
        const dateStrings = parseDateRangeString(newPossibleValue, dateModeTemplate, rangeSeparator);
        let validatedValue = '';
        const hasRangeSeparator = Boolean(rangeSeparator) && newPossibleValue.includes(rangeSeparator);
        for (const dateString of dateStrings) {
            const { validatedDateString, updatedSelection } = validateDateString({
                dateString,
                dateModeTemplate,
                dateSegmentsSeparator,
                offset: validatedValue.length,
                selection: [from, to],
            });
            if (dateString && !validatedDateString) {
                return { elementState, data: '' }; // prevent changes
            }
            to = updatedSelection[1];
            validatedValue +=
                hasRangeSeparator && !validatedValue
                    ? validatedDateString + rangeSeparator
                    : validatedDateString;
        }
        const newData = validatedValue.slice(from, to);
        return {
            elementState: {
                selection,
                value: validatedValue.slice(0, from) +
                    newData
                        .split(dateSegmentsSeparator)
                        .map((segment) => '0'.repeat(segment.length))
                        .join(dateSegmentsSeparator) +
                    validatedValue.slice(to),
            },
            data: newData,
        };
    };
}

function maskitoEventHandler(name, handler, eventListenerOptions) {
    return (element, maskitoOptions) => {
        const listener = () => handler(element, maskitoOptions);
        element.addEventListener(name, listener, eventListenerOptions);
        return () => element.removeEventListener(name, listener, eventListenerOptions);
    };
}

function maskitoAddOnFocusPlugin(value) {
    return maskitoEventHandler('focus', (element) => {
        if (!element.value) {
            maskitoUpdateElement(element, value);
        }
    });
}

function maskitoCaretGuard(guard) {
    return (element) => {
        const document = element.ownerDocument;
        let isPointerDown = 0;
        const onPointerDown = () => isPointerDown++;
        const onPointerUp = () => {
            isPointerDown = Math.max(--isPointerDown, 0);
        };
        const listener = () => {
            if (!element.matches(':focus')) {
                return;
            }
            if (isPointerDown) {
                return document.addEventListener('mouseup', listener, {
                    once: true,
                    passive: true,
                });
            }
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const [fromLimit, toLimit] = guard(element.value, [start, end]);
            if (fromLimit > start || toLimit < end) {
                element.setSelectionRange(clamp(start, fromLimit, toLimit), clamp(end, fromLimit, toLimit));
            }
        };
        document.addEventListener('selectionchange', listener, { passive: true });
        element.addEventListener('mousedown', onPointerDown, { passive: true });
        document.addEventListener('mouseup', onPointerUp, { passive: true });
        return () => {
            document.removeEventListener('selectionchange', listener);
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('mouseup', onPointerUp);
        };
    };
}

const maskitoRejectEvent = (element) => {
    const listener = () => {
        const value = element.value;
        element.addEventListener('beforeinput', (event) => {
            if (event.defaultPrevented && value === element.value) {
                element.dispatchEvent(new CustomEvent('maskitoReject', { bubbles: true }));
            }
        }, { once: true });
    };
    element.addEventListener('beforeinput', listener, true);
    return () => element.removeEventListener('beforeinput', listener, true);
};

function maskitoRemoveOnBlurPlugin(value) {
    return maskitoEventHandler('blur', (element) => {
        if (element.value === value) {
            maskitoUpdateElement(element, '');
        }
    });
}

const noop = () => { };
function createTimeSegmentsSteppingPlugin({ step, fullMode, timeSegmentMaxValues, }) {
    const segmentsIndexes = createTimeSegmentsIndexes(fullMode);
    return step <= 0
        ? noop
        : (element) => {
            const listener = (event) => {
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
                    return;
                }
                event.preventDefault();
                const selectionStart = element.selectionStart || 0;
                const activeSegment = getActiveSegment({
                    segmentsIndexes,
                    selectionStart,
                });
                if (!activeSegment) {
                    return;
                }
                const updatedValue = updateSegmentValue({
                    selection: segmentsIndexes.get(activeSegment),
                    value: element.value,
                    toAdd: event.key === 'ArrowUp' ? step : -step,
                    max: timeSegmentMaxValues[activeSegment],
                });
                maskitoUpdateElement(element, {
                    value: updatedValue,
                    selection: [selectionStart, selectionStart],
                });
            };
            element.addEventListener('keydown', listener);
            return () => element.removeEventListener('keydown', listener);
        };
}
function createTimeSegmentsIndexes(fullMode) {
    return new Map([
        ['hours', getSegmentRange(fullMode, 'HH')],
        ['minutes', getSegmentRange(fullMode, 'MM')],
        ['seconds', getSegmentRange(fullMode, 'SS')],
        ['milliseconds', getSegmentRange(fullMode, 'MSS')],
    ]);
}
function getSegmentRange(mode, segment) {
    const index = mode.indexOf(segment);
    return index === -1 ? [-1, -1] : [index, index + segment.length];
}
function getActiveSegment({ segmentsIndexes, selectionStart, }) {
    for (const [segmentName, segmentRange] of segmentsIndexes.entries()) {
        const [from, to] = segmentRange;
        if (from <= selectionStart && selectionStart <= to) {
            return segmentName;
        }
    }
    return null;
}
function updateSegmentValue({ selection, value, toAdd, max, }) {
    const [from, to] = selection;
    const segmentValue = Number(value.slice(from, to).padEnd(to - from, '0'));
    const newSegmentValue = mod(segmentValue + toAdd, max + 1);
    return (value.slice(0, from) +
        String(newSegmentValue).padStart(to - from, '0') +
        value.slice(to, value.length));
}
function mod(value, max) {
    if (value < 0) {
        value += Math.floor(Math.abs(value) / max + 1) * max;
    }
    return value % max;
}

function maskitoWithPlaceholder(placeholder, focusedOnly = false) {
    let lastClearValue = '';
    let action = 'validation';
    const removePlaceholder = (value) => {
        for (let i = value.length - 1; i >= lastClearValue.length; i--) {
            if (value[i] !== placeholder[i]) {
                return value.slice(0, i + 1);
            }
        }
        return value.slice(0, lastClearValue.length);
    };
    const plugins = [maskitoCaretGuard((value) => [0, removePlaceholder(value).length])];
    let focused = false;
    if (focusedOnly) {
        const focus = maskitoEventHandler('focus', (element) => {
            focused = true;
            maskitoUpdateElement(element, element.value + placeholder.slice(element.value.length));
        }, { capture: true });
        const blur = maskitoEventHandler('blur', (element) => {
            focused = false;
            maskitoUpdateElement(element, removePlaceholder(element.value));
        }, { capture: true });
        plugins.push(focus, blur);
    }
    return {
        plugins,
        removePlaceholder,
        preprocessors: [
            ({ elementState, data }, actionType) => {
                action = actionType;
                const { value, selection } = elementState;
                return {
                    elementState: {
                        selection,
                        value: removePlaceholder(value),
                    },
                    data,
                };
            },
        ],
        postprocessors: [
            ({ value, selection }, initialElementState) => {
                lastClearValue = value;
                const justPlaceholderRemoval = value +
                    placeholder.slice(value.length, initialElementState.value.length) ===
                    initialElementState.value;
                if (action === 'validation' && justPlaceholderRemoval) {
                    /**
                     * If `value` still equals to `initialElementState.value`,
                     * then it means that value is patched programmatically (from Maskito's plugin or externally).
                     * In this case, we don't want to mutate value and automatically add/remove placeholder.
                     * ___
                     * For example, developer wants to remove manually placeholder (+ do something else with value) on blur.
                     * Without this condition, placeholder will be unexpectedly added again.
                     */
                    return { selection, value: initialElementState.value };
                }
                const newValue = focused || !focusedOnly
                    ? value + placeholder.slice(value.length)
                    : value;
                if (newValue === initialElementState.value &&
                    action === 'deleteBackward') {
                    const [caretIndex] = initialElementState.selection;
                    return {
                        value: newValue,
                        selection: [caretIndex, caretIndex],
                    };
                }
                return { value: newValue, selection };
            },
        ],
    };
}

function createZeroPlaceholdersPreprocessor() {
    return ({ elementState }, actionType) => {
        const { value, selection } = elementState;
        if (!value || isLastChar(value, selection)) {
            return { elementState };
        }
        const [from, to] = selection;
        const zeroes = value.slice(from, to).replaceAll(/\d/g, '0');
        const newValue = value.slice(0, from) + zeroes + value.slice(to);
        if (actionType === 'validation' || (actionType === 'insert' && from === to)) {
            return {
                elementState: { selection, value: newValue },
            };
        }
        return {
            elementState: {
                selection: actionType === 'deleteBackward' || actionType === 'insert'
                    ? [from, from]
                    : [to, to],
                value: newValue,
            },
        };
    };
}
function isLastChar(value, [_, to]) {
    return to === value.length;
}

function maskitoDateOptionsGenerator({ mode, separator = '.', max, min, }) {
    const dateModeTemplate = mode.split('/').join(separator);
    return Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), { mask: Array.from(dateModeTemplate).map((char) => separator.includes(char) ? char : /\d/), overwriteMode: 'replace', preprocessors: [
            createFullWidthToHalfWidthPreprocessor(),
            createZeroPlaceholdersPreprocessor(),
            normalizeDatePreprocessor({
                dateModeTemplate,
                dateSegmentsSeparator: separator,
            }),
            createValidDatePreprocessor({
                dateModeTemplate,
                dateSegmentsSeparator: separator,
            }),
        ], postprocessors: [
            createDateSegmentsZeroPaddingPostprocessor({
                dateModeTemplate,
                dateSegmentSeparator: separator,
                splitFn: (value) => ({ dateStrings: [value] }),
                uniteFn: ([dateString = '']) => dateString,
            }),
            createMinMaxDatePostprocessor({
                min,
                max,
                dateModeTemplate,
                dateSegmentSeparator: separator,
            }),
        ] });
}

const POSSIBLE_DATE_RANGE_SEPARATOR = [
    CHAR_HYPHEN,
    CHAR_EN_DASH,
    CHAR_EM_DASH,
    CHAR_MINUS,
    CHAR_JP_HYPHEN,
];

function createMinMaxRangeLengthPostprocessor({ dateModeTemplate, rangeSeparator, minLength, maxLength, max = DEFAULT_MAX_DATE, }) {
    if (isEmpty(minLength) && isEmpty(maxLength)) {
        return identity;
    }
    return ({ value, selection }) => {
        const dateStrings = parseDateRangeString(value, dateModeTemplate, rangeSeparator);
        if (dateStrings.length !== 2 ||
            dateStrings.some((date) => !isDateStringComplete(date, dateModeTemplate))) {
            return { value, selection };
        }
        const [fromDate, toDate] = dateStrings.map((dateString) => segmentsToDate(parseDateString(dateString, dateModeTemplate)));
        if (!fromDate || !toDate) {
            return { value, selection };
        }
        const minDistantToDate = appendDate(fromDate, Object.assign(Object.assign({}, minLength), { 
            // 06.02.2023 - 07.02.2023 => {minLength: {day: 3}} => 06.02.2023 - 08.02.2023
            // "from"-day is included in the range
            day: (minLength === null || minLength === void 0 ? void 0 : minLength.day) && minLength.day - 1 }));
        const maxDistantToDate = !isEmpty(maxLength)
            ? appendDate(fromDate, Object.assign(Object.assign({}, maxLength), { day: (maxLength === null || maxLength === void 0 ? void 0 : maxLength.day) && maxLength.day - 1 }))
            : max;
        const minLengthClampedToDate = clamp(toDate, minDistantToDate, max);
        const minMaxLengthClampedToDate = minLengthClampedToDate > maxDistantToDate
            ? maxDistantToDate
            : minLengthClampedToDate;
        return {
            selection,
            value: dateStrings[0] +
                rangeSeparator +
                toDateString(dateToSegments(minMaxLengthClampedToDate), {
                    dateMode: dateModeTemplate,
                }),
        };
    };
}

function createSwapDatesPostprocessor({ dateModeTemplate, rangeSeparator, }) {
    return ({ value, selection }) => {
        const dateStrings = parseDateRangeString(value, dateModeTemplate, rangeSeparator);
        const isDateRangeComplete = dateStrings.length === 2 &&
            dateStrings.every((date) => isDateStringComplete(date, dateModeTemplate));
        const [from, to] = selection;
        const caretAtTheEnd = from >= value.length;
        const allValueSelected = from === 0 && to >= value.length; // dropping text inside with a pointer
        if (!(caretAtTheEnd || allValueSelected) || !isDateRangeComplete) {
            return { value, selection };
        }
        const [fromDate, toDate] = dateStrings.map((dateString) => segmentsToDate(parseDateString(dateString, dateModeTemplate)));
        return {
            selection,
            value: fromDate && toDate && fromDate > toDate
                ? dateStrings.reverse().join(rangeSeparator)
                : value,
        };
    };
}

function maskitoDateRangeOptionsGenerator({ mode, min, max, minLength, maxLength, dateSeparator = '.', rangeSeparator = `${CHAR_NO_BREAK_SPACE}${CHAR_EN_DASH}${CHAR_NO_BREAK_SPACE}`, }) {
    const dateModeTemplate = mode.split('/').join(dateSeparator);
    const dateMask = Array.from(dateModeTemplate).map((char) => dateSeparator.includes(char) ? char : /\d/);
    return Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), { mask: [...dateMask, ...Array.from(rangeSeparator), ...dateMask], overwriteMode: 'replace', preprocessors: [
            createFullWidthToHalfWidthPreprocessor(),
            createFirstDateEndSeparatorPreprocessor({
                dateModeTemplate,
                dateSegmentSeparator: dateSeparator,
                firstDateEndSeparator: rangeSeparator,
                pseudoFirstDateEndSeparators: POSSIBLE_DATE_RANGE_SEPARATOR,
            }),
            createZeroPlaceholdersPreprocessor(),
            normalizeDatePreprocessor({
                dateModeTemplate,
                rangeSeparator,
                dateSegmentsSeparator: dateSeparator,
            }),
            createValidDatePreprocessor({
                dateModeTemplate,
                rangeSeparator,
                dateSegmentsSeparator: dateSeparator,
            }),
        ], postprocessors: [
            createDateSegmentsZeroPaddingPostprocessor({
                dateModeTemplate,
                dateSegmentSeparator: dateSeparator,
                splitFn: (value) => ({
                    dateStrings: parseDateRangeString(value, dateModeTemplate, rangeSeparator),
                }),
                uniteFn: (validatedDateStrings, initialValue) => validatedDateStrings.reduce((acc, dateString, dateIndex) => acc +
                    dateString +
                    (!dateIndex && initialValue.includes(rangeSeparator)
                        ? rangeSeparator
                        : ''), ''),
            }),
            createMinMaxDatePostprocessor({
                min,
                max,
                dateModeTemplate,
                rangeSeparator,
                dateSegmentSeparator: dateSeparator,
            }),
            createMinMaxRangeLengthPostprocessor({
                dateModeTemplate,
                minLength,
                maxLength,
                max,
                rangeSeparator,
            }),
            createSwapDatesPostprocessor({
                dateModeTemplate,
                rangeSeparator,
            }),
        ] });
}

function padTimeSegments(timeSegments, pad) {
    return Object.fromEntries(Object.entries(timeSegments).map(([segmentName, segmentValue]) => [
        segmentName,
        pad(String(segmentValue), TIME_SEGMENT_VALUE_LENGTHS[segmentName]),
    ]));
}

function padEndTimeSegments(timeSegments) {
    return padTimeSegments(timeSegments, (value, length) => value.padEnd(length, '0'));
}

function padStartTimeSegments(timeSegments) {
    return padTimeSegments(timeSegments, (value, length) => value.padStart(length, '0'));
}

const SEGMENT_FULL_NAME = {
    HH: 'hours',
    MM: 'minutes',
    SS: 'seconds',
    MSS: 'milliseconds',
};
/**
 * @param timeString can be with/without fixed characters
 */
function parseTimeString(timeString, timeMode) {
    const onlyDigits = timeString.replaceAll(/\D+/g, '');
    let offset = 0;
    return Object.fromEntries(timeMode.split(/\W/).map((segmentAbbr) => {
        const segmentValue = onlyDigits.slice(offset, offset + segmentAbbr.length);
        offset += segmentAbbr.length;
        return [SEGMENT_FULL_NAME[segmentAbbr], segmentValue];
    }));
}

const LEADING_NON_DIGITS = /^\D*/;
const TRAILING_NON_DIGITS = /\D*$/;
function toTimeString({ hours = '', minutes = '', seconds = '', milliseconds = '', }) {
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
        .replace(LEADING_NON_DIGITS, '')
        .replace(TRAILING_NON_DIGITS, '');
}

const TRAILING_TIME_SEGMENT_SEPARATOR_REG = new RegExp(`[${TIME_FIXED_CHARACTERS.map(escapeRegExp).join('')}]$`);
function validateTimeString({ timeString, paddedMaxValues, offset, selection: [from, to], timeMode, }) {
    const parsedTime = parseTimeString(timeString, timeMode);
    const possibleTimeSegments = Object.entries(parsedTime);
    const validatedTimeSegments = {};
    let paddedZeroes = 0;
    for (const [segmentName, segmentValue] of possibleTimeSegments) {
        const validatedTime = toTimeString(validatedTimeSegments);
        const maxSegmentValue = paddedMaxValues[segmentName];
        const fantomSeparator = validatedTime.length && 1;
        const lastSegmentDigitIndex = offset +
            validatedTime.length +
            fantomSeparator +
            TIME_SEGMENT_VALUE_LENGTHS[segmentName];
        const isLastSegmentDigitAdded = lastSegmentDigitIndex >= from && lastSegmentDigitIndex <= to;
        if (isLastSegmentDigitAdded && Number(segmentValue) > Number(maxSegmentValue)) {
            // 2|0:00 => Type 9 => 2|0:00
            return { validatedTimeString: '', updatedTimeSelection: [from, to] }; // prevent changes
        }
        const { validatedSegmentValue, prefixedZeroesCount } = padWithZeroesUntilValid(segmentValue, `${maxSegmentValue}`);
        paddedZeroes += prefixedZeroesCount;
        validatedTimeSegments[segmentName] = validatedSegmentValue;
    }
    const [trailingSegmentSeparator = ''] = timeString.match(TRAILING_TIME_SEGMENT_SEPARATOR_REG) || [];
    const validatedTimeString = toTimeString(validatedTimeSegments) + trailingSegmentSeparator;
    const addedDateSegmentSeparators = Math.max(validatedTimeString.length - timeString.length, 0);
    return {
        validatedTimeString,
        updatedTimeSelection: [
            from + paddedZeroes + addedDateSegmentSeparators,
            to + paddedZeroes + addedDateSegmentSeparators,
        ],
    };
}

function isDateTimeStringComplete(dateTimeString, { dateMode, timeMode, dateTimeSeparator = DATE_TIME_SEPARATOR, }) {
    return (dateTimeString.length >=
        dateMode.length + timeMode.length + dateTimeSeparator.length &&
        (dateTimeString.split(dateTimeSeparator)[0] || '')
            .split(/\D/)
            .every((segment) => !segment.match(/^0+$/)));
}

function parseDateTimeString(dateTime, { dateModeTemplate, dateTimeSeparator, }) {
    const hasSeparator = dateTime.includes(dateTimeSeparator);
    return [
        dateTime.slice(0, dateModeTemplate.length),
        dateTime.slice(hasSeparator
            ? dateModeTemplate.length + dateTimeSeparator.length
            : dateModeTemplate.length),
    ];
}

function createMinMaxDateTimePostprocessor({ dateModeTemplate, timeMode, min = DEFAULT_MIN_DATE, max = DEFAULT_MAX_DATE, dateTimeSeparator, }) {
    return ({ value, selection }) => {
        const [dateString, timeString] = parseDateTimeString(value, {
            dateModeTemplate,
            dateTimeSeparator,
        });
        const parsedDate = parseDateString(dateString, dateModeTemplate);
        const parsedTime = parseTimeString(timeString, timeMode);
        if (!isDateTimeStringComplete(value, {
            dateMode: dateModeTemplate,
            timeMode,
            dateTimeSeparator,
        })) {
            const fixedDate = raiseSegmentValueToMin(parsedDate, dateModeTemplate);
            const { year, month, day } = isDateStringComplete(dateString, dateModeTemplate)
                ? dateToSegments(clamp(segmentsToDate(fixedDate), min, max))
                : fixedDate;
            const fixedValue = toDateString(Object.assign({ year,
                month,
                day }, parsedTime), { dateMode: dateModeTemplate, dateTimeSeparator, timeMode });
            const tail = value.slice(fixedValue.length);
            return {
                selection,
                value: fixedValue + tail,
            };
        }
        const date = segmentsToDate(parsedDate, parsedTime);
        const clampedDate = clamp(date, min, max);
        const validatedValue = toDateString(dateToSegments(clampedDate), {
            dateMode: dateModeTemplate,
            dateTimeSeparator,
            timeMode,
        });
        return {
            selection,
            value: validatedValue,
        };
    };
}

function createValidDateTimePreprocessor({ dateModeTemplate, dateSegmentsSeparator, dateTimeSeparator, timeMode, }) {
    const invalidCharsRegExp = new RegExp(`[^\\d${TIME_FIXED_CHARACTERS.map(escapeRegExp).join('')}${escapeRegExp(dateSegmentsSeparator)}]+`);
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        if (data === dateSegmentsSeparator) {
            return {
                elementState,
                data: selection[0] === value.length ? data : '',
            };
        }
        const newCharacters = data.replace(invalidCharsRegExp, '');
        if (!newCharacters) {
            return { elementState, data: '' };
        }
        const [from, rawTo] = selection;
        let to = rawTo + data.length;
        const newPossibleValue = value.slice(0, from) + newCharacters + value.slice(to);
        const [dateString, timeString] = parseDateTimeString(newPossibleValue, {
            dateModeTemplate,
            dateTimeSeparator,
        });
        let validatedValue = '';
        const hasDateTimeSeparator = newPossibleValue.includes(dateTimeSeparator);
        const { validatedDateString, updatedSelection } = validateDateString({
            dateString,
            dateSegmentsSeparator,
            dateModeTemplate,
            offset: 0,
            selection: [from, to],
        });
        if (dateString && !validatedDateString) {
            return { elementState, data: '' }; // prevent changes
        }
        to = updatedSelection[1];
        validatedValue += validatedDateString;
        const paddedMaxValues = padStartTimeSegments(DEFAULT_TIME_SEGMENT_MAX_VALUES);
        const { validatedTimeString, updatedTimeSelection } = validateTimeString({
            timeString,
            paddedMaxValues,
            offset: validatedValue.length + dateTimeSeparator.length,
            selection: [from, to],
            timeMode,
        });
        if (timeString && !validatedTimeString) {
            return { elementState, data: '' }; // prevent changes
        }
        to = updatedTimeSelection[1];
        validatedValue += hasDateTimeSeparator
            ? dateTimeSeparator + validatedTimeString
            : validatedTimeString;
        const newData = validatedValue.slice(from, to);
        return {
            elementState: {
                selection,
                value: validatedValue.slice(0, from) +
                    newData
                        .split(dateSegmentsSeparator)
                        .map((segment) => '0'.repeat(segment.length))
                        .join(dateSegmentsSeparator) +
                    validatedValue.slice(to),
            },
            data: newData,
        };
    };
}

function maskitoDateTimeOptionsGenerator({ dateMode, timeMode, dateSeparator = '.', min, max, dateTimeSeparator = DATE_TIME_SEPARATOR, timeStep = 0, }) {
    const dateModeTemplate = dateMode.split('/').join(dateSeparator);
    return Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), { mask: [
            ...Array.from(dateModeTemplate).map((char) => dateSeparator.includes(char) ? char : /\d/),
            ...dateTimeSeparator.split(''),
            ...Array.from(timeMode).map((char) => TIME_FIXED_CHARACTERS.includes(char) ? char : /\d/),
        ], overwriteMode: 'replace', preprocessors: [
            createFullWidthToHalfWidthPreprocessor(),
            createColonConvertPreprocessor(),
            createFirstDateEndSeparatorPreprocessor({
                dateModeTemplate,
                dateSegmentSeparator: dateSeparator,
                firstDateEndSeparator: dateTimeSeparator,
                pseudoFirstDateEndSeparators: dateTimeSeparator.split(''),
            }),
            createZeroPlaceholdersPreprocessor(),
            normalizeDatePreprocessor({
                dateModeTemplate,
                dateSegmentsSeparator: dateSeparator,
                dateTimeSeparator,
            }),
            createValidDateTimePreprocessor({
                dateModeTemplate,
                dateSegmentsSeparator: dateSeparator,
                dateTimeSeparator,
                timeMode,
            }),
        ], postprocessors: [
            createDateSegmentsZeroPaddingPostprocessor({
                dateModeTemplate,
                dateSegmentSeparator: dateSeparator,
                splitFn: (value) => {
                    const [dateString, timeString] = parseDateTimeString(value, {
                        dateModeTemplate,
                        dateTimeSeparator,
                    });
                    return { dateStrings: [dateString], restPart: timeString };
                },
                uniteFn: ([validatedDateString], initialValue) => validatedDateString +
                    (initialValue.includes(dateTimeSeparator) ? dateTimeSeparator : ''),
            }),
            createMinMaxDateTimePostprocessor({
                min,
                max,
                dateModeTemplate,
                timeMode,
                dateTimeSeparator,
            }),
        ], plugins: [
            createTimeSegmentsSteppingPlugin({
                step: timeStep,
                fullMode: `${dateModeTemplate}${dateTimeSeparator}${timeMode}`,
                timeSegmentMaxValues: DEFAULT_TIME_SEGMENT_MAX_VALUES,
            }),
        ] });
}

/**
 * It drops prefix and postfix from data
 * Needed for case, when prefix or postfix contain decimalSeparator, to ignore it in resulting number
 * @example User pastes '{prefix}123.45{postfix}' => 123.45
 */
function createAffixesFilterPreprocessor({ prefix, postfix, }) {
    return ({ elementState, data }) => {
        const { cleanValue: cleanData } = extractAffixes(data, {
            prefix,
            postfix,
        });
        return {
            elementState,
            data: cleanData,
        };
    };
}

function generateMaskExpression({ decimalSeparator, isNegativeAllowed, precision, thousandSeparator, prefix, postfix, decimalPseudoSeparators = [], pseudoMinuses = [], minusSign, }) {
    const computedPrefix = computeAllOptionalCharsRegExp(prefix);
    const digit = String.raw `\d`;
    const optionalMinus = isNegativeAllowed
        ? `[${minusSign}${pseudoMinuses.map((x) => `\\${x}`).join('')}]?`
        : '';
    const integerPart = thousandSeparator
        ? `[${digit}${escapeRegExp(thousandSeparator).replaceAll(/\s/g, String.raw `\s`)}]*`
        : `[${digit}]*`;
    const decimalPart = precision > 0
        ? `([${escapeRegExp(decimalSeparator)}${decimalPseudoSeparators
            .map(escapeRegExp)
            .join('')}]${digit}{0,${Number.isFinite(precision) ? precision : ''}})?`
        : '';
    const computedPostfix = computeAllOptionalCharsRegExp(postfix);
    return new RegExp(`^${computedPrefix}${optionalMinus}${integerPart}${decimalPart}${computedPostfix}$`);
}
function computeAllOptionalCharsRegExp(str) {
    return str
        ? `${str
            .split('')
            .map((char) => `${escapeRegExp(char)}?`)
            .join('')}`
        : '';
}

function maskitoParseNumber(maskedNumber, decimalSeparator = '.') {
    const hasNegativeSign = !!maskedNumber.match(new RegExp(`^\\D*[${CHAR_MINUS}\\${CHAR_HYPHEN}${CHAR_EN_DASH}${CHAR_EM_DASH}${CHAR_JP_HYPHEN}]`));
    const escapedDecimalSeparator = escapeRegExp(decimalSeparator);
    const unmaskedNumber = maskedNumber
        // drop all decimal separators not followed by a digit
        .replaceAll(new RegExp(`${escapedDecimalSeparator}(?!\\d)`, 'g'), '')
        // drop all non-digit characters except decimal separator
        .replaceAll(new RegExp(`[^\\d${escapedDecimalSeparator}]`, 'g'), '')
        .replace(decimalSeparator, '.');
    return unmaskedNumber
        ? Number((hasNegativeSign ? CHAR_HYPHEN : '') + unmaskedNumber)
        : NaN;
}

/**
 * Convert number to string with replacing exponent part on decimals
 *
 * @param value the number
 * @return string representation of a number
 */
function stringifyNumberWithoutExp(value) {
    const valueAsString = String(value);
    const [numberPart = '', expPart] = valueAsString.split('e-');
    let valueWithoutExp = valueAsString;
    if (expPart) {
        const [, fractionalPart] = numberPart.split('.');
        const decimalDigits = Number(expPart) + ((fractionalPart === null || fractionalPart === void 0 ? void 0 : fractionalPart.length) || 0);
        valueWithoutExp = value.toFixed(decimalDigits);
    }
    return valueWithoutExp;
}

function toNumberParts(value, { decimalSeparator, thousandSeparator, }) {
    const [integerWithMinus = '', decimalPart = ''] = value.split(decimalSeparator);
    const [, minus = '', integerPart = ''] = integerWithMinus.match(new RegExp(`([^\\d${escapeRegExp(thousandSeparator)}]+)?(.*)`)) || [];
    return { minus, integerPart, decimalPart };
}

function validateDecimalPseudoSeparators({ decimalSeparator, thousandSeparator, decimalPseudoSeparators = DEFAULT_DECIMAL_PSEUDO_SEPARATORS, }) {
    return decimalPseudoSeparators.filter((char) => char !== thousandSeparator && char !== decimalSeparator);
}

/**
 * If `decimalZeroPadding` is `true`, it pads decimal part with zeroes
 * (until number of digits after decimalSeparator is equal to the `precision`).
 * @example 1,42 => (`precision` is equal to 4) => 1,4200.
 */
function createDecimalZeroPaddingPostprocessor({ decimalSeparator, precision, decimalZeroPadding, prefix, postfix, }) {
    if (precision <= 0 || !decimalZeroPadding) {
        return identity;
    }
    return ({ value, selection }) => {
        const { cleanValue, extractedPrefix, extractedPostfix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        if (Number.isNaN(maskitoParseNumber(cleanValue, decimalSeparator))) {
            return { value, selection };
        }
        const [integerPart, decimalPart = ''] = cleanValue.split(decimalSeparator);
        return {
            value: extractedPrefix +
                integerPart +
                decimalSeparator +
                decimalPart.padEnd(precision, '0') +
                extractedPostfix,
            selection,
        };
    };
}

/**
 * Make textfield empty if there is no integer part and all decimal digits are zeroes.
 * @example 0|,00 => Backspace => Empty.
 * @example -0|,00 => Backspace => -.
 * @example ,42| => Backspace x2 => ,|00 => Backspace => Empty
 */
function emptyPostprocessor({ prefix, postfix, decimalSeparator, thousandSeparator, }) {
    return ({ value, selection }) => {
        const [caretIndex] = selection;
        const { cleanValue, extractedPrefix, extractedPostfix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        const { minus, integerPart, decimalPart } = toNumberParts(cleanValue, {
            decimalSeparator,
            thousandSeparator,
        });
        const aloneDecimalSeparator = !integerPart && !decimalPart && cleanValue.includes(decimalSeparator);
        if ((!integerPart &&
            !Number(decimalPart) &&
            caretIndex === (minus + extractedPrefix).length) ||
            aloneDecimalSeparator) {
            return {
                selection,
                value: extractedPrefix + minus + extractedPostfix,
            };
        }
        return { value, selection };
    };
}

/**
 * This preprocessor works only once at initialization phase (when `new Maskito(...)` is executed).
 * This preprocessor helps to avoid conflicts during transition from one mask to another (for the same input).
 * For example, the developer changes postfix (or other mask's props) during run-time.
 * ```
 * let maskitoOptions = maskitoNumberOptionsGenerator({postfix: ' year'});
 * // [3 seconds later]
 * maskitoOptions = maskitoNumberOptionsGenerator({postfix: ' years'});
 * ```
 */
function createInitializationOnlyPreprocessor({ decimalSeparator, decimalPseudoSeparators, pseudoMinuses, prefix, postfix, minusSign, }) {
    let isInitializationPhase = true;
    const cleanNumberMask = generateMaskExpression({
        decimalSeparator,
        decimalPseudoSeparators,
        pseudoMinuses,
        prefix: '',
        postfix: '',
        thousandSeparator: '',
        precision: Infinity,
        isNegativeAllowed: true,
        minusSign,
    });
    return ({ elementState, data }) => {
        if (!isInitializationPhase) {
            return { elementState, data };
        }
        isInitializationPhase = false;
        const { value, selection } = elementState;
        const [from, to] = selection;
        const { extractedPrefix, cleanValue, extractedPostfix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        const cleanState = maskitoTransform({
            selection: [
                Math.max(from - extractedPrefix.length, 0),
                clamp(to - extractedPrefix.length, 0, cleanValue.length),
            ],
            value: cleanValue,
        }, {
            mask: cleanNumberMask,
        });
        const [cleanFrom, cleanTo] = cleanState.selection;
        return {
            elementState: {
                selection: [
                    cleanFrom + extractedPrefix.length,
                    cleanTo + extractedPrefix.length,
                ],
                value: extractedPrefix + cleanState.value + extractedPostfix,
            },
            data,
        };
    };
}

/**
 * It removes repeated leading zeroes for integer part.
 * @example 0,|00005 => Backspace => |5
 * @example -0,|00005 => Backspace => -|5
 * @example User types "000000" => 0|
 * @example 0| => User types "5" => 5|
 */
function createLeadingZeroesValidationPostprocessor({ decimalSeparator, thousandSeparator, prefix, postfix, }) {
    const trimLeadingZeroes = (value) => {
        const escapedThousandSeparator = escapeRegExp(thousandSeparator);
        return value
            .replace(
        // all leading zeroes followed by another zero
        new RegExp(`^(\\D+)?[0${escapedThousandSeparator}]+(?=0)`), '$1')
            .replace(
        // zero followed by not-zero digit
        new RegExp(`^(\\D+)?[0${escapedThousandSeparator}]+(?=[1-9])`), '$1');
    };
    const countTrimmedZeroesBefore = (value, index) => {
        const valueBefore = value.slice(0, index);
        const followedByZero = value.slice(index).startsWith('0');
        return (valueBefore.length -
            trimLeadingZeroes(valueBefore).length +
            (followedByZero ? 1 : 0));
    };
    return ({ value, selection }) => {
        const [from, to] = selection;
        const { cleanValue, extractedPrefix, extractedPostfix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        const hasDecimalSeparator = cleanValue.includes(decimalSeparator);
        const [integerPart = '', decimalPart = ''] = cleanValue.split(decimalSeparator);
        const zeroTrimmedIntegerPart = trimLeadingZeroes(integerPart);
        if (integerPart === zeroTrimmedIntegerPart) {
            return { value, selection };
        }
        const newFrom = from - countTrimmedZeroesBefore(value, from);
        const newTo = to - countTrimmedZeroesBefore(value, to);
        return {
            value: extractedPrefix +
                zeroTrimmedIntegerPart +
                (hasDecimalSeparator ? decimalSeparator : '') +
                decimalPart +
                extractedPostfix,
            selection: [Math.max(newFrom, 0), Math.max(newTo, 0)],
        };
    };
}

/**
 * This postprocessor is connected with {@link createMinMaxPlugin}:
 * both validate `min`/`max` bounds of entered value (but at the different point of time).
 */
function createMinMaxPostprocessor({ min, max, decimalSeparator, minusSign, }) {
    return ({ value, selection }) => {
        const parsedNumber = maskitoParseNumber(value, decimalSeparator);
        const limitedValue = 
        /**
         * We cannot limit lower bound if user enters positive number.
         * The same for upper bound and negative number.
         * ___
         * @example (min = 5)
         * Empty input => Without this condition user cannot type 42 (the first digit will be rejected)
         * ___
         * @example (max = -10)
         * Value is -10 => Without this condition user cannot delete 0 to enter another digit
         */
        parsedNumber > 0 ? Math.min(parsedNumber, max) : Math.max(parsedNumber, min);
        if (parsedNumber && limitedValue !== parsedNumber) {
            const newValue = `${limitedValue}`
                .replace('.', decimalSeparator)
                .replace(CHAR_HYPHEN, minusSign);
            return {
                value: newValue,
                selection: [newValue.length, newValue.length],
            };
        }
        return {
            value,
            selection,
        };
    };
}

/**
 * Manage caret-navigation when user "deletes" non-removable digits or separators
 * @example 1,|42 => Backspace => 1|,42 (only if `decimalZeroPadding` is `true`)
 * @example 1|,42 => Delete => 1,|42 (only if `decimalZeroPadding` is `true`)
 * @example 0,|00 => Delete => 0,0|0 (only if `decimalZeroPadding` is `true`)
 * @example 1 |000 => Backspace => 1| 000 (always)
 */
function createNonRemovableCharsDeletionPreprocessor({ decimalSeparator, thousandSeparator, decimalZeroPadding, }) {
    return ({ elementState, data }, actionType) => {
        const { value, selection } = elementState;
        const [from, to] = selection;
        const selectedCharacters = value.slice(from, to);
        const nonRemovableSeparators = decimalZeroPadding
            ? [decimalSeparator, thousandSeparator]
            : [thousandSeparator];
        const areNonRemovableZeroesSelected = decimalZeroPadding &&
            from > value.indexOf(decimalSeparator) &&
            Boolean(selectedCharacters.match(/^0+$/gi));
        if ((actionType !== 'deleteBackward' && actionType !== 'deleteForward') ||
            (!nonRemovableSeparators.includes(selectedCharacters) &&
                !areNonRemovableZeroesSelected)) {
            return {
                elementState,
                data,
            };
        }
        return {
            elementState: {
                value,
                selection: actionType === 'deleteForward' ? [to, to] : [from, from],
            },
            data,
        };
    };
}

/**
 * It pads integer part with zero if user types decimal separator (for empty input).
 * @example Empty input => User types "," (decimal separator) => 0,|
 */
function createNotEmptyIntegerPartPreprocessor({ decimalSeparator, precision, prefix, postfix, }) {
    const startWithDecimalSepRegExp = new RegExp(`^\\D*${escapeRegExp(decimalSeparator)}`);
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        const { cleanValue, extractedPrefix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        const [from, to] = selection;
        const cleanFrom = clamp(from - extractedPrefix.length, 0, cleanValue.length);
        const cleanTo = clamp(to - extractedPrefix.length, 0, cleanValue.length);
        if (precision <= 0 ||
            cleanValue.slice(0, cleanFrom).includes(decimalSeparator) ||
            cleanValue.slice(cleanTo).includes(decimalSeparator) ||
            !data.match(startWithDecimalSepRegExp)) {
            return { elementState, data };
        }
        const digitsBeforeCursor = cleanValue.slice(0, cleanFrom).match(/\d+/);
        return {
            elementState,
            data: digitsBeforeCursor ? data : `0${data}`,
        };
    };
}

/**
 * It replaces pseudo characters with valid one.
 * @example User types '.' (but separator is equal to comma) => dot is replaced with comma.
 * @example User types hyphen / en-dash / em-dash => it is replaced with minus.
 */
function createPseudoCharactersPreprocessor({ validCharacter, pseudoCharacters, prefix, postfix, }) {
    const pseudoCharactersRegExp = new RegExp(`[${pseudoCharacters.join('')}]`, 'gi');
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        const { cleanValue, extractedPostfix, extractedPrefix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        return {
            elementState: {
                selection,
                value: extractedPrefix +
                    cleanValue.replace(pseudoCharactersRegExp, validCharacter) +
                    extractedPostfix,
            },
            data: data.replace(pseudoCharactersRegExp, validCharacter),
        };
    };
}

/**
 * It rejects new typed decimal separator if it already exists in text field.
 * Behaviour is similar to native <input type="number"> (Chrome).
 * @example 1|23,45 => Press comma (decimal separator) => 1|23,45 (do nothing).
 */
function createRepeatedDecimalSeparatorPreprocessor({ decimalSeparator, prefix, postfix, }) {
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        const [from, to] = selection;
        const { cleanValue } = extractAffixes(value, { prefix, postfix });
        return {
            elementState,
            data: !cleanValue.includes(decimalSeparator) ||
                value.slice(from, to + 1).includes(decimalSeparator)
                ? data
                : data.replaceAll(new RegExp(escapeRegExp(decimalSeparator), 'gi'), ''),
        };
    };
}

/**
 * It adds symbol for separating thousands.
 * @example 1000000 => (thousandSeparator is equal to space) => 1 000 000.
 */
function createThousandSeparatorPostprocessor({ thousandSeparator, decimalSeparator, prefix, postfix, }) {
    if (!thousandSeparator) {
        return identity;
    }
    const isAllSpaces = (...chars) => chars.every((x) => /\s/.test(x));
    return ({ value, selection }) => {
        const { cleanValue, extractedPostfix, extractedPrefix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        const { minus, integerPart, decimalPart } = toNumberParts(cleanValue, {
            decimalSeparator,
            thousandSeparator,
        });
        const [initialFrom, initialTo] = selection;
        let [from, to] = selection;
        const processedIntegerPart = Array.from(integerPart).reduceRight((formattedValuePart, char, i) => {
            const isLeadingThousandSeparator = !i && char === thousandSeparator;
            const isPositionForSeparator = !isLeadingThousandSeparator &&
                formattedValuePart.length &&
                (formattedValuePart.length + 1) % 4 === 0;
            if (isPositionForSeparator &&
                (char === thousandSeparator || isAllSpaces(char, thousandSeparator))) {
                return thousandSeparator + formattedValuePart;
            }
            if (char === thousandSeparator && !isPositionForSeparator) {
                if (i && i <= initialFrom) {
                    from--;
                }
                if (i && i <= initialTo) {
                    to--;
                }
                return formattedValuePart;
            }
            if (!isPositionForSeparator) {
                return char + formattedValuePart;
            }
            if (i <= initialFrom) {
                from++;
            }
            if (i <= initialTo) {
                to++;
            }
            return char + thousandSeparator + formattedValuePart;
        }, '');
        return {
            value: extractedPrefix +
                minus +
                processedIntegerPart +
                (cleanValue.includes(decimalSeparator) ? decimalSeparator : '') +
                decimalPart +
                extractedPostfix,
            selection: [from, to],
        };
    };
}

/**
 * It drops decimal part if precision is zero.
 * @example User pastes '123.45' (but precision is zero) => 123
 */
function createZeroPrecisionPreprocessor({ precision, decimalSeparator, prefix, postfix, }) {
    if (precision > 0) {
        return identity;
    }
    const decimalPartRegExp = new RegExp(`${escapeRegExp(decimalSeparator)}.*$`, 'g');
    return ({ elementState, data }) => {
        const { value, selection } = elementState;
        const { cleanValue, extractedPrefix, extractedPostfix } = extractAffixes(value, {
            prefix,
            postfix,
        });
        const [from, to] = selection;
        const newValue = extractedPrefix +
            cleanValue.replace(decimalPartRegExp, '') +
            extractedPostfix;
        return {
            elementState: {
                selection: [
                    Math.min(from, newValue.length),
                    Math.min(to, newValue.length),
                ],
                value: newValue,
            },
            data: data.replace(decimalPartRegExp, ''),
        };
    };
}

const DUMMY_SELECTION = [0, 0];
/**
 * It removes repeated leading zeroes for integer part on blur-event.
 * @example 000000 => blur => 0
 * @example 00005 => blur => 5
 */
function createLeadingZeroesValidationPlugin({ decimalSeparator, thousandSeparator, prefix, postfix, }) {
    const dropRepeatedLeadingZeroes = createLeadingZeroesValidationPostprocessor({
        decimalSeparator,
        thousandSeparator,
        prefix,
        postfix,
    });
    return maskitoEventHandler('blur', (element) => {
        const newValue = dropRepeatedLeadingZeroes({
            value: element.value,
            selection: DUMMY_SELECTION,
        }, { value: '', selection: DUMMY_SELECTION }).value;
        maskitoUpdateElement(element, newValue);
    }, { capture: true });
}

/**
 * This plugin is connected with {@link createMinMaxPostprocessor}:
 * both validate `min`/`max` bounds of entered value (but at the different point of time).
 */
function createMinMaxPlugin({ min, max, decimalSeparator, }) {
    return maskitoEventHandler('blur', (element, options) => {
        const parsedNumber = maskitoParseNumber(element.value, decimalSeparator);
        const clampedNumber = clamp(parsedNumber, min, max);
        if (!Number.isNaN(parsedNumber) && parsedNumber !== clampedNumber) {
            maskitoUpdateElement(element, maskitoTransform(stringifyNumberWithoutExp(clampedNumber), options));
        }
    }, { capture: true });
}

/**
 * It pads EMPTY integer part with zero if decimal parts exists.
 * It works on blur event only!
 * @example 1|,23 => Backspace => Blur => 0,23
 */
function createNotEmptyIntegerPlugin({ decimalSeparator, prefix, postfix, }) {
    return maskitoEventHandler('blur', (element) => {
        const { cleanValue, extractedPostfix, extractedPrefix } = extractAffixes(element.value, { prefix, postfix });
        const newValue = extractedPrefix +
            cleanValue.replace(new RegExp(`^(\\D+)?${escapeRegExp(decimalSeparator)}`), `$10${decimalSeparator}`) +
            extractedPostfix;
        maskitoUpdateElement(element, newValue);
    }, { capture: true });
}

function maskitoNumberOptionsGenerator({ max = Number.MAX_SAFE_INTEGER, min = Number.MIN_SAFE_INTEGER, precision = 0, thousandSeparator = CHAR_NO_BREAK_SPACE, decimalSeparator = '.', decimalPseudoSeparators, decimalZeroPadding = false, prefix: unsafePrefix = '', postfix = '', minusSign = CHAR_MINUS, } = {}) {
    const pseudoMinuses = [
        CHAR_HYPHEN,
        CHAR_EN_DASH,
        CHAR_EM_DASH,
        CHAR_JP_HYPHEN,
        CHAR_MINUS,
    ].filter((char) => char !== thousandSeparator && char !== decimalSeparator && char !== minusSign);
    const validatedDecimalPseudoSeparators = validateDecimalPseudoSeparators({
        decimalSeparator,
        thousandSeparator,
        decimalPseudoSeparators,
    });
    const prefix = unsafePrefix.endsWith(decimalSeparator) && precision > 0
        ? `${unsafePrefix}${CHAR_ZERO_WIDTH_SPACE}`
        : unsafePrefix;
    return Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), { mask: generateMaskExpression({
            decimalSeparator,
            precision,
            thousandSeparator,
            prefix,
            postfix,
            isNegativeAllowed: min < 0,
            minusSign,
        }), preprocessors: [
            createFullWidthToHalfWidthPreprocessor(),
            createInitializationOnlyPreprocessor({
                decimalSeparator,
                decimalPseudoSeparators: validatedDecimalPseudoSeparators,
                pseudoMinuses,
                prefix,
                postfix,
                minusSign,
            }),
            createAffixesFilterPreprocessor({ prefix, postfix }),
            createPseudoCharactersPreprocessor({
                validCharacter: minusSign,
                pseudoCharacters: pseudoMinuses,
                prefix,
                postfix,
            }),
            createPseudoCharactersPreprocessor({
                validCharacter: decimalSeparator,
                pseudoCharacters: validatedDecimalPseudoSeparators,
                prefix,
                postfix,
            }),
            createNotEmptyIntegerPartPreprocessor({
                decimalSeparator,
                precision,
                prefix,
                postfix,
            }),
            createNonRemovableCharsDeletionPreprocessor({
                decimalSeparator,
                decimalZeroPadding,
                thousandSeparator,
            }),
            createZeroPrecisionPreprocessor({
                precision,
                decimalSeparator,
                prefix,
                postfix,
            }),
            createRepeatedDecimalSeparatorPreprocessor({
                decimalSeparator,
                prefix,
                postfix,
            }),
        ], postprocessors: [
            createMinMaxPostprocessor({ decimalSeparator, min, max, minusSign }),
            maskitoPrefixPostprocessorGenerator(prefix),
            maskitoPostfixPostprocessorGenerator(postfix),
            createThousandSeparatorPostprocessor({
                decimalSeparator,
                thousandSeparator,
                prefix,
                postfix,
            }),
            createDecimalZeroPaddingPostprocessor({
                decimalSeparator,
                decimalZeroPadding,
                precision,
                prefix,
                postfix,
            }),
            emptyPostprocessor({ prefix, postfix, decimalSeparator, thousandSeparator }),
        ], plugins: [
            createLeadingZeroesValidationPlugin({
                decimalSeparator,
                thousandSeparator,
                prefix,
                postfix,
            }),
            createNotEmptyIntegerPlugin({
                decimalSeparator,
                prefix,
                postfix,
            }),
            createMinMaxPlugin({ min, max, decimalSeparator }),
        ], overwriteMode: decimalZeroPadding
            ? ({ value, selection: [from] }) => from <= value.indexOf(decimalSeparator) ? 'shift' : 'replace'
            : 'shift' });
}

function createMaxValidationPreprocessor(timeSegmentMaxValues, timeMode) {
    const paddedMaxValues = padStartTimeSegments(timeSegmentMaxValues);
    const invalidCharsRegExp = new RegExp(`[^\\d${TIME_FIXED_CHARACTERS.map(escapeRegExp).join('')}]+`);
    return ({ elementState, data }, actionType) => {
        if (actionType === 'deleteBackward' || actionType === 'deleteForward') {
            return { elementState, data };
        }
        const { value, selection } = elementState;
        if (actionType === 'validation') {
            const { validatedTimeString, updatedTimeSelection } = validateTimeString({
                timeString: value,
                paddedMaxValues,
                offset: 0,
                selection,
                timeMode,
            });
            return {
                elementState: {
                    value: validatedTimeString,
                    selection: updatedTimeSelection,
                },
                data,
            };
        }
        const newCharacters = data.replace(invalidCharsRegExp, '');
        const [from, rawTo] = selection;
        let to = rawTo + newCharacters.length; // to be conformed with `overwriteMode: replace`
        const newPossibleValue = value.slice(0, from) + newCharacters + value.slice(to);
        const { validatedTimeString, updatedTimeSelection } = validateTimeString({
            timeString: newPossibleValue,
            paddedMaxValues,
            offset: 0,
            selection: [from, to],
            timeMode,
        });
        if (newPossibleValue && !validatedTimeString) {
            return { elementState, data: '' }; // prevent changes
        }
        to = updatedTimeSelection[1];
        const newData = validatedTimeString.slice(from, to);
        return {
            elementState: {
                selection,
                value: validatedTimeString.slice(0, from) +
                    '0'.repeat(newData.length) +
                    validatedTimeString.slice(to),
            },
            data: newData,
        };
    };
}

function maskitoTimeOptionsGenerator({ mode, timeSegmentMaxValues = {}, step = 0, }) {
    const enrichedTimeSegmentMaxValues = Object.assign(Object.assign({}, DEFAULT_TIME_SEGMENT_MAX_VALUES), timeSegmentMaxValues);
    return Object.assign(Object.assign({}, MASKITO_DEFAULT_OPTIONS), { mask: Array.from(mode).map((char) => TIME_FIXED_CHARACTERS.includes(char) ? char : /\d/), preprocessors: [
            createFullWidthToHalfWidthPreprocessor(),
            createColonConvertPreprocessor(),
            createZeroPlaceholdersPreprocessor(),
            createMaxValidationPreprocessor(enrichedTimeSegmentMaxValues, mode),
        ], plugins: [
            createTimeSegmentsSteppingPlugin({
                fullMode: mode,
                step,
                timeSegmentMaxValues: enrichedTimeSegmentMaxValues,
            }),
        ], overwriteMode: 'replace' });
}

/**
 * Converts a formatted time string to milliseconds based on the given `options.mode`.
 *
 * @param maskedTime a formatted time string by {@link maskitoTimeOptionsGenerator} or {@link maskitoStringifyTime}
 * @param params
 */
function maskitoParseTime(maskedTime, { mode, timeSegmentMaxValues = {} }) {
    var _a, _b, _c, _d;
    const maxValues = Object.assign(Object.assign({}, DEFAULT_TIME_SEGMENT_MAX_VALUES), timeSegmentMaxValues);
    const msInSecond = maxValues.milliseconds + 1;
    const msInMinute = (maxValues.seconds + 1) * msInSecond;
    const msInHour = (maxValues.minutes + 1) * msInMinute;
    const parsedTime = padEndTimeSegments(parseTimeString(maskedTime, mode));
    return (Number((_a = parsedTime.hours) !== null && _a !== void 0 ? _a : '') * msInHour +
        Number((_b = parsedTime.minutes) !== null && _b !== void 0 ? _b : '') * msInMinute +
        Number((_c = parsedTime.seconds) !== null && _c !== void 0 ? _c : '') * msInSecond +
        Number((_d = parsedTime.milliseconds) !== null && _d !== void 0 ? _d : ''));
}

/**
 * Converts milliseconds to a formatted time string based on the given `options.mode`.
 *
 * @param milliseconds unsigned integer milliseconds
 * @param params
 */
function maskitoStringifyTime(milliseconds, { mode, timeSegmentMaxValues = {} }) {
    const maxValues = Object.assign(Object.assign({}, DEFAULT_TIME_SEGMENT_MAX_VALUES), timeSegmentMaxValues);
    const msInSecond = maxValues.milliseconds + 1;
    const msInMinute = (maxValues.seconds + 1) * msInSecond;
    const msInHour = (maxValues.minutes + 1) * msInMinute;
    const hours = Math.trunc(milliseconds / msInHour);
    milliseconds -= hours * msInHour;
    const minutes = Math.trunc(milliseconds / msInMinute);
    milliseconds -= minutes * msInMinute;
    const seconds = Math.trunc(milliseconds / msInSecond);
    milliseconds -= seconds * msInSecond;
    const result = padStartTimeSegments({ hours, minutes, seconds, milliseconds });
    return mode
        .replaceAll(/H+/g, result.hours)
        .replaceAll('MSS', result.milliseconds)
        .replaceAll(/M+/g, result.minutes)
        .replaceAll(/S+/g, result.seconds);
}

const popoverSelectDateCss = "";

const PopoverSelectDate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.inputValue = undefined;
        this.value = undefined;
        this.labelTag = undefined;
        this.labelText = undefined;
        this.labelReplace = undefined;
        this.appendText = undefined;
        this.datePresentation = "date";
        this.preferWheel = false;
        this.showDateTitle = true;
        this.maxDate = undefined;
        this.updateView = true;
    }
    componentWillLoad() {
        // The target timezone, i.e., the user's local timezone
        this.targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Convert the provided date string (in the original timezone) to the user's local time
        this.setLocalTime(this.value);
        this.popover = this.el.closest("ion-popover");
    }
    componentDidLoad() {
        this.initializeMask();
    }
    disconnectedCallback() {
        this.maskedInput.destroy();
    }
    setLocalTime(date) {
        // Parsing as UTC or specified timezone
        this.localTime = toZonedTime(new Date(date), this.targetTimeZone);
        this.inputValue = showDate(dateFns.formatISO(this.localTime), this.datePresentation, true);
        this.updateView = !this.updateView;
    }
    async initializeMask() {
        const optionsDate = maskitoDateOptionsGenerator({
            mode: "dd/mm/yyyy",
            separator: "/",
        });
        const optionsDateTime = maskitoDateTimeOptionsGenerator({
            dateMode: "dd/mm/yyyy",
            timeMode: "HH:MM",
            dateSeparator: "/",
        });
        const ionInput = document.querySelector("#dateInput");
        const nativeEl = await ionInput.getInputElement();
        this.maskedInput = new Maskito(nativeEl, this.datePresentation == "date" ? optionsDate : optionsDateTime);
    }
    handleChange(ev) {
        this.value = ev.detail.value;
        this.setLocalTime(this.value);
    }
    handleInputChange(ev) {
        const inputDate = ev.target.value;
        const parsedDate = dateFns.parse(inputDate, this.datePresentation == "date" ? "dd/MM/yyyy" : "dd/MM/yyyy HH:ss", new Date());
        if (dateFns.isValid(parsedDate)) {
            this.value = dateFns.formatISO(parsedDate);
            this.setLocalTime(this.value);
        }
    }
    close() {
        this.popover.dismiss();
    }
    save() {
        //save in database in UTC format
        const utcDate = toZonedTime(this.value, "UTC");
        const formatDate = dateFns.format(utcDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        this.popover.dismiss(formatDate);
    }
    render() {
        return (h(Host, { key: 'ae039d575c682151a3a7a24bafdaa74e3455598d' }, h("ion-content", { key: '24fda786bdda3306ba4f5f9b4581c6687d4aec18' }, h("ion-datetime", { key: 'a4fa9a57f3f1944d4e36baa6b3f68bbb3039167c', color: Environment.getAppColor(), presentation: this.datePresentation, "prefer-wheel": this.preferWheel, "show-default-title": !this.showDateTitle, onIonChange: (ev) => this.handleChange(ev), max: this.maxDate, value: dateFns.formatISO(this.localTime) }, this.showDateTitle ? (h("span", { slot: "title" }, this.labelTag ? (h("my-transl", { tag: this.labelTag, text: this.labelText, replace: this.labelReplace })) : this.labelText ? (this.labelText) : undefined, this.appendText ? this.appendText : undefined)) : undefined), this.datePresentation == "date-time" ||
            this.datePresentation == "time-date" ||
            this.datePresentation == "date" ? (h("ion-item", null, h("ion-input", { id: "dateInput", fill: "outline", type: "text", debounce: 300, inputmode: "numeric", value: this.inputValue, onIonInput: (ev) => this.handleInputChange(ev) }))) : undefined), h("ion-footer", { key: 'ed48b0d87927cc8eed2bff71715d92ba3288ccee' }, h("app-modal-footer", { key: '309807e84db5d4a78befa1e0379ec83c88f26c87', onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }))));
    }
    get el() { return getElement(this); }
};
PopoverSelectDate.style = popoverSelectDateCss;

export { PopoverSelectDate as popover_select_date };

//# sourceMappingURL=popover-select-date.entry.js.map