'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/typography';
import { IListingItem } from '@/interfaces/market';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: IListingItem['nft'];
  auctionId: string;
  minimumBid: number;
  onBid: (auctionId: string, bidAmount: number) => void;
}

export default function BidModal({
  isOpen,
  onClose,
  nft,
  auctionId,
  minimumBid,
  onBid,
}: BidModalProps) {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }
    if (amount < minimumBid) {
      setError(`Bid must be at least ${minimumBid} ETH.`);
      return;
    }
    setError(null);
    onBid(auctionId, amount);
    setBidAmount('');
    onClose();
  };

  if (!isOpen) return null;
  if (!nft) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral2-3 p-6 rounded-[20px] shadow-wrapper max-w-md w-full">
        <Typography level="h4" className="text-gray-100 mb-4">
          Place Bid for {nft.name} #{nft.tokenId}
        </Typography>
        <div className="mb-4">
          <Typography level="baser" className="text-gray-400">
            Minimum Bid: {minimumBid} ETH
          </Typography>
        </div>
        <div className="mb-4">
          <input
            type="number"
            step="0.01"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount (ETH)"
            className="w-full px-4 py-2 bg-neutral2-5 text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cherry"
          />
          {error && (
            <Typography level="small" className="text-red-500 mt-1">
              {error}
            </Typography>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-300 rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full"
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
}
