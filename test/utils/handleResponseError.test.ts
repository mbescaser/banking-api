import NotFoundError from '@models/http/NotFoundError';
import handleResponseError from '@utils/handleResponseError';

it('should handle default response error', () => {
  expect(handleResponseError(new Error('Some error'))).toMatchObject({
    statusCode: 500,
    body: JSON.stringify({ message: 'Some error' }),
  });
});

it('should handle given response error', () => {
  expect(handleResponseError(new NotFoundError('Some error'))).toMatchObject({
    statusCode: 404,
    body: JSON.stringify({ message: 'Some error' }),
  });
});
