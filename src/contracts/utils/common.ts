export type AddressType  = {
    80002: string;
  }
  
  export enum CHAIN_ID {
    TESTNET = 80002,
  }
  
  export default function getChainIdFromEnv(): number {
    const env = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (!env) { return 80002;}
    return parseInt(env);
  }
  
  
  export const getRPC = () => {
    return process.env.NEXT_PUBLIC_RPC;
  }

  export const SMART_CONTRACT_ADDRESS = {
    Currency: {80002: '0x6644b705ec09984d7970abbb201f1370f28a8eb6'},
    NFT: {80002: '0x32e2c8069999819576385cd43be43f3b95631692'},
    Marketplace: {80002: '0x631ab9909c7a7b86253e8bae9e96d0376a6fa454'}, 
    Auction: {80002: '0x9973c3431a17aa2f2c60dafe6eda7dd67f469377'},
    NftContest: {80002: '0x760db223356f5ea6578654662a0cea1365d4adf7'}
  }