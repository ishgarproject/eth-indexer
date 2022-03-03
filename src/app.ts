import { ethers } from 'ethers';
import { ContractType } from '@prisma/client';
import { prisma } from '~/modules/db';
import {
  isERC721,
  getERC721,
  getERC721NameAndSymbol,
  getContractDeploymentsInBlock,
  getBlockLogs,
} from '~/modules/contracts';
import { ALCHEMY_API_KEY } from './constants';
import { TxResponse } from './types';

const provider = new ethers.providers.AlchemyProvider('goerli', ALCHEMY_API_KEY);

async function registerContracts(contracts: TxResponse[]) {
  for (const contract of contracts) {
    const contractAddress = contract.creates;
    if (await isERC721(contractAddress, provider)) {
      const erc721 = getERC721(contractAddress, provider);
      const { name, symbol } = await getERC721NameAndSymbol(erc721);
      console.log(`registering new ERC721 ${contractAddress} with name: ${name} and symbol: ${symbol}`);
      /* await prisma.contract.create({
        data: {
          address: contractAddress,
          deployer: contract.from,
          name,
          symbol,
          contractType: ContractType.ERC721,
          blockNumber,
        },
      }); */
    }
  }
}

async function main() {
  // const blockNumber = 6439505;
  const blockNumber = 6458052;
  const block = await provider.getBlockWithTransactions(blockNumber);
  const contracts = getContractDeploymentsInBlock(block);
  console.log(`found ${contracts.length} contract deployments in block ${block.number}`);

  if (contracts.length === 0) {
    // await registerContracts(contracts);
  }

  const blockLogs = await getBlockLogs(block, provider);

  blockLogs.forEach((transactionLogs) => {
    transactionLogs.forEach((log) => {
      switch (log.name) {
        case 'Transfer':
          console.log(log);
          break;
        case 'Approval':
          console.log(log);
          break;
        case 'ApprovalForAll':
          console.log(log);
          break;
        default:
          console.log(`Event ${log.name} not supported`);
          break;
      }
    });
  });

  // console.log(blockLogs);
}

main().catch(console.error);
