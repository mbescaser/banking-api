export default interface IAccount {
  id: number | string;
  createdAt?: string | Date;
  accountNumber: string;
  balance: string;
  name: string;
}

export interface IAccountRequestPayload {
  balance: string;
}

export interface IAccountInsertResult {
  id: number | string;
}

export interface IAccountUpdateResult {
  id: number | string;
}
