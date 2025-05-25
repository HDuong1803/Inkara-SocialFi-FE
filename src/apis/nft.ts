import axiosInstance from '@/utils/axios';
import { endpoints } from '@/utils/axios';
import { IApiResponse } from '@/interfaces/api-response';
import { FilterByOption, FilterParams, IMintNft, INftItem, PaginationParams, SearchParams, SortParams } from '@/interfaces/nft';
import { OutputContract } from '@/interfaces/transaction';



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

export const getNftDetail = async (
  id: string
): Promise<IApiResponse<INftItem>> => {
  const response = await axiosInstance.get(endpoints.nft.getNftById(id));
  return response.data;
};

export const mintNft = async (
  data: IMintNft
): Promise<IApiResponse<OutputContract>> => {
  const response = await axiosInstance.post(
    endpoints.nft.mintNft,
    data
  );

  return response.data;
};

export const getNftByUser = async (
  creatorId: string,
  sortParams: SortParams = { sortBy: undefined, sortAscending: undefined },
  searchParams: SearchParams = { contains: undefined },
  filterParams: FilterParams = { filterBy: FilterByOption.ERC721_NFTS },
  paginationParams: PaginationParams = { offset: 1, limit: 10, startId: 0 }
): Promise<IApiResponse<INftItem[]>> => {
  const response = await axiosInstance.get<IApiResponse<INftItem[]>>(
    endpoints.nft.getNftByUser(creatorId), {
    params: {
      sortBy: sortParams.sortBy,
      sortAscending: sortParams.sortAscending,
      contains: searchParams.contains,
      filterBy: filterParams.filterBy,
      offset: paginationParams.offset,
      limit: paginationParams.limit,
      startId: paginationParams.startId
    }
  }
  );
  return response.data;
};

export const getMyNfts = async (
  sortParams: SortParams = { sortBy: undefined, sortAscending: undefined },
  searchParams: SearchParams = { contains: undefined },
  filterParams: FilterParams = { filterBy: FilterByOption.ERC721_NFTS },
  paginationParams: PaginationParams = { offset: 1, limit: 10, startId: 0 }
): Promise<IApiResponse<INftItem[]>> => {
  const response = await axiosInstance.post<IApiResponse<INftItem[]>>(
    endpoints.nft.getMyNfts, {
    sort: sortParams,
    search: searchParams,
    filter: filterParams,
    pagination: paginationParams
  }
  );
  return response.data;
};