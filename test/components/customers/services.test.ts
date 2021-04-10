import pool from '@config/database';
import ICustomer from '@interfaces/ICustomer';
import { services } from '@components/customers';

jest.mock('@components/customers/queries');
jest.mock('@config/database', () => ({
  connect: jest.fn(),
}));

const mockedPool = pool as jest.Mocked<typeof pool>;
const mockedClient = {
  query: jest.fn(),
  release: jest.fn(),
};

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

describe('getCustomers', () => {
  it('should return list of customers', async () => {
    const mockedCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
      {
        id: 2,
        name: 'hello world',
      },
    ];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ICustomer[] }>
    >).mockImplementation(() =>
      Promise.resolve({
        rows: mockedCustomers,
      }),
    );

    const customers = await services.getCustomers();

    expect(customers).toHaveLength(2);
    expect(customers).toMatchObject(mockedCustomers);
  });

  it('should return list of empty customers', async () => {
    const mockedCustomers: ICustomer[] = [];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ICustomer[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: mockedCustomers,
      }),
    );

    const customers = await services.getCustomers();

    expect(customers).toHaveLength(0);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(services.getCustomers()).rejects.toThrowError(
      new Error('Some error.'),
    );
  });
});

describe('getCustomerById', () => {
  it('should return account details by id', async () => {
    const mockAccounts: ICustomer[] = [
      {
        id: 1,
        name: 'some-name',
      },
    ];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ICustomer[] }>
    >).mockImplementation(() =>
      Promise.resolve({
        rows: mockAccounts,
      }),
    );

    const result = await services.getCustomerById(1);

    expect(result).toHaveLength(1);
    expect(result).toMatchObject(mockAccounts);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(services.getCustomerById(1)).rejects.toThrowError(
      new Error('Some error.'),
    );
  });
});
