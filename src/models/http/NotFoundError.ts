import { StatusCodes } from '@config/constants';

import HttpResponseError from './HttpResponseError';

export default class NotFoundError extends HttpResponseError {
  constructor(message: string) {
    super(message, StatusCodes.NotFound);
    Error.captureStackTrace(this);
  }
}
