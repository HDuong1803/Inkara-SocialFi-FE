import { cn } from '@/lib/utils';

export default function EventIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-6 w-6 stroke-secondary', className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g opacity="0.8">
        <path
          d="M12 2L14.09 8.26L20.18 9.27L15 13.14L16.18 19.02L12 16.26L7.82 19.02L9 13.14L3.82 9.27L9.91 8.26L12 2Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
