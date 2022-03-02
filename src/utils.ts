import { ethers } from 'ethers';
import { Formatter } from '@ethersproject/providers';
import { TxResponse } from '~/types';

const formatter = new Formatter();

export const getTransaction = async (
  provider: ethers.providers.JsonRpcProvider,
  transactionHash: string
): Promise<TxResponse> => {
  return formatter.transactionResponse(await provider.perform('getTransaction', { transactionHash }));
};
