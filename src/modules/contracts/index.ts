import { AlchemyProvider } from '@ethersproject/providers';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants';
import { getAddress } from '@ethersproject/address';
import { VAULT_ADDRESS } from '~/constants';
import VaultAbi from '~/abis/Vault.json';
import ERC721Abi from '~/abis/ERC721.json';
import { Vault, ERC721 } from '~/abis/types';

export function isAddress(address: string) {
  try {
    return getAddress(address);
  } catch (err) {
    return false;
  }
}

export function getContract<T extends Contract = Contract>(
  address: string,
  ABI: ContractInterface,
  provider: AlchemyProvider
): T {
  if (!isAddress(address) || address === AddressZero) {
    throw new Error(`Invalid 'address' parameter ${address}`);
  }
  return new Contract(address, ABI, provider) as T;
}

export function getVault(provider: AlchemyProvider) {
  return getContract<Vault>(VAULT_ADDRESS, VaultAbi, provider);
}

export function getERC721(address: string, provider: AlchemyProvider) {
  return getContract<ERC721>(address, ERC721Abi, provider);
}

export async function isERC721(address: string, provider: AlchemyProvider) {
  try {
    const contract = getERC721(address, provider);
    return await contract.supportsInterface('0x80ac58cd');
  } catch {
    return false;
  }
}

export async function getERC721NameAndSymbol(contract: ERC721) {
  const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
  return { name, symbol };
}

export async function getERC721TokenUri(contract: ERC721, tokenId: number) {
  return await contract.tokenURI(tokenId);
}
