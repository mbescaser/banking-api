import { StatusCodes } from '@config/constants';

import HttpResponseError from './HttpResponseError';

export default class InternalServerError extends HttpResponseError {
  constructor(message: string) {
    super(message, StatusCodes.InternalServerError);
    Error.captureStackTrace(this);
  }
}
