import dedent from 'dedent';

import { queries } from '@components/customers';

describe('getCustomers', () => {
  it('should return proper query', () => {
    const query = queries.getCustomers();

    expect(query.name).toBe('get-customers');
    expect(query.text).toBe(dedent`
      SELECT
        c.id,
        c.name
      FROM customers c;
    `);
  });
});

describe('getCustomerById', () => {
  it('should return proper query', () => {
    const query = queries.getCustomerById(1);

    expect(query.name).toBe('get-customer-by-id');
    expect(query.text).toBe(dedent`
      SELECT
        c.id,
        c.name
      FROM customers c
      WHERE
        c.id = $1;
    `);
    expect(query.values).toEqual([1]);
  });
});
