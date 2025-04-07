import axiosInstance from '@/utils/axios';
import { endpoints } from '@/utils/axios';

import { IEvent, IEventCreation } from '@/interfaces/event';
import { IApiResponse } from '@/interfaces/api-response';
import { InputFilter } from './dto/filter.dto';
import { InputPagination } from './dto/pagination.dto';
import { OutputContract } from '@/interfaces/transaction';

//--------------------------------------------------------------------------------------------

export const getListEvent = async (
  { filterBy }: InputFilter,
  { startId, offset, limit }: InputPagination
): Promise<IApiResponse<IEvent[]>> => {
  const filter = {
    period: 'ALL',
    filterBy,
  };
  const pagination = {
    startId,
    offset,
    limit,
  };
  const response = await axiosInstance.get<IApiResponse<IEvent[]>>(
    endpoints.event.getMany,
    {
      params: {
        ...filter,
        ...pagination,
      },
    }
  );
  return response.data;
};

export const getEventDetail = async (
  id: string
): Promise<IApiResponse<IEvent>> => {
  const response = await axiosInstance.get<IApiResponse<IEvent>>(
    endpoints.event.getById(id)
  );
  return response.data;
};

export const createEvent = async (
  data: IEventCreation
): Promise<IApiResponse<OutputContract>> => {
  const response = await axiosInstance.post<IApiResponse<OutputContract>>(
    endpoints.event.requestEvent,
    data
  );
  return response.data;
}

export const voteForEvent = async (
  eventId: number
): Promise<IApiResponse<OutputContract>> => {
  const response = await axiosInstance.post<IApiResponse<OutputContract>>(
    endpoints.event.voteEvent,
    {
      eventId: eventId,
    }
  );
  return response.data;
}

export const hasVotedForEvent = async (
  eventId: string
): Promise<IApiResponse<boolean>> => {
  const response = await axiosInstance.get<IApiResponse<boolean>>(
    endpoints.event.hasVoted(eventId)
  );
  return response.data;
}