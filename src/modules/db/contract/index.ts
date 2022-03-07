import { ContractType } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { AlchemyProvider } from '@ethersproject/providers';
import type { TxResponse, ERC721EventLog } from '~/types';
import { getERC721, getERC721NameAndSymbol, isERC721 } from '~/modules/contracts';
import { performERC721Transfer } from './transfer';
import { performERC721Approval } from './approval';

export async function registerERC721s(contracts: TxResponse[], provider: AlchemyProvider, prisma: PrismaClient) {
  console.log(`Checking ${contracts.length} contract deployments...`);
  return Promise.all(
    contracts.map(async (contract) => {
      const address = contract.creates;
      console.log(`Contract ${address}`);
      if (await isERC721(address, provider)) {
        const erc721 = getERC721(address, provider);
        const { name, symbol } = await getERC721NameAndSymbol(erc721);
        console.log(`registering new ERC721 ${address} with name: ${name} and symbol ${symbol}`);

        return await prisma.contract.create({
          data: {
            address,
            name,
            symbol,
            contractType: ContractType.ERC721,
          },
        });
      }
    })
  );
}

export async function performERC721Logs(logs: ERC721EventLog[], prisma: PrismaClient) {
  console.log(`Performing ${logs.length} ERC721 logs`);
  return Promise.all(logs.map((log) => performERC721Log(log, prisma)));
}

async function performERC721Log(log: ERC721EventLog, prisma: PrismaClient) {
  switch (log.name) {
    case 'Transfer':
      console.log('Transfer detected');
      await performERC721Transfer(log, prisma);
      break;
    case 'Approval':
      console.log('Approval detected');
      await performERC721Approval(log, prisma);
      break;
    case 'ApprovalForAll':
      console.log('ApprovalForAll detected');
      console.log('TODO: PerformApprovalForAll');
      break;
    default:
      console.error('RegisterERC721Log: Non-supported event');
      break;
  }
}
