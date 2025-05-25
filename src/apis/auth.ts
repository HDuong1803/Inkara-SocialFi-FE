import { AUTH_TOKEN } from '@/constant';
import { IApiResponse } from '@/interfaces/api-response';
import axiosInstance, { endpoints } from '@/utils/axios';

//-------------------------------------------------------------------------------------------

interface SignInParams {
  address: string;
  signature: string;
}

interface SignUpParams {
  address: string;
}

interface ITokens {
  accessToken: string;
}

export const login = async ({
  address,
  signature,
}: SignInParams): Promise<ITokens> => {
  const response = await axiosInstance.post(endpoints.auth.login, {
    address,
    signature,
  });
  return response.data;
};

export const register = async (
  params: SignUpParams
): Promise<IApiResponse<string>> => {
  const response = await axiosInstance.post(endpoints.auth.register, params);
  return response.data;
};

export const logout = async (): Promise<IApiResponse<string>> => {
  const response = await axiosInstance.post(endpoints.auth.logout);
  localStorage.removeItem(AUTH_TOKEN);
  return response.data;
};

export const refresh = async (): Promise<void> => {
  const response = await axiosInstance.post(endpoints.auth.refresh, {}, { withCredentials: true });
  const { accessToken } = response.data;
  localStorage.setItem(AUTH_TOKEN, accessToken);
}