import { AlchemyProvider } from '@ethersproject/providers';
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { getContract } from '~/modules/contracts';
import { ERC721 } from '~/abis/types';
import ERC721Abi from '~/abis/ERC721.json';

export function isAddress(address: string) {
  try {
    return getAddress(address).length !== 0;
  } catch {
    return false;
  }
}

async function getERC721Name(address: string, provider: AlchemyProvider) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  const contract = getContract<ERC721>(address, ERC721Abi, provider);
  return contract.name();
}

export async function getAllERC721Names(addresses: string[], provider: AlchemyProvider) {
  const promises: Promise<string>[] = [];
  addresses.forEach((address) => {
    promises.push(getERC721Name(address, provider));
  });
  return Promise.all(promises);
}
