'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfileById } from '@/apis/user';
import { IPost } from '@/interfaces/post';
import { IUserProfile } from '@/interfaces/user';
import ToggleGroup from '@/components/toggle-group/toggle-group';
import ActivityFeed from '@/components/user-activity-feed/user-activity-feed';
import ProfileHead from '../profile-components/header';
import UserInfo from '../profile-components/user-info';
import { getPostsByUser } from '@/apis/post';
import {
  FilterByOption,
  FilterParams,
  INftItem,
  PaginationParams,
  SearchParams,
  SortByOption,
  SortParams,
} from '@/interfaces/nft';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Search } from 'lucide-react';
import { getNftByUser } from '@/apis/nft';

interface ProfileUserViewProps {
  userId: string;
}

export default function ProfileUserView({ userId }: ProfileUserViewProps) {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [nfts, setNfts] = useState<INftItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [contentType, setContentType] = useState<'post' | 'nfts'>('post');
  const [sortParams, setSortParams] = useState<SortParams>({
    sortAscending: 'desc',
    sortBy: SortByOption.CREATED_DATE,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [filterParams, setFilterParams] = useState<FilterParams>({
    filterBy: FilterByOption.ERC721_NFTS,
  });
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    startId: 0,
    offset: 1,
    limit: 12,
  });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getUserProfileById(userId);
      setUser(response.data);
      setIsProfileLoaded(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile.');
    }
  }, [userId]);

  const fetchPosts = useCallback(async () => {
    if (!userId || posts.length > 0) return;
    setPostsLoading(true);
    try {
      const response = await getPostsByUser(
        { startId: 0, offset: 1, limit: 5 },
        userId
      );
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts.');
    } finally {
      setPostsLoading(false);
    }
  }, [userId, posts]);

  const fetchNfts = useCallback(
    async (append: boolean = false) => {
      if (!userId) return;
      setNftsLoading(true);
      try {
        const response = await getNftByUser(
          userId,
          sortParams,
          searchParams,
          filterParams,
          paginationParams
        );
        setNfts((prev) =>
          append ? [...prev, ...response.data] : response.data
        );
        setHasMore(response.data.length === paginationParams.limit);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Failed to load NFTs.');
      } finally {
        setNftsLoading(false);
      }
    },
    [userId, paginationParams]
  );

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!isProfileLoaded) return; // Đợi profile tải xong
    if (contentType === 'post') {
      fetchPosts();
    } else {
      fetchNfts();
    }
  }, [contentType, fetchPosts, fetchNfts, isProfileLoaded]);

  const handleToggle = (key: string) => {
    setContentType(key === 'posts' ? 'post' : 'nfts');
    setPaginationParams({ offset: 1, limit: 8, startId: 0 });
    setError(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ contains: e.target.value });
    setPaginationParams((prev) => ({ ...prev, offset: 1 }));
    setNfts([]); // Reset NFTs khi tìm kiếm
    fetchNfts();
  };

  const handleSortChange = (value: string) => {
    setSortParams((prev) => ({ ...prev, sortBy: value as SortByOption }));
    setPaginationParams((prev) => ({ ...prev, offset: 1 }));
    setNfts([]); // Reset NFTs khi thay đổi sắp xếp
    fetchNfts();
  };

  const handleFilterChange = (value: string) => {
    setFilterParams({ filterBy: value as FilterByOption });
    setPaginationParams((prev) => ({ ...prev, offset: 1 }));
    setNfts([]); // Reset NFTs khi thay đổi bộ lọc
    fetchNfts();
  };

  const loadMore = () => {
    setPaginationParams((prev) => ({
      ...prev,
      offset: (prev.offset || 1) + 1,
    }));
    fetchNfts(true);
  };

  if (!user && !isProfileLoaded) {
    return (
      <section className="relative w-full h-fit min-h-svh overflow-hidden px-3 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-neutral2-10 rounded-xl" />
          <div className="h-10 bg-neutral2-10 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-64 bg-neutral2-10 rounded-xl" />
              ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-fit min-h-svh overflow-hidden">
      <ProfileHead />
      <UserInfo user={user as IUserProfile} />
      <ToggleGroup
        items={[
          { key: 'posts', label: 'Posts' },
          { key: 'nfts', label: 'NFTs' },
        ]}
        className="z-[2] mb-3 relative"
        onChange={handleToggle}
      />
      {contentType === 'nfts' && (
        <div className="px-3 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search NFTs by name..."
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-[20px] bg-neutral2-3 text-gray-100 placeholder-gray-400
                border border-neutral2-20 focus:border-wine focus:ring-2 focus:ring-wine/50
                shadow-neumorphic-dark-inset
                hover:bg-neutral2-5 transition-all duration-300"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <Select.Root
            onValueChange={handleSortChange}
            defaultValue={sortParams.sortBy}
          >
            <Select.Trigger
              className="inline-flex items-center justify-between w-48 px-4 py-2 rounded-[20px]
                bg-neutral2-3 text-gray-100 border border-neutral2-20
                hover:bg-neutral2-5 focus:ring-2 focus:ring-wine/50
                shadow-neumorphic-dark-inset
                transition-all duration-300"
              aria-label="Sort by"
            >
              <Select.Value placeholder="Sort by" />
              <Select.Icon>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="overflow-hidden bg-neutral2-5 rounded-[12px] shadow-wrapper
                  backdrop-blur-sm border border-neutral2-20"
              >
                <Select.Viewport className="p-2">
                  {Object.values(SortByOption).map((option) => (
                    <Select.Item
                      key={option as React.Key}
                      value={option as string}
                      className="relative flex items-center px-4 py-2 text-sm text-gray-100
                        rounded-md hover:bg-neutral2-10 focus:bg-neutral2-10
                        cursor-pointer transition-colors duration-200"
                    >
                      <Select.ItemText>
                        {(option as string).replace('_', ' ')}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          <Select.Root
            onValueChange={handleFilterChange}
            defaultValue={filterParams.filterBy}
          >
            <Select.Trigger
              className="inline-flex items-center justify-between w-48 px-4 py-2 rounded-[20px]
                bg-neutral2-3 text-gray-100 border border-neutral2-20
                hover:bg-neutral2-5 focus:ring-2 focus:ring-wine/50
                shadow-neumorphic-dark-inset
                transition-all duration-300"
              aria-label="Filter by"
            >
              <Select.Value placeholder="Filter by" />
              <Select.Icon>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="overflow-hidden bg-neutral2-5 rounded-[12px] shadow-wrapper
                  backdrop-blur-sm border border-neutral2-20"
              >
                <Select.Viewport className="p-2">
                  {Object.values(FilterByOption).map((option) => (
                    <Select.Item
                      key={option as React.Key}
                      value={option as string}
                      className="relative flex items-center px-4 py-2 text-sm text-gray-100
                        rounded-md hover:bg-neutral2-10 focus:bg-neutral2-10
                        cursor-pointer transition-colors duration-200"
                    >
                      <Select.ItemText>
                        {option.replace('_', ' ')}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      )}
      <div className="px-3 gap-5 h-fit no-scrollbar">
        <ActivityFeed
          contentType={contentType}
          data={contentType === 'nfts' ? nfts : posts}
          loading={contentType === 'nfts' ? nftsLoading : postsLoading}
          err={error}
          onLoadMore={contentType === 'nfts' && hasMore ? loadMore : undefined}
        />
      </div>
    </section>
  );
}
