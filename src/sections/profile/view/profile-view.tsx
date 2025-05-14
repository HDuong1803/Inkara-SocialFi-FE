'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '@/context/user-context';
import { IPost } from '@/interfaces/post';
import {
  FilterByOption,
  FilterParams,
  INftItem,
  PaginationParams,
  SearchParams,
  SortByOption,
  SortParams,
} from '@/interfaces/nft';
import { getPostsByUser } from '@/apis/post';
import { getMyNfts } from '@/apis/nft';
import ToggleGroup from '@/components/toggle-group/toggle-group';
import ActivityFeed from '@/components/user-activity-feed/user-activity-feed';
import ProfileHead from '../profile-components/header';
import UserInfo from '../profile-components/user-info';
// Import Radix UI Select components
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Search } from 'lucide-react';

export default function ProfileView() {
  const { userProfile } = useUserProfile();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [nfts, setNfts] = useState<INftItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    offset: 1,
    limit: 12,
    startId: 0,
  });
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchPosts = useCallback(async () => {
    if (!userProfile?.id) return;
    setLoading(true);
    try {
      const response = await getPostsByUser(
        { startId: 0, offset: 1, limit: 5 },
        userProfile.id
      );
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  const fetchNfts = useCallback(
    async (append: boolean = false) => {
      if (!userProfile?.id) return;
      setLoading(true);
      try {
        const response = await getMyNfts(
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
        setLoading(false);
      }
    },
    [userProfile?.id, sortParams, searchParams, filterParams, paginationParams]
  );

  useEffect(() => {
    if (contentType === 'post') {
      fetchPosts();
    } else {
      fetchNfts();
    }
  }, [contentType, fetchPosts, fetchNfts]);

  const handleToggle = (key: string) => {
    setContentType(key === 'posts' ? 'post' : 'nfts');
    setNfts([]);
    setPaginationParams({ offset: 1, limit: 8, startId: 0 });
    setError(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ contains: e.target.value });
    setPaginationParams((prev) => ({ ...prev, offset: 1 }));
  };

  const handleSortChange = (value: string) => {
    setSortParams((prev) => ({ ...prev, sortBy: value as SortByOption }));
    setPaginationParams((prev) => ({ ...prev, offset: 1 }));
  };

  const handleFilterChange = (value: string) => {
    setFilterParams({ filterBy: value as FilterByOption });
    setPaginationParams((prev) => ({ ...prev, offset: 1 }));
  };

  const loadMore = () => {
    setPaginationParams((prev) => ({
      ...prev,
      offset: (prev.offset || 1) + 1,
    }));
    fetchNfts(true);
  };

  return (
    <section className="relative w-full h-fit min-h-screen overflow-hidden">
      <ProfileHead />
      {userProfile && <UserInfo user={userProfile} />}
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
          {/* Input tìm kiếm */}
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
          {/* Dropdown Sort */}
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
          {/* Dropdown Filter */}
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
          loading={loading}
          err={error}
          onLoadMore={contentType === 'nfts' && hasMore ? loadMore : undefined}
        />
      </div>
    </section>
  );
}
