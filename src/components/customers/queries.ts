import { QueryConfig } from 'pg';
import dedent from 'dedent';

const getCustomers = (): QueryConfig => {
  const name = 'get-customers';
  const text = dedent`
    SELECT
      c.id,
      c.name
    FROM customers c;
  `;

  return {
    name,
    text,
  };
};

const getCustomerById = (customerId: number): QueryConfig => {
  const name = 'get-customer-by-id';
  const text = dedent`
    SELECT
      c.id,
      c.name
    FROM customers c
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

export default { getCustomers, getCustomerById };
