import { APIGatewayProxyResult } from 'aws-lambda';

import { StatusCodes } from '../config/constants';
import HttpResponseError from '../models/http/HttpResponseError';
import handleResponseError from './handleResponseError';

const success = <T>(
  body: T,
  statusCode: number = StatusCodes.Ok,
): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify(body),
});

const error = (
  errorInstance: HttpResponseError | Error,
): APIGatewayProxyResult => handleResponseError(errorInstance);

export default {
  success,
  error,
};
