import pool from '@config/database';
import IAccount from '@interfaces/IAccount';
import ITransaction from '@interfaces/ITransaction';
import { services } from '@components/accounts';

jest.mock('@components/accounts/queries');
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

describe('getAccounts', () => {
  it('should return accounts by customer id', async () => {
    const mockAccounts: IAccount[] = [
      {
        id: 1,
        accountNumber: 'some-account-number',
        name: 'some-name',
        balance: '100.00',
      },
      {
        id: 2,
        accountNumber: 'some-account-number',
        name: 'some-name',
        balance: '100.00',
      },
    ];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccount[] }>
    >).mockImplementation(() =>
      Promise.resolve({
        rows: mockAccounts,
      }),
    );

    const result = await services.getAccounts(1);

    expect(result).toHaveLength(2);
    expect(result).toMatchObject(mockAccounts);
  });

  it('should return empty accounts by customer id', async () => {
    const mockAccounts: IAccount[] = [];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccount[] }>
    >).mockImplementation(() =>
      Promise.resolve({
        rows: mockAccounts,
      }),
    );

    const result = await services.getAccounts(1);

    expect(result).toHaveLength(0);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(services.getAccounts(1)).rejects.toThrowError(
      new Error('Some error.'),
    );
  });
});

describe('createAccount', () => {
  it('should return success for creating an account', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.resolve({ rows: [{ id: 2 }] }),
    );

    const result = await services.createAccount(1, '100.00');

    expect(result).toHaveLength(1);
    expect(result).toMatchObject([{ id: 2 }]);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(services.createAccount(1, '100.00')).rejects.toThrowError(
      new Error('Some error.'),
    );
  });
});

describe('getAccountById', () => {
  it('should return account details by id', async () => {
    const mockAccounts: IAccount[] = [
      {
        id: 1,
        accountNumber: 'some-account-number',
        name: 'some-name',
        balance: '100.00',
      },
    ];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccount[] }>
    >).mockImplementation(() =>
      Promise.resolve({
        rows: mockAccounts,
      }),
    );

    const result = await services.getAccountById(1);

    expect(result).toHaveLength(1);
    expect(result).toMatchObject(mockAccounts);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(services.getAccountById(1)).rejects.toThrowError(
      new Error('Some error.'),
    );
  });
});

describe('getTransactions', () => {
  it('should return transactions for account id', async () => {
    const mockTransactions: ITransaction[] = [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        description: 'some-description',
        type: 'some-type',
        amount: '100.00',
      },
      {
        id: 2,
        createdAt: new Date().toISOString(),
        description: 'some-description',
        type: 'some-type',
        amount: '100.00',
      },
    ];

    mockedPool.connect.mockImplementation(() => mockedClient);
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransaction[] }>
    >).mockImplementation(() =>
      Promise.resolve({
        rows: mockTransactions,
      }),
    );

    const result = await services.getTransactions(1);

    expect(result).toHaveLength(2);
    expect(result).toMatchObject(mockTransactions);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(services.getTransactions(1)).rejects.toThrowError(
      new Error('Some error.'),
    );
  });
});
