interface ApiErrorInferface {
    error : string;
    statusCode: number;
    message: string;
}

export class ApiError {

    public error : string;
    public statusCode: number;
    public message: string;

    constructor({message: message, error: error, statusCode: statusCode}: ApiErrorInferface) {
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
    }

}