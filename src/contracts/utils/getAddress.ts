import getChainIdFromEnv, { AddressType, SMART_CONTRACT_ADDRESS } from "./common";

const getAddress = (address: AddressType) => {
  const CHAIN_ID = getChainIdFromEnv() as keyof AddressType ;
  return address[CHAIN_ID]
};

export const getCurrencyAddress = () => getAddress(SMART_CONTRACT_ADDRESS.Currency);
export const getNftAddress = () => getAddress(SMART_CONTRACT_ADDRESS.NFT);
export const getMarketplaceAddress = () => getAddress(SMART_CONTRACT_ADDRESS.Marketplace);
export const getAuctionAddress = () => getAddress(SMART_CONTRACT_ADDRESS.Auction);
export const getNftContestAddress = () => getAddress(SMART_CONTRACT_ADDRESS.NftContest);