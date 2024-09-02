import {Validator} from "./validator";
import {TranslateText} from "../interfaces/common/translations/translations";
import {isString} from "lodash";

export function getMinValueValidator(min: number): Validator<string> {
  return {
    validate: (value: string | number) => {
      if (isString(value)) value = parseFloat(value);
      return value >= min;
    },
    errorMessage: getErrorMessage(min),
  };
}

function getErrorMessage(min: number): TranslateText {
  const error = {
    tag: "validators-minvalue",
    text: "You must enter a value higher than xxx",
    replace: {
      xxx: min,
    },
  };
  return error;
}
