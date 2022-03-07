import { AddressZero } from '@ethersproject/constants';
import type { PrismaClient } from '@prisma/client';
import type { ERC721EventLog } from '~/types';
import { retrieveERC721, getERC721TransferArgs } from './helpers';

export async function performERC721Transfer(log: ERC721EventLog, prisma: PrismaClient) {
  const { contractAddress } = log;
  const contract = await retrieveERC721(contractAddress, prisma);
  if (contract === null) {
    console.log(`Discard Transfer | Unregistered ERC721 ${contractAddress}`);
    return;
  }

  await updateToken(log, prisma);
}

async function updateToken(log: ERC721EventLog, prisma: PrismaClient) {
  const { contractAddress } = log;
  const { to, tokenId } = getERC721TransferArgs(log);

  const token = await prisma.token.findFirst({
    where: {
      tokenId,
      owner: to,
      contract: contractAddress,
    },
  });

  return await prisma.contract.update({
    where: { address: contractAddress },
    data: {
      tokens: {
        upsert: {
          where: { id: token?.id || 0 },
          create: {
            tokenId,
            owner: to,
            contract: contractAddress,
          },
          update: {
            owner: to,
          },
        },
      },
    },
  });
}
