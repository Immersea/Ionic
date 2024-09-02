import { Validator } from "./validator";

export function getEmailValidator(): Validator<string> {
  return {
    validate: (email: string) => {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(email)) {
        return true;
      } else {
        return false;
      }
    },
    errorMessage: {
      tag: "validators-email",
      text: "You must enter a valid email address",
    },
  };
}
