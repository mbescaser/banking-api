export interface ITransferRequestPayload {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: string;
}

export interface ITransferInsertResult {
  id: number | string;
}
