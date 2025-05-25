import axiosInstance from '@/utils/axios';
import { endpoints } from '@/utils/axios';

import { Media } from '@/interfaces/media';
import { IApiResponse } from '@/interfaces/api-response';
import { ProviderUploadType } from '@/interfaces/image';

//--------------------------------------------------------------------------------------------

export const uploadFile = async (file: File): Promise<IApiResponse<Media>> => {
  const form = new FormData();
  form.append('file', file);
  form.append('provider', ProviderUploadType.ARWEAVE_STORAGE); 

  const response = await axiosInstance.post(endpoints.media.upload, form);

  return response.data;
};
