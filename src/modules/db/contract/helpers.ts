import got from 'got';
import { BigNumber } from '@ethersproject/bignumber';
import type { PrismaClient } from '@prisma/client';
import type { ERC721EventLog, ERC721Metadata } from '~/types';
import { IPFS_BASE_URI } from '~/constants';

export async function retrieveERC721(address: string, prisma: PrismaClient) {
  return prisma.contract.findFirst({ where: { address } });
}

export async function getERC721TokenImageUri(tokenUri: string) {
  const [, suffix] = tokenUri.split('//');
  const url = IPFS_BASE_URI + suffix;
  const metadata: ERC721Metadata = await got.get(url).json();
  if (!metadata?.image) {
    return tokenUri;
  }
  const [, cid] = metadata?.image.split('//');
  return IPFS_BASE_URI + cid;
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
