import {Validator} from "./validator";
import {TranslateText} from "../interfaces/common/translations/translations";

export function getMinMaxValueValidator(
  min: number,
  max: number
): Validator<string> {
  return {
    validate: (string: string) => {
      let value = parseFloat(string) || 0;
      return value >= min && value <= max;
    },
    errorMessage: getErrorMessage(min, max),
  };
}

function getErrorMessage(min: number, max: number): TranslateText {
  const error = {
    tag: "validators-minmaxvalue",
    text: "You must enter a value between xxx and yyy",
    replace: {
      xxx: min,
      yyy: max,
    },
  };
  return error;
}
