'use client';
import React from 'react';
import { Typography } from '@/components/typography';
import { INftActivity } from '@/interfaces/nft';

export const ViewMyBidModal = ({
  isOpen,
  onClose,
  bids,
}: {
  isOpen: boolean;
  onClose: () => void;
  bids: INftActivity[];
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-neutral2-3 bg-opacity-100 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <Typography level="h4" className="text-gray-100 font-bold">
            My Bids
          </Typography>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="bg-neutral2-10 p-5 rounded-xl border border-neutral2-20 max-h-96 overflow-y-auto">
          {bids?.length > 0 ? (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className="bg-neutral2-5 p-4 rounded-lg border border-neutral2-20"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography level="baser" className="text-gray-400 mr-2">
                        Price
                      </Typography>
                      <Typography level="baser" className="text-gray-100 font-semibold">
                        {bid.price || 0} INK
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography level="baser" className="text-gray-400 mr-2">
                        Time
                      </Typography>
                      <Typography level="baser" className="text-gray-100 font-semibold">
                        {new Date(bid.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography level="base2r" className="text-gray-400 italic">
              No bids found.
            </Typography>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};