export default class HttpResponseError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    Error.captureStackTrace(this);

    this.statusCode = statusCode;
  }
}
