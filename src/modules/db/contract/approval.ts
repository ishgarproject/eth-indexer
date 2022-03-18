import type { PrismaClient } from '@prisma/client';
import type { ERC721EventLog } from '~/types';
import { getERC721ApprovalArgs } from './helpers';

export async function performERC721Approval(log: ERC721EventLog, prisma: PrismaClient) {
  const { contractAddress } = log;
  const { owner, spender, tokenId } = getERC721ApprovalArgs(log);
  const token = await prisma.token.findFirst({
    where: {
      owner,
      tokenId,
      collectionAddress: contractAddress,
    },
  });
  if (token === null) {
    console.log(`Discard Approval | Unregistered ERC721 ${contractAddress}`);
    return;
  }
  return prisma.token.update({
    where: { id: token.id },
    data: { approvedAddress: spender },
  });
}
