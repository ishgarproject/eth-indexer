import { TransactionResponse } from '@ethersproject/abstract-provider';

export type TxResponse = TransactionResponse & { creates?: string };
