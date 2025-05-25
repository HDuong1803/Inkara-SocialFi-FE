'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { IFollowing } from '@/interfaces/follower';

import EmptyContent from '@/components/empty-content/empty-content';
import ProfileCard from '@/components/profile-card/profile-card';
import { Typography } from '@/components/typography';

import HeaderFollowers from '../header';
import ToggleGroup from '@/components/toggle-group/toggle-group';
import { SplashScreen } from '@/components/loading-screen';
import { followAction, listFollows } from '@/apis/follow';
import { UserFilterByOption } from '@/apis/dto/filter.dto';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';

//-------------------------------------------------------------------------

export default function FollowersView() {
  const params = useParams();
  const userId = params?.id as string;
  const [followers, setFollowers] = React.useState<IFollowing[]>([]);
  const [following, setFollowings] = React.useState<IFollowing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState('1'); // '1' for Followers, '2' for Following

  React.useEffect(() => {
    const fetchFollowersData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await listFollows(
          { filterBy: UserFilterByOption.LIST_FOLLOWERS },
          { startId: 0, offset: 1, limit: 10 },
          userId
        );
        setFollowers(response.data);
      } catch (error) {
        console.error('Error fetching followers:', error);
        setError('Failed to load followers.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowersData();
  }, [userId]);

  React.useEffect(() => {
    const fetchFollowingData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await listFollows(
          { filterBy: UserFilterByOption.LIST_FOLLOWINGS },
          { startId: 0, offset: 1, limit: 10 },
          userId
        );
        setFollowings(response.data);
      } catch (error) {
        console.error('Error fetching following:', error);
        setError('Failed to load following.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowingData();
  }, [userId]);

  const handleFollow = async (id: string) => {
    try {
      await followAction(id);
      setFollowings((prevFollowers) =>
        prevFollowers.map((following) => following)
      );
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <section className="w-full max-h-full min-h-full p-3 pb-[5rem] md:pb-0 transition-all duration-[0.5s]">
      <HeaderFollowers />
      <ToggleGroup
        className="w-full p-1 flex justify-between items-center bg-neutral3-60 rounded-[6.25rem]"
        items={[
          { key: '1', label: 'Follower' },
          { key: '2', label: 'Following' },
        ]}
        onChange={(key) => setTab(key)}
      />
      {isLoading ? (
        <SplashScreen />
      ) : error ? (
        <div className="text-center text-secondary">
          <Typography level="title" className="opacity-80">
            {error}
          </Typography>
        </div>
      ) : tab === '1' ? (
        followers.length === 0 ? (
          <EmptyContent
            content={
              <div className="text-center text-secondary">
                <Typography level="title" className="opacity-80">
                  No followers yet
                </Typography>
                <Typography level="base2r" className="opacity-50">
                  When you have followers, they&#39;ll be listed here.
                </Typography>
              </div>
            }
            image="/svg/ai_data_consolidation.svg"
          />
        ) : (
          <ul className="max-h-[calc(100svh-100px)] mt-3">
            {followers.map((follower: IFollowing) => (
              <li key={follower.id} className="mb-2">
                <ProfileCard
                  user={{
                    id: follower.id,
                    fullname: follower?.following?.fullname,
                    username: follower?.following?.username,
                    photo: {
                      url:
                        follower?.following?.photo?.url ||
                        USER_AVATAR_PLACEHOLDER,
                    },
                    address: follower?.following?.address,
                  }}
                  types="follower"
                  onFollow={() => handleFollow(follower.id)}
                />
              </li>
            ))}
          </ul>
        )
      ) : following.length === 0 ? (
        <EmptyContent
          content={
            <div className="text-center text-secondary">
              <Typography level="title" className="opacity-80">
                No following yet
              </Typography>
              <Typography level="base2r" className="opacity-50">
                When you follow people, they&#39;ll be listed here.
              </Typography>
            </div>
          }
          image="/svg/ai_data_consolidation.svg"
        />
      ) : (
        <ul className="max-h-[calc(100svh-100px)] mt-3">
          {following.map((followed: IFollowing) => (
            <li key={followed.id} className="mb-2">
              <ProfileCard
                user={{
                  id: followed.following.id,
                  fullname: followed.following.fullname,
                  username: followed.following.username,
                  photo: {
                    url:
                      followed.following.photo?.url || USER_AVATAR_PLACEHOLDER,
                  },
                  address: followed.following.address,
                }}
                types="following"
                onFollow={() => handleFollow(followed.following.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
