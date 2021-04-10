import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';

import customers from './components/customers';
import accounts from './components/accounts';
import transfers from './components/transfers';

type APIGatewayProxyHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;
type Route = Record<string, APIGatewayProxyHandler>;
type Routes = Record<string, Route>;

const routes: Routes = {
  '/customers': {
    GET: customers.getCustomers,
  },
  '/customers/{customerId}/accounts': {
    GET: accounts.getAccounts,
    POST: accounts.createAccount,
  },
  '/customers/{customerId}/accounts/{accountId}': {
    GET: accounts.getAccount,
  },
  '/customers/{customerId}/accounts/{accountId}/transactions': {
    GET: accounts.getTransactions,
  },
  '/customers/{customerId}/transfers': {
    POST: transfers.transferAmount,
  },
};

export default routes;
