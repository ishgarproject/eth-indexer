import { AlchemyProvider } from '@ethersproject/providers';
import { createAlchemyWeb3, AlchemyWeb3 } from '@alch/alchemy-web3';
import { createWeb3Provider } from '~/modules/providers/web3-provider';
import { getUrl, reduceByContractAddress } from './helpers';
import { getAllERC721Names } from '~/modules/utils/web3';
import { ALCHEMY_API_KEY } from '~/constants';
import { AlchemyNetwork } from '~/types';

export class Alchemy {
  #_web3Provider: AlchemyProvider;
  #_alchemyWeb3: AlchemyWeb3;

  constructor(network: AlchemyNetwork) {
    const url = getUrl(network, ALCHEMY_API_KEY);
    this.#_web3Provider = createWeb3Provider(network);
    this.#_alchemyWeb3 = createAlchemyWeb3(url);
  }

  async getNftsByOwner(owner: string) {
    const { ownedNfts } = await this.#_alchemyWeb3.alchemy.getNfts({ owner, withMetadata: true });
    const nfts = reduceByContractAddress(ownedNfts);
    const addresses = Object.keys(nfts);
    const erc721Names = await getAllERC721Names(addresses, this.#_web3Provider);
    return Object.values(nfts).map((ownedERC721, index) => {
      ownedERC721.name = erc721Names[index];
      return ownedERC721;
    });
  }
}
