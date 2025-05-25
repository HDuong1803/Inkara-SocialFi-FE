import React from 'react';
import { Typography } from '@/components/typography';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  hash?: string;
  title?: string;
}

export default function SuccessModal({ isOpen, onClose, hash, title = 'SUCCESS' }: SuccessModalProps) {
  const onNavigation = () => {
    if (window && hash) {
      window.open(`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${hash}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral3-90 p-6 rounded-[20px] shadow-wrapper max-w-sm w-full">
        <button
          className="absolute top-4 right-4 text-neutral1-60 hover:text-neutral1-80"
          onClick={onClose}
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
          <Typography level="title" className="text-neutral1-60">
            {title}
          </Typography>
          <Typography level="small" className="text-neutral1-60 italic mt-2">
            (Your Transaction Successful!)
          </Typography>
          <button
            onClick={onNavigation}
            className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
          >
            {hash ? `${hash.slice(0, 12)}...${hash.slice(-10)}` : 'View Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}