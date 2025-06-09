export class ResponseModel<T> {
    code: number;
    message: string;
    data: T;
}