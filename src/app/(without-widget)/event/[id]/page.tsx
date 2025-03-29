import React from 'react';

import { EventDetailView } from '@/sections/event/view/';

//------------------------------------------------------------------------------------------------

export default function EventDetail({ params }: { params: { id: number } }) {
  return <EventDetailView id={params.id} />;
}
