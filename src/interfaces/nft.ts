export interface IAttribute {
    trait_type: string;
    value: string | number;
}

export interface INftItem {
    id: number;
    name?: string;
    description?: string;
    image: string;
    attributes?: IAttribute[];
    //Listing
    price?: number;
    author?: string;
}

export type ActionType = "LIST" | "UNLIST" | "AUCTION";
