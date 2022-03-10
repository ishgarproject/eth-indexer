import got from 'got';
import { BigNumber } from '@ethersproject/bignumber';
import type { PrismaClient } from '@prisma/client';
import type { ERC721EventLog, ERC721Metadata } from '~/types';
import { IPFS_BASE_URI } from '~/constants';

export async function retrieveERC721(address: string, prisma: PrismaClient) {
  return prisma.contract.findFirst({ where: { address } });
}

/**
 * Dumb way to check if a given tokenUri points to ipfs or not
 * For simplicity, I assume ipfs uris are prefixed with 'ipfs'
 */
function isIpfsUri(str: string) {
  const target = 'ipfs';
  return str.startsWith(target);
}

async function getERC721TokenMetadata(tokenUri: string): Promise<ERC721Metadata> {
  return await got.get(tokenUri).json();
}

function getERC721TokenMetadataUriFetchable(tokenUri: string) {
  if (!isIpfsUri(tokenUri)) {
    return tokenUri;
  }
  const [, suffix] = tokenUri.split('//');
  return IPFS_BASE_URI + suffix;
}

/**
 * @param {string} tokenUri
 * Ugly
 */
export async function getERC721TokenImageUri(tokenUri: string) {
  try {
    const uri = getERC721TokenMetadataUriFetchable(tokenUri);
    const metadata = await getERC721TokenMetadata(uri);
    if (!metadata?.image) {
      return tokenUri;
    }
    if (isIpfsUri(tokenUri)) {
      const [, cid] = metadata?.image.split('//');
      return IPFS_BASE_URI + cid;
    }
    return metadata.image;
  } catch {
    return tokenUri;
  }
}

export function getERC721TransferArgs(log: ERC721EventLog) {
  const [from, to, tokenId] = log.args;
  return {
    from: from as string,
    to: to as string,
    tokenId: BigNumber.from(tokenId as BigNumber).toString(),
  };
}

export function getERC721ApprovalArgs(log: ERC721EventLog) {
  const [owner, spender, tokenId] = log.args;
  return {
    owner: owner as string,
    spender: spender as string,
    tokenId: BigNumber.from(tokenId as BigNumber).toString(),
  };
}
