import { APIGatewayProxyEvent } from 'aws-lambda';

import { StatusCodes } from '@config/constants';
import ICustomer from '@interfaces/ICustomer';
import IAccount from '@interfaces/IAccount';
import transfers, { services } from '@components/transfers';
import { services as customersService } from '@components/customers';

jest.mock('@components/transfers/services');
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

describe('transferAmount', () => {
  it('should return success transfer amount', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'from-some-account-number',
        toAccountNumber: 'to-some-account-number',
        amount: '100.00',
      }),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const fromAccount: IAccount = {
      id: 1,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };
    const toAccount: IAccount = {
      id: 2,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([fromAccount]));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([toAccount]));
    (mockedServices.transferAmount as jest.Mock<
      Promise<boolean>
    >).mockImplementationOnce(() => Promise.resolve(true));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.Created,
      body: JSON.stringify({ message: 'Amount successfully transferred.' }),
    });
  });

  it('should return error for non-existent customer', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'from-some-account-number',
        toAccountNumber: 'to-some-account-number',
        amount: '100.00',
      }),
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

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve([]));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.NotFound,
      body: JSON.stringify({
        message: "The resource that you're trying to access does not exist.",
      }),
    });
  });

  it('should throw error for missing fields', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({}),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.UnprocessableEntity,
      body: JSON.stringify({
        message: 'Failed to process request due to missing required fields.',
      }),
    });
  });

  it('should throw error for same value of sender and recipient account number', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'some-account-number',
        toAccountNumber: 'some-account-number',
        amount: '100.00',
      }),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.UnprocessableEntity,
      body: JSON.stringify({
        message:
          'Failed to process request due to same sender and recipient account.',
      }),
    });
  });

  it('should throw error for non-existent sender account number', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'from-some-account-number',
        toAccountNumber: 'to-some-account-number',
        amount: '100.00',
      }),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const toAccount: IAccount = {
      id: 2,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([]));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([toAccount]));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.UnprocessableEntity,
      body: JSON.stringify({
        message:
          'Failed to process request due to non-existent sender account.',
      }),
    });
  });

  it('should throw error for non-existent recipient account number', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'from-some-account-number',
        toAccountNumber: 'to-some-account-number',
        amount: '100.00',
      }),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const fromAccount: IAccount = {
      id: 1,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([fromAccount]));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([]));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.UnprocessableEntity,
      body: JSON.stringify({
        message:
          'Failed to process request due to non-existent recipient account.',
      }),
    });
  });

  it('should throw error for invalid value of amount', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'from-some-account-number',
        toAccountNumber: 'to-some-account-number',
        amount: 'some-amount',
      }),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const fromAccount: IAccount = {
      id: 1,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };
    const toAccount: IAccount = {
      id: 2,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([fromAccount]));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([toAccount]));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.UnprocessableEntity,
      body: JSON.stringify({
        message:
          'Failed to process request due to amount is less than zero or not a numeric value.',
      }),
    });
  });

  it('should throw error for insufficient balance for transfer amount', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        customerId: '1',
      },
      body: JSON.stringify({
        fromAccountNumber: 'from-some-account-number',
        toAccountNumber: 'to-some-account-number',
        amount: '200.00',
      }),
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
    const mockCustomers: ICustomer[] = [
      {
        id: 1,
        name: 'hello world',
      },
    ];
    const fromAccount: IAccount = {
      id: 1,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };
    const toAccount: IAccount = {
      id: 2,
      accountNumber: 'some-account-number',
      name: 'some-name',
      balance: '100.00',
    };

    (mockedCustomersService.getCustomerById as jest.Mock<
      Promise<ICustomer[]>
    >).mockImplementation(() => Promise.resolve(mockCustomers));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([fromAccount]));
    (mockedServices.getAccountByAccountNumber as jest.Mock<
      Promise<IAccount[]>
    >).mockImplementationOnce(() => Promise.resolve([toAccount]));

    const result = await transfers.transferAmount(event);

    expect(result).toMatchObject({
      statusCode: StatusCodes.UnprocessableEntity,
      body: JSON.stringify({
        message: 'Failed to process request due insufficient funds.',
      }),
    });
  });
});
