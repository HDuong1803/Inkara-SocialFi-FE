"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Typography } from '@/components/typography';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { INftItem } from '@/interfaces/nft';
import { IListingItem } from '@/interfaces/market';

interface ListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'LISTING' | 'AUCTION' | 'OFFER' | 'BID';
  nft?: INftItem | IListingItem['nft'];
  isListing?: boolean;
  onList?: (amount: number, expireDate?: Date | null) => Promise<void>;
  minimumBid?: number | null;
}

export default function ListModal({
  isOpen,
  onClose,
  type,
  nft,
  isListing,
  onList,
  minimumBid
}: ListModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !nft) return null;

  const getTitle = () => {
    switch (type) {
      case 'LISTING':
        return 'List for Sale';
      case 'AUCTION':
        return 'List for Auction';
      case 'OFFER':
        return 'Make Offer';
      case 'BID':
        return 'Place Bid';
    }
  };

  const getPriceLabel = () => {
    switch (type) {
      case 'LISTING':
        return 'Price Listing';
      case 'AUCTION':
        return 'Reserve Price';
      case 'OFFER':
        return 'Offer Amount';
      case 'BID':
        return 'Bid Amount';
    }
  };

  const getButtonLabel = () => {
    if (isProcessing || isListing) return 'Processing...';
    switch (type) {
      case 'LISTING':
        return 'List Now';
      case 'AUCTION':
        return 'Auction Now';
      case 'OFFER':
        return 'Make Offer';
      case 'BID':
        return 'Place Bid';
    }
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (type === 'BID' && minimumBid && parsedAmount < minimumBid) {
      setError(`Bid amount must be at least ${minimumBid} INK.`);
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      await onList?.(parsedAmount, type === 'AUCTION' ? startDate : null);
      setAmount('');
    } catch {
      setError('Failed to process transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral3-90 p-6 rounded-[20px] shadow-wrapper max-w-md w-full">
        <button
          className="absolute top-4 right-4 text-neutral1-60 hover:text-neutral1-80"
          onClick={onClose}
          disabled={isProcessing || isListing}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <Typography level="h4" className="text-gray-100 mb-4">
            {getTitle()} for {nft.name} #{nft.tokenId}
          </Typography>
          <div className="relative w-4/5 h-48 rounded-xl overflow-hidden mb-6">
            <Image
              src={nft.image || '/svg/list-empty.svg'}
              fill
              alt={nft.name || 'NFT Image'}
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="w-full">
            <Typography level="baser" className="text-neutral1-60 font-bold">
              {getPriceLabel()}
            </Typography>
            <div className="relative my-4">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-[20px] bg-neutral2-3 text-gray-100 border border-neutral2-20 focus:border-wine focus:ring-2 focus:ring-wine/50 shadow-neumorphic-dark-inset"
                placeholder="Enter amount"
                disabled={isProcessing || isListing}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral1-60 font-bold text-lg">INK</span>
            </div>
            {type === 'AUCTION' && (
              <>
                <Typography level="baser" className="text-neutral1-60 font-bold mb-2">
                  Expiration Date
                </Typography>
                <div className="border border-neutral2-20 rounded-md px-3 py-2 mb-4">
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    showTimeSelect
                    timeFormat="p"
                    timeIntervals={15}
                    dateFormat="Pp"
                    className="bg-transparent text-gray-100 w-full"
                    disabled={isProcessing || isListing}
                    minDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
                    placeholderText="Select date (minimum 5 days from now)"
                  />
                </div>
                <Typography level="base2m" className="text-neutral1-60 italic mb-4">
                  Expiration date must be at least 5 days from now
                </Typography>
              </>
            )}
            {error && (
              <Typography level="small" className="text-red-500 mb-2">
                {error}
              </Typography>
            )}
            <button
              onClick={handleSubmit}
              disabled={!amount || isProcessing || isListing || parseFloat(amount) <= 0}
              className="w-full px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isProcessing || isListing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                getButtonLabel()
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
