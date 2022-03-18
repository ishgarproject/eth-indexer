import type { AlchemyProvider } from '@ethersproject/providers';
import type { PrismaClient } from '@prisma/client';
import type { BigNumber } from '@ethersproject/bignumber';
import { getVault } from '~/modules/contracts';

export async function vaultListener(provider: AlchemyProvider, prisma: PrismaClient) {
  const vault = getVault(provider);
  vault.on('DepositNFT', async (depositorAddress: string, erc721Address: string, tokenId: BigNumber) => {
    const token = await prisma.token.findFirst({
      where: {
        owner: depositorAddress,
        collectionAddress: erc721Address,
        tokenId: tokenId.toString(),
      },
    });

    if (!token) return;

    return await prisma.token.update({
      where: { id: token.id },
      data: {
        depositorAddress,
        depositedInVault: true,
      },
    });
  });
}
