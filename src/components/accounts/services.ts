import pool from '@config/database';
import nanoid from '@utils/nanoid';
import IAccount, { IAccountInsertResult } from '@interfaces/IAccount';
import ITransaction from '@interfaces/ITransaction';

import queries from './queries';

const getAccounts = async (customerId: number): Promise<IAccount[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query<IAccount>(
      queries.getAccounts(customerId),
    );
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (getAccounts)', error);

    throw error;
  } finally {
    client.release();
  }
};

const createAccount = async (
  customerId: number,
  balance: string,
): Promise<IAccountInsertResult[]> => {
  const client = await pool.connect();

  try {
    const accountNumber = nanoid();
    const result = await client.query<IAccountInsertResult>(
      queries.createAccount(customerId, accountNumber, balance),
    );
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (createAccount)', error);

    throw error;
  } finally {
    client.release();
  }
};

const getAccountById = async (accountId: number): Promise<IAccount[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query<IAccount>(
      queries.getAccountById(accountId),
    );
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (getAccountById)', error);

    throw error;
  } finally {
    client.release();
  }
};

const getTransactions = async (
  accountId: number,
  transactionType?: string,
): Promise<ITransaction[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query<ITransaction>(
      queries.getTransactions(accountId, transactionType),
    );
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (getTransactions)', error);

    throw error;
  } finally {
    client.release();
  }
};

export default { getAccounts, createAccount, getAccountById, getTransactions };
