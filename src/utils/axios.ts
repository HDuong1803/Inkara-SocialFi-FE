'use client';

import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from '../global-config';
import { AUTH_TOKEN } from '@/constant';
import { refresh } from '@/apis/auth';

//----------------------------------------------------------------------

const axiosInstance = axios.create({ 
  baseURL: HOST_API,
  withCredentials: true
 });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest._retry = true;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await refresh();
        const accessToken = localStorage.getItem(AUTH_TOKEN);
        processQueue(null, accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(
      (error.response && error.response.data) || 'Something went wrong'
    );
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  try {
    const res = await axiosInstance.get(url, { ...config });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    login: `/auth/signin`,
    register: `/auth/signup`,
    logout: `/auth/signout`,
    refresh: `/auth/refresh`
  },

  user: {
    me: `/user/me`,
    create: `/profile/`,
    update: `/user/update-profile`,
    profile: (id: string) => `user/${id}`,
    profileById: (id: string) => `/user/${id}`,
  },

  follow: {
    hasFollowed: (id: string) => `/follow/check/${id}`,
    followAction: (followingId: string) => `/follow/${followingId}`,
    listFollows: `/follow/list`,
    whoToFollow: `/follow/who-to-follow`,
    countFollows: (id: string) => `/follow/${id}/count`,
  },

  post: {
    getById: (id: string) => `/post/${id}`,
    getMany: `/post`,
    getManyByUser: (id: string) => `/post/user/${id}`,
    create: `/post`,
    update: (id: string) => `/post/${id}`,
    delete: (id: string) => `/post/${id}`,
    detail: `/post/:id`,
    countPosts: (id: string) => `/post/${id}/count`,
  },
  media: {
    upload: `/upload-file`,
  },

  notification: {
    get: `/notification`,
    read: (id: string) => `/notifications/${id}/read`,
    readAll: `/notifications/read-all`,
  },

  comment: {
    get: `/comment`,
    create: (id: string) => `/comment/${id}`,
    update: (id: string) => `/comment/comment/${id}`,
    delete: (id: string) => `/comment/comment/${id}`,
  },

  like: {
    likeAction: `/like`,
    hasLiked: (id: string) => `/like/check/${id}`,
  },

  message: {
    getMessageRoom: (id: string) => `/message/${id}`,
    createMessageRoom: (id: string) => `/message/${id}`,
    getMessage: `/message`,
  },

  conversation: {
    get: `/conversation`,
    create: `/conversation`,
    getById: (id: string) => `/conversation/${id}`,
    getMyConversation: `/conversation/my-conversation`,
  },

  room: {
    getInvitation: `/room/invitation`,
    getInvitations: `/room/invitations`,
    invite: (id: string) => `/room/invite/${id}`,
    getMany: `/room`,
    getById: (id: string) => `/room/${id}`,
    getMyRooms: `/room/my-rooms`,
    create: `/room`,
    addUser: (id: string) => `/room/add-user/${id}`,
    removeUser: (id: string) => `/room/remove-user/${id}`,
  },
  
  event: {
    getMany: `/event/list`,
    getById: (id: string) => `/event/${id}`,
    requestEvent: `/event/request-event-creation`,
    voteEvent: `/event/vote-for-event`,
    update: (id: string) => `/event/${id}`,
    delete: (id: string) => `/event/${id}`,
    hasVoted: (id: string) => `/event/check-voted-event/${id}`,
  }
};
