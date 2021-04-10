/* eslint-disable import/prefer-default-export */
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';

import 'source-map-support/register';
import routes from './routes';
import handleResponseError from './utils/handleResponseError';
import NotFoundError from './models/http/NotFoundError';

export const main = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const {
      requestContext: { httpMethod, resourcePath },
    } = event;

    if (!(resourcePath in routes)) {
      throw new NotFoundError('Not found');
    }

    const route = routes[resourcePath];

    if (!(httpMethod in route)) {
      throw new NotFoundError('Not found');
    }

    const invoke = route[httpMethod];

    return await invoke(event, context);
  } catch (error) {
    return handleResponseError(error);
  }
};
