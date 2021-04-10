import BigNumber from 'bignumber.js';

import pool from '@config/database';
import nanoid from '@utils/nanoid';
import ConflictError from '@models/http/ConflictError';
import IAccount, { IAccountUpdateResult } from '@interfaces/IAccount';
import { ITransactionInsertResult } from '@interfaces/ITransaction';
import { ITransferInsertResult } from '@interfaces/ITransfer';
import { IDepositInsertResult } from '@interfaces/IDeposit';

import queries from './queries';

const getAccountByAccountNumber = async (
  accountNumber: string,
): Promise<IAccount[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query<IAccount>(
      queries.getAccountByAccountNumber(accountNumber),
    );
    const { rows } = result;

    return rows;
  } catch (error) {
    console.log('ERROR (getAccountByAccountNumber)', error);

    throw error;
  } finally {
    client.release();
  }
};

const transferAmount = async (
  fromAccount: IAccount,
  toAccount: IAccount,
  amount: string,
): Promise<boolean> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const transferTransactionResult = await client.query<ITransactionInsertResult>(
      queries.addTransaction(Number(fromAccount.id), nanoid(), '', 'TRANSFER'),
    );

    if (transferTransactionResult.rows.length === 0) {
      throw new Error('Failed to process transfer amount.');
    }

    const [{ id: transferTransactionId }] = transferTransactionResult.rows;
    const transferEndingAmount = new BigNumber(fromAccount.balance)
      .minus(amount)
      .toFixed(2);

    const transferResult = await client.query<ITransferInsertResult>(
      queries.addTransfer(
        Number(transferTransactionId),
        Number(fromAccount.id),
        Number(toAccount.id),
        amount,
        transferEndingAmount,
      ),
    );

    if (transferResult.rows.length === 0) {
      throw new Error('Failed to process transfer amount.');
    }

    const fromAccountUpdateBalanceResult = await client.query<IAccountUpdateResult>(
      queries.updateAccountBalance(
        Number(fromAccount.id),
        transferEndingAmount,
      ),
    );

    if (fromAccountUpdateBalanceResult.rows.length === 0) {
      throw new Error('Failed to process transfer amount.');
    }

    const depositTransactionResult = await client.query<ITransactionInsertResult>(
      queries.addTransaction(Number(toAccount.id), nanoid(), '', 'DEPOSIT'),
    );

    if (depositTransactionResult.rows.length === 0) {
      throw new Error('Failed to process transfer amount.');
    }

    const [{ id: depositTransactionId }] = depositTransactionResult.rows;
    const depositEndingAmount = new BigNumber(toAccount.balance)
      .plus(amount)
      .toFixed(2);
    const depositResult = await client.query<IDepositInsertResult>(
      queries.addDeposit(
        Number(depositTransactionId),
        amount,
        depositEndingAmount,
      ),
    );

    if (depositResult.rows.length === 0) {
      throw new Error('Failed to process transfer amount.');
    }

    const toAccountUpdateBalanceResult = await client.query<IAccountUpdateResult>(
      queries.updateAccountBalance(Number(toAccount.id), depositEndingAmount),
    );

    if (toAccountUpdateBalanceResult.rows.length === 0) {
      throw new Error('Failed to process transfer amount.');
    }

    await client.query('COMMIT');

    return true;
  } catch (error) {
    console.log('ERROR (transferAmount)', error);
    await client.query('ROLLBACK');

    throw new ConflictError(error.message);
  } finally {
    client.release();
  }
};

export default { getAccountByAccountNumber, transferAmount };
