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
} from 'lucide-react';
import Link from 'next/link';
import { getListEvent } from '@/apis/event';
import { UserFilterByOption } from '@/apis/dto/filter.dto';
import { Avatar } from '@/components/avatar';
import { Card, CardContent } from '@/components/card/card';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';

export default function EventsView() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'ALL'>('ALL');
  const [showMyEvents, setShowMyEvents] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getListEvent(
          { filterBy: showMyEvents ? UserFilterByOption.MY_EVENTS : UserFilterByOption.ALL_EVENTS },
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
  }, [showMyEvents]);

  const filteredEvents = events.filter(event => 
    selectedStatus === 'ALL' ? true : event.status === selectedStatus
  );

  const totalDeposit = filteredEvents.reduce((sum, event) => sum + parseFloat(event.depositAmount), 0);
  const totalParticipants = filteredEvents.reduce((sum, event) => sum + event._count.participants, 0);
  const totalNFTs = filteredEvents.reduce((sum, event) => sum + event.totalNFTsSubmitted, 0);
  const activeEvents = filteredEvents.filter(
    (event) => event.status === EventStatus.ONGOING
  ).length;

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.UPCOMING:
        return 'bg-neutral1-10 text-neutral1-95 border border-neutral1-30';
      case EventStatus.ONGOING:
        return 'bg-neutral1-10 text-neutral1-95 border border-green-500';
      case EventStatus.ENDED:
        return 'bg-neutral1-10 text-neutral1-95 border border-neutral1-30';
      default:
        return 'bg-neutral1-10 text-neutral1-95 border border-neutral1-30';
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

    const colorClass =
      daysLeft > 20
        ? 'text-green-600'
        : daysLeft > 10
        ? 'text-amber-500'
        : 'text-red-600';

    return (
      <span className={colorClass}>
        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
      </span>
    );
  };

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
        <div className="text-lg font-medium text-neutral2-95">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {['ALL', EventStatus.UPCOMING, EventStatus.ONGOING, EventStatus.ENDED].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as EventStatus | 'ALL')}
              className={`px-4 py-2 rounded-full text-caption transition-colors
                ${selectedStatus === status 
                  ? 'bg-surface-3 text-primary border border-neutral1-30' 
                  : 'bg-surface-2 text-secondary hover:bg-surface-3'}
              `}
            >
              {status === 'ALL' ? 'ALL EVENTS' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowMyEvents(!showMyEvents)}
          className={`px-4 py-2 rounded-full text-caption transition-colors
            ${showMyEvents 
              ? 'bg-surface-3 text-primary border border-neutral1-30' 
              : 'bg-surface-2 text-secondary hover:bg-surface-3'}
          `}
        >
          {showMyEvents ? 'Showing My Events' : 'Show All Events'}
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Card className="bg-surface-2 hover:bg-surface-3 transition-colors shadow-card">
          <CardContent className="flex items-center p-5">
            <div className="rounded-full bg-neutral2-15 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-wine" />
            </div>
            <div>
              <p className="text-base2 text-secondary">Total Deposit</p>
              <h3 className="text-h5 font-semibold text-primary">${totalDeposit.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-2 hover:bg-surface-3 transition-colors shadow-card">
          <CardContent className="flex items-center p-5">
            <div className="rounded-full bg-neutral2-15 p-3 mr-4">
              <Users className="h-6 w-6 text-wine" />
            </div>
            <div>
              <p className="text-base2 text-secondary">Total Participants</p>
              <h3 className="text-h5 font-semibold text-primary">{totalParticipants}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-2 hover:bg-surface-3 transition-colors shadow-card">
          <CardContent className="flex items-center p-5">
            <div className="rounded-full bg-neutral2-15 p-3 mr-4">
              <Award className="h-6 w-6 text-wine" />
              </div>
            <div>
              <p className="text-base2 text-secondary">Total NFTs Submitted</p>
              <h3 className="text-h5 font-semibold text-primary">{totalNFTs}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-2 hover:bg-surface-3 transition-colors shadow-card">
          <CardContent className="flex items-center p-5">
            <div className="rounded-full bg-neutral2-15 p-3 mr-4">
              <Calendar className="h-6 w-6 text-wine" />
              </div>
            <div>
              <p className="text-base2 text-secondary">Active Events</p>
              <h3 className="text-h5 font-semibold text-primary">{activeEvents} / {filteredEvents.length}</h3>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <h2 className="text-h4 font-semibold text-primary mb-6">Event Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((event) => (
          <Link href={`/event/${event.eventId}`} key={event.eventId}>
            <Card className="h-full bg-surface-1 hover:bg-surface-2 transition-colors shadow-card hover:shadow-wrapper rounded-[20px]">
              <CardContent className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Avatar
                      className="h-10 w-10 mr-3 border-2 border-neutral2-20"
                      src={event.user?.photo?.url || USER_AVATAR_PLACEHOLDER}
                      alt={event.user.username}
                    />
                    <div>
                      <h3 className="text-title font-medium text-primary truncate max-w-[160px]">
                        {event.user?.username}&apos;s Event
                      </h3>
                      <p className="text-caption text-tertiary">
                        {event.user?.fullname}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-caption rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-4">
                  <p className="text-base2 text-secondary line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-base2 text-secondary">
                      <Clock className="h-4 w-4 mr-2 text-tertiary" />
                      <span className="truncate">{formatDate(event.startTime)} - {formatDate(event.endTime)}</span>
                    </div>
                    
                    <div className="text-caption text-wine font-medium">
                      {getTimeRemaining(event)}
                    </div>

                    <div className="flex justify-between mt-2">
                    <div className="flex items-center text-base2 text-secondary">
                      <DollarSign className="h-4 w-4 mr-2 text-tertiary" />
                      <span>
                        Entry: ${parseFloat(event.entryFee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center text-base2 text-secondary">
                      <DollarSign className="h-4 w-4 mr-2 text-tertiary" />
                      <span>
                        Deposit: ${parseFloat(event.depositAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-caption text-secondary mb-1">
                      <span>
                        <Users className="h-4 w-4 mr-1 text-tertiary" />
                        Participants
                      </span>
                      <span>{event._count.participants}/{event.maxParticipants}</span>
                    </div>
                    <div className="w-full bg-neutral2-10 rounded-full h-2">
                      <div 
                        className="bg-wine h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((event._count.participants / event.maxParticipants) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {event.aiRiskScore > 0 && (
                  <div className="flex items-center mt-3 text-sm">
                  <AlertTriangle
                    className={`h-4 w-4 mr-1 ${
                    event.aiRiskScore < 20
                      ? 'text-green-600'
                      : event.aiRiskScore < 50
                      ? 'text-amber-500'
                      : 'text-red-600'
                    }`}
                  />
                  <span
                    className={
                    event.aiRiskScore < 20
                      ? 'text-green-600'
                      : event.aiRiskScore < 50
                      ? 'text-amber-500'
                      : 'text-red-600'
                    }
                  >
                    Risk score: {event.aiRiskScore}/100
                  </span>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-neutral2-10">
                  <div className="flex justify-between text-caption">
                    <div className="flex items-center text-secondary">
                      <Award className="h-4 w-4 mr-2 text-tertiary" />
                      {event._count.nftSubmissions} NFTs
                    </div>
                    <div className="flex items-center text-secondary">
                      <TrendingUp className="h-4 w-4 mr-2 text-tertiary" />
                      {event._count.votes} votes
                    </div>
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