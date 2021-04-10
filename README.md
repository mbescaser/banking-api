
# Banking API

## Tasks
-   [x] Create a new bank account for a customer, with an initial deposit amount.
-   [x] A single customer may have multiple bank accounts.
-   [x] Transfer amounts between any two accounts, including those owned by different customers.
-   [x] Retrieve balances for a given account.
-   [x] Retrieve transfer history for a given account.

## API Documentation
[List of API's available](https://bankingapi7.docs.apiary.io/#)
## Database Installation
[Install PostgreSQL](https://www.postgresql.org/download/)
```bash
psql postgres
postgres=# CREATE USER banking;
postgres=# CREATE DATABASE banking_api;
postgres=# ALTER DATABASE banking_api OWNER TO banking;
postgres=# ALTER USER banking WITH PASSWORD 'banking_api';
```
## Usage Scripts
```bash
npm i -g serverless
npm i
npm run migrate up
npm run start
```
## Database Migration
```bash
npm run migrate up # Setup tables and prerequisite data
npm run migrate down # Teardown tables and all data
```
## Unit Test
```bash
npm test
```
## Notes
You can ignore this log after you execute `npm run start` and go directly to access to the API's, it's more on eslint integration with typescript that's why it will not be an hindrance to the API itself.
```bash
Error: Failed to load config "medikoo" to extend from.
Referenced from: /Users/melvic.bescaser/Projects/NodeJS Workspace/banking-api/node_modules/2-thenable/package.json
Error: Failed to load config "medikoo" to extend from.
Referenced from: /Users/melvic.bescaser/Projects/NodeJS Workspace/banking-api/node_modules/2-thenable/package.json
    at configInvalidError (/Users/melvic.bescaser/Projects/NodeJS Workspace/banking-api/node_modules/@eslint/eslintrc/lib/config-array-factory.js:290:9)
```
