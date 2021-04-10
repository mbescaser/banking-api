import { StatusCodes } from '@config/constants';
import NotFoundError from '@models/http/NotFoundError';
import response from '@utils/response';

describe('success', () => {
  it('should return with default status code value', () => {
    expect(response.success({ message: 'Some message' })).toMatchObject({
      statusCode: 200,
      body: JSON.stringify({ message: 'Some message' }),
    });
  });

  it('should return with given status code value', () => {
    expect(
      response.success({ message: 'Some message' }, StatusCodes.Created),
    ).toMatchObject({
      statusCode: 201,
      body: JSON.stringify({ message: 'Some message' }),
    });
  });
});

describe('error', () => {
  it('should return with default error status code', () => {
    expect(response.error(new Error('Some error'))).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({ message: 'Some error' }),
    });
  });

  it('should return with given error status code', () => {
    expect(response.error(new NotFoundError('Some error'))).toMatchObject({
      statusCode: 404,
      body: JSON.stringify({ message: 'Some error' }),
    });
  });
});
