'use client';

import { Typography } from '@/components/typography';
import {
  getAuctionAddress,
  getMarketplaceAddress,
} from '@/contracts/utils/getAddress';
import { actionType } from '@/interfaces/market';
import { INftActivity } from '@/interfaces/nft';

const columnConfigs = [
  {
    key: 'actionType',
    label: 'Event',
    render: (event: INftActivity) => (
      <div className="flex items-center">
        <span>
          {event.actionType &&
            (Object.keys(actionType).includes(event.actionType)
              ? actionType[event.actionType as keyof typeof actionType]
              : event.actionType)}
        </span>
        {event.txHash && (
          <a
            href={`https://amoy.polygonscan.com/tx/${event.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-gray-100 hover:text-cherry"
            title="View transaction"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    ),
  },
  {
    key: 'fromAddress',
    label: 'From',
    render: (event: INftActivity, owner?: string) => {
      const marketplaceAddress = getMarketplaceAddress();
      const auctionAddress = getAuctionAddress();

      if (event.actionType === 'MINTED') {
        return (
          <span title="0x0000000000000000000000000000000000000000">
            0x00000000...00000000
          </span>
        );
      } else if (!event.fromAddress) {
        return '-';
      } else if (
        event.fromAddress.toLowerCase() === marketplaceAddress.toLowerCase()
      ) {
        return (
          <a
            href={`https://amoy.polygonscan.com/address/${event.fromAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-cherry"
            title={event.fromAddress}
          >
            Contract Marketplace
          </a>
        );
      } else if (
        event.fromAddress.toLowerCase() === auctionAddress.toLowerCase()
      ) {
        return (
          <a
            href={`https://amoy.polygonscan.com/address/${event.fromAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-cherry"
            title={event.fromAddress}
          >
            Contract Auction
          </a>
        );
      } else {
        if (!event.from || !event.from.id) {
          return (
            <span title={event.fromAddress}>
              {event.fromAddress.slice(0, 8)}...{event.fromAddress.slice(-8)}
            </span>
          );
        }

        const isCurrentUser =
          owner && owner === event.fromAddress.toLowerCase();

        return (
          <a
            className="text-gray-100 hover:text-cherry"
            href={isCurrentUser ? '/profile' : `/profile/${event.from.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title={event.fromAddress}
          >
            {isCurrentUser
              ? 'Me'
              : event?.from?.username ||
                `${event.fromAddress.slice(0, 8)}...${event.fromAddress.slice(-8)}`}
          </a>
        );
      }
    },
  },
  {
    key: 'toAddress',
    label: 'To',
    render: (event: INftActivity, owner?: string) => {
      const marketplaceAddress = getMarketplaceAddress();
      const auctionAddress = getAuctionAddress();

      if (!event.toAddress) {
        return '-';
      } else if (
        event.toAddress.toLowerCase() === marketplaceAddress.toLowerCase()
      ) {
        return (
          <a
            href={`https://amoy.polygonscan.com/address/${event.toAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-cherry"
            title={event.toAddress}
          >
            Contract Marketplace
          </a>
        );
      } else if (
        event.toAddress.toLowerCase() === auctionAddress.toLowerCase()
      ) {
        return (
          <a
            href={`https://amoy.polygonscan.com/address/${event.toAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-cherry"
            title={event.toAddress}
          >
            Contract Auction
          </a>
        );
      } else {
        if (!event.to || !event.to.id) {
          return (
            <span title={event.toAddress}>
              {event.toAddress.slice(0, 8)}...{event.toAddress.slice(-8)}
            </span>
          );
        }

        const isCurrentUser = owner && owner === event.toAddress.toLowerCase();

        return (
          <a
            className="text-gray-100 hover:text-cherry"
            href={isCurrentUser ? '/profile' : `/profile/${event.to.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title={event.toAddress}
          >
            {isCurrentUser
              ? 'Me'
              : event?.to?.username ||
                `${event.toAddress.slice(0, 8)}...${event.toAddress.slice(-8)}`}
          </a>
        );
      }
    },
  },
  {
    key: 'price',
    label: 'Price',
    render: (event: INftActivity) => (event.price ? `${event.price} INK` : '-'),
  },
  {
    key: 'createdAt',
    label: 'Date',
    render: (event: INftActivity) => new Date(event.createdAt).toLocaleString(),
  },
];

export default function TransactionHistory({
  history,
  owner,
}: {
  history: INftActivity[];
  owner: string;
}) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mt-8">
      <Typography level="h4" className="text-gray-100 mb-4">
        Transaction History
      </Typography>
      {sortedHistory.length === 0 ? (
        <Typography level="baser" className="text-gray-400">
          No transaction history available.
        </Typography>
      ) : (
        <>
          {/* Bảng cho Desktop (ẩn trên mobile) */}
          <div className="hidden md:block bg-neutral2-3 rounded-[20px] shadow-card p-4 overflow-x-auto">
            <table className="w-full text-gray-100">
              <thead>
                <tr className="border-b border-neutral2-20">
                  {columnConfigs.map((col) => (
                    <th key={col.key} className="py-3 px-4 text-left">
                      <Typography level="baser" className="font-semibold">
                        {col.label}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-neutral2-20 last:border-b-0"
                  >
                    {columnConfigs.map((col) => (
                      <td key={col.key} className="py-3 px-4">
                        <Typography level="baser" className="text-gray-100">
                          {col.render(event, owner)}
                        </Typography>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Danh sách cho Mobile (ẩn trên desktop) */}
          <div className="md:hidden space-y-4">
            {sortedHistory.map((event) => (
              <div
                key={event.id}
                className="bg-neutral2-3 p-4 rounded-lg shadow-card"
              >
                {columnConfigs.map((col) => (
                  <div
                    key={col.key}
                    className="flex justify-between py-1 border-b border-neutral2-20 last:border-b-0"
                  >
                    <Typography level="baser" className="text-gray-400">
                      {col.label}
                    </Typography>
                    <Typography level="baser" className="text-gray-100">
                      {col.render(event)}
                    </Typography>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
