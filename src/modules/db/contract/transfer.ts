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

  await updateReceiverAccount(log, prisma);
  await updateSenderAccount(log, contractAddress, prisma);
}

/**
 * @param {ERC721EventLog} log
 * @param {string} contractAddress
 * @param {PrismaClient} prisma
 * Doesn't update anything if sender address is AddressZero
 * Otherwise remove the Token from sender Account
 */
async function updateSenderAccount(log: ERC721EventLog, contractAddress: string, prisma: PrismaClient) {
  const { from, tokenId } = getERC721TransferArgs(log);
  if (from === AddressZero) {
    return;
  }
  const token = await prisma.token.findFirst({
    where: {
      tokenId,
      owner: from,
      contractAddress,
    },
    select: { id: true },
  });
  await prisma.account.update({
    where: { address: from },
    data: {
      tokens: {
        delete: [{ id: token.id }],
      },
    },
  });
}

async function updateReceiverAccount(log: ERC721EventLog, prisma: PrismaClient) {
  const { contractAddress } = log;
  const { to, tokenId } = getERC721TransferArgs(log);
  const contract = await prisma.contract.findFirst({ where: { address: contractAddress } });
  return prisma.account.upsert({
    where: { address: to },
    create: {
      address: to,
      contractId: contract.id,
      tokens: {
        create: {
          owner: to,
          contractAddress,
          tokenId,
        },
      },
    },
    update: {
      tokens: {
        create: {
          owner: to,
          contractAddress,
          tokenId,
        },
      },
    },
  });
}
