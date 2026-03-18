export class ApiError {

    public error : string;
    public statusCode: number;
    public message: string

    constructor(message: string, error: string, statuscode: number) {
        this.message = message;
        this.statusCode = statuscode;
        this.error = error;
    }

}