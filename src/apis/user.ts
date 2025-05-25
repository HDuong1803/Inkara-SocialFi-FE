/* eslint-disable @typescript-eslint/no-explicit-any */
import { IApiResponse } from '@/interfaces/api-response';
import { IUserProfile } from '@/interfaces/user';
import {
  default as axiosInstance,
  endpoints,
} from '@/utils/axios';

// ----------------------------------------------------------------------

export const getManyUser = async(): Promise<IApiResponse<IUserProfile[]>> => {
  const response = await axiosInstance.get(endpoints.user.list);
  return response.data;
};

export const getUserProfile = async (): Promise<IApiResponse<IUserProfile>> => {
  const response = await axiosInstance.get(endpoints.user.me);
  return response.data;
};

export const updateUserProfile = async (
  profileData: Partial<IUserProfile>
): Promise<IApiResponse<IUserProfile>> => {
  const { data } = await axiosInstance.put(
    endpoints.user.update,
    profileData
  );
  return data;
};

export const updateUserAvatar = async (
  avatarData: { avatarId: string }
): Promise<IApiResponse<IUserProfile>> => {
  const { data } = await axiosInstance.patch(
    endpoints.user.updateAvatar,
    avatarData
  );
  return data;
};

export const getUserProfileById = async (
  userId: string
): Promise<IApiResponse<IUserProfile>> => {
  const { data } = await axiosInstance.get(endpoints.user.profileById(userId));

  return data;
};
