import axiosInstance from '@/utils/axios';
import { endpoints } from '@/utils/axios';
import { IApiResponse } from '@/interfaces/api-response';
import { INftItem, PaginationParams } from '@/interfaces/nft';
import { IListingItem } from '@/interfaces/market';


//--------------------------------------------------------------------------------------------

// export const getPosts = async (
//   { filterBy }: InputFilter,
//   { startId, offset, limit }: InputPagination
// ): Promise<IApiResponse<INftItem[]>> => {
//   const filter = {
//     period: 'ALL',
//     filterBy,
//   };
//   const pagination = {
//     startId,
//     offset,
//     limit,
//   };
//   const response = await axiosInstance.get<IApiResponse<INftItem[]>>(
//     endpoints.nft.getMany,
//     {
//       params: {
//         ...filter,
//         ...pagination,
//       },
//     }
//   );
//   return response.data;
// };

export const getMyListings = async (
  { startId, offset, limit }: PaginationParams,
): Promise<IApiResponse<INftItem[]>> => {
  const pagination = {
    startId,
    offset,
    limit,
  };
  const response = await axiosInstance.get<IApiResponse<INftItem[]>>(
    endpoints.listing.getMyListings, {
    params: {
      ...pagination,
    },
  }
  );
  return response.data;
};

export const getAllListings = async (
): Promise<IApiResponse<IListingItem[]>> => {
  const response = await axiosInstance.get<IApiResponse<IListingItem[]>>(
    endpoints.listing.getAllListings
  );
  return response.data;
};
