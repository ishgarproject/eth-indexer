import { BigNumber } from '@ethersproject/bignumber';
import type { PrismaClient } from '@prisma/client';
import type { ERC721EventLog } from '~/types';

export async function retrieveERC721(address: string, prisma: PrismaClient) {
  return prisma.contract.findFirst({ where: { address } });
}

export function getERC721TransferArgs(log: ERC721EventLog) {
  const [from, to, tokenId] = log.args;
  return {
    from: from as string,
    to: to as string,
    tokenId: BigNumber.from(tokenId as BigNumber).toNumber(),
  };
}

export function getERC721ApprovalArgs(log: ERC721EventLog) {
  const [owner, spender, tokenId] = log.args;
  return {
    owner: owner as string,
    spender: spender as string,
    tokenId: BigNumber.from(tokenId as BigNumber).toNumber(),
  };
}
