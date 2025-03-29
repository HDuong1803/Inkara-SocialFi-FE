'use client';

import React, { useEffect, useState } from 'react';
import { IEvent, EventStatus } from '@/interfaces/event';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Award,
  AlertTriangle,
  TrendingUp,
  Medal,
} from 'lucide-react';
import Link from 'next/link';
import { getListEvent } from '@/apis/event';
import { UserFilterByOption } from '@/apis/dto/filter.dto';
import { Avatar } from '@/components/avatar';
import { Card, CardContent } from '@/components/card/card';

export default function EventsDashboard() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getListEvent(
          { filterBy: UserFilterByOption.ALL_EVENTS },
          { startId: 0, offset: 1, limit: 10 }
        );
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Calculate dashboard statistics
  const totalDeposit = events.reduce((sum, event) => {
    return sum + parseFloat(event.depositAmount);
  }, 0);

  const totalParticipants = events.reduce((sum, event) => {
    return sum + event._count.participants;
  }, 0);

  const totalNFTs = events.reduce((sum, event) => {
    return sum + event.totalNFTsSubmitted;
  }, 0);

  const activeEvents = events.filter(
    (event) =>
      event.status === EventStatus.ONGOING ||
      event.status === EventStatus.UPCOMING
  ).length;

  // Status color mapping
  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.UPCOMING:
        return 'bg-blue-100 text-blue-800';
      case EventStatus.ONGOING:
        return 'bg-green-100 text-green-800';
      case EventStatus.ENDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (event: IEvent) => {
    const now = new Date();
    const endTime = new Date(event.endTime);
    const startTime = new Date(event.startTime);

    if (now < startTime) {
      return `Starts in ${Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`;
    }

    if (now > endTime) {
      return 'Event ended';
    }

    const daysLeft = Math.ceil(
      (endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Event Dashboard</h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deposit</p>
              <h3 className="text-2xl font-bold">${totalDeposit.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Users className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Participants</p>
              <h3 className="text-2xl font-bold">{totalParticipants}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Award className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total NFTs Submitted</p>
              <h3 className="text-2xl font-bold">{totalNFTs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <Calendar className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Events</p>
              <h3 className="text-2xl font-bold">{activeEvents}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <h2 className="text-xl font-semibold mb-4">Event Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link href={`/event/${event.eventId}`} key={event.eventId}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Avatar
                      className="h-10 w-10 mr-3"
                      src={event.user.photo?.url || '/placeholder-avatar.png'}
                      alt={event.user.username}
                    />
                    <div>
                      <h3 className="font-semibold text-lg truncate max-w-[200px]">
                        {event.user.username}&apos;s Event
                      </h3>
                      <p className="text-sm text-gray-500">
                        {event.user.fullname}
                      </p>
                    </div>
                  </div>
                  <Medal className={getStatusColor(event.status)}>
                    {event.status}
                  </Medal>
                </div>

                <div className="space-y-3 mt-4">
                  <p className="text-sm line-clamp-2">{event.description}</p>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(event.startTime)} -{' '}
                      {formatDate(event.endTime)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 italic">
                    {getTimeRemaining(event)}
                  </div>

                  <div className="flex justify-between mt-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-600" />
                      <span>
                        Entry: ${parseFloat(event.entryFee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-600" />
                      <span>
                        Deposit: ${parseFloat(event.depositAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-600" />
                      Participants
                    </span>
                    <span>
                      {event._count.participants}/{event.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((event._count.participants / event.maxParticipants) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                {event.aiRiskScore > 0 && (
                  <div className="flex items-center mt-3 text-sm">
                    <AlertTriangle
                      className={`h-4 w-4 mr-1 ${event.aiRiskScore > 70 ? 'text-red-600' : 'text-amber-500'}`}
                    />
                    <span
                      className={
                        event.aiRiskScore > 70
                          ? 'text-red-600'
                          : 'text-amber-500'
                      }
                    >
                      Risk score: {event.aiRiskScore}/100
                    </span>
                  </div>
                )}

                <div className="flex justify-between mt-4 text-sm">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-gray-600" />
                    <span>{event.totalNFTsSubmitted} NFTs</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-gray-600" />
                    <span>{event.votesForCreation} votes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
