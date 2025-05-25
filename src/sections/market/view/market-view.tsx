"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Typography } from '@/components/typography';
import { getAllListings } from '@/apis/listing';
import { IListingItem } from '@/interfaces/market';
import MarketNFT from '../components/market-nft';

export default function MarketView() {
  const [listing, setListing] = useState<IListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAllListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllListings();
      setListing(response.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllListings();
  }, [fetchAllListings]);

  return (
    <section className="relative w-full h-fit min-h-screen overflow-hidden px-3 py-6">
      <Typography level="h3" className="text-gray-100 mb-6">
        NFT Marketplace
      </Typography>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="rounded-[20px] bg-neutral2-3 p-4 animate-pulse shadow-card"
              >
                <div className="w-full h-48 bg-neutral2-10 rounded-xl" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 bg-neutral2-10 rounded" />
                  <div className="h-3 w-1/2 bg-neutral2-10 rounded" />
                  <div className="h-3 w-2/3 bg-neutral2-10 rounded" />
                </div>
              </div>
            ))}
        </div>
      ) : listing.length === 0 ? (
        <Typography level="baser" className="text-gray-400">
          No NFTs found in the marketplace.
        </Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listing.map((item) => (
            <MarketNFT
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}