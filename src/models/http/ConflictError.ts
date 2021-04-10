import { StatusCodes } from '@config/constants';

import HttpResponseError from './HttpResponseError';

export default class ConflictError extends HttpResponseError {
  constructor(message: string) {
    super(message, StatusCodes.Conflict);
    Error.captureStackTrace(this);
  }
}
