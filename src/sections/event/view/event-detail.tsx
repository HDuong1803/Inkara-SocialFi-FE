'use client';

import { getEventDetail } from '@/apis/event';
import { IEvent } from '@/interfaces/event';
import Custom404 from '@/pages/404';
import React from 'react';

//-----------------------------------------------------------------------------------------------

export default function EventDetailView({ id }: { id: string }) {
  const [data, setData] = React.useState<IEvent | null>(null);
  
  React.useEffect(() => {
    getEventDetail(id)
      .then((response: { data: React.SetStateAction<IEvent | null>; }) => {
        setData(response.data);
        return response.data;
      })
  }, [id]);
  if (!data) {
    return Custom404();
  }

  return (
    <div>
      <h1>Event Detail</h1>
      <div>
        <h2>{data.description}</h2>
        <p>Creator: {data.creator}</p>
        <p>Entry Fee: {data.entryFee}</p>
        <p>Deposit Amount: {data.depositAmount}</p>
        <p>Total NFTs Submitted: {data.totalNFTsSubmitted}</p>
        <p>Max Participants: {data.maxParticipants}</p>
        <p>Status: {data.status}</p>
        <p>Start Time: {data.startTime}</p>
        <p>End Time: {data.endTime}</p>
      </div>
    </div>
  );
}
