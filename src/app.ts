import { ethers } from 'ethers';
import { prisma } from '~/modules/db';
import { getERC721, isERC721 } from '~/modules/contracts';
import { ALCHEMY_API_KEY } from './constants';
import { TxResponse } from '~/types';

const provider = new ethers.providers.AlchemyProvider('goerli', ALCHEMY_API_KEY);

const getContractMetadata = async (address: string) => {
  const contract = getERC721(address, provider);
  const [name, symbol, isERC721, isERC1155] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.supportsInterface('0x80ac58cd'),
    contract.supportsInterface('0xd9b67a26'),
  ]);
  return { name, symbol, isERC721, isERC1155 };
};

async function main() {
  const blockNumber = 6439505;
  const { hash, number, timestamp, transactions } = await provider.getBlockWithTransactions(blockNumber);
  const contracts: TxResponse[] = transactions.filter((tx: TxResponse) => Boolean(tx.creates));

  console.log(`found ${contracts.length} contract deployments`);

  if (contracts.length === 0) {
    return;
  }

  for (const contract of contracts) {
    if (await isERC721(contract.creates, provider)) {
      console.log(`found an ERC721 ${contract.creates}`);
    }
  }
}

main();
