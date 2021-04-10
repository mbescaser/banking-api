import { QueryConfig } from 'pg';
import dedent from 'dedent';

const getAccounts = (customerId: number): QueryConfig => {
  const name = 'get-accounts';
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
      c.id = $1;
  `;
  const values = [customerId];

  return {
    name,
    text,
    values,
  };
};

const createAccount = (
  customerId: number,
  accountNumber: string,
  balance: string,
): QueryConfig => {
  const name = 'create-account';
  const text = dedent`
    INSERT INTO accounts
      (customer_id, account_number, balance)
    VALUES
      ($1, $2, $3)
    RETURNING
      id;
  `;
  const values = [customerId, accountNumber, balance];

  return {
    name,
    text,
    values,
  };
};

const getAccountById = (accountId: number): QueryConfig => {
  const name = 'get-account-by-id';
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
      a.id = $1;
  `;
  const values = [accountId];

  return {
    name,
    text,
    values,
  };
};

const getTransactions = (
  accountId: number,
  transactionType?: string,
): QueryConfig => {
  const name = 'get-transactions';
  const values: QueryConfig['values'] = [accountId];

  if (transactionType) {
    values.push(transactionType);
  }

  const text = dedent`
    SELECT
      ut.id,
      ut.created_at as "createdAt",
      ut.description,
      ut.amount,
      ut.transaction_type AS type
    FROM (
      SELECT
        t2.id,
        t2.created_at,
        t2.description,
        t.amount,
        (SELECT name FROM transaction_types tt WHERE tt.id = t2.transaction_type) AS transaction_type
      FROM transfers t
      INNER JOIN transactions t2
        ON t.transaction_id = t2.id
      WHERE
        t2.account_id = $1
      UNION
      SELECT
        t.id,
        t.created_at,
        t.description,
        d.amount,
        (SELECT name FROM transaction_types tt WHERE tt.id = t.transaction_type) AS transaction_type
      FROM deposits d
      INNER JOIN transactions t
        ON d.transaction_id = t.id
      WHERE
        t.account_id = $1
    ) ut
    ${transactionType ? `WHERE ut.transaction_type = $2` : ''}
    ORDER BY
      ut.created_at DESC;
  `;

  return {
    name,
    text,
    values,
  };
};

export default { getAccounts, createAccount, getAccountById, getTransactions };
