'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Typography } from '@/components/typography';
import { IListingItem } from '@/interfaces/market';
import { getStatusStyle } from '@/utils/helper';

interface MarketNFTProps {
  item: IListingItem;
}

export default function MarketNFT({ item }: MarketNFTProps) {
  if (!item || !item.nft) return null;
  const isSale = !!item.saleId && item.status === 'ACTIVE';
  const isAuction = !!item.auctionId && item.status === 'ACTIVE';
  const isListed = isSale || isAuction;
  const isExpired = new Date(item.expiresAt) < new Date();
  const auctionStatus = isExpired ? 'ENDED' : 'ONGOING';

  return (
    <div className="group relative rounded-[20px] bg-neutral2-3 p-4 shadow-card hover:shadow-wrapper hover:bg-neutral2-5 transition-all duration-300 hover:-translate-y-1">
      <Link href={`/nfts/${item.nft.id}`} className="block">
        <div className="relative w-full h-48 overflow-hidden rounded-xl">
          <Image
            src={item.nft.image || '/svg/list-empty.svg'}
            fill
            alt={item.nft.name || 'NFT Image'}
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral2-10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
              isListed
                ? 'bg-gradient-to-r from-cherry to-black-600 text-white'
                : 'bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300'
            }`}
          >
            {isSale ? 'For Sale' : isAuction ? 'In Auction' : 'Not Listed'}
          </span>
          <span className="absolute top-3 left-3 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            #{item.nft.tokenId}
          </span>
        </div>
      </Link>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <Typography
            level="baser"
            className="font-semibold text-gray-100 truncate max-w-[60%]"
          >
            {item.nft.name}
          </Typography>
          <Typography
            level="h5"
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cherry text-white"
          >
            {item.price} INK
          </Typography>
        </div>
        <div className="flex justify-between items-center gap-1.5">
          {isAuction ? (
            <span
              className={`px-4 py-1 rounded-full text-sm ${getStatusStyle(auctionStatus || '')}`}
            >
              {auctionStatus}
            </span>
          ) : (
           <span
              className={`px-4 py-1 rounded-full text-sm ${getStatusStyle('ONGOING')}`}
            >
              {'ONGOING'}
            </span>
          )}
          <Link href={`/nfts/${item.nft.id}`}>
            <button className="px-4 py-2 font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300 bg-gradient-to-r from-cherry to-black-600 text-white hover:bg-gradient-to-l">
              View Listing
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
