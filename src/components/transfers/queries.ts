import { QueryConfig } from 'pg';
import dedent from 'dedent';

const getAccountByAccountNumber = (accountNumber: string): QueryConfig => {
  const name = 'get-account-by-account-number';
  const text = dedent`
    SELECT
      a.id,
      a.account_number as "accountNumber",
      a.balance,
      c.name
    FROM accounts a
    INNER JOIN customers c
      ON a.customer_id = c.id
    WHERE
      a.account_number = $1;
  `;
  const values = [accountNumber];

  return {
    name,
    text,
    values,
  };
};

const addTransaction = (
  accountId: number,
  transactionNumber: string,
  description: string,
  transactionType: string,
): QueryConfig => {
  const name = 'add-transaction';
  const text = dedent`
    INSERT INTO transactions
      (account_id, transaction_number, description, transaction_type)
    VALUES
      ($1, $2, $3, (SELECT id FROM transaction_types tt WHERE tt.name = $4))
    RETURNING
      id;
  `;
  const values = [accountId, transactionNumber, description, transactionType];

  return {
    name,
    text,
    values,
  };
};

const addTransfer = (
  transactionId: number,
  fromAccountId: number,
  toAccountId: number,
  amount: string,
  endingAmount: string,
): QueryConfig => {
  const name = 'add-transfer';
  const text = dedent`
    INSERT INTO transfers
      (transaction_id, from_account_id, to_account_id, amount, ending_amount)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      id;
  `;
  const values = [
    transactionId,
    fromAccountId,
    toAccountId,
    amount,
    endingAmount,
  ];

  return {
    name,
    text,
    values,
  };
};

const updateAccountBalance = (
  accountId: number,
  balance: string,
): QueryConfig => {
  const name = 'update-account-balance';
  const text = dedent`
    UPDATE accounts
      SET balance = $2
    WHERE
      id = $1
    RETURNING
      id;
  `;
  const values = [accountId, balance];

  return {
    name,
    text,
    values,
  };
};

const addDeposit = (
  transactionId: number,
  amount: string,
  endingAmount: string,
): QueryConfig => {
  const name = 'add-deposit';
  const text = dedent`
    INSERT INTO deposits
      (transaction_id, amount, ending_amount)
    VALUES
      ($1, $2, $3)
    RETURNING
      id;
  `;
  const values = [transactionId, amount, endingAmount];

  return {
    name,
    text,
    values,
  };
};

export default {
  getAccountByAccountNumber,
  addTransaction,
  addTransfer,
  updateAccountBalance,
  addDeposit,
};
