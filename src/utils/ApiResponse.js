class ApiResponse {
    constructor(statusCode, data, message = "success") {
        this.statusCode = statusCode;
        this.ResponseObject = data;
        this.ResponseMessage = message
        this.success = statusCode < 400
    }
}

export default ApiResponse