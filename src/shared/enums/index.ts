export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  INVALID = 'invalid',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
