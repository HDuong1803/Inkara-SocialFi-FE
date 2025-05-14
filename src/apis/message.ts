import axiosInstance from '@/utils/axios';
import { endpoints } from '@/utils/axios';

import { IApiResponse } from '@/interfaces/api-response';
import { IMessage } from '@/interfaces/message';

//--------------------------------------------------------------------------------------------

export const findMessageForRoom = async (
    id: string
): Promise<IApiResponse<IMessage[]>> => {
    const response = await axiosInstance.get<IApiResponse<IMessage[]>>(
        endpoints.message.getMessageRoom(id)
    );
    return response.data;
};

export const createMessage = async (
    roomId: string,
    content: string,
    type: 'room' | 'conversation'
): Promise<IApiResponse<IMessage>> => {
    const response = await axiosInstance.post(
        endpoints.message.createMessageRoom(roomId),
        {
            content,
            type
        }
    );
    return response.data;
};

export const getMessageConversation = async (conversationId: string, page: number, limit: number = 20): Promise<IApiResponse<IMessage[]>> => {
    const response = await axiosInstance.get(
        endpoints.message.getMessageConversation(conversationId),
        {
            params: {
                page,
                limit
            }
        }
    );

    return response.data;
};