export interface IAttribute {
    trait_type: string;
    value: string | number;
}

export interface IMintNft {
    tokenUri: string;
    feeNumerator: string
}

// interfaces/nft.ts
export interface INftItem {
    id: string;
    ownerAddress: string;
    minterAddress: string;
    collectionId?: string;
    contractAddress: string;
    tokenId: string;
    tokenUri: string;
    name: string;
    image: string;
    attributes: Record<string, unknown>;
    royalty: number;
    slug: string;
    transactionHash: string;
    nftType: string;
    nftStatus: string;
    createdAt: string;
    updatedAt: string;
    collection?: {
        id: string;
        name: string;
        // Add other collection fields as needed
    };
    listing?: Array<{
        id: string;
        price: number;
        createAt: string;
        endTime: string;
    }>;
    offers?: Array<{
        id: string;
        offerPrice: number;
    }>;
}

export interface IApiResponse<T> {
    data: T;
    meta?: {
        total: number;
        offset: number;
        limit: number;
    };
}

// interfaces/sort-filter.ts
export enum SortByOption {
    LISTING_DATE = 'LISTING_DATE',
    BEST_OFFER = 'BEST_OFFER',
    LAST_SALE_PRICE = 'LAST_SALE_PRICE',
    LAST_SALE_DATE = 'LAST_SALE_DATE',
    CREATED_DATE = 'CREATED_DATE',
    FAVORITE_COUNT = 'FAVORITE_COUNT',
    EXPIRATION_DATE = 'EXPIRATION_DATE',
    PRICE = 'PRICE',
}

export enum FilterByOption {
    ERC721_NFTS = 'ERC721_NFTS',
    CREATED = 'CREATED',
}

export interface SortParams {
    sortAscending?: 'asc' | 'desc';
    sortBy?: SortByOption;
}

export interface SearchParams {
    contains?: string;
}

export interface FilterParams {
    filterBy?: FilterByOption;
}

export interface PaginationParams {
    offset?: number;
    limit?: number;
    startId?: number;
}

export type ActionType = "LIST" | "UNLIST" | "AUCTION";
