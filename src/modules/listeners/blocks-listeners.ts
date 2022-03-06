import { ethers } from 'ethers';
import type { AlchemyProvider } from '@ethersproject/providers';
import type { BlockWithTransactions } from '@ethersproject/abstract-provider';
import type { PrismaClient } from '@prisma/client';
import type { TxResponse, ERC721EventLog } from '~/types';
import ERC721Abi from '~/abis/ERC721.json';
import { registerERC721s, performERC721Logs } from '~/modules/db/contract';

export async function blockListener(provider: AlchemyProvider, prisma: PrismaClient) {
  provider.on('block', async (blockNumber: number) => {
    console.log(`Scanning block ${blockNumber}`);
    const { contracts, erc721Logs } = await getBlockData(blockNumber, provider);
    await registerERC721s(contracts, provider, prisma);
    await performERC721Logs(erc721Logs, prisma);
    console.log('------------------------');
  });
}

async function getBlockData(blockNumber: number, provider: AlchemyProvider) {
  const block = await provider.getBlockWithTransactions(blockNumber);
  const contracts = getContractDeploymentsInBlock(block);
  const erc721Logs = await getERC721LogsInBlock(block, provider);
  return { contracts, erc721Logs };
}

async function getERC721LogsInBlock(block: BlockWithTransactions, provider: AlchemyProvider) {
  const transactions = getNonContractDeploymentsInBlock(block);
  const logsPerTransaction = await Promise.all(
    transactions.map(({ hash, to }) => getERC721TransactionLogs(hash, to, provider))
  );
  // remove empty arrays
  return logsPerTransaction.filter((transactionLogs) => transactionLogs.length).flat();
}

async function getERC721TransactionLogs(
  transactionHash: string,
  contractAddress: string,
  provider: AlchemyProvider
): Promise<ERC721EventLog[]> {
  const receipt = await provider.getTransactionReceipt(transactionHash);
  if (!receipt || !receipt.logs) {
    return [];
  }
  const iface = new ethers.utils.Interface(ERC721Abi);
  const logs = receipt.logs.map((rawLog) => {
    try {
      const log = iface.parseLog(rawLog);
      return {
        ...log,
        contractAddress,
      };
    } catch (e) {
      return null;
    }
  });
  // remove null elements
  return logs.filter((log) => log);
}

function getContractDeploymentsInBlock(block: BlockWithTransactions): TxResponse[] {
  return block.transactions.filter((tx: TxResponse) => Boolean(tx.creates));
}

function getNonContractDeploymentsInBlock(block: BlockWithTransactions) {
  return block.transactions.filter((tx: TxResponse) => !Boolean(tx.creates));
}
