import dedent from 'dedent';

import { queries } from '@components/transfers';

describe('getAccounts', () => {
  it('should return proper query', () => {
    const query = queries.getAccountByAccountNumber('some-account-number');

    expect(query.name).toBe('get-account-by-account-number');
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
        a.account_number = $1;
    `);
    expect(query.values).toEqual(['some-account-number']);
  });
});

describe('addTransaction', () => {
  it('should return proper query', () => {
    const query = queries.addTransaction(
      1,
      'some-transaction-number',
      'some-description',
      'some-transaction-type',
    );

    expect(query.name).toBe('add-transaction');
    expect(query.text).toBe(dedent`
      INSERT INTO transactions
        (account_id, transaction_number, description, transaction_type)
      VALUES
        ($1, $2, $3, (SELECT id FROM transaction_types tt WHERE tt.name = $4))
      RETURNING
        id;
    `);
    expect(query.values).toEqual([
      1,
      'some-transaction-number',
      'some-description',
      'some-transaction-type',
    ]);
  });
});

describe('addTransfer', () => {
  it('should return proper query', () => {
    const query = queries.addTransfer(1, 2, 3, '100.00', '200.00');

    expect(query.name).toBe('add-transfer');
    expect(query.text).toBe(dedent`
      INSERT INTO transfers
        (transaction_id, from_account_id, to_account_id, amount, ending_amount)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id;
    `);
    expect(query.values).toEqual([1, 2, 3, '100.00', '200.00']);
  });
});

describe('updateAccountBalance', () => {
  it('should return proper query', () => {
    const query = queries.updateAccountBalance(1, '100.00');

    expect(query.name).toBe('update-account-balance');
    expect(query.text).toBe(dedent`
      UPDATE accounts
        SET balance = $2
      WHERE
        id = $1
      RETURNING
        id;
    `);
    expect(query.values).toEqual([1, '100.00']);
  });
});

describe('addDeposit', () => {
  it('should return proper query', () => {
    const query = queries.addDeposit(1, '100.00', '200.00');

    expect(query.name).toBe('add-deposit');
    expect(query.text).toBe(dedent`
      INSERT INTO deposits
        (transaction_id, amount, ending_amount)
      VALUES
        ($1, $2, $3)
      RETURNING
        id;
    `);
    expect(query.values).toEqual([1, '100.00', '200.00']);
  });
});
