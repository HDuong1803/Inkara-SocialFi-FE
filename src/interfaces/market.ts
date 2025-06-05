import { IAttribute } from "./nft";

export enum AuctionStatus {
    ONGOING = 'ONGOING',
    ENDED = 'ENDED',
}

export interface IListingItem {
    id: string;
    saleId?: string;
    auctionId?: string;
    offerId?: string | null;
    nftAddress: string;
    nftId: string;
    sellerId: string;
    price: string;
    startTime: string;
    endTime: string;
    expiresAt: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    network: string;
    seller?: {
        id: string;
        address: string;
        role: string;
        nonce: string;
        status: string;
        fullname: string | null;
        username: string | null;
        bio: string | null;
        avatarId?: string | null;
        googleId?: string | null;
        twitter?: string | null;
        discord?: string | null;
        facebook?: string | null;
        reddit?: string | null;
        email?: string | null;
        lastLoginAt?: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };
    nft: {
        id: string;
        ownerAddress: string | null;
        ownerId?: string;
        minterAddress: string | null;
        collectionId?: string | null;
        contractAddress: string | null;
        tokenId: number;
        tokenUri: string | null;
        name: string | null;
        image: string | null;
        attributes?: IAttribute[];
        royalty?: number;
        transactionHash?: string | null;
        nftType?: string;
        nftStatus?: string | null;
        network?: string | null;
        viewCount?: number | null;
        createdAt?: Date | null;
        updatedAt?: Date | null;
    };
}

export enum actionType {
    MINTED = "Minted NFT",
    LISTED_FOR_SALE = "Listed for Sale",
    LISTED_FOR_AUCTION = "Listed for Auction",
    SOLD = "Sold NFT",
    UNLISTED = "Unlisted NFT",
    TRANSFERRED = "Transferred NFT",
    CREATED_OFFER = "Created Offer",
    CANCELED_OFFER = "Canceled Offer",
    ACCEPTED_OFFER = "Accepted Offer",
    REJECTED_OFFER = "Rejected Offer",
    PLACE_BID = "Place Bid"
}