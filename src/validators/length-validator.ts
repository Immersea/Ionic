import {Validator} from "./validator";
import {TranslateText} from "../interfaces/common/translations/translations";
import {isNumber, isString} from "lodash";

export function getLengthValidator(
  min: number,
  max: number
): Validator<string> {
  return {
    validate: (value: string | number) => {
      if (isString(value)) {
        value = value.toString() || "";
        if (min && max) {
          //"length" validator
          return min <= value.length && value.length <= max;
        }
        if (min == -1) {
          //"required" validator
          return value.length > 0;
        }
        if (min) {
          //"length" validator
          return min <= value.length;
        }
        if (max) {
          //"length" validator
          return value.length <= max;
        }
        return true;
      } else if (isNumber(value)) {
        value = value || 0;
        if (min && max) {
          //"length" validator
          return min <= value && value <= max;
        }
        if (min == -1) {
          //"required" validator
          return isNumber(value);
        }
        if (min) {
          //"length" validator
          return min <= value;
        }
        if (max) {
          //"length" validator
          return value <= max;
        }
        return true;
      } else {
        return false;
      }
    },
    errorMessage: getErrorMessage(min, max),
  };
}

function getErrorMessage(min: number, max: number): TranslateText {
  const error =
    min && max
      ? {
          tag: "validators-minmax",
          text: "You must enter between xxx and yyy characters",
          replace: {
            xxx: min,
            yyy: max,
          },
        }
      : min == -1
        ? {
            tag: "validators-required",
            text: "This field is required",
          }
        : min
          ? {
              tag: "validators-min",
              text: "You must enter at least xxx characters",
              replace: {
                xxx: min,
              },
            }
          : max
            ? {
                tag: "validators-max",
                text: "You must enter less than yyy characters",
                replace: {
                  yyy: max,
                },
              }
            : undefined;
  return error;
}
