import type { PrismaClient } from '@prisma/client';
import type { AlchemyProvider } from '@ethersproject/providers';
import type { ERC721EventLog } from '~/types';
import { retrieveERC721, getERC721TransferArgs, getERC721TokenMetadata } from './helpers';
import { getERC721, getERC721TokenUri } from '~/modules/contracts';

export async function performERC721Transfer(log: ERC721EventLog, provider: AlchemyProvider, prisma: PrismaClient) {
  const { contractAddress } = log;
  const contract = await retrieveERC721(contractAddress, prisma);
  if (contract === null) {
    console.log(`Discard Transfer | Unregistered ERC721 ${contractAddress}`);
    return;
  }

  await updateToken(log, provider, prisma);
}

async function updateToken(log: ERC721EventLog, provider: AlchemyProvider, prisma: PrismaClient) {
  const { contractAddress } = log;
  const { from, to, tokenId } = getERC721TransferArgs(log);

  const token = await prisma.token.findFirst({
    where: {
      tokenId,
      owner: from,
      collectionAddress: contractAddress,
    },
  });

  const erc721 = getERC721(contractAddress, provider);
  const tokenUri = await getERC721TokenUri(erc721, tokenId);
  const metadata = await getERC721TokenMetadata(tokenUri);

  return await prisma.contract.update({
    where: { address: contractAddress },
    data: {
      tokens: {
        upsert: {
          where: { id: token?.id || 0 },
          create: {
            tokenId,
            tokenUri,
            owner: to,
            name: metadata?.name,
            description: metadata?.description,
            imageUri: metadata?.image,
            attributes: metadata?.attributes,
            collectionAddress: contractAddress,
          },
          update: {
            owner: to,
          },
        },
      },
    },
  });
}
