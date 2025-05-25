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
    login: `/api/auth/signin`,
    register: `/api/auth/signup`,
    logout: `/api/auth/signout`,
    refresh: `/api/auth/refresh`
  },

  user: {
    me: `/api/user/me`,
    list: `/api/user/list`,
    create: `/api/profile/`,
    update: `/api/user/update-profile`,
    profile: (id: string) => `user/${id}`,
    profileById: (id: string) => `/api/user/${id}`,
    updateAvatar: `/api/user/update-avatar`,
  },

  follow: {
    hasFollowed: (id: string) => `/api/follow/check/${id}`,
    followAction: (followingId: string) => `/api/follow/${followingId}`,
    listFollows: `/api/follow/list`,
    whoToFollow: `/api/follow/who-to-follow`,
    countFollows: (id: string) => `/api/follow/${id}/count`,
  },

  post: {
    getById: (id: string) => `/api/post/${id}`,
    getMany: `/api/post`,
    getManyByUser: (id: string) => `/api/post/user/${id}`,
    create: `/api/post`,
    update: (id: string) => `/api/post/${id}`,
    delete: (id: string) => `/api/post/${id}`,
    detail: `/api/post/:id`,
    countPosts: (id: string) => `/api/post/${id}/count`,
  },
  media: {
    upload: `/api/file`,
  },

  notification: {
    get: `/api/notification`,
    read: (id: string) => `/api/notifications/${id}/read`,
    readAll: `/api/notifications/read-all`,
  },

  comment: {
    get: `/api/comment`,
    create: (id: string) => `/api/comment/${id}`,
    update: (id: string) => `/api/comment/comment/${id}`,
    delete: (id: string) => `/api/comment/comment/${id}`,
  },

  like: {
    likeAction: `/api/like`,
    hasLiked: (id: string) => `/api/like/check/${id}`,
  },

  message: {
    getMessageRoom: (id: string) => `/api/message/${id}`,
    createMessageRoom: (id: string) => `/api/message/${id}`,
    getMessageConversation: (conversationId: string) => `/api/message/conversation/${conversationId}`,
  },

  conversation: {
    get: `/api/conversation`,
    create: `/api/conversation`,
    getById: (id: string) => `/api/conversation/${id}`,
    getMyConversation: `/api/conversation/my-conversation`,
  },

  room: {
    getInvitation: `/api/room/invitation`,
    getInvitations: `/api/room/invitations`,
    invite: (id: string) => `/api/room/invite/${id}`,
    getMany: `/api/room`,
    getById: (id: string) => `/api/room/${id}`,
    getMyRooms: `/api/room/my-rooms`,
    create: `/api/room`,
    addUser: (id: string) => `/api/room/add-user/${id}`,
    removeUser: (id: string) => `/api/room/remove-user/${id}`,
  },
  
  event: {
    getMany: `/api/event/list`,
    getById: (id: string) => `/api/event/${id}`,
    requestEvent: `/api/event/request-event-creation`,
    voteEvent: `/api/event/vote-for-event`,
    update: (id: string) => `/api/event/${id}`,
    delete: (id: string) => `/api/event/${id}`,
    hasVoted: (id: string) => `/api/event/check-voted-event/${id}`,
  },

  nft: {
    getMyNfts: `/api/nft/me`,
    getNftByUser: (id: string) => `/api/nft/user/${id}`,
    getNftById: (id: string) => `/api/nft/${id}`,
    mintNft: `/api/nft/mint`
  },

  listing: {
    getAllListings: `/api/listing/list`,
    getMyListings: `/api/listing/user`,
    getListingById: (id: string) => `/api/listing/${id}`,
  }
};