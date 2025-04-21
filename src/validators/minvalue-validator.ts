import { Validator } from "./validator";
import { TranslateText } from "../interfaces/common/translations/translations";

export function getMinValueValidator(min: number): Validator<string> {
  return {
    validate: (value: string | number) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      return num >= min;
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
