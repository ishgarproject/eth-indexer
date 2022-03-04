import type { AlchemyProvider } from '@ethersproject/providers';
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
