import { APIGatewayProxyEvent } from 'aws-lambda';

import { StatusCodes } from '@config/constants';
import ICustomer from '@interfaces/ICustomer';
import IAccount, { IAccountInsertResult } from '@interfaces/IAccount';
import ITransaction from '@interfaces/ITransaction';
import accounts, { services } from '@components/accounts';
import { services as customersService } from '@components/customers';

jest.mock('@components/accounts/services');
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
const mockedCustomersService = customersService as jest.Mocked<
  typeof customersService
>;

describe('getAccounts', () => {
  const event: APIGatewayProxyEvent = {
    pathParameters: {
      customerId: '1',
    },
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: '',
    isBase64Encoded: false,
    path: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: null,
    resource: '',
  };

  it('should return list of accounts by customer id', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
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

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccounts as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));

    const result = await accounts.getAccounts(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.Ok,
      body: JSON.stringify(mockAccounts),
    });
  });

  it('should return error for non-existent customer', async () => {
    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve([]));

    const result = await accounts.getAccounts(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });
});

describe('createAccount', () => {
  const event: APIGatewayProxyEvent = {
    pathParameters: {
      customerId: '1',
    },
    body: JSON.stringify({ balance: '100.00' }),
    headers: {},
    multiValueHeaders: {},
    httpMethod: '',
    isBase64Encoded: false,
    path: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: null,
    resource: '',
  };

  it('should return success for account creation', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccountInsertResult[] = [
      {
        id: 1,
      },
    ];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.createAccount as jest.Mock<
      Promise<IAccountInsertResult[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));

    const result = await accounts.createAccount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.Created,
      body: JSON.stringify({
        message: 'Account successfully created.',
      }),
    });
  });

  it('should return error for non-existent customer', async () => {
    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve([]));

    const result = await accounts.createAccount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });

  it('should return error for failed account creation', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccountInsertResult[] = [];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.createAccount as jest.Mock<
      Promise<IAccountInsertResult[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));

    const result = await accounts.createAccount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.Conflict,
      body: JSON.stringify({
        message: 'Failed to created account.',
      }),
    });
  });
});

describe('getAccount', () => {
  const event: APIGatewayProxyEvent = {
    pathParameters: {
      customerId: '1',
      accountId: '1',
    },
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: '',
    isBase64Encoded: false,
    path: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: null,
    resource: '',
  };

  it('should return account details by id', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccount[] = [
      {
        id: 1,
        accountNumber: 'some-account-number',
        name: 'some-name',
        balance: '100.00',
      },
    ];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountById as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));

    const result = await accounts.getAccount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.Ok,
      body: JSON.stringify(mockAccounts[0]),
    });
  });

  it('should return error for non-existent customer', async () => {
    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve([]));

    const result = await accounts.getAccount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });

  it('should return error for non-existent account in a customer', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccount[] = [];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountById as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));

    const result = await accounts.getAccount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });
});

describe('getTransactions', () => {
  const event: APIGatewayProxyEvent = {
    pathParameters: {
      customerId: '1',
      accountId: '1',
    },
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: '',
    isBase64Encoded: false,
    path: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: null,
    resource: '',
  };

  it('should return list of transactions in an account', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccount[] = [
      {
        id: 1,
        accountNumber: 'some-account-number',
        name: 'some-name',
        balance: '100.00',
      },
    ];
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

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountById as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));
    (mockedServices.getTransactions as jest.Mock<
      Promise<ITransaction[]>
    >).mockImplementation(() => Promise.resolve(mockTransactions));

    const result = await accounts.getTransactions(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.Ok,
      body: JSON.stringify(mockTransactions),
    });
  });

  it('should return list of transactions in an account with query params', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccount[] = [
      {
        id: 1,
        accountNumber: 'some-account-number',
        name: 'some-name',
        balance: '100.00',
      },
    ];
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

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountById as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));
    (mockedServices.getTransactions as jest.Mock<
      Promise<ITransaction[]>
    >).mockImplementation(() => Promise.resolve(mockTransactions));

    const result = await accounts.getTransactions({
      ...event,
      queryStringParameters: { type: 'some-type' },
    });

    expect(result).toMatchObject({
      statusCode: StatusCodes.Ok,
      body: JSON.stringify(mockTransactions),
    });
  });

  it('should return error for non-existent customer', async () => {
    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve([]));

    const result = await accounts.getTransactions(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });

  it('should return error for non-existent account in a customer', async () => {
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const mockAccounts: IAccount[] = [];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountById as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementation(() => Promise.resolve(mockAccounts));

    const result = await accounts.getTransactions(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });
});
