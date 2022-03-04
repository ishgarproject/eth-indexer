import type { LogDescription } from '@ethersproject/abi';
import type { BigNumber } from '@ethersproject/bignumber';
import type { TransactionResponse } from '@ethersproject/abstract-provider';
import type { ERC721EventNames } from '~/modules/contracts/helpers';

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export type TxResponse = TransactionResponse & { creates?: string };
export type ERC721EventTransferArgs = {
  from: string;
  to: string;
  tokenId: BigNumber;
};
export type LogInfo = Overwrite<LogDescription, { name: ERC721EventNames; args: ERC721EventTransferArgs }>;
