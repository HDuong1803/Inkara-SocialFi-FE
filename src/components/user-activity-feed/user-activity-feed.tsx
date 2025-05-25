// components/user-activity-feed/user-activity-feed.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IPost } from '@/interfaces/post';
import { INftItem } from '@/interfaces/nft';
import { EmptyContent } from '../empty-content';
import { Post } from '../post';
import { Typography } from '../typography';
import { Loader2 } from 'lucide-react';
import { useUserProfile } from '@/context/user-context';

interface ActivityFeedProps {
  contentType: 'post' | 'nfts';
  data: unknown[];
  loading?: boolean;
  err?: string | null;
  className?: string;
  onLoadMore?: () => void;
  onDeleted?: (isDeleted: boolean) => void;
}

export default function ActivityFeed({
  contentType,
  data,
  loading,
  err,
  className,
  onLoadMore,
  onDeleted,
}: ActivityFeedProps) {
  const { userProfile } = useUserProfile();

  const [openMoreOptionsId, setOpenMoreOptionsId] = React.useState<
    string | null
  >(null);
  const [expandedPostId, setExpandedPostId] = React.useState<string | null>(
    null
  );

  const handleToggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const handleListForSale = (nftId: string) => {
    // TODO: Implement logic to list NFT for sale (e.g., open modal, call API)
    console.log(`Listing NFT ${nftId} for sale`);
  };

  const posts = (
    <ul className="w-full h-full mt-3">
      {(data as IPost[]).map((post) => (
        <li key={post.id} className="mb-2">
          <Post
            data={post}
            onDeleteSuccess={onDeleted}
            openMoreOptionsId={openMoreOptionsId}
            setOpenMoreOptionsId={setOpenMoreOptionsId}
            showComments={expandedPostId === post.id}
            onToggleComments={() => handleToggleComments(post.id)}
          />
        </li>
      ))}
    </ul>
  );

  const nfts = (
    <div className="w-full h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {(data as INftItem[]).map((nft) => {
        const isOwner = userProfile?.address === nft?.owner?.address;
        const isListed = nft.listing && nft.listing.length > 0;

        return (
          <div
            key={nft.id}
            className="group relative rounded-[20px] bg-neutral2-3 p-4
            shadow-card hover:shadow-wrapper hover:bg-neutral2-5
            transition-all duration-300 hover:-translate-y-1"
          >
            <Link href={`/nfts/${nft.id}`} className="block">
              <div className="relative w-full h-48 overflow-hidden rounded-xl">
                <Image
                  src={nft.image ? nft.image : '/svg/list-empty.svg'}
                  fill
                  alt={nft.name}
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Gradient overlay khi hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral2-10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Badge trạng thái */}
                {isListed ? (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-cherry to-black-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Listed
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Not Listed
                  </span>
                )}
              </div>
            </Link>
            <div className="mt-4 ">
              <Typography
                level="baser"
                className="font-semibold text-gray-100 truncate"
              >
                {nft.name}
              </Typography>
              <Typography level="small" className="text-gray-400">
                <span className="absolute top-10 left-5 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  #{nft.tokenId}
                </span>
              </Typography>
              {nft.collection && (
                <Typography level="small" className="text-gray-400">
                  Collection: {nft.collection.name}
                </Typography>
              )}
              <div className="mt-4 flex justify-center">
                {isListed ? (
                  <Typography
                    level="baser"
                    className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cherry to-black-600"
                  >
                    {nft.listing && nft.listing.length > 0 ? `${nft.listing[0].price} INK` : '0 INK'}
                  </Typography>
                ) : isOwner ? (
                  <button
                    onClick={() => handleListForSale(nft.id)}
                    className="px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold
                      rounded-full shadow-card hover:shadow-wrapper
                      transition-all duration-300"
                  >
                    List for Sale
                  </button>
                ) : (
                  <Typography
                    level="base2r"
                    className="text-gray-500 text-center"
                  >
                    Not for sale
                  </Typography>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      {loading && !data.length && contentType === 'nfts' ? (
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
      ) : err ? (
        <Typography level="baser" className="text-red-400">
          Error: {err}
        </Typography>
      ) : data.length === 0 ? (
        <EmptyContent
          content={
            <Typography level="base2sm" className="text-gray-400">
              {contentType === 'nfts'
                ? 'No NFTs found.'
                : "This user hasn't posted anything yet."}
            </Typography>
          }
        />
      ) : contentType === 'post' ? (
        posts
      ) : (
        <>
          {nfts}
          {onLoadMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold rounded-full
                  shadow-card hover:shadow-wrapper
                  disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading...
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
