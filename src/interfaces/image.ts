export interface IImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export enum ProviderUploadType {
  AWS= 'AWS',
  CLOUDINARY= 'CLOUDINARY',
  INFURA= 'INFURA',
  PINATA= 'PINATA',
  WEB3_STORAGE= 'WEB3_STORAGE',
  NFT_STORAGE= 'NFT_STORAGE',
  ARWEAVE_STORAGE= 'ARWEAVE_STORAGE'
};
