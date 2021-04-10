import { APIGatewayProxyResult } from 'aws-lambda';

import HttpResponseError from '@models/http/HttpResponseError';
import InternalServerError from '@models/http/InternalServerError';

const handleResponseError = (
  error: HttpResponseError | Error,
): APIGatewayProxyResult => {
  if (error instanceof HttpResponseError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ message: error.message }),
    };
  }

  const internalServerError = new InternalServerError(error.message);

  return {
    statusCode: internalServerError.statusCode,
    body: JSON.stringify({ message: internalServerError.message }),
  };
};

export default handleResponseError;
