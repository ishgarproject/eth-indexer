import { ethers } from 'ethers';
import type { BigNumber } from '@ethersproject/bignumber';
import type { AlchemyProvider } from '@ethersproject/providers';
import type { BlockWithTransactions } from '@ethersproject/abstract-provider';
import type { TxResponse, LogInfo } from '~/types';
import { isERC721EventName, ERC721EventNames } from '~/modules/contracts/helpers';
import ERC721Abi from '~/abis/ERC721.json';

export async function getBlockData(blockNumber: number, provider: AlchemyProvider) {
  const block = await provider.getBlockWithTransactions(blockNumber);
  const contracts = getContractDeploymentsInBlock(block);
  const blockLogs = await getBlockLogs(block, provider);
  return { contracts, blockLogs };
}

export async function getLogsFromTransaction(transactionHash: string, provider: AlchemyProvider) {
  const receipt = await provider.getTransactionReceipt(transactionHash);
  const iface = new ethers.utils.Interface(ERC721Abi);
  // try to parse using ERC721 abi
  const logs = receipt.logs.map((rawLog) => {
    try {
      const { name, args, ...rest } = iface.parseLog(rawLog);
      if (!isERC721EventName(name)) {
        return null;
      }
      const [from, to, tokenId] = args;
      return {
        ...rest,
        name: name as ERC721EventNames,
        args: {
          from: from as string,
          to: to as string,
          tokenId: tokenId as BigNumber,
        },
      } as LogInfo;
    } catch {
      return null;
    }
  });
  // remove 'null' elements
  return logs.filter((log) => log);
}

export function getContractDeploymentsInBlock(block: BlockWithTransactions) {
  return block.transactions.filter((tx: TxResponse) => Boolean(tx.creates));
}

export function getNonContractDeploymentsInBlock(block: BlockWithTransactions) {
  return block.transactions.filter((tx: TxResponse) => !Boolean(tx.creates));
}

// get logs of non-contract deployments transactions
export async function getBlockLogs(block: BlockWithTransactions, provider: AlchemyProvider) {
  const transactions = getNonContractDeploymentsInBlock(block);
  const logsPerTransaction = await Promise.all(transactions.map(({ hash }) => getLogsFromTransaction(hash, provider)));
  // remove empty elements
  return logsPerTransaction.filter((transactionLogs) => transactionLogs.length);
}
