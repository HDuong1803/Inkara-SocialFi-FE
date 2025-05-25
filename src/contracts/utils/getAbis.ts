import Currency from "../abis/Currency.json";
import Nft from "../abis/NFT.json";
import Marketplace from "../abis/Marketplace.json";
import Auction from "../abis/Auction.json";
import NftContest from "../abis/NFTContest.json";

export const getCurrencyAbi = () => Currency.abi;
export const getNftAbi = () => Nft.abi;
export const getMarketplaceAbi = () => Marketplace.abi;
export const getAuctionAbi = () => Auction.abi;
export const getNftContestAbi = () => NftContest.abi;