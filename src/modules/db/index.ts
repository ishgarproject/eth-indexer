import { PrismaClient } from '@prisma/client';
import type { AlchemyProvider } from '@ethersproject/providers';
import type { BigNumber } from '@ethersproject/bignumber';
import { isERC721, getERC721, getERC721NameAndSymbol } from '~/modules/contracts';
import { TxResponse } from '~/types';

export const prisma = new PrismaClient({ errorFormat: 'pretty', log: ['query'] });

export async function registerContracts(contracts: TxResponse[], provider: AlchemyProvider) {
  for (const contract of contracts) {
    const contractAddress = contract.creates;
    if (await isERC721(contractAddress, provider)) {
      const erc721 = getERC721(contractAddress, provider);
      const { name, symbol } = await getERC721NameAndSymbol(erc721);
      console.log(`registering new ERC721 ${contractAddress} with name: ${name} and symbol: ${symbol}`);
      /* await prisma.contract.create({
        data: {
          address: contractAddress,
          deployer: contract.from,
          name,
          symbol,
          contractType: ContractType.ERC721,
          blockNumber,
        },
      }); */
    }
  }
}

export async function approve(tokenId: BigNumber, owner: string, contractAddress: string) {
  const res = await prisma.token.findFirst({
    where: {
      tokenId: tokenId.toNumber(),
      owner,
      contractAddress,
    },
  });
  console.log('res', res);
}
