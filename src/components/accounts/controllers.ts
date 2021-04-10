import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { StatusCodes } from '@config/constants';
import response from '@utils/response';
import { encodeItems } from '@utils/hashIds';
import decodePathParameters from '@utils/decodePathParameters';
import parseJson from '@utils/parseJson';
import NotFoundError from '@models/http/NotFoundError';
import ConflictError from '@models/http/ConflictError';
import { IAccountRequestPayload } from '@interfaces/IAccount';
import { services as customersServices } from '@components/customers';

import services from './services';

const getAccounts = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters } = event;
    const { customerId } = decodePathParameters(pathParameters);
    const customers = await customersServices.getCustomerById(
      Number(customerId),
    );

    if (customers.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    const accounts = await services.getAccounts(customerId);
    const accountsWithHashIds = accounts.map((account) =>
      encodeItems(account, ['id']),
    );

    return response.success(accountsWithHashIds);
  } catch (error) {
    return response.error(error);
  }
};

const createAccount = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters, body } = event;
    const { customerId } = decodePathParameters(pathParameters);
    const parsedJson = parseJson<IAccountRequestPayload>(body);
    const customers = await customersServices.getCustomerById(
      Number(customerId),
    );

    if (customers.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    const accounts = await services.createAccount(
      customerId,
      parsedJson.balance,
    );

    if (accounts.length === 0) {
      throw new ConflictError('Failed to created account.');
    }

    return response.success(
      { message: 'Account successfully created.' },
      StatusCodes.Created,
    );
  } catch (error) {
    return response.error(error);
  }
};

const getAccount = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters } = event;
    const { customerId, accountId } = decodePathParameters(pathParameters);
    const customers = await customersServices.getCustomerById(
      Number(customerId),
    );

    if (customers.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    const accounts = await services.getAccountById(accountId);

    if (accounts.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    const [account] = accounts;
    const accountWithHashIds = encodeItems(account, ['id']);

    return response.success(accountWithHashIds);
  } catch (error) {
    return response.error(error);
  }
};

const getTransactions = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters, queryStringParameters } = event;
    const { customerId, accountId } = decodePathParameters(pathParameters);
    const customers = await customersServices.getCustomerById(
      Number(customerId),
    );

    if (customers.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    const accounts = await services.getAccountById(accountId);

    if (accounts.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    let transactionType: string;

    if (queryStringParameters) {
      ({ type: transactionType } = queryStringParameters);
    }

    const transactions = await services.getTransactions(
      accountId,
      transactionType,
    );
    const transactionsWithHashIds = transactions.map((transaction) =>
      encodeItems(transaction, ['id']),
    );

    return response.success(transactionsWithHashIds);
  } catch (error) {
    return response.error(error);
  }
};

export default { getAccounts, createAccount, getAccount, getTransactions };
