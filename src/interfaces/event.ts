export enum EventStatus {
    UPCOMING = 'UPCOMING',
    ONGOING = 'ONGOING',
    ENDED = 'ENDED',
}

export interface IEvent {
    eventId: string
    creator: string
    entryFee: string
    depositAmount: string
    maxParticipants: number
    description: string
    aiReview: string
    aiRiskScore: number
    status: EventStatus
    startTime: string
    endTime: string
    createdAt: string
    updatedAt: string
    winnerNftId: string | null
    user: {
        username: string
        fullname: string
        address: string
        photo: {
            url: string | null
        }
    }
    _count: {
        participants: number
        votes: number
        nftSubmissions: number
    }
}

export interface IEventCreation {
    duration: string
    entryFee: string
    depositAmount: string
    maxParticipants: string
    description: string
}