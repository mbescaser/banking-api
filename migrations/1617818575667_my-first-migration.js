exports.up = (pgm) => {
  pgm.createTable('customers', {
    id: 'id',
    name: {
      type: 'varchar(1000)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.sql(`
    INSERT INTO customers
      (name)
    VALUES
      ('Arisha Barron'),
      ('Branden Gibson'),
      ('Rhonda Church'),
      ('Georgina Hazel');
  `);
  pgm.createTable('accounts', {
    id: 'id',
    customer_id: {
      type: 'integer',
      notNull: true,
      references: '"customers"',
      onDelete: 'cascade',
    },
    account_number: {
      type: 'varchar(1000)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    balance: {
      type: 'numeric',
      notNull: true,
      default: 0,
    },
  });
  pgm.createIndex('accounts', 'customer_id');
  // pgm.sql(`
  //   INSERT INTO accounts
  //     (customer_id, account_number, balance)
  //   VALUES
  //     (1, 'account-001', '1000.00'),
  //     (1, 'account-002', '500.00')
  //   RETURNING
  //     id;
  // `);
  pgm.createTable('transaction_types', {
    id: 'id',
    name: {
      type: 'varchar(1000)',
      notNull: true,
    },
    description: {
      type: 'varchar(1000)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.sql(`
    INSERT INTO transaction_types
      (name, description)
    VALUES
      ('TRANSFER', ''),
      ('DEPOSIT', '');
  `);
  pgm.createTable('transactions', {
    id: 'id',
    account_id: {
      type: 'integer',
      notNull: true,
      references: '"accounts"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    transaction_number: {
      type: 'varchar(1000)',
      notNull: true,
    },
    description: {
      type: 'varchar(1000)',
      notNull: true,
    },
    transaction_type: {
      type: 'integer',
      notNull: true,
      references: '"transaction_types"',
      onDelete: 'cascade',
    },
  });
  pgm.createIndex('transactions', ['account_id', 'transaction_type']);
  pgm.createTable('transfers', {
    id: 'id',
    transaction_id: {
      type: 'integer',
      notNull: true,
      references: '"transactions"',
      onDelete: 'cascade',
    },
    from_account_id: {
      type: 'integer',
      notNull: true,
      references: '"accounts"',
      onDelete: 'cascade',
    },
    to_account_id: {
      type: 'integer',
      notNull: true,
      references: '"accounts"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    amount: {
      type: 'numeric',
      notNull: true,
      default: 0,
    },
    ending_amount: {
      type: 'numeric',
      notNull: true,
      default: 0,
    }
  });
  pgm.createIndex('transfers', ['transaction_id', 'from_account_id', 'to_account_id']);
  pgm.createTable('deposits', {
    id: 'id',
    transaction_id: {
      type: 'integer',
      notNull: true,
      references: '"transactions"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    amount: {
      type: 'numeric',
      notNull: true,
      default: 0,
    },
    ending_amount: {
      type: 'numeric',
      notNull: true,
      default: 0,
    }
  });
  pgm.createIndex('deposits', ['transaction_id']);
  // pgm.sql(`
  //   INSERT INTO transactions
  //     (account_id, transaction_number, description, transaction_type)
  //   VALUES
  //     (1, '1-transaction-001', 'Transfer to account', (SELECT id from transaction_types tt WHERE tt.name = 'TRANSFER'))
  //   RETURNING
  //     id;
  // `);
  // pgm.sql(`
  //   INSERT INTO transfers
  //     (transaction_id, from_account_id, to_account_id, amount, ending_amount)
  //   VALUES
  //     (1, 1, 2, '100.00', '900.00')
  //   RETURNING
  //     id;
  // `);
  // pgm.sql(`
  //   UPDATE accounts
  //     SET balance='900.00'
  //   WHERE
  //     id='1';
  // `);
  // pgm.sql(`
  //   INSERT INTO transactions
  //     (account_id, transaction_number, description, transaction_type)
  //   VALUES
  //     (2, '2-transaction-001', 'Funds transfer', (SELECT id from transaction_types tt WHERE tt.name = 'DEPOSIT'));
  // `);
  // pgm.sql(`
  //   INSERT INTO deposits
  //     (transaction_id, amount, ending_amount)
  //   VALUES
  //     (2, '100.00', '600.00');
  // `);
  // pgm.sql(`
  //   UPDATE accounts
  //     SET balance='600.00'
  //   WHERE
  //     id='2';
  // `);
}

exports.down = (pgm) => {
  pgm.dropIndex('deposits', ['transaction_id']);
  pgm.dropTable('deposits');
  pgm.dropIndex('transfers', ['transaction_id', 'from_account_id', 'to_account_id']);
  pgm.dropTable('transfers');
  pgm.dropIndex('transactions', ['account_id', 'transaction_type']);
  pgm.dropTable('transactions');
  pgm.dropTable('transaction_types');
  pgm.dropIndex('accounts', 'customer_id');
  pgm.dropTable('accounts');
  pgm.dropTable('customers');
}
