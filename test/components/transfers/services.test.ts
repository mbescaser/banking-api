import pool from '@config/database';
import IAccount, { IAccountUpdateResult } from '@interfaces/IAccount';
import { ITransactionInsertResult } from '@interfaces/ITransaction';
import { ITransferInsertResult } from '@interfaces/ITransfer';
import { IDepositInsertResult } from '@interfaces/IDeposit';
import { services } from '@components/transfers';

jest.mock('@components/transfers/queries');
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
  jest.clearAllMocks();
});

describe('getAccountByAccountNumber', () => {
  it('should return account by account number', async () => {
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

    const result = await services.getAccountByAccountNumber(
      'some-account-number',
    );

    expect(result).toHaveLength(1);
    expect(result).toMatchObject(mockAccounts);
  });

  it('should throw for db error', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementation(() =>
      Promise.reject(new Error('Some error.')),
    );

    expect(
      services.getAccountByAccountNumber('some-account-number'),
    ).rejects.toThrowError(new Error('Some error.'));
  });
});

describe('transferAmount', () => {
  const fromAccount: IAccount = {
    id: 1,
    accountNumber: 'some-account-number',
    name: 'some-name',
    balance: '100.00',
  };
  const toAccount: IAccount = {
    id: 1,
    accountNumber: 'some-account-number',
    name: 'some-name',
    balance: '100.00',
  };
  const amount = '100.00';

  it('should transfer amount from one account to another account', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransferInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 2 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IDepositInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 2 }],
      }),
    );
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    const result = await services.transferAmount(
      fromAccount,
      toAccount,
      amount,
    );

    expect(result).toBe(true);
  });

  it('should throw error for invalid transfer transaction insertion', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() => Promise.reject(new Error('Some error.')));
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    expect(
      services.transferAmount(fromAccount, toAccount, amount),
    ).rejects.toThrowError(new Error('Some error.'));
  });

  it('should throw error for invalid transfer insertion', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransferInsertResult[] }>
    >).mockImplementationOnce(() => Promise.reject(new Error('Some error.')));
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    expect(
      services.transferAmount(fromAccount, toAccount, amount),
    ).rejects.toThrowError(new Error('Some error.'));
  });

  it('should throw error for invalid account update of sender', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransferInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() => Promise.reject(new Error('Some error.')));
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    expect(
      services.transferAmount(fromAccount, toAccount, amount),
    ).rejects.toThrowError(new Error('Some error.'));
  });

  it('should throw error for invalid deposit transaction insertion', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransferInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() => Promise.reject(new Error('Some error.')));
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    expect(
      services.transferAmount(fromAccount, toAccount, amount),
    ).rejects.toThrowError(new Error('Some error.'));
  });

  it('should throw error for invalid deposit insertion', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransferInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 2 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IDepositInsertResult[] }>
    >).mockImplementationOnce(() => Promise.reject(new Error('Some error.')));
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    expect(
      services.transferAmount(fromAccount, toAccount, amount),
    ).rejects.toThrowError(new Error('Some error.'));
  });

  it('should throw error for invalid account update of sender', async () => {
    mockedPool.connect.mockImplementation(() => mockedClient);
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransferInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: ITransactionInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 2 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IDepositInsertResult[] }>
    >).mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: 1 }],
      }),
    );
    (mockedClient.query as jest.Mock<
      Promise<{ rows: IAccountUpdateResult[] }>
    >).mockImplementationOnce(() => Promise.reject(new Error('Some error.')));
    mockedClient.query.mockImplementationOnce(() => Promise.resolve());

    expect(
      services.transferAmount(fromAccount, toAccount, amount),
    ).rejects.toThrowError(new Error('Some error.'));
  });
});
