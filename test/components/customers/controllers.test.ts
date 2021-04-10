import { StatusCodes } from '@config/constants';
import ICustomer from '@interfaces/ICustomer';
import customers, { services } from '@components/customers';

jest.mock('@components/customers/services');
jest.mock('hashids', () => {
  return jest.fn().mockImplementation(() => {
    return {
      encode: jest.fn().mockImplementation((x) => x),
      decode: jest.fn().mockImplementation((x) => [x]),
    };
  });
});

const mockedServices = services as jest.Mocked<typeof services>;

describe('getCustomers', () => {
  it('should return list of customers', async () => {
    const customerList: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
      {
        id: 2,
        name: 'hello world',
      },
    ];

    mockedServices.getCustomers.mockImplementation(() =>
      Promise.resolve(customerList),
    );

    const result = await customers.getCustomers();

    expect(result).toMatchObject({
      statusCode: StatusCodes.Ok,
      body: JSON.stringify(customerList),
    });
  });

  it('should return database message with appropriate status code', async () => {
    mockedServices.getCustomers.mockImplementation(() =>
      Promise.reject(new Error('Failed to fetch from database.')),
    );

    const result = await customers.getCustomers();

    expect(result).toMatchObject({
      statusCode: StatusCodes.InternalServerError,
      body: JSON.stringify({
        message: 'Failed to fetch from database.',
      }),
    });
  });
});
