import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import BigNumber from 'bignumber.js';

import { StatusCodes } from '@config/constants';
import response from '@utils/response';
import decodePathParameters from '@utils/decodePathParameters';
import parseJson from '@utils/parseJson';
import NotFoundError from '@models/http/NotFoundError';
import UnprocessableEntityError from '@models/http/UnprocessableEntityError';
import { ITransferRequestPayload } from '@interfaces/ITransfer';
import { services as customersServices } from '@components/customers';

import services from './services';

const transferAmount = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters, body } = event;
    const { customerId } = decodePathParameters(pathParameters);
    const customers = await customersServices.getCustomerById(
      Number(customerId),
    );

    if (customers.length === 0) {
      throw new NotFoundError(
        "The resource that you're trying to access does not exist.",
      );
    }

    const {
      fromAccountNumber,
      toAccountNumber,
      amount,
    } = parseJson<ITransferRequestPayload>(body);

    if (!fromAccountNumber || !toAccountNumber || !amount) {
      throw new UnprocessableEntityError(
        'Failed to process request due to missing required fields.',
      );
    }

    if (fromAccountNumber === toAccountNumber) {
      throw new UnprocessableEntityError(
        'Failed to process request due to same sender and recipient account.',
      );
    }

    const [fromAccounts, toAccounts] = await Promise.all([
      services.getAccountByAccountNumber(fromAccountNumber),
      services.getAccountByAccountNumber(toAccountNumber),
    ]);

    if (fromAccounts.length === 0) {
      throw new UnprocessableEntityError(
        'Failed to process request due to non-existent sender account.',
      );
    }

    const [fromAccount] = fromAccounts;

    if (toAccounts.length === 0) {
      throw new UnprocessableEntityError(
        'Failed to process request due to non-existent recipient account.',
      );
    }

    const [toAccount] = toAccounts;
    const amountBigNumber = new BigNumber(amount);

    if (amountBigNumber.isNaN() || amountBigNumber.isLessThanOrEqualTo(0)) {
      throw new UnprocessableEntityError(
        'Failed to process request due to amount is less than zero or not a numeric value.',
      );
    }

    if (amountBigNumber.isGreaterThan(fromAccount.balance)) {
      throw new UnprocessableEntityError(
        'Failed to process request due insufficient funds.',
      );
    }

    await services.transferAmount(
      fromAccount,
      toAccount,
      amountBigNumber.toFixed(2),
    );

    return response.success(
      {
        message: 'Amount successfully transferred.',
      },
      StatusCodes.Created,
    );
  } catch (error) {
    return response.error(error);
  }
};

export default { transferAmount };
