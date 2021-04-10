import dedent from 'dedent';

import { queries } from '@components/accounts';

describe('getAccounts', () => {
  it('should return proper query', () => {
    const query = queries.getAccounts(1);

    expect(query.name).toBe('get-accounts');
    expect(query.text).toBe(dedent`
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
    `);
    expect(query.values).toEqual([1]);
  });
});

describe('createAccount', () => {
  it('should return proper query', () => {
    const query = queries.createAccount(1, 'account-number', '100.00');

    expect(query.name).toBe('create-account');
    expect(query.text).toBe(dedent`
      INSERT INTO accounts
        (customer_id, account_number, balance)
      VALUES
        ($1, $2, $3)
      RETURNING
        id;
    `);
    expect(query.values).toEqual([1, 'account-number', '100.00']);
  });
});

describe('getAccountById', () => {
  it('should return proper query', () => {
    const query = queries.getAccountById(1);

    expect(query.name).toBe('get-account-by-id');
    expect(query.text).toBe(dedent`
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
    `);
    expect(query.values).toEqual([1]);
  });
});

describe('getTransactions', () => {
  it('should return proper query', () => {
    const query = queries.getTransactions(1);

    expect(query.name).toBe('get-transactions');
    expect(query.text).toBe(dedent`
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

      ORDER BY
        ut.created_at DESC;
    `);
    expect(query.values).toEqual([1]);
  });

  it('should return proper query with where clause', () => {
    const query = queries.getTransactions(1, 'some-type');

    expect(query.name).toBe('get-transactions');
    expect(query.text).toBe(dedent`
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
      WHERE ut.transaction_type = $2
      ORDER BY
        ut.created_at DESC;
      `);
    expect(query.values).toEqual([1, 'some-type']);
  });
});
