import { APIGatewayProxyResult } from 'aws-lambda';

import response from '@utils/response';
import { encodeItems } from '@utils/hashIds';

import services from './services';

const getCustomers = async (): Promise<APIGatewayProxyResult> => {
  try {
    const customers = await services.getCustomers();
    const customersWithHashIds = customers.map((customer) =>
      encodeItems(customer, ['id']),
    );

    return response.success(customersWithHashIds);
  } catch (error) {
    return response.error(error);
  }
};

export default { getCustomers };
