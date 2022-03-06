import { ethers } from 'ethers';
import { Networkish } from '@ethersproject/providers';
import { ALCHEMY_API_KEY } from '~/constants';

export function createWeb3Provider(network: Networkish) {
  return new ethers.providers.AlchemyProvider(network, ALCHEMY_API_KEY);
}
