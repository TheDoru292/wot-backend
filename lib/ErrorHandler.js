const errorStatuses = [
  { code: 400, status: "Bad Request" },
  { code: 401, status: "Unauthorized" },
  { code: 403, status: "Forbidden" },
  { code: 404, status: "Not Found" },
  { code: 415, status: "Unsupported Media Type" },
  { code: 429, status: "Too Many Requests" },
  { code: 500, status: "Internal Server Error" },
];

class Error {
  constructor(err, errCode, customErrMessage, errorArray) {
    this.err = err;
    this.errCode = errCode;
    this.customErrMessage = customErrMessage;
    this.errorArray = errorArray;

    this.consoleError(err);
  }

  consoleError(err) {
    console.error(err);
  }

  get error() {
    let errorMessage;

    if (this.customErrMessage !== undefined) {
      errorMessage = this.customErrMessage;
    } else {
      errorMessage = errorStatuses.find(
        (element) => element.code == this.errCode
      );
      errorMessage = errorMessage.status;
    }

    if (this.errorArray !== undefined) {
      return {
        success: false,
        code: this.errCode,
        status: errorMessage,
        errors: this.errorArray,
      };
    }

    return { success: false, code: this.errCode, status: errorMessage };
  }
}

module.exports = Error;
