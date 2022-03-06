import { createWeb3Provider } from '~/modules/providers/web3-provider';
import { blockListener } from './blocks-listeners';
import { prisma } from '~/modules/db/client';

export async function listeners() {
  const provider = createWeb3Provider('goerli');
  await blockListener(provider, prisma);
}
