class Response {
  constructor(result = {}, error) {
    this.data = result;
    this.hasError = false;
    this.error = {};

    if (error?.stack) {
      this.hasError = true;
      if (error.cause && error.cause.type) {
        this.error = error.cause.type;
      } else {
        this.error.message = error.message;
      }
    }
  };
};

module.exports = Response;