import pool from '@config/database';
import ICustomer from '@interfaces/ICustomer';

import queries from './queries';

const getCustomers = async (): Promise<ICustomer[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query<ICustomer>(queries.getCustomers());
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (getCustomers)', error);

    throw error;
  } finally {
    client.release();
  }
};

const getCustomerById = async (customerId: number): Promise<ICustomer[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query<ICustomer>(
      queries.getCustomerById(customerId),
    );
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (getCustomerById)', error);

    throw error;
  } finally {
    client.release();
  }
};

export default { getCustomers, getCustomerById };
