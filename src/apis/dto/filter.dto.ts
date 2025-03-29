export enum UserFilterByOption {
  FOLLOWING = 'FOLLOWING',
  EXPLORER = 'EXPLORER',
  LIST_FOLLOWERS = 'LIST_FOLLOWERS',
  LIST_FOLLOWINGS = 'LIST_FOLLOWINGS',
  ERC721_NFTS = 'ERC721_NFTS',
  ERC4671_NFTS = 'ERC4671_NFTS',
  CREATED = 'CREATED',
  ACTIVITY = 'ACTIVITY',
  LIKE_POST = 'LIKE_POST',
  LIKE_NFT = 'LIKE_NFT',
  HIDDEN = 'HIDDEN',
  LISTING = 'LISTING',
  BUY_OFFER = 'BUY_OFFER',
  SELL_OFFER = 'SELL_OFFER',
  ALL_EVENTS = 'ALL_EVENTS',
  MY_EVENTS = 'MY_EVENTS',
}

export interface InputFilter {
  period?: string;
  filterBy: UserFilterByOption;
}

export interface FilterType {
  startId: number;
  offset: number;
  limit: number;
}
