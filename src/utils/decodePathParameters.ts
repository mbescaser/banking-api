import NotFoundError from '@models/http/NotFoundError';

import { decodeItems } from './hashIds';

const decodePathParameters = <T>(
  pathParameters: T,
): ReturnType<typeof decodeItems> => {
  try {
    return decodeItems<T>(pathParameters);
  } catch (error) {
    console.log('ERROR (decodePathParameters)', error);

    throw new NotFoundError(
      "The resource that you're trying to access does not exist.",
    );
  }
};

export default decodePathParameters;
