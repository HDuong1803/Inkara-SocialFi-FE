import { cn } from '@/lib/utils';

export default function MarketplaceIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-6 w-6 stroke-secondary', className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g opacity="0.8">
        <path
          d="M3 3H5L6.68 14.39C6.84639 15.5869 7.84067 16.5 9.04516 16.5H16.9548C18.1593 16.5 19.1536 15.5869 19.32 14.39L20.5 6H6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
      </g>
    </svg>
  );
}
