import React from 'react';

import { NftDetailView } from '@/sections/nft-detail/view';

//------------------------------------------------------------------------------------------------

export default function NftDetail({ params }: { params: { id: string } }) {
  return <NftDetailView id={params.id} />;
}