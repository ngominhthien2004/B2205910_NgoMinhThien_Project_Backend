class ApiError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.name = message;
    }
}

module.exports = ApiError;