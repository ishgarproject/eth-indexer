import { ethers } from 'ethers';
import { getBlockData } from '~/modules/blocks';
import { approve } from '~/modules/db';
import { ALCHEMY_API_KEY } from './constants';

const provider = new ethers.providers.AlchemyProvider('goerli', ALCHEMY_API_KEY);

async function main() {
  const blockNumber = 6458052;
  const { contracts, blockLogs } = await getBlockData(blockNumber, provider);
  console.log(`found ${contracts.length} contract deployments in block ${blockNumber}`);

  if (contracts.length === 0) {
    // await registerContracts(contracts);
  }

  blockLogs.forEach((transactionLogs) => {
    transactionLogs.forEach((log) => {
      const { from, to, tokenId } = log.args;
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
