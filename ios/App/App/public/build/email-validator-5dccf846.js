function getEmailValidator() {
    return {
        validate: (email) => {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(email)) {
                return true;
            }
            else {
                return false;
            }
        },
        errorMessage: {
            tag: "validators-email",
            text: "You must enter a valid email address",
        },
    };
}

export { getEmailValidator as g };

//# sourceMappingURL=email-validator-5dccf846.js.map