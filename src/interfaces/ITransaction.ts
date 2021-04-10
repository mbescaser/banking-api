export default interface ITransaction {
  id: number | string;
  createdAt: string | Date;
  description: string;
  type: string;
  amount: string;
}

export interface ITransactionInsertResult {
  id: number | string;
}
