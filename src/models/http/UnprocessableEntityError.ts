import { StatusCodes } from '@config/constants';

import HttpResponseError from './HttpResponseError';

export default class UnprocessableEntityError extends HttpResponseError {
  constructor(message: string) {
    super(message, StatusCodes.UnprocessableEntity);
    Error.captureStackTrace(this);
  }
}
