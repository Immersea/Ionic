import {
  Validator,
  ValidatorEntry,
  defaultValidator,
  combineValidators,
} from "./validator";
import {FruitValidator} from "./fruit-validator";
import {getLengthValidator} from "./length-validator";
import {getEmailValidator} from "./email-validator";
import {getUniqueIdValidator} from "./uniqueid-validator";
import {getMinMaxValueValidator} from "./minmaxvalue-validator";
import {getMinValueValidator} from "./minvalue-validator";

export enum ValidatorsName {
  fruit = "fruit",
  email = "email",
  length = "length",
  uniqueid = "uniqueid",
  required = "required",
  minmaxvalue = "minmaxvalue",
  minvalue = "minvalue",
}

export function getValidator<A>(
  list: Array<string | ValidatorEntry | Validator<A>>
): Validator<A> {
  return (list || [])
    .map((v) => {
      if (typeof v === "string") {
        return validatorFactory(v, null);
      } else if (v && (v as any).name) {
        v = v as ValidatorEntry;
        return validatorFactory(v.name, v.options);
      } else {
        return v as Validator<A>;
      }
    })
    .reduce(combineValidators, defaultValidator);
}

export function validatorFactory(name: string, options: any): Validator<any> {
  options = options || {};
  switch (name) {
    case ValidatorsName.fruit:
      return FruitValidator;
    case ValidatorsName.required:
      return getLengthValidator(-1, null);
    case ValidatorsName.length:
      return getLengthValidator(options.min, options.max);
    case ValidatorsName.email:
      return getEmailValidator();
    case ValidatorsName.uniqueid:
      return getUniqueIdValidator(options.type, options.index, options.list);
    case ValidatorsName.minmaxvalue:
      return getMinMaxValueValidator(options.min, options.max);
    case ValidatorsName.minvalue:
      return getMinValueValidator(options.min);
    default:
      return defaultValidator;
  }
}
