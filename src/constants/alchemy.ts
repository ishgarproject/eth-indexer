export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
export const ALCHEMY_API_VERSION = 'v2';

export const ALCHEMY_BASE_URIS = {
  mainnet: `https://eth-mainnet.alchemyapi.io/${ALCHEMY_API_VERSION}/`,
  goerli: `https://eth-goerli.alchemyapi.io/${ALCHEMY_API_VERSION}/`,
};
