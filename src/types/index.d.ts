import type { TransactionResponse } from '@ethersproject/abstract-provider';
import type { LogDescription } from '@ethersproject/abi';
import type { Prisma } from '@prisma/client';

export type AlchemyNetwork = 'mainnet' | 'goerli';

export type TxResponse = TransactionResponse & { creates?: string };
export type ERC721EventLog = LogDescription & { contractAddress: string };

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface ERC721Metadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Prisma.JsonArray;
}

export interface Nft {
  tokenId: number;
  tokenIdWithLeadingZeros: string;
  tokenUri?: string;
}

export interface ERC721 {
  address: string;
  name?: string;
  nfts: Nft[];
}

export interface OwnedERC721s {
  [key: string]: ERC721;
}
