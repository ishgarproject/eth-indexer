import { ethers } from 'ethers';
import type { AlchemyProvider } from '@ethersproject/providers';
import type { BlockWithTransactions } from '@ethersproject/abstract-provider';
import type { TxResponse } from '~/types';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants';
import { getAddress } from '@ethersproject/address';
import { ERC721 } from '~/abis/types/ERC721';
import ERC721Abi from '~/abis/ERC721.json';

function isAddress(address: string) {
  try {
    return getAddress(address);
  } catch (err) {
    return false;
  }
}

function getContract<T extends Contract = Contract>(
  address: string,
  ABI: ContractInterface,
  provider: AlchemyProvider
): T {
  if (!isAddress(address) || address === AddressZero) {
    throw new Error(`Invalid 'address' parameter ${address}`);
  }
  return new Contract(address, ABI, provider) as T;
}

export function getERC721(address: string, provider: AlchemyProvider) {
  return getContract<ERC721>(address, ERC721Abi, provider);
}

export async function getERC721NameAndSymbol(contract: ERC721) {
  const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
  return { name, symbol };
}

export async function isERC721(address: string, provider: AlchemyProvider) {
  const contract = getERC721(address, provider);
  return contract.supportsInterface('0x80ac58cd');
}

export async function isERC1155(address: string, provider: AlchemyProvider) {
  const contract = getERC721(address, provider);
  return contract.supportsInterface('0xd9b67a26');
}

export async function getLogsFromTransaction(transactionHash: string, provider: AlchemyProvider) {
  const iface = new ethers.utils.Interface(ERC721Abi);
  const receipt = await provider.getTransactionReceipt(transactionHash);
  // try to parse using ERC721 abi
  const logs = receipt.logs.map((log) => {
    try {
      return iface.parseLog(log);
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

// get logs of non-contract deployments transactions
export async function getBlockLogs(block: BlockWithTransactions, provider: AlchemyProvider) {
  // non-contract deployments
  const transactions: TxResponse[] = block.transactions.filter((tx: TxResponse) => !Boolean(tx.creates));
  const logsPerTransaction = await Promise.all(transactions.map(({ hash }) => getLogsFromTransaction(hash, provider)));
  // remove empty elements
  return logsPerTransaction.filter((transactionLogs) => transactionLogs.length);
}
