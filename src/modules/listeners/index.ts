import { createWeb3Provider } from '~/modules/providers/web3-provider';
import { blockListener } from './blocks-listeners';
import { vaultListener } from './vault-listener';
import { prisma } from '~/modules/db/client';

export function listeners() {
  const provider = createWeb3Provider('goerli');
  blockListener(provider, prisma);
  vaultListener(provider, prisma);
}
